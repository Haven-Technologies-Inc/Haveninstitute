/**
 * Progress Service
 * 
 * Handles user study progress, statistics, and data sync
 */

import { Op } from 'sequelize';
import { User } from '../models/User';
import { StudyActivity } from '../models/StudyActivity';
import { CATSession } from '../models/CATSession';
import { QuizSession } from '../models/QuizSession';
import { UserFlashcardProgress } from '../models/Flashcard';
import { UserBook } from '../models/Book';

export interface DailyStats {
  date: string;
  studyTimeMinutes: number;
  questionsAnswered: number;
  correctAnswers: number;
  flashcardsReviewed: number;
  pagesRead: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalStudyTimeMinutes: number;
  totalQuestionsAnswered: number;
  averageAccuracy: number;
  streakDays: number;
  topCategories: { category: string; count: number }[];
}

export interface OverallProgress {
  totalStudyTimeMinutes: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  catSessionsCompleted: number;
  averageCatScore: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  flashcardsLearned: number;
  booksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
  memberSince: Date;
}

export class ProgressService {
  /**
   * Record study activity
   */
  async recordActivity(
    userId: string,
    activityType: string,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<StudyActivity> {
    return StudyActivity.create({
      userId,
      activityType,
      description,
      metadata,
    } as Partial<StudyActivity>);
  }

  /**
   * Get daily statistics for a user
   */
  async getDailyStats(userId: string, date: Date = new Date()): Promise<DailyStats> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await StudyActivity.findAll({
      where: {
        userId,
        createdAt: { [Op.between]: [startOfDay, endOfDay] },
      },
    });

    let studyTimeMinutes = 0;
    let questionsAnswered = 0;
    let correctAnswers = 0;
    let flashcardsReviewed = 0;
    let pagesRead = 0;

    for (const activity of activities) {
      const meta = activity.metadata || {};
      studyTimeMinutes += Math.round((meta.timeSpent || 0) / 60);
      
      if (activity.activityType === 'quiz_completed' || activity.activityType === 'cat_completed') {
        questionsAnswered += meta.total || 0;
        correctAnswers += meta.score || 0;
      } else if (activity.activityType === 'flashcard_reviewed') {
        flashcardsReviewed += meta.total || 1;
      } else if (activity.activityType === 'book_read') {
        pagesRead += meta.total || 0;
      }
    }

    return {
      date: date.toISOString().split('T')[0],
      studyTimeMinutes,
      questionsAnswered,
      correctAnswers,
      flashcardsReviewed,
      pagesRead,
    };
  }

