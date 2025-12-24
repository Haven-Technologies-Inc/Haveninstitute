/**
 * Study Planner API - Frontend client for study planning features
 */

import apiClient from './client';

export interface StudyPlanTask {
  id: string;
  planId: string;
  title: string;
  description?: string;
  type: 'quiz' | 'cat' | 'flashcard' | 'reading' | 'video' | 'review' | 'practice' | 'custom';
  category?: string;
  topic?: string;
  scheduledDate: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled';
  priority: number;
  completedAt?: string;
  metadata?: {
    resourceId?: string;
    resourceType?: string;
    questionCount?: number;
    targetScore?: number;
    actualScore?: number;
    notes?: string;
  };
  sortOrder: number;
}

export interface StudyPlanMilestone {
  id: string;
  planId: string;
  title: string;
  description?: string;
  targetDate: string;
  status: 'pending' | 'achieved' | 'missed';
  achievedAt?: string;
  criteria?: {
    type: 'score' | 'completion' | 'streak' | 'custom';
    target: number;
    current?: number;
    category?: string;
  };
}

export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  targetDate: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  isAIGenerated: boolean;
  focusAreas: string[];
  weakAreas: string[];
  dailyStudyHours: number;
  preferences?: {
    preferredTimes?: ('morning' | 'afternoon' | 'evening' | 'night')[];
    studyDays?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
    breakDuration?: number;
    sessionDuration?: number;
    includeWeekends?: boolean;
  };
  progress?: {
    totalTasks: number;
    completedTasks: number;
    totalMinutesPlanned: number;
    totalMinutesStudied: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate?: string;
    categoryProgress: Record<string, { planned: number; completed: number; averageScore?: number }>;
  };
  aiInsights?: {
    generatedAt: string;
    recommendations: string[];
    predictedReadiness: number;
    suggestedAdjustments?: {
      type: string;
      reason: string;
      action: string;
    }[];
  };
  tasks?: StudyPlanTask[];
  milestones?: StudyPlanMilestone[];
  createdAt: string;
}

export interface CreatePlanInput {
  name: string;
  description?: string;
  targetDate: string;
  focusAreas?: string[];
  weakAreas?: string[];
  dailyStudyHours?: number;
  preferences?: StudyPlan['preferences'];
  useAI?: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: StudyPlanTask['type'];
  category?: string;
  topic?: string;
  scheduledDate: string;
  estimatedMinutes?: number;
  priority?: number;
}

export interface StudyStats {
  totalPlans: number;
  activePlans: number;
  totalTasksCompleted: number;
  totalMinutesStudied: number;
  currentStreak: number;
  longestStreak: number;
  categoryBreakdown: Record<string, number>;
}

// API Functions
export const studyPlannerApi = {
  // Get all plans
  getPlans: async (status?: string): Promise<StudyPlan[]> => {
    const response = await apiClient.get('/planner/plans', { params: { status } });
    return response.data;
  },

  // Create plan
  createPlan: async (input: CreatePlanInput): Promise<StudyPlan> => {
    const response = await apiClient.post('/planner/plans', input);
    return response.data;
  },

  // Get plan by ID
  getPlan: async (planId: string): Promise<StudyPlan> => {
    const response = await apiClient.get(`/planner/plans/${planId}`);
    return response.data;
  },

  // Update plan
  updatePlan: async (planId: string, input: Partial<CreatePlanInput>): Promise<StudyPlan> => {
    const response = await apiClient.put(`/planner/plans/${planId}`, input);
    return response.data;
  },

  // Delete plan
  deletePlan: async (planId: string): Promise<void> => {
    await apiClient.delete(`/planner/plans/${planId}`);
  },

  // Generate AI plan
  generateAIPlan: async (planId: string): Promise<StudyPlan> => {
    const response = await apiClient.post(`/planner/plans/${planId}/generate`);
    return response.data;
  },

  // Add task
  addTask: async (planId: string, input: CreateTaskInput): Promise<StudyPlanTask> => {
    const response = await apiClient.post(`/planner/plans/${planId}/tasks`, input);
    return response.data;
  },

  // Update task
  updateTask: async (taskId: string, input: Partial<CreateTaskInput & { status: string }>): Promise<StudyPlanTask> => {
    const response = await apiClient.put(`/planner/tasks/${taskId}`, input);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/planner/tasks/${taskId}`);
  },

  // Get today's tasks
  getTodaysTasks: async (): Promise<StudyPlanTask[]> => {
    const response = await apiClient.get('/planner/tasks/today');
    return response.data;
  },

  // Get upcoming tasks
  getUpcomingTasks: async (days?: number): Promise<StudyPlanTask[]> => {
    const response = await apiClient.get('/planner/tasks/upcoming', { params: { days } });
    return response.data;
  },

  // Get overdue tasks
  getOverdueTasks: async (): Promise<StudyPlanTask[]> => {
    const response = await apiClient.get('/planner/tasks/overdue');
    return response.data;
  },

  // Get tasks for date
  getTasksForDate: async (date: string): Promise<StudyPlanTask[]> => {
    const response = await apiClient.get(`/planner/tasks/date/${date}`);
    return response.data;
  },

  // Reschedule task
  rescheduleTask: async (taskId: string, newDate: string): Promise<StudyPlanTask> => {
    const response = await apiClient.post(`/planner/tasks/${taskId}/reschedule`, { newDate });
    return response.data;
  },

  // Complete task
  completeTask: async (taskId: string, results: {
    actualMinutes: number;
    score?: number;
    notes?: string;
  }): Promise<StudyPlanTask> => {
    const response = await apiClient.post(`/planner/tasks/${taskId}/complete`, results);
    return response.data;
  },

  // Add milestone
  addMilestone: async (planId: string, input: {
    title: string;
    description?: string;
    targetDate: string;
  }): Promise<StudyPlanMilestone> => {
    const response = await apiClient.post(`/planner/plans/${planId}/milestones`, input);
    return response.data;
  },

  // Update milestone
  updateMilestone: async (milestoneId: string, input: {
    title?: string;
    description?: string;
    targetDate?: string;
    status?: string;
  }): Promise<StudyPlanMilestone> => {
    const response = await apiClient.put(`/planner/milestones/${milestoneId}`, input);
    return response.data;
  },

  // Get stats
  getStats: async (): Promise<StudyStats> => {
    const response = await apiClient.get('/planner/stats');
    return response.data;
  }
};

export default studyPlannerApi;
