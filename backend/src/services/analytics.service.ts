/**
 * Analytics Service - Dashboard stats, trends, and reporting
 */

import { Op, fn, col, literal } from 'sequelize';
import { QuizSession } from '../models/QuizSession';
import { CATSession } from '../models/CATSession';
import { StudyActivity } from '../models/StudyActivity';
import { StudyGoal } from '../models/StudyGoal';
import { User } from '../models/User';

export class AnalyticsService {
  /**
   * Get complete dashboard data
   */
  async getDashboard(userId: string) {
    const [stats, streak, goals, recentActivity] = await Promise.all([
      this.getStats(userId),
      this.getStreak(userId),
      this.getGoals(userId),
      this.getRecentActivity(userId, 5)
    ]);

    return {
      stats,
      streak,
      goals,
      recentActivity
    };
  }

  /**
   * Get user stats
   */
  async getStats(userId: string) {
    // Get quiz stats
    const quizSessions = await QuizSession.findAll({
      where: { userId, status: 'completed' }
    });

    const totalQuizQuestions = quizSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalQuizCorrect = quizSessions.reduce((sum, s) => sum + s.questionsCorrect, 0);
    const quizAccuracy = totalQuizQuestions > 0 
      ? Math.round((totalQuizCorrect / totalQuizQuestions) * 100) 
      : 0;

    // Get CAT stats
    const catSessions = await CATSession.findAll({
      where: { userId, status: 'completed' }
    });

    const latestCAT = catSessions[0];
    const catPassRate = catSessions.length > 0
      ? Math.round((catSessions.filter(s => s.result === 'pass').length / catSessions.length) * 100)
      : 0;

    // Calculate study time (from all sessions)
    const totalStudyTime = quizSessions.reduce((sum, s) => sum + s.timeSpent, 0) +
                          catSessions.reduce((sum, s) => sum + s.timeSpent, 0);

    // Get this week's activity count
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weeklyActivity = await StudyActivity.count({
      where: {
        userId,
        createdAt: { [Op.gte]: weekStart }
      }
    });

    return {
      questionsAnswered: totalQuizQuestions,
      quizAccuracy,
      catTestsTaken: catSessions.length,
      catPassRate,
      currentAbility: latestCAT?.currentAbility || 0,
      totalStudyTime: Math.round(totalStudyTime / 60), // minutes
      weeklyActivity,
      confidenceLevel: latestCAT 
        ? Math.round((1 - latestCAT.standardError) * 100) 
        : 0
    };
  }

  /**
   * Get confidence trend over time
   */
  async getConfidenceTrend(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const catSessions = await CATSession.findAll({
      where: {
        userId,
        status: 'completed',
        createdAt: { [Op.gte]: startDate }
      },
      order: [['createdAt', 'ASC']]
    });

    return catSessions.map(s => ({
      date: s.createdAt.toISOString().split('T')[0],
      ability: s.currentAbility,
      confidence: Math.round((1 - s.standardError) * 100),
      passingProbability: Math.round(s.passingProbability * 100)
    }));
  }

  /**
   * Get category performance breakdown
   */
  async getCategoryPerformance(userId: string) {
    const catSessions = await CATSession.findAll({
      where: { userId, status: 'completed' },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Aggregate category performance
    const categories: Record<string, { correct: number; total: number }> = {};

    for (const session of catSessions) {
      for (const [cat, perf] of Object.entries(session.categoryPerformance || {})) {
        if (!categories[cat]) categories[cat] = { correct: 0, total: 0 };
        categories[cat].correct += perf.correct;
        categories[cat].total += perf.total;
      }
    }

    const categoryLabels: Record<string, string> = {
      safe_effective_care: 'Safe Care',
      health_promotion: 'Health Promotion',
      psychosocial: 'Psychosocial',
      physiological_basic: 'Basic Care',
      physiological_complex: 'Complex Care'
    };

    return Object.entries(categories).map(([cat, perf]) => ({
      category: cat,
      label: categoryLabels[cat] || cat,
      correct: perf.correct,
      total: perf.total,
      percentage: perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0
    }));
  }

  /**
   * Get weekly activity data
   */
  async getWeeklyActivity(userId: string) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData: { day: string; questions: number; minutes: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const quizzes = await QuizSession.findAll({
        where: {
          userId,
          createdAt: { [Op.gte]: date, [Op.lt]: nextDate }
        }
      });

      const catTests = await CATSession.findAll({
        where: {
          userId,
          createdAt: { [Op.gte]: date, [Op.lt]: nextDate }
        }
      });

      const questions = quizzes.reduce((sum, s) => sum + s.questionsAnswered, 0) +
                       catTests.reduce((sum, s) => sum + s.questionsAnswered, 0);
      
      const minutes = Math.round(
        (quizzes.reduce((sum, s) => sum + s.timeSpent, 0) +
         catTests.reduce((sum, s) => sum + s.timeSpent, 0)) / 60
      );

      weekData.push({
        day: days[date.getDay()],
        questions,
        minutes
      });
    }

    return weekData;
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(userId: string, limit: number = 10) {
    const activities = await StudyActivity.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });

    return activities.map(a => ({
      id: a.id,
      type: a.activityType,
      description: a.description,
      points: a.pointsEarned,
      timestamp: a.createdAt.toISOString(),
      metadata: a.metadata
    }));
  }

