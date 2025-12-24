/**
 * AI Hooks - React Query hooks for AI features
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  chat,
  generateQuestions,
  generateStudyPlan,
  explainQuestion,
  analyzeClinicalScenario,
  summarizeContent,
  getRecommendations,
  getSession,
  clearSession,
  ChatRequest,
  GenerateQuestionsRequest,
  StudyPlanRequest,
  ExplainRequest,
  ClinicalAnalysisRequest,
  SummarizeRequest,
  RecommendationsRequest
} from '../api/ai.api';

// Query Keys
export const aiKeys = {
  all: ['ai'] as const,
  session: (id: string) => [...aiKeys.all, 'session', id] as const,
};

/**
 * Chat with AI tutor
 */
export function useAIChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ChatRequest) => chat(request),
    onSuccess: (data) => {
      // Invalidate session cache to refresh history
      queryClient.invalidateQueries({ queryKey: aiKeys.session(data.sessionId) });
    }
  });
}

/**
 * Generate NCLEX questions
 */
export function useGenerateQuestions() {
  return useMutation({
    mutationFn: (request: GenerateQuestionsRequest) => generateQuestions(request)
  });
}

/**
 * Generate study plan
 */
export function useGenerateStudyPlan() {
  return useMutation({
    mutationFn: (request: StudyPlanRequest) => generateStudyPlan(request)
  });
}

/**
 * Get question explanation
 */
export function useExplainQuestion() {
  return useMutation({
    mutationFn: (request: ExplainRequest) => explainQuestion(request)
  });
}

/**
 * Analyze clinical scenario
 */
export function useAnalyzeClinicalScenario() {
  return useMutation({
    mutationFn: (request: ClinicalAnalysisRequest) => analyzeClinicalScenario(request)
  });
}

/**
 * Summarize content
 */
export function useSummarizeContent() {
  return useMutation({
    mutationFn: (request: SummarizeRequest) => summarizeContent(request)
  });
}

/**
 * Get recommendations
 */
export function useGetRecommendations() {
  return useMutation({
    mutationFn: (request: RecommendationsRequest) => getRecommendations(request)
  });
}

/**
 * Get tutoring session
 */
export function useAISession(sessionId: string | null) {
  return useQuery({
    queryKey: aiKeys.session(sessionId || ''),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId
  });
}

/**
 * Clear tutoring session
 */
export function useClearSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => clearSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.removeQueries({ queryKey: aiKeys.session(sessionId) });
    }
  });
}
