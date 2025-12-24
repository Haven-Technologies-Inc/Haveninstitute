import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionApi, QuestionFilters, PaginationParams, CreateQuestionInput } from '../api/questionApi';

// Query keys
export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filters: QuestionFilters, pagination: PaginationParams) => 
    [...questionKeys.lists(), { filters, pagination }] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
  random: (count: number, filters?: { category?: string; difficulty?: string }) => 
    [...questionKeys.all, 'random', count, filters] as const,
  statistics: () => [...questionKeys.all, 'statistics'] as const,
};

// Get questions with filters and pagination
export function useQuestions(filters?: QuestionFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: questionKeys.list(filters || {}, pagination || { page: 1, limit: 20 }),
    queryFn: () => questionApi.getQuestions(filters, pagination),
  });
}

// Get a single question by ID
export function useQuestion(id: string) {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: () => questionApi.getQuestionById(id),
    enabled: !!id,
  });
}

// Get random questions for practice
export function useRandomQuestions(count: number, filters?: { category?: string; difficulty?: string }) {
  return useQuery({
    queryKey: questionKeys.random(count, filters),
    queryFn: () => questionApi.getRandomQuestions(count, filters),
  });
}

// Get question statistics
export function useQuestionStatistics() {
  return useQuery({
    queryKey: questionKeys.statistics(),
    queryFn: () => questionApi.getStatistics(),
  });
}

// Create question mutation
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => questionApi.createQuestion(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.statistics() });
    },
  });
}

// Update question mutation
export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateQuestionInput> }) => 
      questionApi.updateQuestion(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  });
}

// Delete question mutation
export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, hard = false }: { id: string; hard?: boolean }) => 
      questionApi.deleteQuestion(id, hard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.statistics() });
    },
  });
}

// Bulk import JSON mutation
export function useBulkImportJSON() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (questions: CreateQuestionInput[]) => questionApi.bulkImportJSON(questions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.statistics() });
    },
  });
}

// Bulk import CSV mutation
export function useBulkImportCSV() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (csvContent: string) => questionApi.bulkImportCSV(csvContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.statistics() });
    },
  });
}
