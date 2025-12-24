import { Op } from 'sequelize';
import { Notification, NotificationType } from '../models/Notification';
import { logger } from '../utils/logger';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class NotificationService {
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const notification = await Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      actionText: data.actionText,
      metadata: data.metadata || {},
    });

    logger.info(`Notification created for user ${data.userId}: ${data.title}`);
    return notification;
  }

  async createBulkNotifications(
    userIds: string[],
    data: Omit<CreateNotificationData, 'userId'>
  ): Promise<Notification[]> {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        this.createNotification({ ...data, userId })
      )
    );
    return notifications;
  }

  async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt[Op.lte] = filters.endDate;
      }
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      notifications: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const [updatedCount] = await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { id: notificationId, userId } }
    );
    return updatedCount > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const [updatedCount] = await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );
    return updatedCount;
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const deletedCount = await Notification.destroy({
      where: { id: notificationId, userId },
    });
    return deletedCount > 0;
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await Notification.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
        isRead: true,
      },
    });

    logger.info(`Deleted ${deletedCount} old notifications`);
    return deletedCount;
  }

  // Notification Templates
  async sendWelcomeNotification(userId: string, userName: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'system',
      title: 'Welcome to Haven Institute! 🎉',
      message: `Hi ${userName}! Welcome to your NCLEX preparation journey. Start by exploring our study materials and taking your first practice quiz.`,
      actionUrl: '/app/dashboard',
      actionText: 'Get Started',
    });
  }

  async sendAchievementNotification(
    userId: string,
    achievementName: string,
    points: number
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: `Achievement Unlocked: ${achievementName}! 🏆`,
      message: `Congratulations! You've earned ${points} points.`,
      actionUrl: '/app/achievements',
      actionText: 'View Achievements',
      metadata: { achievementName, points },
    });
  }

  async sendStudyReminder(userId: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'reminder',
      title: 'Time to Study! 📚',
      message: "Don't forget your daily study goals. A little progress each day leads to big results!",
      actionUrl: '/app/dashboard',
      actionText: 'Start Studying',
    });
  }

  async sendCATResultNotification(
    userId: string,
    passed: boolean,
    score: number
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'study',
      title: passed ? 'CAT Test Passed! 🎉' : 'CAT Test Completed',
      message: passed
        ? `Great job! You passed with a ${score}% passing probability.`
        : `Keep practicing! Your passing probability was ${score}%. Review your weak areas and try again.`,
      actionUrl: '/app/progress/analytics',
      actionText: 'View Results',
      metadata: { passed, score },
    });
  }

  async sendSubscriptionNotification(
    userId: string,
    action: 'upgraded' | 'renewed' | 'expiring' | 'expired',
    planName?: string
  ): Promise<Notification> {
    const messages = {
      upgraded: `Your subscription has been upgraded to ${planName}! Enjoy your new features.`,
      renewed: `Your ${planName} subscription has been renewed successfully.`,
      expiring: 'Your subscription is expiring soon. Renew to keep access to premium features.',
      expired: 'Your subscription has expired. Upgrade to continue your NCLEX preparation.',
    };

    return this.createNotification({
      userId,
      type: 'subscription',
      title: action === 'upgraded' ? 'Subscription Upgraded! ⭐' : 'Subscription Update',
      message: messages[action],
      actionUrl: '/app/account/subscription',
      actionText: action === 'expiring' || action === 'expired' ? 'Renew Now' : 'View Plan',
      metadata: { action, planName },
    });
  }

  async sendGroupInviteNotification(
    userId: string,
    groupName: string,
    inviterName: string,
    groupId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'social',
      title: 'Study Group Invitation 👥',
      message: `${inviterName} invited you to join "${groupName}".`,
      actionUrl: `/app/community/groups/${groupId}`,
      actionText: 'View Invitation',
      metadata: { groupName, inviterName, groupId },
    });
  }

  async sendForumReplyNotification(
    userId: string,
    postTitle: string,
    replierName: string,
    postId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'social',
      title: 'New Reply to Your Post 💬',
      message: `${replierName} replied to your post: "${postTitle}"`,
      actionUrl: `/app/community/forum/${postId}`,
      actionText: 'View Reply',
      metadata: { postTitle, replierName, postId },
    });
  }

  async sendStreakNotification(userId: string, streakDays: number): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: `${streakDays}-Day Streak! 🔥`,
      message: `Amazing! You've studied for ${streakDays} days in a row. Keep it up!`,
      actionUrl: '/app/progress',
      actionText: 'View Progress',
      metadata: { streakDays },
    });
  }
}

export const notificationService = new NotificationService();
