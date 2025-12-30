/**
 * Admin Statistics Service
 * Provides real-time statistics from the database for the admin dashboard
 */

import { Op, fn, col } from 'sequelize';
import {
  User,
  Question,
  QuizSession,
  CATSession,
  FlashcardDeck,
  Flashcard,
  StudyActivity,
  Subscription,
  PaymentTransaction,
  LoginAudit,
  Book
} from '../models';
import { sequelize } from '../config/database';

export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalQuestions: number;
  totalQuizAttempts: number;
  totalCATSessions: number;
  averageQuizScore: number;
  totalStudyTime: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  bySubscription: Record<string, number>;
  registrationTrend: { date: string; count: number }[];
  topActiveUsers: { id: string; name: string; email: string; activityCount: number }[];
}

export interface QuizStats {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  passRate: number;
  categoryBreakdown: Record<string, { attempts: number; avgScore: number }>;
  difficultyBreakdown: Record<string, { attempts: number; avgScore: number }>;
  recentAttempts: any[];
  scoreDistribution: { range: string; count: number }[];
}

export interface ContentStats {
  totalQuestions: number;
  questionsByCategory: Record<string, number>;
  questionsByDifficulty: Record<string, number>;
  totalFlashcards: number;
  totalFlashcardDecks: number;
  totalBooks: number;
  recentlyAddedQuestions: any[];
}

export interface EngagementStats {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  totalStudyTime: number;
  studyTimeByDay: { date: string; minutes: number }[];
  topStudyCategories: { category: string; time: number }[];
  loginActivity: { date: string; logins: number }[];
}

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueByTier: Record<string, number>;
  activeSubscriptions: number;
  subscriptionsByTier: Record<string, number>;
  churnRate: number;
  recentTransactions: any[];
  revenueTrend: { date: string; amount: number }[];
}

export interface RecentActivity {
  type: string;
  user: string;
  userId: string;
  action: string;
  details?: string;
  score?: number;
  timestamp: Date;
}

