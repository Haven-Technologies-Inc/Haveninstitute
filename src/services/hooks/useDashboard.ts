import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi, DashboardData, DashboardStats, StudyGoal } from '../api';

// Query keys for caching
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  confidenceTrend: (days?: number) => [...dashboardKeys.all, 'confidence-trend', days] as const,
  categoryPerformance: () => [...dashboardKeys.all, 'category-performance'] as const,
  weeklyActivity: () => [...dashboardKeys.all, 'weekly-activity'] as const,
  recentActivity: (limit?: number) => [...dashboardKeys.all, 'recent-activity', limit] as const,
  goals: () => [...dashboardKeys.all, 'goals'] as const,
  streak: () => [...dashboardKeys.all, 'streak'] as const,
};

// Hook for fetching complete dashboard data
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: analyticsApi.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

// Hook for fetching dashboard stats only
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: analyticsApi.getStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for confidence trend chart
export function useConfidenceTrend(days: number = 30) {
  return useQuery({
    queryKey: dashboardKeys.confidenceTrend(days),
    queryFn: () => analyticsApi.getConfidenceTrend(days),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for category performance radar
export function useCategoryPerformance() {
  return useQuery({
    queryKey: dashboardKeys.categoryPerformance(),
    queryFn: analyticsApi.getCategoryPerformance,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for weekly activity chart
export function useWeeklyActivity() {
  return useQuery({
    queryKey: dashboardKeys.weeklyActivity(),
    queryFn: analyticsApi.getWeeklyActivity,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for recent activity log
export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(limit),
    queryFn: () => analyticsApi.getRecentActivity(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for study goals
export function useStudyGoals() {
  return useQuery({
    queryKey: dashboardKeys.goals(),
    queryFn: analyticsApi.getStudyGoals,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for study streak
export function useStudyStreak() {
  return useQuery({
    queryKey: dashboardKeys.streak(),
    queryFn: analyticsApi.getStreak,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutation hooks for goals
export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goal: Omit<StudyGoal, 'id' | 'current'>) => analyticsApi.createGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.goals() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: Partial<StudyGoal> }) => 
      analyticsApi.updateGoal(goalId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.goals() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goalId: string) => analyticsApi.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.goals() });
    },
  });
}
