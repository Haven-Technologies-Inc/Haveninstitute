/**
 * NCLEX Simulator Service
 * 
 * Provides a realistic NCLEX-RN exam simulation with:
 * - Authentic exam environment (timing, breaks, question distribution)
 * - Variable-length CAT algorithm (75-145 questions)
 * - NCLEX-style stopping rules
 * - Comprehensive performance analytics
 * - Next Generation NCLEX (NGN) question types
 */

import { Op } from 'sequelize';
import { Question } from '../models/Question';
import { CATSession, CATStatus } from '../models/CATSession';
import { CATResponse } from '../models/CATResponse';
import { catEngine, IRTParameters, ResponseData } from './cat.engine';
import { StudyActivity } from '../models/StudyActivity';

// NCLEX Exam Configuration
export interface NCLEXConfig {
  minQuestions: number;
  maxQuestions: number;
  timeLimit: number;              // 5 hours in seconds
  breakAfterQuestions: number;    // Optional break offered
  passingStandard: number;        // Logit passing threshold
  confidenceLevel: number;        // 95% CI
  categoryDistribution: Record<string, { min: number; max: number }>;
}

// Standard NCLEX-RN Configuration (2023+ format)
const NCLEX_RN_CONFIG: NCLEXConfig = {
  minQuestions: 75,
  maxQuestions: 145,
  timeLimit: 18000,               // 5 hours
  breakAfterQuestions: 75,        // Optional break after minimum questions
  passingStandard: 0.0,           // Logit scale
  confidenceLevel: 0.95,
  categoryDistribution: {
    'management_of_care': { min: 15, max: 21 },
    'safety_infection_control': { min: 9, max: 15 },
    'health_promotion': { min: 6, max: 12 },
    'psychosocial_integrity': { min: 6, max: 12 },
    'basic_care_comfort': { min: 6, max: 12 },
    'pharmacological_therapies': { min: 12, max: 18 },
    'reduction_of_risk': { min: 9, max: 15 },
    'physiological_adaptation': { min: 11, max: 17 }
  }
};

// Exam session state
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
  categoryProgress: Record<string, { correct: number; total: number }>;
}

// Question with NGN support
export interface NCLEXQuestion {
  id: string;
  text: string;
  stem?: string;
  options: { id: string; text: string; isPartialCredit?: boolean }[];
  category: string;
  subcategory?: string;
  difficulty: number;
  questionType: string;
  isNGN: boolean;
  ngnType?: 'case_study' | 'bowtie' | 'drag_drop' | 'matrix' | 'highlight' | 'cloze';
  exhibits?: { type: string; content: string; title: string }[];
  scoringRubric?: { maxPoints: number; partialCredit: boolean };
}

// Exam result
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

export class NCLEXSimulatorService {
  private config: NCLEXConfig;

  constructor(config: Partial<NCLEXConfig> = {}) {
    this.config = { ...NCLEX_RN_CONFIG, ...config };
  }

  /**
   * Start a new NCLEX simulation exam
   */
  async startExam(userId: string): Promise<{
    session: NCLEXSessionState;
    firstQuestion: NCLEXQuestion;
  }> {
    // Check for existing in-progress session
    const existingSession = await CATSession.findOne({
      where: {
        userId,
        status: 'in_progress'
      }
    });

    if (existingSession) {
      // Resume existing session
      const nextQuestion = await this.getNextQuestion(existingSession);
      return {
        session: this.buildSessionState(existingSession),
        firstQuestion: nextQuestion!
      };
    }

    // Create new NCLEX session
    const session = await CATSession.create({
      userId,
      status: 'in_progress',
      currentAbility: 0,
      standardError: 1.0,
      passingProbability: 0.5,
      questionsAnswered: 0,
      questionsCorrect: 0,
      timeSpent: 0,
      timeLimit: this.config.timeLimit,
      answeredQuestionIds: [],
      categoryPerformance: {},
      difficultyDistribution: { easy: 0, medium: 0, hard: 0 }
    });

    // Get first question (start at medium difficulty, ability = 0)
    const firstQuestion = await this.selectQuestion(0, [], {});

    return {
      session: this.buildSessionState(session),
      firstQuestion: this.formatQuestion(firstQuestion!)
    };
  }

