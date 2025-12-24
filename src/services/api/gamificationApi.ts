import apiClient from './client';

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
  levelProgress: {
    current: number;
    needed: number;
    progress: number;
  };
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: 'study' | 'quiz' | 'cat' | 'social' | 'streak' | 'special';
  iconUrl?: string;
  points: number;
  requirementType: string;
  requirementValue: number;
  isHidden: boolean;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  achievement: Achievement;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  points: number;
  level: number;
  rank: number;
}

export interface UserAchievementsResponse {
  earned: UserAchievement[];
  inProgress: UserAchievement[];
  locked: Achievement[];
}

export const gamificationApi = {
  // Get user stats
  getStats: async (): Promise<UserStats> => {
    const response = await apiClient.get('/gamification/stats');
    return response.data.data;
  },

  // Get user achievements
  getAchievements: async (): Promise<UserAchievementsResponse> => {
    const response = await apiClient.get('/gamification/achievements');
    return response.data.data;
  },

  // Check for new achievements
  checkAchievements: async (): Promise<{ newAchievements: Achievement[] }> => {
    const response = await apiClient.post('/gamification/check-achievements');
    return response.data.data;
  },

  // Get leaderboard
  getLeaderboard: async (
    period: 'all' | 'monthly' | 'weekly' = 'all',
    limit: number = 50
  ): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get(`/gamification/leaderboard?period=${period}&limit=${limit}`);
    return response.data.data;
  },

  // Get user rank
  getRank: async (): Promise<{ rank: number; totalPoints: number; level: number }> => {
    const response = await apiClient.get('/gamification/rank');
    return response.data.data;
  },

  // Get study streak
  getStreak: async (): Promise<{ streak: number }> => {
    const response = await apiClient.get('/gamification/streak');
    return response.data.data;
  },
};

export default gamificationApi;
