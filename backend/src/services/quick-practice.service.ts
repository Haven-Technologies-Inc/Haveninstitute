/**
 * Quick Practice Service
 * 
 * Provides configurable practice sessions with:
 * - Customizable question count (5, 10, 20, 50)
 * - Category filtering
 * - Difficulty selection
 * - Timed/untimed modes
 * - Instant feedback option
 * - Performance tracking
 */

import { Op } from 'sequelize';
import { Question, NCLEXCategory } from '../models/Question';
import { QuizSession, QuizStatus } from '../models/QuizSession';
import { QuizResponse } from '../models/QuizResponse';
import { StudyActivity } from '../models/StudyActivity';

// Practice configuration options
export interface PracticeConfig {
  questionCount: 5 | 10 | 20 | 50 | 100;
  categories?: NCLEXCategory[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  timed: boolean;
  timePerQuestion?: number;  // seconds per question (default 90)
  instantFeedback: boolean;
  shuffleOptions: boolean;
}

// Default configuration
const DEFAULT_CONFIG: PracticeConfig = {
  questionCount: 10,
  difficulty: 'mixed',
  timed: false,
  timePerQuestion: 90,
  instantFeedback: true,
  shuffleOptions: true
};

// Practice question format
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

// Answer result with feedback
export interface PracticeAnswerResult {
  correct: boolean;
  correctAnswers: string[];
  explanation: string;
  rationale?: string;
  relatedTopics?: string[];
  score: number;
  questionsAnswered: number;
  questionsRemaining: number;
  currentScore: number;
  nextQuestion?: PracticeQuestion;
  isComplete: boolean;
}

// Practice session state
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

// Practice result
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

// Category labels mapping
const CATEGORY_LABELS: Record<string, string> = {
  'management_of_care': 'Management of Care',
  'safety_infection_control': 'Safety & Infection Control',
  'health_promotion': 'Health Promotion & Maintenance',
  'psychosocial_integrity': 'Psychosocial Integrity',
  'basic_care_comfort': 'Basic Care & Comfort',
  'pharmacological_therapies': 'Pharmacological Therapies',
  'reduction_of_risk': 'Reduction of Risk Potential',
  'physiological_adaptation': 'Physiological Adaptation'
};

export class QuickPracticeService {
  /**
   * Start a new practice session
   */
  async startPractice(
    userId: string,
    config: Partial<PracticeConfig> = {}
  ): Promise<{
    session: PracticeSessionState;
    firstQuestion: PracticeQuestion;
  }> {
    const finalConfig: PracticeConfig = { ...DEFAULT_CONFIG, ...config };

    // Build query for questions
    const where: any = { isActive: true };

    if (finalConfig.categories && finalConfig.categories.length > 0) {
      where.category = { [Op.in]: finalConfig.categories };
    }

    if (finalConfig.difficulty && finalConfig.difficulty !== 'mixed') {
      where.difficulty = finalConfig.difficulty;
    }

    // Get random questions matching criteria
    const questions = await Question.findAll({
      where,
      order: Question.sequelize?.random(),
      limit: finalConfig.questionCount
    });

    if (questions.length === 0) {
      throw new Error('No questions available matching your criteria');
    }

    const questionIds = questions.map(q => q.id);

    // Create session
    const session = await QuizSession.create({
      userId,
      status: 'in_progress',
      category: finalConfig.categories?.join(',') || 'mixed',
      difficulty: finalConfig.difficulty || 'mixed',
      questionCount: questions.length,
      questionsAnswered: 0,
      questionsCorrect: 0,
      timeSpent: 0,
      questionIds,
      currentQuestionIndex: 0
    });

    // Get first question
    const firstQuestion = this.formatQuestion(questions[0], 1, questions.length, finalConfig);

    return {
      session: this.buildSessionState(session, finalConfig),
      firstQuestion
    };
  }

