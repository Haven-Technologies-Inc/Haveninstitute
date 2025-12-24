import api from '../api';

// ==================== NCLEX SIMULATOR TYPES ====================

export interface NCLEXQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  category: string;
  difficulty: number;
  questionType: string;
  isNGN: boolean;
}

export interface NCLEXSessionState {
  sessionId: string;
  status: 'not_started' | 'in_progress' | 'on_break' | 'completed';
  currentQuestion: number;
  totalAnswered: number;
  timeElapsed: number;
  timeRemaining: number;
  breaksTaken: number;
  breakAvailable: boolean;
  currentAbility: number;
  standardError: number;
  passingProbability: number;
  confidenceInterval: { lower: number; upper: number };
  categoryProgress: Record<string, { answered: number; correct: number }>;
}

export interface NCLEXAnswerResult {
  correct: boolean;
  explanation: string;
  score?: number;
  session: NCLEXSessionState;
  nextQuestion: NCLEXQuestion | null;
  isComplete: boolean;
  result?: NCLEXResult;
}

export interface NCLEXResult {
  sessionId: string;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  abilityEstimate: number;
  confidenceInterval: [number, number];
  passingProbability: number;
  timeSpent: number;
  stopReason: string;
  categoryPerformance: {
    category: string;
    label: string;
    correct: number;
    total: number;
    percentage: number;
    status: 'above' | 'near' | 'below';
  }[];
  difficultyBreakdown: {
    easy: { answered: number; correct: number };
    medium: { answered: number; correct: number };
    hard: { answered: number; correct: number };
  };
  timeAnalysis: {
    averageTimePerQuestion: number;
    fastestQuestion: number;
    slowestQuestion: number;
  };
  recommendations: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface NCLEXHistoryItem {
  sessionId: string;
  passed: boolean;
  score: number;
  total: number;
  passingProbability: number;
  date: string;
  timeSpent: number;
}

// ==================== QUICK PRACTICE TYPES ====================

export interface PracticeConfig {
  questionCount: 5 | 10 | 20 | 50 | 100;
  categories?: string[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  timed: boolean;
  timePerQuestion?: number;
  instantFeedback: boolean;
}

export interface PracticeQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  category: string;
  categoryLabel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: string;
  questionNumber: number;
  totalQuestions: number;
  timeLimit?: number;
}

export interface PracticeSessionState {
  sessionId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  config: PracticeConfig;
  currentQuestionIndex: number;
  questionsAnswered: number;
  questionsCorrect: number;
  timeSpent: number;
  timeRemaining?: number;
  scorePercentage: number;
}

export interface PracticeAnswerResult {
  correct: boolean;
  correctAnswers: string[];
  explanation: string;
  rationale?: string;
  score: number;
  questionsAnswered: number;
  questionsRemaining: number;
  currentScore: number;
  nextQuestion?: PracticeQuestion;
  isComplete: boolean;
}

export interface PracticeResult {
  sessionId: string;
  config: PracticeConfig;
  score: number;
  total: number;
  percentage: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  categoryBreakdown: {
    category: string;
    label: string;
    correct: number;
    total: number;
    percentage: number;
  }[];
  difficultyBreakdown: {
    difficulty: string;
    correct: number;
    total: number;
    percentage: number;
  }[];
  questions: {
    questionId: string;
    questionNumber: number;
    text: string;
    correct: boolean;
    userAnswer: string[];
    correctAnswer: string[];
    explanation: string;
    category: string;
    difficulty: string;
    timeSpent: number;
  }[];
  recommendations: string[];
  streak: { correct: number; incorrect: number };
}

export interface PracticeHistoryItem {
  sessionId: string;
  category: string;
  score: number;
  total: number;
  percentage: number;
  difficulty: string;
  date: string;
  timeSpent: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  questionCount: number;
}

// ==================== PRACTICE API ====================

export const practiceApi = {
  // ==================== NCLEX SIMULATOR ====================
  
  async startNCLEX(): Promise<{ session: NCLEXSessionState; firstQuestion: NCLEXQuestion }> {
    const response = await api.post('/practice/nclex/start');
    return response.data.data;
  },

  async submitNCLEXAnswer(
    sessionId: string,
    questionId: string,
    answer: string | string[],
    timeSpent: number
  ): Promise<NCLEXAnswerResult> {
    const response = await api.post(`/practice/nclex/${sessionId}/answer`, {
      questionId,
      answer,
      timeSpent
    });
    return response.data.data;
  },

  async takeNCLEXBreak(sessionId: string): Promise<{ breakEndsAt: string; breakDuration: number }> {
    const response = await api.post(`/practice/nclex/${sessionId}/break`);
    return response.data.data;
  },

  async endNCLEX(sessionId: string): Promise<NCLEXResult> {
    const response = await api.post(`/practice/nclex/${sessionId}/end`);
    return response.data.data;
  },

  async getNCLEXResult(sessionId: string): Promise<NCLEXResult> {
    const response = await api.get(`/practice/nclex/${sessionId}/result`);
    return response.data.data;
  },

  async getNCLEXHistory(limit = 10): Promise<NCLEXHistoryItem[]> {
    const response = await api.get(`/practice/nclex/history?limit=${limit}`);
    return response.data.data;
  },

  // ==================== QUICK PRACTICE ====================

  async startQuickPractice(config: Partial<PracticeConfig>): Promise<{
    session: PracticeSessionState;
    firstQuestion: PracticeQuestion;
  }> {
    const response = await api.post('/practice/quick/start', config);
    return response.data.data;
  },

  async getCurrentQuestion(sessionId: string): Promise<PracticeQuestion> {
    const response = await api.get(`/practice/quick/${sessionId}/question`);
    return response.data.data;
  },

  async submitPracticeAnswer(
    sessionId: string,
    questionId: string,
    answer: string | string[],
    timeSpent: number
  ): Promise<PracticeAnswerResult> {
    const response = await api.post(`/practice/quick/${sessionId}/answer`, {
      questionId,
      answer,
      timeSpent
    });
    return response.data.data;
  },

  async completePractice(sessionId: string): Promise<PracticeResult> {
    const response = await api.post(`/practice/quick/${sessionId}/complete`);
    return response.data.data;
  },

  async getPracticeResult(sessionId: string): Promise<PracticeResult> {
    const response = await api.get(`/practice/quick/${sessionId}/result`);
    return response.data.data;
  },

  async getPracticeHistory(limit = 20): Promise<PracticeHistoryItem[]> {
    const response = await api.get(`/practice/quick/history?limit=${limit}`);
    return response.data.data;
  },

  // ==================== COMMON ====================

  async getCategories(): Promise<CategoryInfo[]> {
    const response = await api.get('/practice/categories');
    return response.data.data;
  },

  async getQuestionCount(categories?: string[], difficulty?: string): Promise<number> {
    const params = new URLSearchParams();
    if (categories?.length) params.append('categories', categories.join(','));
    if (difficulty) params.append('difficulty', difficulty);
    
    const response = await api.get(`/practice/question-count?${params.toString()}`);
    return response.data.data.count;
  }
};

export default practiceApi;