  /**
   * Get weekly statistics for a user
   */
  async getWeeklyStats(userId: string, weekOffset = 0): Promise<WeeklyStats> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() - (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const activities = await StudyActivity.findAll({
      where: {
        userId,
        createdAt: { [Op.between]: [startOfWeek, endOfWeek] },
      },
    });

    let totalStudyTimeMinutes = 0;
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    const categoryCount: Record<string, number> = {};
    const studyDays = new Set<string>();

    for (const activity of activities) {
      const meta = activity.metadata || {};
      totalStudyTimeMinutes += Math.round((meta.timeSpent || 0) / 60);
      
      if (activity.activityType === 'quiz_completed' || activity.activityType === 'cat_completed') {
        totalQuestionsAnswered += meta.total || 0;
        totalCorrectAnswers += meta.score || 0;
        if (meta.category) {
          categoryCount[meta.category] = (categoryCount[meta.category] || 0) + 1;
        }
      }

      studyDays.add(activity.createdAt.toISOString().split('T')[0]);
    }

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return {
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
      totalStudyTimeMinutes,
      totalQuestionsAnswered,
      averageAccuracy: totalQuestionsAnswered > 0 
        ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) 
        : 0,
      streakDays: studyDays.size,
      topCategories,
    };
  }

  /**
   * Get overall progress for a user
   */
  async getOverallProgress(userId: string): Promise<OverallProgress> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Get all activities
    const activities = await StudyActivity.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    let totalStudyTimeMinutes = 0;
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;

    for (const activity of activities) {
      const meta = activity.metadata || {};
      totalStudyTimeMinutes += Math.round((meta.timeSpent || 0) / 60);
      totalQuestionsAnswered += meta.total || 0;
      totalCorrectAnswers += meta.score || 0;
    }

    // Get CAT sessions
    const catSessions = await CATSession.findAll({
      where: { userId, status: 'completed' },
    });

    const averageCatScore = catSessions.length > 0
      ? catSessions.reduce((sum, s) => sum + s.scorePercentage, 0) / catSessions.length
      : 0;

    // Get Quiz sessions
    const quizSessions = await QuizSession.findAll({
      where: { userId, status: 'completed' },
    });

    const averageQuizScore = quizSessions.length > 0
      ? quizSessions.reduce((sum, s) => {
          const score = s.questionsAnswered > 0 
            ? (s.questionsCorrect / s.questionsAnswered) * 100 
            : 0;
          return sum + score;
        }, 0) / quizSessions.length
      : 0;

    // Get flashcard progress
    const flashcardProgress = await UserFlashcardProgress.count({
      where: { userId, masteryLevel: { [Op.gte]: 3 } },
    });

    // Get completed books
    const completedBooks = await UserBook.count({
      where: { userId, completedAt: { [Op.ne]: null } },
    });

    // Calculate streak
    const streak = await this.calculateStreak(userId);

    return {
      totalStudyTimeMinutes,
      totalQuestionsAnswered,
      totalCorrectAnswers,
      overallAccuracy: totalQuestionsAnswered > 0
        ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
        : 0,
      catSessionsCompleted: catSessions.length,
      averageCatScore: Math.round(averageCatScore),
      quizzesCompleted: quizSessions.length,
      averageQuizScore: Math.round(averageQuizScore),
      flashcardsLearned: flashcardProgress,
      booksCompleted: completedBooks,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      lastStudyDate: activities.length > 0 ? activities[0].createdAt : null,
      memberSince: user.createdAt,
    };
  }

  /**
   * Calculate study streak
   */
  async calculateStreak(userId: string): Promise<{ current: number; longest: number }> {
    const activities = await StudyActivity.findAll({
      where: { userId },
      attributes: ['createdAt'],
      order: [['createdAt', 'DESC']],
    });

    if (activities.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Get unique study days
    const studyDays = [...new Set(
      activities.map(a => a.createdAt.toISOString().split('T')[0])
    )].sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if studied today or yesterday
    if (studyDays[0] === today || studyDays[0] === yesterday) {
      currentStreak = 1;
      
      for (let i = 1; i < studyDays.length; i++) {
        const prevDate = new Date(studyDays[i - 1]);
        const currDate = new Date(studyDays[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          break;
        }
      }
    }

    // Calculate longest streak from all days
    tempStreak = 1;
    for (let i = 1; i < studyDays.length; i++) {
      const prevDate = new Date(studyDays[i - 1]);
      const currDate = new Date(studyDays[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash', 'mfaSecret'] },
    });

    if (!user) throw new Error('User not found');

    const activities = await StudyActivity.findAll({ where: { userId } });
    const catSessions = await CATSession.findAll({ where: { userId } });
    const quizSessions = await QuizSession.findAll({ where: { userId } });
    const flashcardProgress = await UserFlashcardProgress.findAll({ where: { userId } });
    const userBooks = await UserBook.findAll({ where: { userId } });

    return {
      user: user.toJSON(),
      activities: activities.map(a => a.toJSON()),
      catSessions: catSessions.map(s => s.toJSON()),
      quizSessions: quizSessions.map(s => s.toJSON()),
      flashcardProgress: flashcardProgress.map(p => p.toJSON()),
      userBooks: userBooks.map(b => b.toJSON()),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Delete user account and all data (GDPR compliance)
   */
  async deleteUserAccount(userId: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) return false;

    // Delete all user data
    await StudyActivity.destroy({ where: { userId } });
    await CATSession.destroy({ where: { userId } });
    await QuizSession.destroy({ where: { userId } });
    await UserFlashcardProgress.destroy({ where: { userId } });
    await UserBook.destroy({ where: { userId } });
    
    // Finally delete user
    await user.destroy();

    return true;
  }
}

export const progressService = new ProgressService();
export default progressService;
