import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '../api/gamificationApi';

export const gamificationKeys = {
  all: ['gamification'] as const,
  stats: () => [...gamificationKeys.all, 'stats'] as const,
  achievements: () => [...gamificationKeys.all, 'achievements'] as const,
  leaderboard: (period: string) => [...gamificationKeys.all, 'leaderboard', period] as const,
  rank: () => [...gamificationKeys.all, 'rank'] as const,
  streak: () => [...gamificationKeys.all, 'streak'] as const,
};

export function useUserStats() {
  return useQuery({
    queryKey: gamificationKeys.stats(),
    queryFn: () => gamificationApi.getStats(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: gamificationKeys.achievements(),
    queryFn: () => gamificationApi.getAchievements(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCheckAchievements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => gamificationApi.checkAchievements(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.stats() });
    },
  });
}

export function useLeaderboard(period: 'all' | 'monthly' | 'weekly' = 'all', limit: number = 50) {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(period),
    queryFn: () => gamificationApi.getLeaderboard(period, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserRank() {
  return useQuery({
    queryKey: gamificationKeys.rank(),
    queryFn: () => gamificationApi.getRank(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useStudyStreak() {
  return useQuery({
    queryKey: gamificationKeys.streak(),
    queryFn: () => gamificationApi.getStreak(),
    staleTime: 60 * 1000, // 1 minute
  });
}
