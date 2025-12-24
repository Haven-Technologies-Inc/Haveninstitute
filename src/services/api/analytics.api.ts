import { apiClient } from './client';

// Types for dashboard analytics
export interface DashboardStats {
  confidence: number;
  streak: number;
  avgScore: number;
  hoursStudied: number;
  totalQuizzes: number;
  totalCATs: number;
}

export interface ConfidenceTrendPoint {
  date: string;
  confidence: number;
  ability: number;
  test: string;
}

export interface CategoryPerformance {
  category: string;
  categoryShort: string;
  score: number;
  questionsAnswered: number;
  color: string;
}

export interface WeeklyActivity {
  day: string;
  questions: number;
  timeMinutes: number;
}

export interface RecentActivity {
  id: string;
  type: 'cat' | 'quiz' | 'flashcard' | 'reading';
  action: string;
  score: string;
  timestamp: string;
  time: string; // relative time e.g. "2 hours ago"
}

export interface StudyGoal {
  id: string;
  type: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  confidenceTrend: ConfidenceTrendPoint[];
  categoryPerformance: CategoryPerformance[];
  weeklyActivity: WeeklyActivity[];
  recentActivity: RecentActivity[];
  studyGoals: StudyGoal[];
}

// Analytics API endpoints
export const analyticsApi = {
  // Get complete dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  // Get dashboard stats only
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/analytics/stats');
    return response.data;
  },

  // Get confidence trend over time
  getConfidenceTrend: async (days: number = 30): Promise<ConfidenceTrendPoint[]> => {
    const response = await apiClient.get('/analytics/confidence-trend', {
      params: { days },
    });
    return response.data;
  },

  // Get category performance breakdown
  getCategoryPerformance: async (): Promise<CategoryPerformance[]> => {
    const response = await apiClient.get('/analytics/category-performance');
    return response.data;
  },

  // Get weekly activity data
  getWeeklyActivity: async (): Promise<WeeklyActivity[]> => {
    const response = await apiClient.get('/analytics/weekly-activity');
    return response.data;
  },

  // Get recent activity log
  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await apiClient.get('/analytics/recent-activity', {
      params: { limit },
    });
    return response.data;
  },

  // Get study goals
  getStudyGoals: async (): Promise<StudyGoal[]> => {
    const response = await apiClient.get('/goals');
    return response.data;
  },

  // Create a new study goal
  createGoal: async (goal: Omit<StudyGoal, 'id' | 'current'>): Promise<StudyGoal> => {
    const response = await apiClient.post('/goals', goal);
    return response.data;
  },

  // Update a study goal
  updateGoal: async (goalId: string, updates: Partial<StudyGoal>): Promise<StudyGoal> => {
    const response = await apiClient.put(`/goals/${goalId}`, updates);
    return response.data;
  },

  // Delete a study goal
  deleteGoal: async (goalId: string): Promise<void> => {
    await apiClient.delete(`/goals/${goalId}`);
  },

  // Get study streak info
  getStreak: async (): Promise<{ currentStreak: number; longestStreak: number; lastActivityDate: string }> => {
    const response = await apiClient.get('/analytics/streak');
    return response.data;
  },
};

export default analyticsApi;