class AdminStatsService {
  /**
   * Get dashboard overview with key metrics
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalQuestions,
      quizStats,
      catSessions,
      studyTimeResult,
      subscriptionStats,
      revenueResult
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
      User.count({ where: { createdAt: { [Op.gte]: startOfWeek } } }),
      User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Question.count(),
      QuizSession.findAll({
        attributes: [
          [fn('COUNT', col('id')), 'total'],
          [fn('AVG', col('score')), 'avgScore']
        ],
        raw: true
      }),
      CATSession.count(),
      StudyActivity.findOne({
        attributes: [[fn('SUM', col('duration')), 'totalMinutes']],
        raw: true
      }),
      Subscription.findAll({
        attributes: [
          [fn('COUNT', col('id')), 'active']
        ],
        where: { status: 'active' },
        raw: true
      }),
      PaymentTransaction.findOne({
        attributes: [[fn('SUM', col('amount')), 'total']],
        where: {
          status: 'completed',
          createdAt: { [Op.gte]: startOfMonth }
        },
        raw: true
      })
    ]);

    const quizData = quizStats[0] as any || { total: 0, avgScore: 0 };
    const studyData = studyTimeResult as any || { totalMinutes: 0 };
    const subData = subscriptionStats[0] as any || { active: 0 };
    const revData = revenueResult as any || { total: 0 };

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalQuestions,
      totalQuizAttempts: parseInt(quizData.total) || 0,
      totalCATSessions: catSessions,
      averageQuizScore: parseFloat(quizData.avgScore) || 0,
      totalStudyTime: parseInt(studyData.totalMinutes) || 0,
      activeSubscriptions: parseInt(subData.active) || 0,
      monthlyRevenue: parseFloat(revData.total) || 0
    };
  }

  /**
   * Get detailed user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      total,
      active,
      inactive,
      roleStats,
      subscriptionStats,
      registrationTrend,
      topActiveUsers
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { isActive: false } }),
      User.findAll({
        attributes: ['role', [fn('COUNT', col('id')), 'count']],
        group: ['role'],
        raw: true
      }),
      User.findAll({
        attributes: ['subscriptionTier', [fn('COUNT', col('id')), 'count']],
        group: ['subscriptionTier'],
        raw: true
      }),
      sequelize.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, { type: 'SELECT' }),
      sequelize.query(`
        SELECT u.id, u.full_name as name, u.email, COUNT(sa.id) as activityCount
        FROM users u
        LEFT JOIN study_activities sa ON u.id = sa.user_id
        WHERE sa.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY u.id
        ORDER BY activityCount DESC
        LIMIT 10
      `, { type: 'SELECT' })
    ]);

    const byRole: Record<string, number> = {};
    (roleStats as any[]).forEach(r => { byRole[r.role] = parseInt(r.count); });

    const bySubscription: Record<string, number> = {};
    (subscriptionStats as any[]).forEach(s => { bySubscription[s.subscriptionTier] = parseInt(s.count); });

    return {
      total,
      active,
      inactive,
      byRole,
      bySubscription,
      registrationTrend: (registrationTrend as any[]).map(r => ({
        date: r.date,
        count: parseInt(r.count)
      })),
      topActiveUsers: (topActiveUsers as any[]).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        activityCount: parseInt(u.activityCount)
      }))
    };
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(): Promise<QuizStats> {
    const [
      totalAttempts,
      completedAttempts,
      avgScoreResult,
      passRateResult,
      categoryStats,
      recentAttempts,
      scoreDistribution
    ] = await Promise.all([
      QuizSession.count(),
      QuizSession.count({ where: { status: 'completed' } }),
      QuizSession.findOne({
        attributes: [[fn('AVG', col('score')), 'avg']],
        where: { status: 'completed' },
        raw: true
      }),
      sequelize.query(`
        SELECT 
          COUNT(CASE WHEN score >= 70 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as passRate
        FROM quiz_sessions
        WHERE status = 'completed'
      `, { type: 'SELECT' }),
      sequelize.query(`
        SELECT 
          q.category,
          COUNT(qs.id) as attempts,
          AVG(qs.score) as avgScore
        FROM quiz_sessions qs
        JOIN questions q ON q.id = (
          SELECT question_id FROM quiz_responses WHERE quiz_session_id = qs.id LIMIT 1
        )
        WHERE qs.status = 'completed'
        GROUP BY q.category
      `, { type: 'SELECT' }),
      QuizSession.findAll({
        where: { status: 'completed' },
        order: [['completedAt', 'DESC']],
        limit: 20,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }]
      }),
      sequelize.query(`
        SELECT 
          CASE 
            WHEN score >= 90 THEN '90-100'
            WHEN score >= 80 THEN '80-89'
            WHEN score >= 70 THEN '70-79'
            WHEN score >= 60 THEN '60-69'
            WHEN score >= 50 THEN '50-59'
            ELSE '0-49'
          END as \`range\`,
          COUNT(*) as count
        FROM quiz_sessions
        WHERE status = 'completed'
        GROUP BY \`range\`
        ORDER BY \`range\` DESC
      `, { type: 'SELECT' })
    ]);

    const avgData = avgScoreResult as any || { avg: 0 };
    const passData = (passRateResult as any[])[0] || { passRate: 0 };

    const categoryBreakdown: Record<string, { attempts: number; avgScore: number }> = {};
    (categoryStats as any[]).forEach(c => {
      categoryBreakdown[c.category] = {
        attempts: parseInt(c.attempts),
        avgScore: parseFloat(c.avgScore) || 0
      };
    });

    return {
      totalAttempts,
      completedAttempts,
      averageScore: parseFloat(avgData.avg) || 0,
      passRate: parseFloat(passData.passRate) || 0,
      categoryBreakdown,
      difficultyBreakdown: {},
      recentAttempts: recentAttempts.map(a => {
        const quiz = a as any;
        const score = quiz.questionsAnswered > 0 
          ? Math.round((quiz.questionsCorrect / quiz.questionsAnswered) * 100) 
          : 0;
        return {
          id: quiz.id,
          userId: quiz.userId,
          userName: quiz.user?.fullName || 'Unknown',
          userEmail: quiz.user?.email || '',
          score,
          totalQuestions: quiz.questionCount,
          correctAnswers: quiz.questionsCorrect,
          completedAt: quiz.completedAt,
          timeSpent: quiz.timeSpent
        };
      }),
      scoreDistribution: (scoreDistribution as any[]).map(s => ({
        range: s.range,
        count: parseInt(s.count)
      }))
    };
  }

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<ContentStats> {
    const [
      totalQuestions,
      categoryStats,
      difficultyStats,
      totalFlashcards,
      totalFlashcardDecks,
      totalBooks,
      recentQuestions
    ] = await Promise.all([
      Question.count(),
      Question.findAll({
        attributes: ['category', [fn('COUNT', col('id')), 'count']],
        group: ['category'],
        raw: true
      }),
      Question.findAll({
        attributes: ['difficulty', [fn('COUNT', col('id')), 'count']],
        group: ['difficulty'],
        raw: true
      }),
      Flashcard.count(),
      FlashcardDeck.count(),
      Book.count(),
      Question.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['id', 'category', 'difficulty', 'questionType', 'createdAt']
      })
    ]);

    const questionsByCategory: Record<string, number> = {};
    (categoryStats as any[]).forEach(c => { questionsByCategory[c.category] = parseInt(c.count); });

    const questionsByDifficulty: Record<string, number> = {};
    (difficultyStats as any[]).forEach(d => { questionsByDifficulty[d.difficulty] = parseInt(d.count); });

    return {
      totalQuestions,
      questionsByCategory,
      questionsByDifficulty,
      totalFlashcards,
      totalFlashcardDecks,
      totalBooks,
      recentlyAddedQuestions: recentQuestions.map(q => ({
        id: q.id,
        category: q.category,
        difficulty: q.difficulty,
        type: q.questionType,
        createdAt: q.createdAt
      }))
    };
  }

  /**
   * Get engagement statistics
   */
  async getEngagementStats(): Promise<EngagementStats> {
    const [
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      avgSessionDuration,
      totalStudyTime,
      studyTimeByDay,
      loginActivity
    ] = await Promise.all([
      sequelize.query(`
        SELECT COUNT(DISTINCT user_id) as count FROM sessions 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      `, { type: 'SELECT' }),
      sequelize.query(`
        SELECT COUNT(DISTINCT user_id) as count FROM sessions 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `, { type: 'SELECT' }),
      sequelize.query(`
        SELECT COUNT(DISTINCT user_id) as count FROM sessions 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, { type: 'SELECT' }),
      StudyActivity.findOne({
        attributes: [[fn('AVG', col('duration')), 'avg']],
        raw: true
      }),
      StudyActivity.findOne({
        attributes: [[fn('SUM', col('duration')), 'total']],
        raw: true
      }),
      sequelize.query(`
        SELECT DATE(created_at) as date, SUM(duration) as minutes
        FROM study_activities
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, { type: 'SELECT' }),
      sequelize.query(`
        SELECT DATE(created_at) as date, COUNT(*) as logins
        FROM login_audits
        WHERE event_type = 'login' AND success = true
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, { type: 'SELECT' })
    ]);

    const dauData = (dailyActiveUsers as any[])[0] || { count: 0 };
    const wauData = (weeklyActiveUsers as any[])[0] || { count: 0 };
    const mauData = (monthlyActiveUsers as any[])[0] || { count: 0 };
    const avgDuration = avgSessionDuration as any || { avg: 0 };
    const totalTime = totalStudyTime as any || { total: 0 };

    return {
      dailyActiveUsers: parseInt(dauData.count) || 0,
      weeklyActiveUsers: parseInt(wauData.count) || 0,
      monthlyActiveUsers: parseInt(mauData.count) || 0,
      averageSessionDuration: parseFloat(avgDuration.avg) || 0,
      totalStudyTime: parseInt(totalTime.total) || 0,
      studyTimeByDay: (studyTimeByDay as any[]).map(s => ({
        date: s.date,
        minutes: parseInt(s.minutes) || 0
      })),
      topStudyCategories: [],
      loginActivity: (loginActivity as any[]).map(l => ({
        date: l.date,
        logins: parseInt(l.logins) || 0
      }))
    };
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(): Promise<RevenueStats> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const [
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue,
      subscriptionStats,
      activeSubscriptions,
      recentTransactions,
      revenueTrend
    ] = await Promise.all([
      PaymentTransaction.findOne({
        attributes: [[fn('SUM', col('amount')), 'total']],
        where: { status: 'completed' },
        raw: true
      }),
      PaymentTransaction.findOne({
        attributes: [[fn('SUM', col('amount')), 'total']],
        where: { 
          status: 'completed',
          createdAt: { [Op.gte]: startOfMonth }
        },
        raw: true
      }),
      PaymentTransaction.findOne({
        attributes: [[fn('SUM', col('amount')), 'total']],
        where: { 
          status: 'completed',
          createdAt: { [Op.gte]: startOfYear }
        },
        raw: true
      }),
      User.findAll({
        attributes: ['subscriptionTier', [fn('COUNT', col('id')), 'count']],
        where: { subscriptionTier: { [Op.ne]: 'Free' } },
        group: ['subscriptionTier'],
        raw: true
      }),
      Subscription.count({ where: { status: 'active' } }),
      PaymentTransaction.findAll({
        order: [['createdAt', 'DESC']],
        limit: 20,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }]
      }),
      sequelize.query(`
        SELECT DATE(created_at) as date, SUM(amount) as amount
        FROM payment_transactions
        WHERE status = 'completed'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, { type: 'SELECT' })
    ]);

    const totalData = totalRevenue as any || { total: 0 };
    const monthData = monthlyRevenue as any || { total: 0 };
    const yearData = yearlyRevenue as any || { total: 0 };

    const subscriptionsByTier: Record<string, number> = {};
    const revenueByTier: Record<string, number> = {};
    (subscriptionStats as any[]).forEach(s => {
      subscriptionsByTier[s.subscriptionTier] = parseInt(s.count);
      // Estimate revenue by tier
      const price = s.subscriptionTier === 'Premium' ? 49.99 : 29.99;
      revenueByTier[s.subscriptionTier] = parseInt(s.count) * price;
    });

    return {
      totalRevenue: parseFloat(totalData.total) || 0,
      monthlyRevenue: parseFloat(monthData.total) || 0,
      yearlyRevenue: parseFloat(yearData.total) || 0,
      revenueByTier,
      activeSubscriptions,
      subscriptionsByTier,
      churnRate: 0, // TODO: Calculate actual churn rate
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        userId: t.userId,
        userName: (t as any).user?.fullName || 'Unknown',
        userEmail: (t as any).user?.email || '',
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        createdAt: t.createdAt
      })),
      revenueTrend: (revenueTrend as any[]).map(r => ({
        date: r.date,
        amount: parseFloat(r.amount) || 0
      }))
    };
  }

  /**
   * Get recent activity across the platform
   */
  async getRecentActivity(limit: number = 50): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Get recent quiz completions
    const recentQuizzes = await QuizSession.findAll({
      where: { status: 'completed' },
      order: [['completedAt', 'DESC']],
      limit: Math.floor(limit / 3),
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName'] }]
    });

    recentQuizzes.forEach(q => {
      const quiz = q as any;
      const score = quiz.questionsAnswered > 0 
        ? Math.round((quiz.questionsCorrect / quiz.questionsAnswered) * 100) 
        : 0;
      activities.push({
        type: 'quiz',
        user: quiz.user?.fullName || 'Unknown User',
        userId: quiz.userId,
        action: 'Completed quiz',
        score,
        details: `Score: ${score}% (${quiz.questionsCorrect}/${quiz.questionCount})`,
        timestamp: quiz.completedAt || quiz.updatedAt
      });
    });

    // Get recent CAT sessions
    const recentCAT = await CATSession.findAll({
      where: { status: 'completed' },
      order: [['completedAt', 'DESC']],
      limit: Math.floor(limit / 3),
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName'] }]
    });

    recentCAT.forEach(c => {
      const cat = c as any;
      activities.push({
        type: 'cat',
        user: cat.user?.fullName || 'Unknown User',
        userId: cat.userId,
        action: 'Completed CAT session',
        score: cat.currentAbility ? Math.round(cat.passingProbability * 100) : undefined,
        details: cat.result === 'pass' ? 'Passed' : 'Did not pass',
        timestamp: cat.completedAt || cat.updatedAt
      });
    });

    // Get recent logins
    const recentLogins = await LoginAudit.findAll({
      where: { eventType: 'login', success: true },
      order: [['createdAt', 'DESC']],
      limit: Math.floor(limit / 3),
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName'] }]
    });

    recentLogins.forEach(l => {
      activities.push({
        type: 'login',
        user: (l as any).user?.fullName || l.email || 'Unknown User',
        userId: l.userId || '',
        action: 'Logged in',
        details: `From ${l.ipAddress || 'unknown location'}`,
        timestamp: l.createdAt
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, limit);
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<{
    database: boolean;
    activeConnections: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  }> {
    let dbHealthy = false;
    try {
      await sequelize.authenticate();
      dbHealthy = true;
    } catch (e) {
      dbHealthy = false;
    }

    return {
      database: dbHealthy,
      activeConnections: (sequelize as any).pool?.size || 0,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }
}

export const adminStatsService = new AdminStatsService();
