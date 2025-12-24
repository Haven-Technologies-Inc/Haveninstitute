import { apiClient } from './client';

// Types for quiz functionality
export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'select-all' | 'ordered-response';
}

export interface QuizSession {
  sessionId: string;
  questions: Question[];
  category: string;
  difficulty?: string;
  totalQuestions: number;
  timeLimit?: number; // in minutes
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  nextQuestion?: Question;
  questionsRemaining: number;
}

export interface QuizResult {
  sessionId: string;
  score: number;
  total: number;
  percentage: number;
  timeSpent: number; // in seconds
  categoryBreakdown: { category: string; correct: number; total: number }[];
  questions: {
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
  }[];
}

export interface QuizHistoryItem {
  sessionId: string;
  category: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
  timeSpent: number;
}

// Quiz API endpoints
export const quizApi = {
  // Start a new quiz session
  startQuiz: async (params: {
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionCount?: number;
  }): Promise<QuizSession> => {
    const response = await apiClient.post('/quiz/start', params);
    return response.data;
  },

  // Submit an answer for current question
  submitAnswer: async (
    sessionId: string,
    questionId: string,
    answer: string | string[],
    timeSpent: number
  ): Promise<AnswerResult> => {
    const response = await apiClient.post(`/quiz/${sessionId}/answer`, {
      questionId,
      answer,
      timeSpent,
    });
    return response.data;
  },

  // Complete the quiz and get results
  completeQuiz: async (sessionId: string): Promise<QuizResult> => {
    const response = await apiClient.post(`/quiz/${sessionId}/complete`);
    return response.data;
  },

  // Get quiz history
  getHistory: async (params?: {
    limit?: number;
    category?: string;
  }): Promise<QuizHistoryItem[]> => {
    const response = await apiClient.get('/quiz/history', { params });
    return response.data;
  },

  // Get available quiz categories
  getCategories: async (): Promise<{ id: string; name: string; questionCount: number }[]> => {
    const response = await apiClient.get('/quiz/categories');
    return response.data;
  },

  // Get a specific quiz result
  getResult: async (sessionId: string): Promise<QuizResult> => {
    const response = await apiClient.get(`/quiz/${sessionId}/result`);
    return response.data;
  },
};

export default quizApi;
