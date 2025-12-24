import { apiClient } from './client';

// Types for CAT (Computer Adaptive Testing)
export interface CATQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  category: string;
  difficulty: string; // IRT difficulty level (easy, medium, hard)
  type: 'multiple-choice' | 'select-all' | 'ordered-response';
  correctAnswers?: string[]; // Correct answer IDs (shown after answering)
  explanation?: string; // Rationale for the answer
}

export interface CATSession {
  sessionId: string;
  firstQuestion: CATQuestion;
  estimatedDuration: number; // in minutes
  minQuestions: number;
  maxQuestions: number;
}

export interface CATAnswerResult {
  nextQuestion?: CATQuestion;
  currentAbility: number;
  confidence: number; // 0-100
  questionsAnswered: number;
  questionsRemaining: { min: number; max: number };
  isComplete: boolean;
  passingProbability: number; // 0-100
}

export interface CATResult {
  sessionId: string;
  passed: boolean;
  score: number;
  total: number;
  abilityEstimate: number; // theta value
  confidenceInterval: [number, number];
  passingProbability: number;
  timeSpent: number; // in seconds
  categoryPerformance: {
    category: string;
    correct: number;
    total: number;
    performance: 'above' | 'at' | 'below';
  }[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  report: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export interface CATHistoryItem {
  sessionId: string;
  score: number;
  total: number;
  passingProbability: number;
  abilityEstimate: number;
  passed: boolean;
  date: string;
  timeSpent: number;
}

// Extended session interface for active sessions
export interface CATSessionState {
  sessionId: string;
  status: 'in_progress' | 'completed';
  currentQuestion?: CATQuestion;
  questionsAnswered: number;
  questionsCorrect: number;
  currentAbility: number;
  standardError: number;
  passingProbability: number;
  timeSpent: number;
  correctAnswers?: string[];
}

// CAT API endpoints
export const catApi = {
  // Start a new CAT session
  startCAT: async (): Promise<CATSession> => {
    const response = await apiClient.post('/cat/start');
    return response.data;
  },

  // Get session state (current question, ability, etc.)
  getSession: async (sessionId: string): Promise<CATSessionState> => {
    const response = await apiClient.get(`/cat/${sessionId}`);
    return response.data;
  },

  // Submit an answer and get next question
  submitAnswer: async (
    sessionId: string,
    questionId: string,
    answer: string | string[],
    timeSpent: number
  ): Promise<CATAnswerResult> => {
    const response = await apiClient.post(`/cat/${sessionId}/answer`, {
      questionId,
      answer,
      timeSpent,
    });
    return response.data;
  },

  // Complete the CAT test (called when isComplete is true or user quits)
  completeCAT: async (sessionId: string): Promise<CATResult> => {
    const response = await apiClient.post(`/cat/${sessionId}/complete`);
    return response.data;
  },

  // Get CAT history
  getHistory: async (limit?: number): Promise<CATHistoryItem[]> => {
    const response = await apiClient.get('/cat/history', {
      params: { limit },
    });
    return response.data;
  },

  // Get a specific CAT result
  getResult: async (sessionId: string): Promise<CATResult> => {
    const response = await apiClient.get(`/cat/${sessionId}/result`);
    return response.data;
  },

  // Get current ability estimate based on all CAT tests
  getCurrentAbility: async (): Promise<{
    ability: number;
    confidence: number;
    trend: 'improving' | 'stable' | 'declining';
    testsCompleted: number;
  }> => {
    const response = await apiClient.get('/cat/ability');
    return response.data;
  },
};

export default catApi;
