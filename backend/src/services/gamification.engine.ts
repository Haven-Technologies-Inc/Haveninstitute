/**
 * Gamification Engine
 *
 * Handles XP calculation, level progression, achievement unlocking,
 * streak tracking, and leaderboard management
 */

import { sequelize } from '../config/database';
import { QueryTypes, Op } from 'sequelize';
import { Achievement, UserAchievement } from '../models/Achievement';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

// XP rewards for different activities
export const XP_REWARDS = {
  // Practice activities
  questionAnswered: 5,
  questionCorrect: 10,
  questionIncorrect: 2,
  quizCompleted: 25,
  quizPerfectScore: 100,

  // CAT activities
  catSessionStarted: 10,
  catSessionCompleted: 50,
  catSessionPassed: 200,

  // Flashcard activities
  flashcardReviewed: 2,
  flashcardMastered: 25,
  deckCompleted: 50,

  // Study activities
  studySessionCompleted: 20,
  dailyGoalMet: 50,
  weeklyGoalMet: 150,

  // Social activities
  discussionPosted: 15,
  commentAdded: 5,
  helpfulAnswer: 25,
  groupJoined: 20,

  // Streaks
  dailyStreak3: 50,
  dailyStreak7: 100,
  dailyStreak14: 200,
  dailyStreak30: 500,

  // Milestones
  firstQuestion: 25,
  first100Questions: 100,
  first1000Questions: 500,
  firstCATPass: 300
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  3500,   // Level 7
  5500,   // Level 8
  8000,   // Level 9
  11000,  // Level 10
  15000,  // Level 11
  20000,  // Level 12
  26000,  // Level 13
  33000,  // Level 14
  41000,  // Level 15
  50000,  // Level 16
  60000,  // Level 17
  71000,  // Level 18
  83000,  // Level 19
  100000  // Level 20
];

// Level names
export const LEVEL_NAMES = [
  'Nursing Student',
  'Pre-Nursing',
  'Clinical Trainee',
  'Student Nurse',
  'Junior Nurse',
  'Staff Nurse',
  'Experienced Nurse',
  'Senior Nurse',
  'Charge Nurse',
  'Clinical Specialist',
  'Nurse Educator',
  'Clinical Expert',
  'Advanced Practice',
  'Nurse Manager',
  'Clinical Director',
  'Department Head',
  'Chief Nurse',
  'Nursing Director',
  'VP of Nursing',
  'NCLEX Master'
];

export class GamificationEngine {
  /**
   * Award XP to a user for an activity
   */
  async awardXP(
    userId: string,
    activity: keyof typeof XP_REWARDS,
    multiplier: number = 1
  ): Promise<{ xpAwarded: number; newTotal: number; levelUp: boolean; newLevel?: number }> {
    const baseXP = XP_REWARDS[activity] || 0;
    const xpAwarded = Math.floor(baseXP * multiplier);

    // Get current user XP
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const currentXP = (user as any).totalXP || 0;
    const currentLevel = this.calculateLevel(currentXP);
    const newTotal = currentXP + xpAwarded;
    const newLevel = this.calculateLevel(newTotal);
    const levelUp = newLevel > currentLevel;

    // Update user XP
    await sequelize.query(
      `UPDATE users SET total_xp = :newTotal WHERE id = :userId`,
      {
        replacements: { newTotal, userId },
        type: QueryTypes.UPDATE
      }
    );

    // If leveled up, send notification
    if (levelUp) {
      await this.notifyLevelUp(userId, newLevel);
    }

    return { xpAwarded, newTotal, levelUp, newLevel: levelUp ? newLevel : undefined };
  }

  /**
   * Calculate level from XP
   */
  calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Get XP required for next level
   */
  getXPForNextLevel(currentXP: number): { currentLevel: number; nextLevelXP: number; progress: number } {
    const currentLevel = this.calculateLevel(currentXP);
    const nextLevel = Math.min(currentLevel + 1, LEVEL_THRESHOLDS.length);
    const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextLevelXP = LEVEL_THRESHOLDS[nextLevel - 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

    const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return {
      currentLevel,
      nextLevelXP,
      progress: Math.min(100, Math.max(0, progress))
    };
  }

  /**
   * Update user streak
   */
  async updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number; streakBroken: boolean }> {
    const today = new Date().toISOString().split('T')[0];

    // Get user's last activity date and current streak
    const [userData] = await sequelize.query<any>(
      `SELECT last_activity_date, current_streak, longest_streak FROM users WHERE id = :userId`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    if (!userData) throw new Error('User not found');

    const lastActivityDate = userData.last_activity_date;
    let currentStreak = userData.current_streak || 0;
    let longestStreak = userData.longest_streak || 0;
    let streakBroken = false;

    if (!lastActivityDate) {
      // First activity
      currentStreak = 1;
    } else {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no change
      } else if (diffDays === 1) {
        // Consecutive day
        currentStreak += 1;
      } else {
        // Streak broken
        streakBroken = currentStreak > 0;
        currentStreak = 1;
      }
    }

    // Update longest streak
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update user
    await sequelize.query(
      `UPDATE users SET
        last_activity_date = :today,
        current_streak = :currentStreak,
        longest_streak = :longestStreak
      WHERE id = :userId`,
      {
        replacements: { today, currentStreak, longestStreak, userId },
        type: QueryTypes.UPDATE
      }
    );

    // Award streak bonuses
    await this.checkStreakAchievements(userId, currentStreak);

    return { currentStreak, longestStreak, streakBroken };
  }

