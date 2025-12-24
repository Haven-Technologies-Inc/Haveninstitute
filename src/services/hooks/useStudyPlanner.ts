/**
 * Study Planner Hooks - React Query hooks for study planning features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyPlannerApi, StudyPlan, CreatePlanInput, CreateTaskInput } from '../api/studyPlanner.api';

export const studyPlannerKeys = {
  all: ['studyPlanner'] as const,
  plans: (status?: string) => [...studyPlannerKeys.all, 'plans', status] as const,
  plan: (id: string) => [...studyPlannerKeys.all, 'plan', id] as const,
  todaysTasks: () => [...studyPlannerKeys.all, 'tasks', 'today'] as const,
  upcomingTasks: (days?: number) => [...studyPlannerKeys.all, 'tasks', 'upcoming', days] as const,
  overdueTasks: () => [...studyPlannerKeys.all, 'tasks', 'overdue'] as const,
  tasksForDate: (date: string) => [...studyPlannerKeys.all, 'tasks', 'date', date] as const,
  stats: () => [...studyPlannerKeys.all, 'stats'] as const,
};

// Get all plans
export function useStudyPlans(status?: string) {
  return useQuery({
    queryKey: studyPlannerKeys.plans(status),
    queryFn: () => studyPlannerApi.getPlans(status),
    staleTime: 1000 * 60 * 5,
  });
}

// Get single plan
export function useStudyPlan(planId: string) {
  return useQuery({
    queryKey: studyPlannerKeys.plan(planId),
    queryFn: () => studyPlannerApi.getPlan(planId),
    enabled: !!planId,
  });
}

// Get today's tasks
export function useTodaysTasks() {
  return useQuery({
    queryKey: studyPlannerKeys.todaysTasks(),
    queryFn: studyPlannerApi.getTodaysTasks,
    staleTime: 1000 * 60 * 2,
  });
}

// Get upcoming tasks
export function useUpcomingTasks(days?: number) {
  return useQuery({
    queryKey: studyPlannerKeys.upcomingTasks(days),
    queryFn: () => studyPlannerApi.getUpcomingTasks(days),
    staleTime: 1000 * 60 * 5,
  });
}

// Get overdue tasks
export function useOverdueTasks() {
  return useQuery({
    queryKey: studyPlannerKeys.overdueTasks(),
    queryFn: studyPlannerApi.getOverdueTasks,
    staleTime: 1000 * 60 * 5,
  });
}

// Get tasks for specific date
export function useTasksForDate(date: string) {
  return useQuery({
    queryKey: studyPlannerKeys.tasksForDate(date),
    queryFn: () => studyPlannerApi.getTasksForDate(date),
    enabled: !!date,
  });
}

// Get study stats
export function useStudyStats() {
  return useQuery({
    queryKey: studyPlannerKeys.stats(),
    queryFn: studyPlannerApi.getStats,
    staleTime: 1000 * 60 * 10,
  });
}

// Create plan mutation
export function useCreatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreatePlanInput) => studyPlannerApi.createPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.plans() });
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.stats() });
    },
  });
}

// Update plan mutation
export function useUpdatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: Partial<CreatePlanInput> }) =>
      studyPlannerApi.updatePlan(planId, input),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.plan(planId) });
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.plans() });
    },
  });
}

// Delete plan mutation
export function useDeletePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (planId: string) => studyPlannerApi.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.plans() });
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.stats() });
    },
  });
}

// Generate AI plan mutation
export function useGenerateAIPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (planId: string) => studyPlannerApi.generateAIPlan(planId),
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.plan(planId) });
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.todaysTasks() });
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.upcomingTasks() });
    },
  });
}

// Add task mutation
export function useAddTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: CreateTaskInput }) =>
      studyPlannerApi.addTask(planId, input),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.plan(planId) });
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.todaysTasks() });
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.upcomingTasks() });
    },
  });
}

// Update task mutation
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: Partial<CreateTaskInput & { status: string }> }) =>
      studyPlannerApi.updateTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.all });
    },
  });
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => studyPlannerApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.all });
    },
  });
}

// Reschedule task mutation
export function useRescheduleTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, newDate }: { taskId: string; newDate: string }) =>
      studyPlannerApi.rescheduleTask(taskId, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.all });
    },
  });
}

// Complete task mutation
export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, results }: { 
      taskId: string; 
      results: { actualMinutes: number; score?: number; notes?: string } 
    }) => studyPlannerApi.completeTask(taskId, results),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.all });
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.stats() });
    },
  });
}

// Add milestone mutation
export function useAddMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, input }: { 
      planId: string; 
      input: { title: string; description?: string; targetDate: string } 
    }) => studyPlannerApi.addMilestone(planId, input),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.plan(planId) });
    },
  });
}

// Update milestone mutation
export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ milestoneId, input }: { 
      milestoneId: string; 
      input: { title?: string; description?: string; targetDate?: string; status?: string } 
    }) => studyPlannerApi.updateMilestone(milestoneId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyPlannerKeys.all });
    },
  });
}
