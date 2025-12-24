/**
 * CAT Engine - Computerized Adaptive Testing with Item Response Theory
 * 
 * Implements the NCLEX-RN CAT algorithm using:
 * - 3-Parameter Logistic (3PL) IRT Model
 * - Maximum Likelihood Estimation (MLE) for ability
 * - Maximum Information criterion for question selection
 * - NCLEX stopping rules (60-145 questions, 5 hours, 95% CI)
 */

import { Op } from 'sequelize';
import { Question } from '../models/Question';
import { CATSession } from '../models/CATSession';
import { CATResponse } from '../models/CATResponse';

// IRT Parameters interface
export interface IRTParameters {
  discrimination: number;  // a-parameter (0.5 to 2.5)
  difficulty: number;      // b-parameter (-3 to +3)
  guessing: number;        // c-parameter (0 to 0.35)
}

// Response for IRT calculations
export interface ResponseData {
  questionId: string;
  correct: boolean;
  params: IRTParameters;
}

// CAT Configuration
export interface CATConfig {
  minQuestions: number;
  maxQuestions: number;
  timeLimit: number;           // seconds
  passingThreshold: number;    // logit scale
  stoppingCriterion: number;   // standard error threshold
  confidenceLevel: number;     // 0.95 for 95% CI
}

// Default NCLEX-RN configuration
const DEFAULT_CONFIG: CATConfig = {
  minQuestions: 60,
  maxQuestions: 145,
  timeLimit: 18000,           // 5 hours
  passingThreshold: 0.0,      // logit scale
  stoppingCriterion: 0.3,     // SE threshold
  confidenceLevel: 0.95
};

export class CATEngine {
  private config: CATConfig;

