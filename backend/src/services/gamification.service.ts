import { Op } from 'sequelize';
import { Achievement, UserAchievement } from '../models/Achievement';
import { User } from '../models/User';
import { StudyActivity } from '../models/StudyActivity';
import { notificationService } from './notification.service';
import { logger } from '../utils/logger';

export interface UserStats {
  questionsAnswered: number;
  quizzesCompleted: number;
  catTestsCompleted: number;
  catTestsPassed: number;
  flashcardsReviewed: number;
  studyStreak: number;
  perfectQuizzes: number;
  groupsJoined: number;
  forumLikesReceived: number;
  totalPoints: number;
  level: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  points: number;
  level: number;
  rank: number;
}

// Points configuration
const POINT_RULES = {
  question_answered: { base: 10, correct_multiplier: 1.5, difficult_multiplier: 2.0 },
  quiz_completed: { base: 25, perfect_bonus: 50 },
  cat_completed: { base: 100, pass_bonus: 150 },
  flashcard_reviewed: { base: 5 },
  study_streak: { daily: 10, weekly_bonus: 50, monthly_bonus: 200 },
  forum_post: { base: 15 },
  forum_like_received: { base: 5 },
  helpful_answer: { base: 25 },
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
  15000, 20000, 27000, 35000, 45000, 60000, 80000, 105000, 135000, 170000,
];

export class GamificationService {
  // Calculate user level from points
  calculateLevel(points: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  // Calculate points needed for next level
  pointsToNextLevel(points: number): { current: number; needed: number; progress: number } {
    const level = this.calculateLevel(points);
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    
    return {
      current: points - currentThreshold,
      needed: nextThreshold - currentThreshold,
      progress: ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100,
    };
  }

  // Award points for an action
  async awardPoints(
    userId: string,
    action: string,
    metadata?: { correct?: boolean; difficulty?: string; perfect?: boolean; passed?: boolean }
  ): Promise<number> {
    let points = 0;

    switch (action) {
      case 'question_answered':
        points = 10;
        if (metadata?.correct) points *= 1.5;
        if (metadata?.difficulty === 'hard') points *= 2.0;
        break;
      case 'quiz_completed':
        points = 25;
        if (metadata?.perfect) points += 50;
        break;
      case 'cat_completed':
        points = 100;
        if (metadata?.passed) points += 150;
        break;
      case 'flashcard_reviewed':
        points = 5;
        break;
      case 'study_streak':
        points = 10;
        break;
      case 'forum_post':
        points = 15;
        break;
      case 'forum_like_received':
        points = 5;
        break;
      case 'helpful_answer':
        points = 25;
        break;
    }

    // Record activity with points
    await StudyActivity.create({
      userId,
      activityType: action === 'quiz_completed' ? 'quiz_completed' : 
                   action === 'cat_completed' ? 'cat_completed' : 
                   action === 'flashcard_reviewed' ? 'flashcard_reviewed' : 'login',
      pointsEarned: points,
      metadata: { action, ...metadata },
    });

    logger.info(`Awarded ${points} points to user ${userId} for ${action}`);
    return points;
  }

  // Get user stats
  async getUserStats(userId: string): Promise<UserStats> {
    const activities = await StudyActivity.findAll({
      where: { userId },
    });

    const stats: UserStats = {
      questionsAnswered: 0,
      quizzesCompleted: 0,
      catTestsCompleted: 0,
      catTestsPassed: 0,
      flashcardsReviewed: 0,
      studyStreak: 0,
      perfectQuizzes: 0,
      groupsJoined: 0,
      forumLikesReceived: 0,
      totalPoints: 0,
      level: 1,
    };

    activities.forEach((activity: any) => {
      stats.totalPoints += activity.pointsEarned || 0;
      stats.questionsAnswered += activity.questionsAnswered || 0;
      
      if (activity.activityType === 'quiz_completed') {
        stats.quizzesCompleted++;
      } else if (activity.activityType === 'cat_completed') {
        stats.catTestsCompleted++;
      } else if (activity.activityType === 'flashcard_reviewed') {
        stats.flashcardsReviewed++;
      }
    });

    stats.level = this.calculateLevel(stats.totalPoints);
    stats.studyStreak = await this.calculateStreak(userId);

    return stats;
  }

  // Calculate study streak
  async calculateStreak(userId: string): Promise<number> {
    const activities = await StudyActivity.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: ['createdAt'],
    });

