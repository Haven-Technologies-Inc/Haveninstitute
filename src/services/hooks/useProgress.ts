import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api/progressApi';

// Query keys
export const progressKeys = {
  all: ['progress'] as const,
  dashboard: () => [...progressKeys.all, 'dashboard'] as const,
  stats: () => [...progressKeys.all, 'stats'] as const,
  streak: () => [...progressKeys.all, 'streak'] as const,
  confidenceTrend: (days: number) => [...progressKeys.all, 'confidence', days] as const,
  categoryPerformance: () => [...progressKeys.all, 'categories'] as const,
  weeklyActivity: () => [...progressKeys.all, 'weekly'] as const,
  recentActivity: (limit: number) => [...progressKeys.all, 'activity', limit] as const,
  goals: () => [...progressKeys.all, 'goals'] as const,
  insights: () => [...progressKeys.all, 'insights'] as const,
};

// Get complete dashboard data
export function useDashboard() {
  return useQuery({
    queryKey: progressKeys.dashboard(),
    queryFn: () => progressApi.getDashboard(),
  });
}

// Get user stats
export function useStats() {
  return useQuery({
    queryKey: progressKeys.stats(),
    queryFn: () => progressApi.getStats(),
  });
}

// Get streak data
export function useStreak() {
  return useQuery({
    queryKey: progressKeys.streak(),
    queryFn: () => progressApi.getStreak(),
  });
}

// Get confidence trend
export function useConfidenceTrend(days = 30) {
  return useQuery({
    queryKey: progressKeys.confidenceTrend(days),
    queryFn: () => progressApi.getConfidenceTrend(days),
  });
}

// Get category performance
export function useCategoryPerformance() {
  return useQuery({
    queryKey: progressKeys.categoryPerformance(),
    queryFn: () => progressApi.getCategoryPerformance(),
  });
}

// Get weekly activity
export function useWeeklyActivity() {
  return useQuery({
    queryKey: progressKeys.weeklyActivity(),
    queryFn: () => progressApi.getWeeklyActivity(),
  });
}

// Get recent activity
export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: progressKeys.recentActivity(limit),
    queryFn: () => progressApi.getRecentActivity(limit),
  });
}

// Get study goals
export function useGoals() {
  return useQuery({
    queryKey: progressKeys.goals(),
    queryFn: () => progressApi.getGoals(),
  });
}

// Get comprehensive insights
export function useInsights() {
  return useQuery({
    queryKey: progressKeys.insights(),
    queryFn: () => progressApi.getInsights(),
  });
}

// Create goal mutation
export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goal: { title: string; type: string; period: string; target: number }) =>
      progressApi.createGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.goals() });
      queryClient.invalidateQueries({ queryKey: progressKeys.dashboard() });
    },
  });
}

// Update goal mutation
export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: Partial<{ title: string; target: number; current: number }> }) =>
      progressApi.updateGoal(goalId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.goals() });
      queryClient.invalidateQueries({ queryKey: progressKeys.dashboard() });
    },
  });
}

// Delete goal mutation
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goalId: string) => progressApi.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.goals() });
      queryClient.invalidateQueries({ queryKey: progressKeys.dashboard() });
    },
  });
}