  /**
   * Get current question in session
   */
  async getCurrentQuestion(sessionId: string): Promise<PracticeQuestion | null> {
    const session = await QuizSession.findByPk(sessionId);
    if (!session || session.status !== 'in_progress') return null;

    const questionId = session.questionIds[session.currentQuestionIndex];
    const question = await Question.findByPk(questionId);
    if (!question) return null;

    return this.formatQuestion(
      question,
      session.currentQuestionIndex + 1,
      session.questionCount,
      DEFAULT_CONFIG
    );
  }

  /**
   * Submit answer for current question
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string[],
    timeSpent: number,
    config: Partial<PracticeConfig> = {}
  ): Promise<PracticeAnswerResult> {
    const session = await QuizSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.status !== 'in_progress') throw new Error('Session not active');

    const question = await Question.findByPk(questionId);
    if (!question) throw new Error('Question not found');

    const finalConfig: PracticeConfig = { ...DEFAULT_CONFIG, ...config };

    // Evaluate answer
    const { isCorrect, score } = this.evaluateAnswer(userAnswer, question);

    // Save response
    await QuizResponse.create({
      sessionId,
      questionId,
      questionNumber: session.questionsAnswered + 1,
      userAnswer,
      isCorrect,
      timeSpent
    });

    // Update question statistics
    await question.update({
      timesAnswered: question.timesAnswered + 1,
      timesCorrect: question.timesCorrect + (isCorrect ? 1 : 0)
    });

    // Update session
    const newIndex = session.currentQuestionIndex + 1;
    const newAnswered = session.questionsAnswered + 1;
    const newCorrect = session.questionsCorrect + (isCorrect ? 1 : 0);
    const newTimeSpent = session.timeSpent + timeSpent;
    const isComplete = newIndex >= session.questionCount;

    await session.update({
      currentQuestionIndex: newIndex,
      questionsAnswered: newAnswered,
      questionsCorrect: newCorrect,
      timeSpent: newTimeSpent,
      ...(isComplete && {
        status: 'completed' as QuizStatus,
        completedAt: new Date()
      })
    });

    // Get next question if not complete
    let nextQuestion: PracticeQuestion | undefined;
    if (!isComplete) {
      const nextQuestionId = session.questionIds[newIndex];
      const nextQ = await Question.findByPk(nextQuestionId);
      if (nextQ) {
        nextQuestion = this.formatQuestion(
          nextQ,
          newIndex + 1,
          session.questionCount,
          finalConfig
        );
      }
    }

    // Record activity if complete
    if (isComplete) {
      await StudyActivity.create({
        userId: session.userId,
        activityType: 'quiz_completed',
        description: `Completed quick practice - ${newCorrect}/${newAnswered} correct`,
        points: Math.round((newCorrect / newAnswered) * 50),
        metadata: {
          sessionId,
          score: newCorrect,
          total: newAnswered,
          percentage: Math.round((newCorrect / newAnswered) * 100)
        }
      });
    }

    return {
      correct: isCorrect,
      correctAnswers: question.correctAnswers,
      explanation: question.explanation,
      rationale: question.explanation,
      score,
      questionsAnswered: newAnswered,
      questionsRemaining: session.questionCount - newAnswered,
      currentScore: Math.round((newCorrect / newAnswered) * 100),
      nextQuestion,
      isComplete
    };
  }

  /**
   * Complete/abandon session
   */
  async completeSession(sessionId: string): Promise<PracticeResult> {
    const session = await QuizSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.status === 'in_progress') {
      await session.update({
        status: 'completed',
        completedAt: new Date()
      });
    }

    return this.generateResult(sessionId);
  }

  /**
   * Get session result
   */
  async getResult(sessionId: string): Promise<PracticeResult> {
    return this.generateResult(sessionId);
  }

  /**
   * Get practice history
   */
  async getHistory(userId: string, limit = 20): Promise<{
    sessionId: string;
    category: string;
    score: number;
    total: number;
    percentage: number;
    difficulty: string;
    date: string;
    timeSpent: number;
  }[]> {
    const sessions = await QuizSession.findAll({
      where: {
        userId,
        status: { [Op.in]: ['completed', 'abandoned'] }
      },
      order: [['createdAt', 'DESC']],
      limit
    });

    return sessions.map(s => ({
      sessionId: s.id,
      category: s.category || 'mixed',
      score: s.questionsCorrect,
      total: s.questionsAnswered,
      percentage: s.questionsAnswered > 0 
        ? Math.round((s.questionsCorrect / s.questionsAnswered) * 100) 
        : 0,
      difficulty: s.difficulty,
      date: s.createdAt.toISOString(),
      timeSpent: s.timeSpent
    }));
  }