    if (activities.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const activityDates = new Set(
      activities.map((a) => {
        const date = new Date(a.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.toISOString().split('T')[0];
      })
    );

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (streak === 0) {
        // Check if they studied yesterday (allow current day to not have activity yet)
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayStr = currentDate.toISOString().split('T')[0];
        if (activityDates.has(yesterdayStr)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return streak;
  }

  // Check and award achievements
  async checkAchievements(userId: string): Promise<Achievement[]> {
    const stats = await this.getUserStats(userId);
    const allAchievements = await Achievement.findAll({ where: { isActive: true } });
    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [Achievement],
    });

    const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));
    const newlyEarned: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (earnedIds.has(achievement.id)) continue;

      let progress = 0;
      let completed = false;

      switch (achievement.requirementType) {
        case 'questions_answered':
          progress = stats.questionsAnswered;
          break;
        case 'quizzes_completed':
          progress = stats.quizzesCompleted;
          break;
        case 'cat_tests_completed':
          progress = stats.catTestsCompleted;
          break;
        case 'cat_tests_passed':
          progress = stats.catTestsPassed;
          break;
        case 'flashcards_reviewed':
          progress = stats.flashcardsReviewed;
          break;
        case 'study_streak':
          progress = stats.studyStreak;
          break;
        case 'perfect_quizzes':
          progress = stats.perfectQuizzes;
          break;
        case 'groups_joined':
          progress = stats.groupsJoined;
          break;
        case 'forum_likes_received':
          progress = stats.forumLikesReceived;
          break;
      }

      completed = progress >= achievement.requirementValue;

      // Update or create user achievement record
      const [userAchievement, created] = await UserAchievement.findOrCreate({
        where: { userId, achievementId: achievement.id },
        defaults: {
          progress,
          isCompleted: completed,
          completedAt: completed ? new Date() : undefined,
        },
      });

      if (!created) {
        await userAchievement.update({
          progress,
          isCompleted: completed,
          completedAt: completed && !userAchievement.isCompleted ? new Date() : userAchievement.completedAt,
        });
      }

      if (completed && (created || !userAchievement.isCompleted)) {
        newlyEarned.push(achievement);
        
        // Send notification
        await notificationService.sendAchievementNotification(
          userId,
          achievement.name,
          achievement.points
        );
      }
    }

    return newlyEarned;
  }

  // Get user achievements
  async getUserAchievements(userId: string): Promise<{
    earned: (UserAchievement & { achievement: Achievement })[];
    inProgress: (UserAchievement & { achievement: Achievement })[];
    locked: Achievement[];
  }> {
    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [{ model: Achievement, where: { isActive: true } }],
    });

    const allAchievements = await Achievement.findAll({
      where: { isActive: true, isHidden: false },
    });

    const earnedIds = new Set(
      userAchievements.filter((ua) => ua.isCompleted).map((ua) => ua.achievementId)
    );
    const inProgressIds = new Set(
      userAchievements.filter((ua) => !ua.isCompleted).map((ua) => ua.achievementId)
    );

    return {
      earned: userAchievements.filter((ua) => ua.isCompleted) as any,
      inProgress: userAchievements.filter((ua) => !ua.isCompleted) as any,
      locked: allAchievements.filter(
        (a) => !earnedIds.has(a.id) && !inProgressIds.has(a.id)
      ),
    };
  }

  // Get leaderboard
  async getLeaderboard(
    period: 'all' | 'monthly' | 'weekly' = 'all',
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    let dateFilter: Date | undefined;
    
    if (period === 'monthly') {
      dateFilter = new Date();
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    } else if (period === 'weekly') {
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - 7);
    }

    const where: any = {};
    if (dateFilter) {
      where.createdAt = { [Op.gte]: dateFilter };
    }

    // Get points per user
    const activities = await StudyActivity.findAll({
      where,
      attributes: ['userId', 'pointsEarned'],
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'avatarUrl'],
      }],
    });

    // Aggregate points by user
    const userPoints: Map<string, { user: User; points: number }> = new Map();
    
    activities.forEach((activity: any) => {
      const userId = activity.userId;
      const existing = userPoints.get(userId);
      if (existing) {
        existing.points += activity.pointsEarned || 0;
      } else if (activity.user) {
        userPoints.set(userId, {
          user: activity.user,
          points: activity.pointsEarned || 0,
        });
      }
    });

    // Sort and create leaderboard
    const sorted = Array.from(userPoints.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return sorted.map((entry, index) => ({
      userId: entry.user.id,
      userName: entry.user.fullName,
      avatarUrl: entry.user.avatarUrl,
      points: entry.points,
      level: this.calculateLevel(entry.points),
      rank: index + 1,
    }));
  }

  // Get user rank
  async getUserRank(userId: string): Promise<number> {
    const leaderboard = await this.getLeaderboard('all', 1000);
    const userEntry = leaderboard.find((e) => e.userId === userId);
    return userEntry?.rank || leaderboard.length + 1;
  }
}

export const gamificationService = new GamificationService();
