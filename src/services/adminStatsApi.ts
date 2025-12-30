/**
 * Admin Statistics API Service
 * Fetches real-time statistics from the backend for the admin dashboard
 */

import api from './api';

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
  recentAttempts: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    completedAt: string;
    timeSpent: number;
  }[];
  scoreDistribution: { range: string; count: number }[];
}

export interface ContentStats {
  totalQuestions: number;
  questionsByCategory: Record<string, number>;
  questionsByDifficulty: Record<string, number>;
  totalFlashcards: number;
  totalFlashcardDecks: number;
  totalBooks: number;
  recentlyAddedQuestions: {
    id: string;
    category: string;
    difficulty: string;
    type: string;
    createdAt: string;
  }[];
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
  recentTransactions: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
  revenueTrend: { date: string; amount: number }[];
}

export interface RecentActivity {
  type: string;
  user: string;
  userId: string;
  action: string;
  details?: string;
  score?: number;
  timestamp: string;
}

export interface SystemHealth {
  database: boolean;
  activeConnections: number;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

export const adminStatsApi = {
  /**
   * Get dashboard overview with key metrics
   */
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get('/admin/stats/overview');
    return response.data.data;
  },

  /**
   * Get detailed user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const response = await api.get('/admin/stats/users');
    return response.data.data;
  },

  /**
   * Get quiz statistics
   */
  async getQuizStats(): Promise<QuizStats> {
    const response = await api.get('/admin/stats/quizzes');
    return response.data.data;
  },

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<ContentStats> {
    const response = await api.get('/admin/stats/content');
    return response.data.data;
  },

  /**
   * Get engagement statistics
   */
  async getEngagementStats(): Promise<EngagementStats> {
    const response = await api.get('/admin/stats/engagement');
    return response.data.data;
  },

  /**
   * Get revenue statistics
   */
  async getRevenueStats(): Promise<RevenueStats> {
    const response = await api.get('/admin/stats/revenue');
    return response.data.data;
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 50): Promise<RecentActivity[]> {
    const response = await api.get(`/admin/stats/activity?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await api.get('/admin/stats/health');
    return response.data.data;
  },

  /**
   * Get all stats at once (for dashboard)
   */
  async getAllStats(): Promise<{
    overview: DashboardOverview;
    users: UserStats;
    quizzes: QuizStats;
    content: ContentStats;
    engagement: EngagementStats;
    revenue: RevenueStats;
    recentActivity: RecentActivity[];
  }> {
    const [overview, users, quizzes, content, engagement, revenue, recentActivity] = await Promise.all([
      this.getOverview(),
      this.getUserStats(),
      this.getQuizStats(),
      this.getContentStats(),
      this.getEngagementStats(),
      this.getRevenueStats(),
      this.getRecentActivity(20)
    ]);

    return { overview, users, quizzes, content, engagement, revenue, recentActivity };
  }
};

export default adminStatsApi;
