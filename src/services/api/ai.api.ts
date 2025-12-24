/**
 * AI API Service - Frontend client for AI features
 */

import apiClient from './client';

export type AIProvider = 'openai' | 'deepseek' | 'grok';

export interface ChatRequest {
  message: string;
  sessionId?: string;
  provider?: AIProvider;
}

export interface ChatResponse {
  sessionId: string;
  response: string;
  provider: AIProvider;
}

export interface GenerateQuestionsRequest {
  topic: string;
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  bloomLevel?: string;
  count?: number;
  context?: string;
  provider?: AIProvider;
}

export interface GeneratedQuestion {
  text: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
  category: string;
  difficulty: string;
  bloomLevel: string;
  tags: string[];
  irtDifficulty: number;
}

export interface StudyPlanRequest {
  targetDate?: string;
  weakAreas?: string[];
  currentAbility?: number;
  availableHoursPerDay?: number;
  preferredStudyTimes?: string[];
  provider?: AIProvider;
}

export interface StudyPlanDay {
  date: string;
  topics: string[];
  questionCount: number;
  estimatedMinutes: number;
  focusAreas: string[];
  activities: {
    type: 'quiz' | 'cat' | 'flashcard' | 'reading';
    topic: string;
    duration: number;
  }[];
}

export interface StudyPlan {
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPlans: StudyPlanDay[];
  recommendations: string[];
  milestones: { date: string; goal: string }[];
}

export interface ExplainRequest {
  questionText: string;
  correctAnswer: string;
  userAnswer?: string;
  topic?: string;
  provider?: AIProvider;
}

export interface ClinicalAnalysisRequest {
  scenario: string;
  provider?: AIProvider;
}

export interface SummarizeRequest {
  content: string;
  topic?: string;
  provider?: AIProvider;
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  flashcards: { front: string; back: string }[];
}

export interface RecommendationsRequest {
  overallScore?: number;
  categoryScores?: Record<string, number>;
  weakTopics?: string[];
  recentTrend?: 'improving' | 'stable' | 'declining';
  provider?: AIProvider;
}

export interface TutoringMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TutoringSession {
  sessionId: string;
  userId: string;
  topic?: string;
  messages: TutoringMessage[];
  createdAt: string;
}

// API Functions

/**
 * Chat with AI tutor
 */
export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/ai/chat', request);
  return response.data;
}

/**
 * Stream chat response (returns EventSource URL)
 */
export function getChatStreamUrl(): string {
  return `${apiClient.defaults.baseURL}/ai/chat/stream`;
}

/**
 * Chat with streaming (using fetch for SSE)
 */
export async function* chatStream(
  request: ChatRequest,
  token: string
): AsyncGenerator<{ chunk: string; done: boolean; sessionId: string }> {
  const response = await fetch(`${apiClient.defaults.baseURL}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`AI stream error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          yield JSON.parse(data);
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * Generate NCLEX questions
 */
export async function generateQuestions(
  request: GenerateQuestionsRequest
): Promise<{ questions: GeneratedQuestion[]; count: number }> {
  const response = await apiClient.post('/ai/generate-questions', request);
  return response.data;
}

/**
 * Generate personalized study plan
 */
export async function generateStudyPlan(request: StudyPlanRequest): Promise<StudyPlan> {
  const response = await apiClient.post<StudyPlan>('/ai/study-plan', request);
  return response.data;
}

/**
 * Get AI explanation for a question
 */
export async function explainQuestion(request: ExplainRequest): Promise<{ explanation: string }> {
  const response = await apiClient.post('/ai/explain', request);
  return response.data;
}

/**
 * Analyze clinical scenario using CJMM
 */
export async function analyzeClinicalScenario(
  request: ClinicalAnalysisRequest
): Promise<{ analysis: string }> {
  const response = await apiClient.post('/ai/clinical-analysis', request);
  return response.data;
}

/**
 * Summarize content for flashcards
 */
export async function summarizeContent(request: SummarizeRequest): Promise<SummarizeResponse> {
  const response = await apiClient.post<SummarizeResponse>('/ai/summarize', request);
  return response.data;
}

/**
 * Get personalized study recommendations
 */
export async function getRecommendations(
  request: RecommendationsRequest
): Promise<{ recommendations: string[] }> {
  const response = await apiClient.post('/ai/recommendations', request);
  return response.data;
}

/**
 * Get tutoring session history
 */
export async function getSession(sessionId: string): Promise<TutoringSession> {
  const response = await apiClient.get<TutoringSession>(`/ai/session/${sessionId}`);
  return response.data;
}

/**
 * Clear tutoring session
 */
export async function clearSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/ai/session/${sessionId}`);
}

export default {
  chat,
  chatStream,
  getChatStreamUrl,
  generateQuestions,
  generateStudyPlan,
  explainQuestion,
  analyzeClinicalScenario,
  summarizeContent,
  getRecommendations,
  getSession,
  clearSession
};
