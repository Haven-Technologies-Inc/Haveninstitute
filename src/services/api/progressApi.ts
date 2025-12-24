import api from '../api';

export interface DashboardStats {
  questionsAnswered: number;
  quizAccuracy: number;
  catTestsTaken: number;
  catPassRate: number;
  currentAbility: number;
  totalStudyTime: number;
  weeklyActivity: number;
  confidenceLevel: number;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActive: string | null;
}

export interface StudyGoal {
  id: string;
  title: string;
  type: string;
  period: string;
  target: number;
  current: number;
  progress: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  points: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CategoryPerformance {
  category: string;
  label: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface WeeklyActivity {
  day: string;
  questions: number;
  minutes: number;
}

export interface ConfidenceTrend {
  date: string;
  ability: number;
  confidence: number;
  passingProbability: number;
}

export interface DashboardData {
  stats: DashboardStats;
  streak: StreakData;
  goals: StudyGoal[];
  recentActivity: RecentActivity[];
}

export interface InsightsData {
  categoryPerformance: CategoryPerformance[];
  weeklyActivity: WeeklyActivity[];
  confidenceTrend: ConfidenceTrend[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export const progressApi = {
  // Get complete dashboard data
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get('/analytics/dashboard');
    return response.data.data;
  },

  // Get user stats
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/analytics/stats');
    return response.data.data;
  },

  // Get streak data
  async getStreak(): Promise<StreakData> {
    const response = await api.get('/analytics/streak');
    return response.data.data;
  },

  // Get confidence trend over time
  async getConfidenceTrend(days = 30): Promise<ConfidenceTrend[]> {
    const response = await api.get(`/analytics/confidence-trend?days=${days}`);
    return response.data.data;
  },

  // Get category performance breakdown
  async getCategoryPerformance(): Promise<CategoryPerformance[]> {
    const response = await api.get('/analytics/category-performance');
    return response.data.data;
  },

  // Get weekly activity data
  async getWeeklyActivity(): Promise<WeeklyActivity[]> {
    const response = await api.get('/analytics/weekly-activity');
    return response.data.data;
  },

  // Get recent activity
  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    const response = await api.get(`/analytics/activity?limit=${limit}`);
    return response.data.data;
  },

  // ==================== GOALS ====================

  // Get study goals
  async getGoals(): Promise<StudyGoal[]> {
    const response = await api.get('/analytics/goals');
    return response.data.data;
  },

  // Create study goal
  async createGoal(goal: { title: string; type: string; period: string; target: number }): Promise<StudyGoal> {
    const response = await api.post('/analytics/goals', goal);
    return response.data.data;
  },

  // Update study goal
  async updateGoal(goalId: string, updates: Partial<StudyGoal>): Promise<StudyGoal> {
    const response = await api.put(`/analytics/goals/${goalId}`, updates);
    return response.data.data;
  },

  // Delete study goal
  async deleteGoal(goalId: string): Promise<void> {
    await api.delete(`/analytics/goals/${goalId}`);
  },

  // ==================== INSIGHTS ====================

  // Get comprehensive insights
  async getInsights(): Promise<InsightsData> {
    const [categoryPerformance, weeklyActivity, confidenceTrend] = await Promise.all([
      this.getCategoryPerformance(),
      this.getWeeklyActivity(),
      this.getConfidenceTrend(),
    ]);

    // Calculate strengths and weaknesses from category performance
    const sorted = [...categoryPerformance].sort((a, b) => b.percentage - a.percentage);
    const strengths = sorted.filter(c => c.percentage >= 70).map(c => c.label);
    const weaknesses = sorted.filter(c => c.percentage < 60).map(c => c.label);

    // Generate recommendations based on data
    const recommendations: string[] = [];
    if (weaknesses.length > 0) {
      recommendations.push(`Focus on improving ${weaknesses[0]} - your weakest category`);
    }
    if (weeklyActivity.reduce((sum, d) => sum + d.minutes, 0) < 120) {
      recommendations.push('Try to study at least 2 hours this week');
    }
    if (confidenceTrend.length > 0) {
      const latest = confidenceTrend[confidenceTrend.length - 1];
      if (latest.passingProbability < 70) {
        recommendations.push('Take more practice tests to improve your passing probability');
      }
    }

    return {
      categoryPerformance,
      weeklyActivity,
      confidenceTrend,
      strengths,
      weaknesses,
      recommendations,
    };
  },
};

export default progressApi;