  /**
   * Submit answer and get next question
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string[],
    timeSpent: number
  ): Promise<{
    correct: boolean;
    explanation: string;
    score?: number;
    session: NCLEXSessionState;
    nextQuestion: NCLEXQuestion | null;
    isComplete: boolean;
    result?: NCLEXResult;
  }> {
    const session = await CATSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.status !== 'in_progress') throw new Error('Session not active');

    const question = await Question.findByPk(questionId);
    if (!question) throw new Error('Question not found');

    // Calculate if answer is correct (with partial credit for NGN)
    const { isCorrect, score } = this.evaluateAnswer(userAnswer, question);

    // Build response history for IRT calculation
    const previousResponses = await CATResponse.findAll({
      where: { sessionId },
      include: [Question]
    });

    const responses: ResponseData[] = previousResponses.map(r => ({
      questionId: r.questionId,
      correct: r.isCorrect,
      params: {
        discrimination: r.question.irtDiscrimination,
        difficulty: r.question.irtDifficulty,
        guessing: r.question.irtGuessing
      }
    }));

    // Add current response
    responses.push({
      questionId,
      correct: isCorrect,
      params: {
        discrimination: question.irtDiscrimination,
        difficulty: question.irtDifficulty,
        guessing: question.irtGuessing
      }
    });

    // Calculate new ability estimate using IRT
    const newAbility = catEngine.estimateAbility(responses);
    const newSE = catEngine.calculateStandardError(newAbility, responses);
    const ci = catEngine.calculateConfidenceInterval(newAbility, newSE);
    const passingProbability = catEngine.calculatePassingProbability(newAbility, newSE);

    // Update session statistics
    const newQuestionsAnswered = session.questionsAnswered + 1;
    const newTimeSpent = session.timeSpent + timeSpent;
    const newAnsweredIds = [...session.answeredQuestionIds, questionId];

    // Update category performance
    const categoryPerf = { ...session.categoryPerformance };
    if (!categoryPerf[question.category]) {
      categoryPerf[question.category] = { correct: 0, total: 0 };
    }
    categoryPerf[question.category].total++;
    if (isCorrect) categoryPerf[question.category].correct++;

    // Update difficulty distribution
    const diffDist = { ...session.difficultyDistribution };
    const diffLevel = question.difficulty as 'easy' | 'medium' | 'hard';
    diffDist[diffLevel]++;

    // Check NCLEX stopping rules
    const { shouldStop, reason } = this.checkStoppingRules(
      newQuestionsAnswered,
      newTimeSpent,
      newSE,
      passingProbability,
      ci
    );

    // Save response record
    await CATResponse.create({
      sessionId,
      questionId,
      questionNumber: newQuestionsAnswered,
      userAnswer,
      isCorrect,
      timeSpent,
      abilityAfter: newAbility,
      seAfter: newSE,
      irtParams: {
        discrimination: question.irtDiscrimination,
        difficulty: question.irtDifficulty,
        guessing: question.irtGuessing
      }
    });

    // Update question statistics
    await question.update({
      timesAnswered: question.timesAnswered + 1,
      timesCorrect: question.timesCorrect + (isCorrect ? 1 : 0)
    });

    // Update session
    const updateData: Partial<CATSession> = {
      currentAbility: newAbility,
      standardError: newSE,
      confidenceLower: ci.lower,
      confidenceUpper: ci.upper,
      passingProbability,
      questionsAnswered: newQuestionsAnswered,
      questionsCorrect: session.questionsCorrect + (isCorrect ? 1 : 0),
      timeSpent: newTimeSpent,
      answeredQuestionIds: newAnsweredIds,
      categoryPerformance: categoryPerf,
      difficultyDistribution: diffDist
    };

    if (shouldStop) {
      updateData.status = 'completed' as CATStatus;
      updateData.result = passingProbability >= 0.5 ? 'pass' : 'fail';
      updateData.stopReason = reason;
      updateData.completedAt = new Date();
    }

    await session.update(updateData);
    await session.reload();

    // Get next question if not stopping
    let nextQuestion: NCLEXQuestion | null = null;
    if (!shouldStop) {
      const nextQ = await this.selectQuestion(newAbility, newAnsweredIds, categoryPerf);
      nextQuestion = nextQ ? this.formatQuestion(nextQ) : null;
    }

    // Generate result if complete
    let result: NCLEXResult | undefined;
    if (shouldStop) {
      result = await this.generateResult(sessionId);
      
      // Record study activity
      await StudyActivity.create({
        userId: session.userId,
        activityType: 'cat_completed',
        description: `Completed NCLEX simulation - ${result.passed ? 'PASSED' : 'FAILED'}`,
        points: result.passed ? 100 : 50,
        metadata: {
          sessionId,
          passed: result.passed,
          score: result.scorePercentage,
          questions: result.totalQuestions
        }
      });
    }

    return {
      correct: isCorrect,
      explanation: question.explanation,
      score: score,
      session: this.buildSessionState(session),
      nextQuestion,
      isComplete: shouldStop,
      result
    };
  }

  /**
   * Take a break during the exam
   */
  async takeBreak(sessionId: string): Promise<{ breakEndsAt: Date; breakDuration: number }> {
    const session = await CATSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');

    // Breaks don't stop the clock in real NCLEX, but we track them
    const breakDuration = 600; // 10 minutes
    const breakEndsAt = new Date(Date.now() + breakDuration * 1000);

    return { breakEndsAt, breakDuration };
  }

