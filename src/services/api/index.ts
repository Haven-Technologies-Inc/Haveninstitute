// API Services Index - Central export for all API services

// Export API client
import apiClient from './client';
export { apiClient };
export default apiClient;
export type { ApiResponse, ApiError } from './client';

// Analytics API
export * from './analytics.api';

// Quiz API
export { quizApi } from './quiz.api';
export type {
  Question,
  QuizSession,
  AnswerResult,
  QuizResult,
  QuizHistoryItem,
} from './quiz.api';

// CAT API
export { catApi } from './cat.api';
export type {
  CATQuestion,
  CATSession,
  CATAnswerResult,
  CATResult,
  CATHistoryItem,
} from './cat.api';

// AI API
export * from './ai.api';
