import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { practiceApi, PracticeConfig } from '../api/practiceApi';

// Query keys
export const practiceKeys = {
  all: ['practice'] as const,
  nclex: () => [...practiceKeys.all, 'nclex'] as const,
  nclexHistory: () => [...practiceKeys.nclex(), 'history'] as const,
  nclexResult: (sessionId: string) => [...practiceKeys.nclex(), 'result', sessionId] as const,
  quick: () => [...practiceKeys.all, 'quick'] as const,
  quickHistory: () => [...practiceKeys.quick(), 'history'] as const,
  quickResult: (sessionId: string) => [...practiceKeys.quick(), 'result', sessionId] as const,
  categories: () => [...practiceKeys.all, 'categories'] as const,
  questionCount: (categories?: string[], difficulty?: string) => 
    [...practiceKeys.all, 'count', categories, difficulty] as const,
};

// ==================== NCLEX SIMULATOR HOOKS ====================

export function useStartNCLEX() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => practiceApi.startNCLEX(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.nclexHistory() });
    },
  });
}

export function useSubmitNCLEXAnswer() {
  return useMutation({
    mutationFn: ({ sessionId, questionId, answer, timeSpent }: {
      sessionId: string;
      questionId: string;
      answer: string | string[];
      timeSpent: number;
    }) => practiceApi.submitNCLEXAnswer(sessionId, questionId, answer, timeSpent),
  });
}

export function useTakeNCLEXBreak() {
  return useMutation({
    mutationFn: (sessionId: string) => practiceApi.takeNCLEXBreak(sessionId),
  });
}

export function useEndNCLEX() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => practiceApi.endNCLEX(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.nclexHistory() });
    },
  });
}

export function useNCLEXResult(sessionId: string) {
  return useQuery({
    queryKey: practiceKeys.nclexResult(sessionId),
    queryFn: () => practiceApi.getNCLEXResult(sessionId),
    enabled: !!sessionId,
  });
}

export function useNCLEXHistory(limit = 10) {
  return useQuery({
    queryKey: practiceKeys.nclexHistory(),
    queryFn: () => practiceApi.getNCLEXHistory(limit),
  });
}

// ==================== QUICK PRACTICE HOOKS ====================

export function useStartQuickPractice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: Partial<PracticeConfig>) => practiceApi.startQuickPractice(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.quickHistory() });
    },
  });
}

export function useCurrentQuestion(sessionId: string) {
  return useQuery({
    queryKey: [...practiceKeys.quick(), 'question', sessionId],
    queryFn: () => practiceApi.getCurrentQuestion(sessionId),
    enabled: !!sessionId,
  });
}

export function useSubmitPracticeAnswer() {
  return useMutation({
    mutationFn: ({ sessionId, questionId, answer, timeSpent }: {
      sessionId: string;
      questionId: string;
      answer: string | string[];
      timeSpent: number;
    }) => practiceApi.submitPracticeAnswer(sessionId, questionId, answer, timeSpent),
  });
}

export function useCompletePractice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => practiceApi.completePractice(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.quickHistory() });
    },
  });
}

export function usePracticeResult(sessionId: string) {
  return useQuery({
    queryKey: practiceKeys.quickResult(sessionId),
    queryFn: () => practiceApi.getPracticeResult(sessionId),
    enabled: !!sessionId,
  });
}

export function usePracticeHistory(limit = 20) {
  return useQuery({
    queryKey: practiceKeys.quickHistory(),
    queryFn: () => practiceApi.getPracticeHistory(limit),
  });
}

// ==================== COMMON HOOKS ====================

export function useCategories() {
  return useQuery({
    queryKey: practiceKeys.categories(),
    queryFn: () => practiceApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuestionCount(categories?: string[], difficulty?: string) {
  return useQuery({
    queryKey: practiceKeys.questionCount(categories, difficulty),
    queryFn: () => practiceApi.getQuestionCount(categories, difficulty),
    enabled: true,
  });
}