  /**
   * End exam early
   */
  async endExam(sessionId: string): Promise<NCLEXResult> {
    const session = await CATSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.status === 'in_progress') {
      await session.update({
        status: 'completed',
        result: session.passingProbability >= 0.5 ? 'pass' : 'fail',
        stopReason: 'user_ended',
        completedAt: new Date()
      });
    }

    return this.generateResult(sessionId);
  }

  /**
   * Get exam result
   */
  async getResult(sessionId: string): Promise<NCLEXResult> {
    return this.generateResult(sessionId);
  }

  /**
   * Get exam history for user
   */
  async getHistory(userId: string, limit = 10): Promise<{
    sessionId: string;
    passed: boolean;
    score: number;
    total: number;
    passingProbability: number;
    date: string;
    timeSpent: number;
  }[]> {
    const sessions = await CATSession.findAll({
      where: {
        userId,
        status: { [Op.in]: ['completed', 'abandoned'] }
      },
      order: [['createdAt', 'DESC']],
      limit
    });

    return sessions.map(s => ({
      sessionId: s.id,
      passed: s.result === 'pass',
      score: s.questionsCorrect,
      total: s.questionsAnswered,
      passingProbability: Math.round(s.passingProbability * 100),
      date: s.createdAt.toISOString(),
      timeSpent: s.timeSpent
    }));
  }

  // ==================== Private Methods ====================

  /**
   * Select next question using Maximum Information with category balancing
   */
  private async selectQuestion(
    ability: number,
    answeredIds: string[],
    categoryPerf: Record<string, { correct: number; total: number }>
  ): Promise<Question | null> {
    // Get available questions
    const questions = await Question.findAll({
      where: {
        id: { [Op.notIn]: answeredIds },
        isActive: true
      }
    });

    if (questions.length === 0) return null;

    // Calculate information for each question
    const scored = questions.map(q => {
      const params: IRTParameters = {
        discrimination: q.irtDiscrimination,
        difficulty: q.irtDifficulty,
        guessing: q.irtGuessing
      };
      const information = catEngine.calculateInformation(ability, params);
      
      // Apply category balancing bonus
      let categoryBonus = 0;
      const totalAnswered = Object.values(categoryPerf).reduce((sum, c) => sum + c.total, 0);
      if (totalAnswered > 0) {
        const categoryData = categoryPerf[q.category];
        const categoryCount = categoryData ? categoryData.total : 0;
        const categoryRatio = categoryCount / totalAnswered;
        
        // Boost underrepresented categories
        if (categoryRatio < 0.1) categoryBonus = 0.3;
        else if (categoryRatio < 0.15) categoryBonus = 0.15;
      }

      return {
        question: q,
        score: information + categoryBonus
      };
    });

    // Sort by score and return top question
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.question || null;
  }

  /**
   * Get next question for session
   */
  private async getNextQuestion(session: CATSession): Promise<NCLEXQuestion | null> {
    const q = await this.selectQuestion(
      session.currentAbility,
      session.answeredQuestionIds,
      session.categoryPerformance
    );
    return q ? this.formatQuestion(q) : null;
  }

  /**
   * Evaluate answer with partial credit support
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
      // Partial credit: percentage of correct selections
      const correctSelected = userAnswer.filter(a => correctAnswers.includes(a)).length;
      const incorrectSelected = userAnswer.filter(a => !correctAnswers.includes(a)).length;
      const missed = correctAnswers.filter(a => !userAnswer.includes(a)).length;
      
      // All correct = full credit, partial = partial credit, wrong selections penalized
      if (incorrectSelected === 0 && missed === 0) {
        return { isCorrect: true, score: 1 };
      }
      
      const score = Math.max(0, (correctSelected - incorrectSelected) / correctAnswers.length);
      return { isCorrect: score >= 0.8, score };
    }

    if (questionType === 'ordered_response') {
      // Must be in exact order
      if (userAnswer.length !== correctAnswers.length) {
        return { isCorrect: false, score: 0 };
      }
      const isCorrect = userAnswer.every((a, i) => a === correctAnswers[i]);
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    // Default evaluation
    const isCorrect = userAnswer.every(a => correctAnswers.includes(a)) &&
                      correctAnswers.every(a => userAnswer.includes(a));
    return { isCorrect, score: isCorrect ? 1 : 0 };
  }

  /**
   * Check NCLEX stopping rules
   */
  private checkStoppingRules(
    questionsAnswered: number,
    timeSpent: number,
    se: number,
    passingProbability: number,
    ci: { lower: number; upper: number }
  ): { shouldStop: boolean; reason: string } {
    // Rule 1: Maximum questions
    if (questionsAnswered >= this.config.maxQuestions) {
      return { shouldStop: true, reason: 'max_questions' };
    }

    // Rule 2: Time limit
    if (timeSpent >= this.config.timeLimit) {
      return { shouldStop: true, reason: 'time_limit' };
    }

    // Rule 3: Minimum not met
    if (questionsAnswered < this.config.minQuestions) {
      return { shouldStop: false, reason: 'continue' };
    }

    // Rule 4: 95% Confidence Rule
    // Stop if 95% CI is entirely above or below passing standard
    if (ci.lower > this.config.passingStandard) {
      return { shouldStop: true, reason: 'pass_95_ci' };
    }
    if (ci.upper < this.config.passingStandard) {
      return { shouldStop: true, reason: 'fail_95_ci' };
    }

    // Rule 5: Maximum Information Rule (after max questions, use last 60 responses)
    // Not implemented here as we use CI rule primarily

    return { shouldStop: false, reason: 'continue' };
  }

  /**
   * Build session state object
   */
  private buildSessionState(session: CATSession): NCLEXSessionState {
    return {
      sessionId: session.id,
      status: session.status === 'in_progress' ? 'in_progress' : 'completed',
      currentQuestion: session.questionsAnswered + 1,
      totalAnswered: session.questionsAnswered,
      timeElapsed: session.timeSpent,
      timeRemaining: Math.max(0, this.config.timeLimit - session.timeSpent),
      breaksTaken: 0,
      breakAvailable: session.questionsAnswered >= this.config.breakAfterQuestions,
      currentAbility: session.currentAbility,
      standardError: session.standardError,
      passingProbability: Math.round(session.passingProbability * 100),
      confidenceInterval: {
        lower: session.confidenceLower || -4,
        upper: session.confidenceUpper || 4
      },
      categoryProgress: session.categoryPerformance
    };
  }

  /**
   * Format question for API response
   */
  private formatQuestion(question: Question): NCLEXQuestion {
    return {
      id: question.id,
      text: question.text,
      options: question.options,
      category: question.category,
      difficulty: question.irtDifficulty,
      questionType: question.questionType,
      isNGN: ['case_study', 'bowtie', 'drag_drop', 'matrix', 'highlight', 'cloze'].includes(question.questionType)
    };
  }

  /**
   * Generate comprehensive exam result
   */
  private async generateResult(sessionId: string): Promise<NCLEXResult> {
    const session = await CATSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');

    const responses = await CATResponse.findAll({
      where: { sessionId },
      include: [Question],
      order: [['questionNumber', 'ASC']]
    });

    // Calculate time analysis
    const times = responses.map(r => r.timeSpent);
    const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const fastestTime = times.length > 0 ? Math.min(...times) : 0;
    const slowestTime = times.length > 0 ? Math.max(...times) : 0;

    // Build category performance with status
    const categoryLabels: Record<string, string> = {
      'management_of_care': 'Management of Care',
      'safety_infection_control': 'Safety & Infection Control',
      'health_promotion': 'Health Promotion & Maintenance',
      'psychosocial_integrity': 'Psychosocial Integrity',
      'basic_care_comfort': 'Basic Care & Comfort',
      'pharmacological_therapies': 'Pharmacological Therapies',
      'reduction_of_risk': 'Reduction of Risk Potential',
      'physiological_adaptation': 'Physiological Adaptation'
    };

    const categoryPerformance = Object.entries(session.categoryPerformance).map(([cat, data]) => {
      const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      let status: 'above' | 'near' | 'below' = 'near';
      if (percentage >= 70) status = 'above';
      else if (percentage < 50) status = 'below';

      return {
        category: cat,
        label: categoryLabels[cat] || cat.replace(/_/g, ' '),
        correct: data.correct,
        total: data.total,
        percentage,
        status
      };
    });

    // Calculate difficulty breakdown
    const difficultyBreakdown = {
      easy: { answered: 0, correct: 0 },
      medium: { answered: 0, correct: 0 },
      hard: { answered: 0, correct: 0 }
    };

    responses.forEach(r => {
      const diff = r.question.difficulty as 'easy' | 'medium' | 'hard';
      difficultyBreakdown[diff].answered++;
      if (r.isCorrect) difficultyBreakdown[diff].correct++;
    });

    // Generate recommendations
    const recommendations: string[] = [];
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    categoryPerformance.forEach(cat => {
      if (cat.status === 'above') {
        strengths.push(cat.label);
      } else if (cat.status === 'below') {
        areasForImprovement.push(cat.label);
        recommendations.push(`Focus additional study time on ${cat.label}`);
      }
    });

    if (session.result === 'fail') {
      recommendations.push('Schedule additional practice CAT sessions');
      recommendations.push('Review rationales for all missed questions');
      recommendations.push('Consider targeted content review in weak areas');
    } else {
      recommendations.push('Continue regular practice to maintain readiness');
      recommendations.push('Focus on maintaining consistent study habits');
    }

    return {
      sessionId,
      passed: session.result === 'pass',
      totalQuestions: session.questionsAnswered,
      correctAnswers: session.questionsCorrect,
      scorePercentage: session.scorePercentage,
      abilityEstimate: session.currentAbility,
      confidenceInterval: [session.confidenceLower || -4, session.confidenceUpper || 4],
      passingProbability: Math.round(session.passingProbability * 100),
      timeSpent: session.timeSpent,
      stopReason: session.stopReason || 'completed',
      categoryPerformance,
      difficultyBreakdown,
      timeAnalysis: {
        averageTimePerQuestion: Math.round(avgTime),
        fastestQuestion: Math.round(fastestTime),
        slowestQuestion: Math.round(slowestTime)
      },
      recommendations,
      strengths,
      areasForImprovement
    };
  }
}

export const nclexSimulator = new NCLEXSimulatorService();
export default nclexSimulator;