  constructor(config: Partial<CATConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate probability of correct response using 3PL IRT model
   * P(θ) = c + (1 - c) / (1 + e^(-a(θ - b)))
   */
  calculateProbability(ability: number, params: IRTParameters): number {
    const { discrimination: a, difficulty: b, guessing: c } = params;
    const exponent = -a * (ability - b);
    return c + (1 - c) / (1 + Math.exp(exponent));
  }

  /**
   * Calculate item information at given ability level
   * I(θ) = a² * (P - c)² / ((1 - c)² * P * Q)
   */
  calculateInformation(ability: number, params: IRTParameters): number {
    const { discrimination: a, guessing: c } = params;
    const p = this.calculateProbability(ability, params);
    const q = 1 - p;
    
    if (p <= c || q <= 0) return 0;
    
    const pMinusC = p - c;
    const oneMinusC = 1 - c;
    
    return (a * a * pMinusC * pMinusC) / (oneMinusC * oneMinusC * p * q);
  }

  /**
   * Estimate ability using Maximum Likelihood Estimation (MLE)
   * Uses Newton-Raphson iteration
   */
  estimateAbility(responses: ResponseData[]): number {
    if (responses.length === 0) return 0;

    // Handle edge cases
    const allCorrect = responses.every(r => r.correct);
    const allIncorrect = responses.every(r => !r.correct);
    
    if (allCorrect) return 3.0;   // Cap at +3
    if (allIncorrect) return -3.0; // Cap at -3

    let ability = 0;
    const maxIterations = 50;
    const tolerance = 0.001;

    for (let iter = 0; iter < maxIterations; iter++) {
      let L1 = 0; // First derivative
      let L2 = 0; // Second derivative

      for (const response of responses) {
        const { params, correct } = response;
        const { discrimination: a, guessing: c } = params;
        const p = this.calculateProbability(ability, params);
        const q = 1 - p;

        if (p <= 0 || q <= 0) continue;

        const pStar = (p - c) / (1 - c);
        const u = correct ? 1 : 0;

        // First derivative: L'(θ)
        L1 += a * (u - p) * pStar / p;

        // Second derivative: L''(θ)
        const term = a * a * pStar * ((u - p) / p - pStar * (u * q + (1 - u) * p) / (p * p));
        L2 += term;
      }

      // Avoid division by zero
      if (Math.abs(L2) < 1e-10) break;

      // Newton-Raphson update
      const delta = L1 / Math.abs(L2);
      ability += delta;

      // Bound ability estimate
      ability = Math.max(-4, Math.min(4, ability));

      if (Math.abs(delta) < tolerance) break;
    }

    return ability;
  }

  /**
   * Calculate standard error of ability estimate
   * SE(θ) = 1 / √I(θ)
   */
  calculateStandardError(ability: number, responses: ResponseData[]): number {
    let totalInformation = 0;

    for (const response of responses) {
      totalInformation += this.calculateInformation(ability, response.params);
    }

    return totalInformation > 0 ? 1 / Math.sqrt(totalInformation) : 1.0;
  }

  /**
   * Calculate 95% confidence interval for ability
   */
  calculateConfidenceInterval(ability: number, se: number): { lower: number; upper: number } {
    const z = 1.96; // 95% CI
    return {
      lower: Math.max(-4, ability - z * se),
      upper: Math.min(4, ability + z * se)
    };
  }

  /**
   * Calculate probability of passing using normal CDF
   */
  calculatePassingProbability(ability: number, se: number): number {
    if (se <= 0) return ability >= this.config.passingThreshold ? 1 : 0;
    
    const z = (ability - this.config.passingThreshold) / se;
    return this.normalCDF(z);
  }

  /**
   * Standard normal cumulative distribution function
   * Using Abramowitz and Stegun approximation
   */
  private normalCDF(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Determine if test should stop based on NCLEX rules
   */
  shouldStopTest(
    questionCount: number,
    timeSpent: number,
    se: number,
    passingProbability: number
  ): { stop: boolean; reason: string } {
    // Rule 1: Maximum questions reached
    if (questionCount >= this.config.maxQuestions) {
      return { stop: true, reason: 'max_questions' };
    }

    // Rule 2: Time limit reached
    if (timeSpent >= this.config.timeLimit) {
      return { stop: true, reason: 'time_limit' };
    }

    // Rule 3: Minimum questions not met
    if (questionCount < this.config.minQuestions) {
      return { stop: false, reason: 'continue' };
    }

    // Rule 4: 95% CI rule - confident about pass/fail
    if (se <= this.config.stoppingCriterion) {
      if (passingProbability >= 0.95) {
        return { stop: true, reason: 'pass_confident' };
      }
      if (passingProbability <= 0.05) {
        return { stop: true, reason: 'fail_confident' };
      }
    }

    return { stop: false, reason: 'continue' };
  }

  /**
   * Select next question using Maximum Information criterion
   */
  async selectNextQuestion(
    ability: number,
    answeredQuestionIds: string[],
    categoryBalance?: Record<string, { correct: number; total: number }>
  ): Promise<Question | null> {
    // Get available questions
    const questions = await Question.findAll({
      where: {
        id: { [Op.notIn]: answeredQuestionIds },
        isActive: true
      }
    });

    if (questions.length === 0) return null;

    // Calculate information for each question
    const questionInfos = questions.map(q => ({
      question: q,
      information: this.calculateInformation(ability, {
        discrimination: q.irtDiscrimination,
        difficulty: q.irtDifficulty,
        guessing: q.irtGuessing
      })
    }));

    // Sort by information (highest first)
    questionInfos.sort((a, b) => b.information - a.information);

    // Apply category balancing if needed
    if (categoryBalance) {
      // Find underrepresented categories
      const totalAnswered = Object.values(categoryBalance).reduce((sum, cat) => sum + cat.total, 0);
      if (totalAnswered > 0) {
        // Try to balance categories by preferring questions from less-answered categories
        for (const qi of questionInfos.slice(0, 10)) {
          const categoryData = categoryBalance[qi.question.category];
          const categoryCount = categoryData ? categoryData.total : 0;
          const categoryRatio = categoryCount / totalAnswered;
          
          // If category is underrepresented, boost it
          if (categoryRatio < 0.15 && qi.information > questionInfos[0].information * 0.7) {
            return qi.question;
          }
        }
      }
    }

    // Return question with maximum information
    return questionInfos[0]?.question || null;
  }

  /**
   * Determine final result
   */
  determineResult(passingProbability: number): 'pass' | 'fail' {
    return passingProbability >= 0.5 ? 'pass' : 'fail';
  }

  /**
   * Start a new CAT session
   */
  async startSession(userId: string): Promise<CATSession> {
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

    return session;
  }

  /**
   * Process an answer and update session
   */
  async processAnswer(
    session: CATSession,
    questionId: string,
    userAnswer: string[],
    timeSpent: number
  ): Promise<{
    correct: boolean;
    explanation: string;
    newAbility: number;
    newSE: number;
    passingProbability: number;
    shouldStop: boolean;
    stopReason: string;
    nextQuestion: Question | null;
  }> {
    // Get the question
    const question = await Question.findByPk(questionId);
    if (!question) throw new Error('Question not found');

    // Check if answer is correct
    const correct = this.isAnswerCorrect(userAnswer, question.correctAnswers, question.questionType);

    // Build response history
    const previousResponses = await CATResponse.findAll({
      where: { sessionId: session.id },
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
      correct,
      params: {
        discrimination: question.irtDiscrimination,
        difficulty: question.irtDifficulty,
        guessing: question.irtGuessing
      }
    });

    // Calculate new ability estimate
    const newAbility = this.estimateAbility(responses);
    const newSE = this.calculateStandardError(newAbility, responses);
    const ci = this.calculateConfidenceInterval(newAbility, newSE);
    const passingProbability = this.calculatePassingProbability(newAbility, newSE);

    // Update session
    const newQuestionsAnswered = session.questionsAnswered + 1;
    const newTimeSpent = session.timeSpent + timeSpent;
    const newAnsweredIds = [...session.answeredQuestionIds, questionId];

    // Update category performance
    const categoryPerf = { ...session.categoryPerformance };
    if (!categoryPerf[question.category]) {
      categoryPerf[question.category] = { correct: 0, total: 0 };
    }
    categoryPerf[question.category].total++;
    if (correct) categoryPerf[question.category].correct++;

    // Update difficulty distribution
    const diffDist = { ...session.difficultyDistribution };
    diffDist[question.difficulty]++;

    // Check stopping rules
    const { stop, reason } = this.shouldStopTest(
      newQuestionsAnswered,
      newTimeSpent,
      newSE,
      passingProbability
    );

    // Save response
    await CATResponse.create({
      sessionId: session.id,
      questionId,
      questionNumber: newQuestionsAnswered,
      userAnswer,
      isCorrect: correct,
      timeSpent,
      abilityAfter: newAbility,
      seAfter: newSE,
      irtParams: question.getIRTParams()
    });

    // Update question statistics
    await question.update({
      timesAnswered: question.timesAnswered + 1,
      timesCorrect: question.timesCorrect + (correct ? 1 : 0)
    });

    // Update session
    await session.update({
      currentAbility: newAbility,
      standardError: newSE,
      confidenceLower: ci.lower,
      confidenceUpper: ci.upper,
      passingProbability,
      questionsAnswered: newQuestionsAnswered,
      questionsCorrect: session.questionsCorrect + (correct ? 1 : 0),
      timeSpent: newTimeSpent,
      answeredQuestionIds: newAnsweredIds,
      categoryPerformance: categoryPerf,
      difficultyDistribution: diffDist,
      ...(stop && {
        status: 'completed',
        result: this.determineResult(passingProbability),
        stopReason: reason,
        completedAt: new Date()
      })
    });

    // Get next question if not stopping
    let nextQuestion: Question | null = null;
    if (!stop) {
      nextQuestion = await this.selectNextQuestion(
        newAbility,
        newAnsweredIds,
        categoryPerf
      );
    }

    return {
      correct,
      explanation: question.explanation,
      newAbility,
      newSE,
      passingProbability,
      shouldStop: stop,
      stopReason: reason,
      nextQuestion
    };
  }

  /**
   * Check if user's answer is correct
   */
  private isAnswerCorrect(
    userAnswer: string[],
    correctAnswers: string[],
    questionType: string
  ): boolean {
    if (questionType === 'multiple_choice') {
      return userAnswer.length === 1 && userAnswer[0] === correctAnswers[0];
    }

    if (questionType === 'select_all') {
      if (userAnswer.length !== correctAnswers.length) return false;
      return userAnswer.every(a => correctAnswers.includes(a));
    }

    if (questionType === 'ordered_response') {
      if (userAnswer.length !== correctAnswers.length) return false;
      return userAnswer.every((a, i) => a === correctAnswers[i]);
    }

    // Default: check if all correct answers are present
    return userAnswer.every(a => correctAnswers.includes(a)) &&
           correctAnswers.every(a => userAnswer.includes(a));
  }

  /**
   * Get session result with detailed report
   */
  async getSessionResult(sessionId: string) {
    const session = await CATSession.findByPk(sessionId, {
      include: [{ model: CATResponse, include: [Question] }]
    });

    if (!session) throw new Error('Session not found');

    // Generate recommendations based on performance
    const recommendations: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const [category, perf] of Object.entries(session.categoryPerformance)) {
      const rate = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
      if (rate >= 70) {
        strengths.push(category.replace(/_/g, ' '));
      } else if (rate < 50) {
        weaknesses.push(category.replace(/_/g, ' '));
        recommendations.push(`Focus more on ${category.replace(/_/g, ' ')} topics`);
      }
    }

    if (session.result === 'fail') {
      recommendations.push('Schedule additional CAT practice sessions');
      recommendations.push('Review rationales for missed questions');
    }

    return {
      sessionId: session.id,
      passed: session.result === 'pass',
      score: session.questionsCorrect,
      total: session.questionsAnswered,
      abilityEstimate: session.currentAbility,
      confidenceInterval: [session.confidenceLower, session.confidenceUpper],
      passingProbability: Math.round(session.passingProbability * 100),
      timeSpent: session.timeSpent,
      categoryPerformance: Object.entries(session.categoryPerformance).map(([cat, perf]) => ({
        category: cat,
        correct: perf.correct,
        total: perf.total,
        performance: perf.total > 0 
          ? (perf.correct / perf.total >= 0.6 ? 'above' : perf.correct / perf.total >= 0.4 ? 'at' : 'below')
          : 'at'
      })),
      difficultyDistribution: session.difficultyDistribution,
      report: {
        strengths,
        weaknesses,
        recommendations
      }
    };
  }
}

export const catEngine = new CATEngine();
export default catEngine;
