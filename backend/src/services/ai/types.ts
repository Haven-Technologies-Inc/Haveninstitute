/**
 * AI Service Types - Shared types for AI providers
 */

export type AIProvider = 'openai' | 'deepseek' | 'grok';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface AICompletionResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export interface AIEmbeddingResponse {
  embedding: number[];
  model: string;
  provider: AIProvider;
}

// NCLEX-specific types
export interface QuestionGenerationRequest {
  topic: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomLevel: string;
  count: number;
  context?: string;
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
  userId: string;
  targetDate?: Date;
  weakAreas: string[];
  currentAbility: number;
  availableHoursPerDay: number;
  preferredStudyTimes?: string[];
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

export interface ExplanationRequest {
  questionText: string;
  correctAnswer: string;
  userAnswer?: string;
  topic: string;
}

export interface TutoringMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TutoringSession {
  sessionId: string;
  userId: string;
  topic?: string;
  messages: TutoringMessage[];
  createdAt: Date;
}

// Provider interface
export interface IAIProvider {
  name: AIProvider;
  
  /** Check if the provider is configured with valid API key */
  isConfigured(): boolean;
  
  chat(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResponse>;
  
  chatStream(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): AsyncGenerator<AIStreamChunk>;
  
  embed?(text: string): Promise<AIEmbeddingResponse>;
}
