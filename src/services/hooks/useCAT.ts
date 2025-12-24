import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catApi } from '../api';

// Query keys
export const catKeys = {
  all: ['cat'] as const,
  session: (sessionId: string) => [...catKeys.all, 'session', sessionId] as const,
  history: (limit?: number) => [...catKeys.all, 'history', limit] as const,
  result: (sessionId: string) => [...catKeys.all, 'result', sessionId] as const,
  ability: () => [...catKeys.all, 'ability'] as const,
};

// Hook for fetching CAT history
export function useCATHistory(limit?: number) {
  return useQuery({
    queryKey: catKeys.history(limit),
    queryFn: () => catApi.getHistory(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching a specific CAT result
export function useCATResult(sessionId: string) {
  return useQuery({
    queryKey: catKeys.result(sessionId),
    queryFn: () => catApi.getResult(sessionId),
    enabled: !!sessionId,
  });
}

// Hook for fetching current ability estimate
export function useCurrentAbility() {
  return useQuery({
    queryKey: catKeys.ability(),
    queryFn: catApi.getCurrentAbility,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Mutation to start a new CAT
export function useStartCAT() {
  return useMutation({
    mutationFn: catApi.startCAT,
  });
}

// Hook for fetching a CAT session (current question, stats)
export function useCATSession(sessionId: string) {
  return useQuery({
    queryKey: catKeys.session(sessionId),
    queryFn: () => catApi.getSession(sessionId),
    enabled: !!sessionId,
    refetchInterval: false,
  });
}

// Mutation to submit a CAT answer
export function useSubmitCATAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, questionId, answer, timeSpent }: { 
      sessionId: string; 
      questionId: string; 
      answer: string | string[]; 
      timeSpent: number 
    }) => catApi.submitAnswer(sessionId, questionId, answer, timeSpent),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: catKeys.session(variables.sessionId) });
    },
  });
}

// Mutation to complete a CAT
export function useCompleteCAT() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => catApi.completeCAT(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: catKeys.history() });
      queryClient.invalidateQueries({ queryKey: catKeys.ability() });
      queryClient.invalidateQueries({ queryKey: catKeys.session(sessionId) });
    },
  });
}