  /**
   * Get available categories with question counts
   */
  async getCategories(): Promise<{ id: string; name: string; questionCount: number }[]> {
    const categories = await Question.findAll({
      attributes: [
        'category',
        [Question.sequelize?.fn('COUNT', Question.sequelize?.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['category']
    });

    return categories.map(c => ({
      id: c.category,
      name: CATEGORY_LABELS[c.category] || c.category.replace(/_/g, ' '),
      questionCount: parseInt((c as any).getDataValue('count') || '0', 10)
    }));
  }

  /**
   * Get question count by criteria
   */
  async getQuestionCount(
    categories?: NCLEXCategory[],
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<number> {
    const where: any = { isActive: true };

    if (categories && categories.length > 0) {
      where.category = { [Op.in]: categories };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    return Question.count({ where });
  }

  // ==================== Private Methods ====================

  /**
   * Evaluate answer
   */
  private evaluateAnswer(
    userAnswer: string[],
    question: Question
  ): { isCorrect: boolean; score: number } {
    const correctAnswers = question.correctAnswers;
    const questionType = question.questionType;

    if (questionType === 'multiple_choice') {
      const isCorrect = userAnswer.length === 1 && userAnswer[0] === correctAnswers[0];
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    if (questionType === 'select_all') {
      const correctSelected = userAnswer.filter(a => correctAnswers.includes(a)).length;
      const incorrectSelected = userAnswer.filter(a => !correctAnswers.includes(a)).length;
      const missed = correctAnswers.filter(a => !userAnswer.includes(a)).length;

      if (incorrectSelected === 0 && missed === 0) {
        return { isCorrect: true, score: 1 };
      }

      const score = Math.max(0, (correctSelected - incorrectSelected) / correctAnswers.length);
      return { isCorrect: score >= 0.8, score };
    }

    if (questionType === 'ordered_response') {
      if (userAnswer.length !== correctAnswers.length) {
        return { isCorrect: false, score: 0 };
      }
      const isCorrect = userAnswer.every((a, i) => a === correctAnswers[i]);
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    // Default
    const isCorrect = userAnswer.every(a => correctAnswers.includes(a)) &&
                      correctAnswers.every(a => userAnswer.includes(a));
    return { isCorrect, score: isCorrect ? 1 : 0 };
  }

  /**
   * Format question for API
   */
  private formatQuestion(
    question: Question,
    questionNumber: number,
    totalQuestions: number,
    config: PracticeConfig
  ): PracticeQuestion {
    let options = [...question.options];

    if (config.shuffleOptions && question.questionType !== 'ordered_response') {
      options = this.shuffleArray(options);
    }

    return {
      id: question.id,
      text: question.text,
      options,
      category: question.category,
      categoryLabel: CATEGORY_LABELS[question.category] || question.category.replace(/_/g, ' '),
      difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
      questionType: question.questionType,
      questionNumber,
      totalQuestions,
      timeLimit: config.timed ? config.timePerQuestion : undefined
    };
  }

  /**
   * Build session state
   */
  private buildSessionState(
    session: QuizSession,
    config: PracticeConfig
  ): PracticeSessionState {
    const totalTime = config.timed ? config.timePerQuestion! * session.questionCount : undefined;
    const timeRemaining = totalTime ? Math.max(0, totalTime - session.timeSpent) : undefined;

    return {
      sessionId: session.id,
      status: session.status,
      config,
      currentQuestionIndex: session.currentQuestionIndex,
      questionsAnswered: session.questionsAnswered,
      questionsCorrect: session.questionsCorrect,
      timeSpent: session.timeSpent,
      timeRemaining,
      scorePercentage: session.questionsAnswered > 0
        ? Math.round((session.questionsCorrect / session.questionsAnswered) * 100)
        : 0
    };
  }

  /**
   * Generate practice result
   */
  private async generateResult(sessionId: string): Promise<PracticeResult> {
    const session = await QuizSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');

    const responses = await QuizResponse.findAll({
      where: { sessionId },
      include: [Question],
      order: [['questionNumber', 'ASC']]
    });

    // Category breakdown
    const categoryStats: Record<string, { correct: number; total: number }> = {};
    const difficultyStats: Record<string, { correct: number; total: number }> = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    };

    // Track streaks
    let currentCorrectStreak = 0;
    let currentIncorrectStreak = 0;
    let maxCorrectStreak = 0;
    let maxIncorrectStreak = 0;

    const questions = responses.map((r, index) => {
      const q = r.question;

      // Category stats
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { correct: 0, total: 0 };
      }
      categoryStats[q.category].total++;
      if (r.isCorrect) categoryStats[q.category].correct++;

      // Difficulty stats
      const diff = q.difficulty as 'easy' | 'medium' | 'hard';
      difficultyStats[diff].total++;
      if (r.isCorrect) difficultyStats[diff].correct++;

      // Streaks
      if (r.isCorrect) {
        currentCorrectStreak++;
        currentIncorrectStreak = 0;
        maxCorrectStreak = Math.max(maxCorrectStreak, currentCorrectStreak);
      } else {
        currentIncorrectStreak++;
        currentCorrectStreak = 0;
        maxIncorrectStreak = Math.max(maxIncorrectStreak, currentIncorrectStreak);
      }

      return {
        questionId: r.questionId,
        questionNumber: index + 1,
        text: q.text,
        correct: r.isCorrect,
        userAnswer: r.userAnswer,
        correctAnswer: q.correctAnswers,
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty,
        timeSpent: r.timeSpent
      };
    });

    const categoryBreakdown = Object.entries(categoryStats).map(([cat, stats]) => ({
      category: cat,
      label: CATEGORY_LABELS[cat] || cat.replace(/_/g, ' '),
      correct: stats.correct,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }));

    const difficultyBreakdown = Object.entries(difficultyStats)
      .filter(([_, stats]) => stats.total > 0)
      .map(([diff, stats]) => ({
        difficulty: diff,
        correct: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100)
      }));

    // Generate recommendations
    const recommendations: string[] = [];
    const weakCategories = categoryBreakdown.filter(c => c.percentage < 60);
    const strongCategories = categoryBreakdown.filter(c => c.percentage >= 80);

    weakCategories.forEach(c => {
      recommendations.push(`Focus more on ${c.label} - scored ${c.percentage}%`);
    });

    if (session.questionsAnswered >= 10) {
      const overallPercentage = Math.round((session.questionsCorrect / session.questionsAnswered) * 100);
      if (overallPercentage < 60) {
        recommendations.push('Consider reviewing content before more practice');
      } else if (overallPercentage >= 80) {
        recommendations.push('Great performance! Try harder difficulty questions');
      }
    }

    const avgTime = session.questionsAnswered > 0 
      ? Math.round(session.timeSpent / session.questionsAnswered) 
      : 0;

    return {
      sessionId,
      config: {
        questionCount: session.questionCount as 5 | 10 | 20 | 50 | 100,
        difficulty: session.difficulty as 'easy' | 'medium' | 'hard' | 'mixed',
        timed: false,
        instantFeedback: true,
        shuffleOptions: true
      },
      score: session.questionsCorrect,
      total: session.questionsAnswered,
      percentage: session.questionsAnswered > 0
        ? Math.round((session.questionsCorrect / session.questionsAnswered) * 100)
        : 0,
      timeSpent: session.timeSpent,
      averageTimePerQuestion: avgTime,
      categoryBreakdown,
      difficultyBreakdown,
      questions,
      recommendations,
      streak: {
        correct: maxCorrectStreak,
        incorrect: maxIncorrectStreak
      }
    };
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const quickPractice = new QuickPracticeService();
export default quickPractice;
