import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi, QuizSession, QuizResult, QuizHistoryItem } from '../api';

// Query keys
export const quizKeys = {
  all: ['quiz'] as const,
  history: (params?: { limit?: number; category?: string }) => [...quizKeys.all, 'history', params] as const,
  categories: () => [...quizKeys.all, 'categories'] as const,
  session: (sessionId: string) => [...quizKeys.all, 'session', sessionId] as const,
  result: (sessionId: string) => [...quizKeys.all, 'result', sessionId] as const,
};

// Hook for fetching quiz history
export function useQuizHistory(params?: { limit?: number; category?: string }) {
  return useQuery({
    queryKey: quizKeys.history(params),
    queryFn: () => quizApi.getHistory(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching quiz categories
export function useQuizCategories() {
  return useQuery({
    queryKey: quizKeys.categories(),
    queryFn: quizApi.getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour (categories rarely change)
  });
}

// Hook for fetching a specific quiz result
export function useQuizResult(sessionId: string) {
  return useQuery({
    queryKey: quizKeys.result(sessionId),
    queryFn: () => quizApi.getResult(sessionId),
    enabled: !!sessionId,
  });
}

// Mutation to start a new quiz
export function useStartQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { category?: string; difficulty?: 'easy' | 'medium' | 'hard'; questionCount?: number }) =>
      quizApi.startQuiz(params),
    onSuccess: () => {
      // Optionally invalidate history after starting new quiz
    },
  });
}

// Mutation to submit an answer
export function useSubmitAnswer(sessionId: string) {
  return useMutation({
    mutationFn: ({ questionId, answer, timeSpent }: { questionId: string; answer: string | string[]; timeSpent: number }) =>
      quizApi.submitAnswer(sessionId, questionId, answer, timeSpent),
  });
}

// Alias for useSubmitAnswer
export const useSubmitQuizAnswer = useSubmitAnswer;

// Hook for fetching quiz session
export function useQuizSession(sessionId: string) {
  return useQuery({
    queryKey: quizKeys.session(sessionId),
    queryFn: () => quizApi.getSession(sessionId),
    enabled: !!sessionId,
  });
}

// Mutation to complete a quiz
export function useCompleteQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => quizApi.completeQuiz(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.history() });
    },
  });
}