  /**
   * Check and unlock streak achievements
   */
  private async checkStreakAchievements(userId: string, streak: number): Promise<void> {
    const streakMilestones = [3, 7, 14, 30, 60, 100];
    const xpRewards: Record<number, keyof typeof XP_REWARDS> = {
      3: 'dailyStreak3',
      7: 'dailyStreak7',
      14: 'dailyStreak14',
      30: 'dailyStreak30'
    };

    for (const milestone of streakMilestones) {
      if (streak >= milestone) {
        await this.checkAndUnlockAchievement(userId, 'streak', milestone);
        if (xpRewards[milestone]) {
          await this.awardXP(userId, xpRewards[milestone]);
        }
      }
    }
  }

  /**
   * Check and unlock an achievement
   */
  async checkAndUnlockAchievement(
    userId: string,
    achievementType: string,
    progressValue: number
  ): Promise<{ unlocked: Achievement[]; alreadyUnlocked: boolean }> {
    // Find achievements matching the type
    const achievements = await Achievement.findAll({
      where: {
        achievement_type: achievementType,
        threshold_value: { [Op.lte]: progressValue },
        is_active: true
      }
    });

    const unlocked: Achievement[] = [];

    for (const achievement of achievements) {
      // Check if already unlocked
      const [existing] = await UserAchievement.findOrCreate({
        where: { user_id: userId, achievement_id: achievement.id },
        defaults: {
          user_id: userId,
          achievement_id: achievement.id,
          progress: progressValue,
          is_unlocked: false
        }
      });

      if (!existing.is_unlocked && progressValue >= (achievement.threshold_value || 0)) {
        // Unlock achievement
        await existing.update({
          is_unlocked: true,
          unlocked_at: new Date(),
          progress: progressValue
        });

        // Award XP reward
        if (achievement.xp_reward) {
          await sequelize.query(
            `UPDATE users SET total_xp = total_xp + :xp WHERE id = :userId`,
            {
              replacements: { xp: achievement.xp_reward, userId },
              type: QueryTypes.UPDATE
            }
          );
        }

        // Send notification
        await this.notifyAchievementUnlocked(userId, achievement);

        unlocked.push(achievement);
      }
    }

    return { unlocked, alreadyUnlocked: unlocked.length === 0 };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: 'xp' | 'streak' | 'questions' = 'xp',
    limit: number = 10,
    timeframe: 'all' | 'weekly' | 'monthly' = 'all'
  ): Promise<any[]> {
    let orderColumn: string;
    switch (type) {
      case 'streak':
        orderColumn = 'current_streak';
        break;
      case 'questions':
        orderColumn = 'total_questions_answered';
        break;
      default:
        orderColumn = 'total_xp';
    }

    const results = await sequelize.query<any>(
      `SELECT
        id,
        full_name,
        avatar_url,
        total_xp,
        current_streak,
        longest_streak,
        RANK() OVER (ORDER BY ${orderColumn} DESC) as rank
      FROM users
      WHERE is_active = true
      ORDER BY ${orderColumn} DESC
      LIMIT :limit`,
      {
        replacements: { limit },
        type: QueryTypes.SELECT
      }
    );

    return results.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.full_name,
      avatar: user.avatar_url,
      xp: user.total_xp || 0,
      level: this.calculateLevel(user.total_xp || 0),
      levelName: LEVEL_NAMES[this.calculateLevel(user.total_xp || 0) - 1],
      streak: user.current_streak || 0
    }));
  }

  /**
   * Get user's gamification stats
   */
  async getUserStats(userId: string): Promise<any> {
    const [user] = await sequelize.query<any>(
      `SELECT
        total_xp,
        current_streak,
        longest_streak,
        last_activity_date,
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = :userId AND is_unlocked = true) as achievements_unlocked,
        (SELECT COUNT(*) FROM achievements WHERE is_active = true) as total_achievements
      FROM users
      WHERE id = :userId`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    if (!user) throw new Error('User not found');

    const totalXP = user.total_xp || 0;
    const level = this.calculateLevel(totalXP);
    const levelProgress = this.getXPForNextLevel(totalXP);

    // Get user's rank
    const [rankData] = await sequelize.query<any>(
      `SELECT COUNT(*) + 1 as rank FROM users WHERE total_xp > :totalXP AND is_active = true`,
      {
        replacements: { totalXP },
        type: QueryTypes.SELECT
      }
    );

    return {
      totalXP,
      level,
      levelName: LEVEL_NAMES[level - 1],
      xpToNextLevel: levelProgress.nextLevelXP - totalXP,
      levelProgress: levelProgress.progress,
      currentStreak: user.current_streak || 0,
      longestStreak: user.longest_streak || 0,
      achievementsUnlocked: user.achievements_unlocked || 0,
      totalAchievements: user.total_achievements || 0,
      rank: rankData?.rank || 0
    };
  }

  /**
   * Send level up notification
   */
  private async notifyLevelUp(userId: string, newLevel: number): Promise<void> {
    await Notification.create({
      user_id: userId,
      title: `Level Up! You're now Level ${newLevel}`,
      message: `Congratulations! You've reached ${LEVEL_NAMES[newLevel - 1]}. Keep up the great work!`,
      notification_type: 'achievement',
      action_url: '/progress/achievements'
    });
  }

  /**
   * Send achievement unlocked notification
   */
  private async notifyAchievementUnlocked(userId: string, achievement: Achievement): Promise<void> {
    await Notification.create({
      user_id: userId,
      title: `Achievement Unlocked: ${achievement.name}`,
      message: achievement.description || 'Great job!',
      notification_type: 'achievement',
      action_url: '/progress/achievements',
      action_data: { achievementId: achievement.id }
    });
  }
}

export const gamificationEngine = new GamificationEngine();
export default gamificationEngine;