  /**
   * Get study streak
   */
  async getStreak(userId: string) {
    const activities = await StudyActivity.findAll({
      where: { userId },
      attributes: [
        [fn('DATE', col('created_at')), 'date']
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'DESC']],
      raw: true
    }) as any[];

    if (activities.length === 0) {
      return { current: 0, longest: 0, lastActive: null };
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const dates = activities.map(a => a.date);
    
    // Check if active today or yesterday
    if (dates[0] === today || dates[0] === yesterday) {
      currentStreak = 1;
      let expectedDate = new Date(dates[0]);
      
      for (let i = 1; i < dates.length; i++) {
        expectedDate.setDate(expectedDate.getDate() - 1);
        const expected = expectedDate.toISOString().split('T')[0];
        
        if (dates[i] === expected) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = currentStreak;
    let tempStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return {
      current: currentStreak,
      longest: Math.max(longestStreak, currentStreak),
      lastActive: dates[0]
    };
  }

  /**
   * Get study goals
   */
  async getGoals(userId: string) {
    const goals = await StudyGoal.findAll({
      where: { userId, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    return goals.map(g => ({
      id: g.id,
      title: g.title,
      type: g.type,
      period: g.period,
      target: g.target,
      current: g.current,
      progress: g.progress
    }));
  }

  /**
   * Create a study goal
   */
  async createGoal(
    userId: string,
    data: { title: string; type: string; period: string; target: number }
  ) {
    const goal = await StudyGoal.create({
      userId,
      title: data.title,
      type: data.type,
      period: data.period,
      target: data.target,
      current: 0,
      lastReset: new Date()
    });

    return {
      id: goal.id,
      title: goal.title,
      type: goal.type,
      period: goal.period,
      target: goal.target,
      current: goal.current,
      progress: goal.progress
    };
  }

  /**
   * Update a study goal
   */
  async updateGoal(goalId: string, userId: string, updates: Partial<StudyGoal>) {
    const goal = await StudyGoal.findByPk(goalId);
    if (!goal) throw new Error('Goal not found');
    if (goal.userId !== userId) throw new Error('Unauthorized');

    await goal.update(updates);
    return goal;
  }

  /**
   * Delete a study goal
   */
  async deleteGoal(goalId: string, userId: string) {
    const goal = await StudyGoal.findByPk(goalId);
    if (!goal) throw new Error('Goal not found');
    if (goal.userId !== userId) throw new Error('Unauthorized');

    await goal.destroy();
    return { success: true };
  }

  /**
   * Increment goal progress (called after activities)
   */
  async incrementGoalProgress(userId: string, type: string, amount: number = 1) {
    const goals = await StudyGoal.findAll({
      where: { userId, type, isActive: true }
    });

    for (const goal of goals) {
      const newCurrent = goal.current + amount;
      await goal.update({ current: newCurrent });

      // Check if goal achieved
      if (newCurrent >= goal.target && goal.current < goal.target) {
        await StudyActivity.create({
          userId,
          activityType: 'goal_achieved',
          description: `Achieved goal: ${goal.title}`,
          metadata: { goalId: goal.id },
          pointsEarned: 50
        });
      }
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
