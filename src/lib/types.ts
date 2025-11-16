// ============================================================================
// TYPE DEFINITIONS FOR HAVEN INSTITUTE
// ============================================================================
// Centralized TypeScript interfaces for the application

// ============================================================================
// QUESTION TYPES
// ============================================================================

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  rationales?: string[];
  category: string;
  subcategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  discrimination?: number; // IRT discrimination parameter (0-2)
  tags?: string[];
  questionType?: 'multiple_choice' | 'select_all' | 'fill_blank' | 'ordered_response';
  createdBy?: string;
  isPublic?: boolean;
  isActive?: boolean;
  usageCount?: number;
  successRate?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionCreateInput {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  rationales?: string[];
  category: string;
  subcategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  discrimination?: number;
  tags?: string[];
  questionType?: 'multiple_choice' | 'select_all' | 'fill_blank' | 'ordered_response';
  isPublic?: boolean;
}

export interface QuestionUpdateInput extends Partial<QuestionCreateInput> {
  isActive?: boolean;
}

export interface QuestionFilters {
  category?: string;
  subcategory?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  isActive?: boolean;
  searchTerm?: string;
}

// ============================================================================
// QUIZ SESSION TYPES
// ============================================================================

export interface QuizSession {
  id: string;
  userId: string;
  quizId?: string;
  sessionType: 'quiz' | 'cat' | 'practice' | 'timed_practice';
  status: 'active' | 'paused' | 'completed' | 'abandoned';

  // Configuration
  totalQuestions: number;
  timeLimit?: number; // seconds
  passingScore?: number;

  // Progress
  currentQuestionIndex: number;
  questionsAnswered: number;
  correctAnswers: number;

  // Data
  questionIds: string[];
  userAnswers: QuizAnswer[];

  // Timing
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  timeElapsed: number; // seconds

  // CAT-specific
  abilityEstimate?: number;
  confidenceLevel?: number;

  // Results
  finalScore?: number;
  finalPercentage?: number;
  passed?: boolean;

  // Metadata
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: number;
  isCorrect: boolean;
  timeSpent: number; // seconds
  answeredAt: Date;
}

export interface QuizSessionCreateInput {
  userId: string;
  quizId?: string;
  sessionType: 'quiz' | 'cat' | 'practice' | 'timed_practice';
  questionIds: string[];
  totalQuestions: number;
  timeLimit?: number;
  passingScore?: number;
  settings?: Record<string, any>;
}

export interface QuizSessionUpdateInput {
  status?: 'active' | 'paused' | 'completed' | 'abandoned';
  currentQuestionIndex?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  userAnswers?: QuizAnswer[];
  timeElapsed?: number;
  abilityEstimate?: number;
  confidenceLevel?: number;
  finalScore?: number;
  finalPercentage?: number;
  passed?: boolean;
  completedAt?: Date;
}

export interface QuestionUsage {
  id: string;
  questionId: string;
  sessionId: string;
  userId: string;
  userAnswer?: number;
  isCorrect: boolean;
  timeSpent?: number;
  presentedAt: Date;
  answeredAt?: Date;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  avatar?: string;
  role: 'user' | 'admin';
  subscriptionPlan: 'free' | 'pro' | 'premium';
  onboardingCompleted?: boolean;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  amount: number;
  interval: 'monthly' | 'yearly';
  paymentMethod?: {
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
  };
}

export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  date: Date;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  invoiceUrl?: string;
  description: string;
}

// ============================================================================
// STRIPE WEBHOOK TYPES
// ============================================================================

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface StripeCustomer {
  id: string;
  email: string;
  metadata?: {
    userId: string;
  };
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
        recurring: {
          interval: 'month' | 'year';
        };
        unit_amount: number;
      };
    }>;
  };
}

export interface StripeInvoice {
  id: string;
  customer: string;
  subscription: string;
  amount_paid: number;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  hosted_invoice_url?: string;
  created: number;
}

// ============================================================================
// FLASHCARD TYPES
// ============================================================================

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  createdBy?: string;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardProgress {
  id: string;
  userId: string;
  flashcardId: string;
  status: 'new' | 'learning' | 'mastered';
  attempts: number;
  correctCount: number;
  lastReviewed: Date;
  nextReview: Date;
  confidence: number;
  easeFactor?: number; // SM2 algorithm
  interval?: number; // Days until next review
  repetitions?: number;
}

// ============================================================================
// BOOK TYPES
// ============================================================================

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  category: string;
  totalChapters: number;
  totalPages: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  content?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentChapter: number;
  currentPage: number;
  progress: number; // percentage
  lastRead: Date;
  timeSpent: number; // minutes
}

// ============================================================================
// STUDY GROUP TYPES
// ============================================================================

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  category: string;
  avatar?: string;
  isPrivate: boolean;
  tags?: string[];
  memberCount: number;
  maxMembers: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface QuestionStats {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  usageCount: number;
  successRate: number;
  totalAttempts: number;
  correctAttempts: number;
  avgTimeSpent: number;
}

export interface UserPerformanceMetrics {
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTimePerQuestion: number;
  categoryPerformance: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  difficultyPerformance: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  recentActivity: {
    date: Date;
    questionsAnswered: number;
    accuracy: number;
  }[];
}

// ============================================================================
// SPACED REPETITION TYPES (SM2 Algorithm)
// ============================================================================

export interface SM2Result {
  interval: number; // Days until next review
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
}

export interface SpacedRepetitionCard {
  flashcardId: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  lastReviewed: Date;
}
