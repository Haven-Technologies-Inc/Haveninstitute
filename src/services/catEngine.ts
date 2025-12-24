/**
 * Haven CAT Engine - Computer Adaptive Testing System
 * 
 * Implements Item Response Theory (IRT) based adaptive testing
 * Designed to match NCLEX-RN CAT algorithm standards
 * 
 * Key Features:
 * - 3-Parameter Logistic (3PL) IRT Model
 * - Maximum Likelihood Estimation (MLE) for ability
 * - Maximum Information criterion for question selection
 * - 95% Confidence Interval stopping rule
 * - NCLEX-style passing determination
 */

import type { NextGenQuestion, NCLEXCategory, QuestionType } from '../types/nextGenNCLEX';

// IRT Parameters for questions
export interface IRTParameters {
  a: number;  // Discrimination parameter (0.5 - 2.5)
  b: number;  // Difficulty parameter (-3 to +3 logits)
  c: number;  // Guessing parameter (0.0 - 0.25)
}

// Question with IRT parameters
export type CATQuestion = NextGenQuestion & {
  irt: IRTParameters;
  bloomsLevel: 1 | 2 | 3 | 4 | 5 | 6;  // Bloom's taxonomy level
  contentArea: NCLEXCategory;
  usedInSession: boolean;
};

// CAT Session State
export interface CATSessionState {
  sessionId: string;
  startTime: number;
  currentQuestion: number;
  totalQuestions: number;
  maxQuestions: number;
  minQuestions: number;
  timeLimit: number;  // in milliseconds (5 hours = 18000000)
  
  // Ability estimation
  abilityEstimate: number;  // theta (-3 to +3)
  standardError: number;
  confidenceInterval: [number, number];
  
  // History
  responses: CATResponse[];
  administeredQuestions: string[];  // question IDs
  
  // Status
  status: 'in_progress' | 'passed' | 'failed' | 'timed_out' | 'max_questions';
  passingStandard: number;  // The passing threshold in logits
  
  // Content balancing
  categoryDistribution: Record<NCLEXCategory, number>;
  questionTypeDistribution: Record<QuestionType, number>;
}

export interface CATResponse {
  questionId: string;
  response: number;  // 0 = incorrect, 1 = correct (partial credit 0-1)
  timeSpent: number;
  abilityAfter: number;
  seAfter: number;
  timestamp: number;
}

export interface CATResult {
  passed: boolean;
  abilityEstimate: number;
  confidenceInterval: [number, number];
  standardError: number;
  questionsAnswered: number;
  timeSpent: number;
  passingProbability: number;
  categoryPerformance: Record<NCLEXCategory, { correct: number; total: number; percentage: number }>;
  stoppingReason: 'confidence_interval' | 'max_questions' | 'time_limit';
}

// NCLEX Passing Standard (in logits) - approximately 0.0 logits
const NCLEX_PASSING_STANDARD = 0.0;

// Confidence interval width for stopping (95% CI)
const CI_MULTIPLIER = 1.96;

// Minimum SE for stopping
const MIN_SE_FOR_STOP = 0.30;

/**
 * Haven CAT Engine Class
 * Implements the core adaptive testing algorithm
 */
export class HavenCATEngine {
  private questionBank: CATQuestion[];
  private session: CATSessionState | null = null;
  
  constructor(questionBank: NextGenQuestion[]) {
    // Convert questions to CAT questions with IRT parameters
    this.questionBank = this.initializeQuestionBank(questionBank);
  }
  
  /**
   * Initialize question bank with IRT parameters
   * Assigns difficulty based on question type and stated difficulty
   */
  private initializeQuestionBank(questions: NextGenQuestion[]): CATQuestion[] {
    return questions.map(q => {
      // Assign IRT parameters based on question characteristics
      const irt = this.assignIRTParameters(q);
      const bloomsLevel = this.assignBloomsLevel(q);
      
      return {
        ...q,
        irt,
        bloomsLevel,
        contentArea: q.category,
        usedInSession: false
      };
    });
  }
  
  /**
   * Assign IRT parameters based on question characteristics
   */
  private assignIRTParameters(question: NextGenQuestion): IRTParameters {
    // Base difficulty from stated difficulty
    let baseDifficulty: number;
    switch (question.difficulty) {
      case 'easy': baseDifficulty = -1.5; break;
      case 'medium': baseDifficulty = 0.0; break;
      case 'hard': baseDifficulty = 1.5; break;
      default: baseDifficulty = 0.0;
    }
    
    // Adjust difficulty based on question type (NextGen types are generally harder)
    let typeAdjustment = 0;
    switch (question.type) {
      case 'multiple-choice': typeAdjustment = -0.3; break;
      case 'select-all': typeAdjustment = 0.3; break;
      case 'ordered-response': typeAdjustment = 0.5; break;
      case 'cloze-dropdown': typeAdjustment = 0.4; break;
      case 'matrix': typeAdjustment = 0.5; break;
      case 'highlight': typeAdjustment = 0.6; break;
      case 'bow-tie': typeAdjustment = 0.8; break;
      case 'hot-spot': typeAdjustment = 0.4; break;
      case 'case-study': typeAdjustment = 1.0; break;
    }
    
    // Random variation to simulate real IRT calibration
    const randomVariation = (Math.random() - 0.5) * 0.4;
    
    return {
      a: 0.8 + Math.random() * 1.2,  // Discrimination: 0.8 - 2.0
      b: Math.max(-3, Math.min(3, baseDifficulty + typeAdjustment + randomVariation)),
      c: question.type === 'multiple-choice' ? 0.2 : 0.1  // Lower guessing for complex types
    };
  }
  
  /**
   * Assign Bloom's taxonomy level
   */
  private assignBloomsLevel(question: NextGenQuestion): 1 | 2 | 3 | 4 | 5 | 6 {
    // Higher-order thinking for complex question types
    switch (question.type) {
      case 'multiple-choice': return question.difficulty === 'hard' ? 4 : 3;
      case 'select-all': return 4;
      case 'ordered-response': return 4;
      case 'cloze-dropdown': return 3;
      case 'matrix': return 4;
      case 'highlight': return 5;
      case 'bow-tie': return 6;
      case 'case-study': return 6;
      default: return 3;
    }
  }
  
  /**
   * Start a new CAT session
   */
  startSession(config: {
    minQuestions?: number;
    maxQuestions?: number;
    timeLimit?: number;  // in minutes
    passingStandard?: number;
  } = {}): CATSessionState {
    const {
      minQuestions = 85,
      maxQuestions = 150,
      timeLimit = 300,  // 5 hours in minutes
      passingStandard = NCLEX_PASSING_STANDARD
    } = config;
    
    // Reset question usage
    this.questionBank.forEach(q => q.usedInSession = false);
    
    this.session = {
      sessionId: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      currentQuestion: 0,
      totalQuestions: 0,
      maxQuestions,
      minQuestions,
      timeLimit: timeLimit * 60 * 1000,  // Convert to milliseconds
      
      abilityEstimate: 0.0,  // Start at average ability
      standardError: 1.0,    // High initial uncertainty
      confidenceInterval: [-1.96, 1.96],
      
      responses: [],
      administeredQuestions: [],
      
      status: 'in_progress',
      passingStandard,
      
      categoryDistribution: {} as Record<NCLEXCategory, number>,
      questionTypeDistribution: {} as Record<QuestionType, number>
    };
    
    return this.session;
  }
  
  /**
   * Get the next question using Maximum Information criterion
   */
  getNextQuestion(): CATQuestion | null {
    if (!this.session || this.session.status !== 'in_progress') {
      return null;
    }
    
    // Check stopping conditions
    if (this.shouldStop()) {
      this.finalizeSession();
      return null;
    }
    
    // Get available questions (not yet used)
    const availableQuestions = this.questionBank.filter(q => !q.usedInSession);
    
    if (availableQuestions.length === 0) {
      this.session.status = 'max_questions';
      this.finalizeSession();
      return null;
    }
    
    // Select question with maximum information at current ability estimate
    const selectedQuestion = this.selectQuestionByMaxInfo(availableQuestions);
    
    if (selectedQuestion) {
      selectedQuestion.usedInSession = true;
      this.session.administeredQuestions.push(selectedQuestion.id);
      this.session.currentQuestion++;
    }
    
    return selectedQuestion;
  }
  
  /**
   * Select question using Maximum Information criterion with content balancing
   */
  private selectQuestionByMaxInfo(questions: CATQuestion[]): CATQuestion | null {
    if (!this.session) return null;
    
    const theta = this.session.abilityEstimate;
    
    // Calculate information for each question
    const questionInfos = questions.map(q => ({
      question: q,
      information: this.calculateInformation(q.irt, theta),
      // Add content balancing factor
      contentBonus: this.getContentBalanceBonus(q)
    }));
    
    // Sort by weighted information (information + content balance bonus)
    questionInfos.sort((a, b) => {
      const scoreA = a.information * (1 + a.contentBonus * 0.3);
      const scoreB = b.information * (1 + b.contentBonus * 0.3);
      return scoreB - scoreA;
    });
    
    // Add some randomization among top candidates to prevent predictability
    const topCandidates = questionInfos.slice(0, Math.min(5, questionInfos.length));
    const randomIndex = Math.floor(Math.random() * topCandidates.length);
    
    return topCandidates[randomIndex]?.question || null;
  }
  
  /**
   * Calculate content balance bonus for question selection
   */
  private getContentBalanceBonus(question: CATQuestion): number {
    if (!this.session) return 0;
    
    // Target: roughly equal distribution across categories
    const totalAnswered = this.session.totalQuestions || 1;
    const categoryCount = this.session.categoryDistribution[question.category] || 0;
    const categoryRatio = categoryCount / totalAnswered;
    
    // Bonus for underrepresented categories
    const targetRatio = 1 / 8;  // 8 NCLEX categories
    return Math.max(0, (targetRatio - categoryRatio) * 2);
  }
  
  /**
   * Calculate Fisher Information for a question at given ability level
   * Using 3PL IRT model
   */
  private calculateInformation(irt: IRTParameters, theta: number): number {
    const { a, b, c } = irt;
    
    // Probability of correct response
    const p = this.calculateProbability(irt, theta);
    
    // Information formula for 3PL model
    const numerator = Math.pow(a, 2) * Math.pow(1 - c, 2) * Math.pow(p - c, 2);
    const denominator = Math.pow(1 - c, 2) * p * (1 - p);
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }
  
  /**
   * Calculate probability of correct response using 3PL IRT model
   */
  private calculateProbability(irt: IRTParameters, theta: number): number {
    const { a, b, c } = irt;
    
    // 3PL model: P(θ) = c + (1-c) / (1 + exp(-a(θ-b)))
    const exponent = -a * (theta - b);
    const logistic = 1 / (1 + Math.exp(exponent));
    
    return c + (1 - c) * logistic;
  }
  
  /**
   * Process a response and update ability estimate
   */
  processResponse(questionId: string, correct: number, timeSpent: number): CATSessionState | null {
    if (!this.session || this.session.status !== 'in_progress') {
      return null;
    }
    
    const question = this.questionBank.find(q => q.id === questionId);
    if (!question) return null;
    
    // Update ability estimate using MLE
    const newAbility = this.updateAbilityEstimate(correct);
    const newSE = this.calculateStandardError();
    
    // Record response
    this.session.responses.push({
      questionId,
      response: correct,
      timeSpent,
      abilityAfter: newAbility,
      seAfter: newSE,
      timestamp: Date.now()
    });
    
    // Update session state
    this.session.totalQuestions++;
    this.session.abilityEstimate = newAbility;
    this.session.standardError = newSE;
    this.session.confidenceInterval = [
      newAbility - CI_MULTIPLIER * newSE,
      newAbility + CI_MULTIPLIER * newSE
    ];
    
    // Update distributions
    this.session.categoryDistribution[question.category] = 
      (this.session.categoryDistribution[question.category] || 0) + 1;
    this.session.questionTypeDistribution[question.type] = 
      (this.session.questionTypeDistribution[question.type] || 0) + 1;
    
    return this.session;
  }
  
  /**
   * Update ability estimate using Maximum Likelihood Estimation
   */
  private updateAbilityEstimate(lastResponse: number): number {
    if (!this.session) return 0;
    
    // Newton-Raphson method for MLE
    let theta = this.session.abilityEstimate;
    const maxIterations = 20;
    const tolerance = 0.001;
    
    for (let i = 0; i < maxIterations; i++) {
      let firstDerivative = 0;
      let secondDerivative = 0;
      
      // Sum over all administered questions
      for (const response of this.session.responses) {
        const question = this.questionBank.find(q => q.id === response.questionId);
        if (!question) continue;
        
        const { a, b, c } = question.irt;
        const p = this.calculateProbability(question.irt, theta);
        const q = 1 - p;
        
        // First derivative of log-likelihood
        const pStar = (p - c) / (1 - c);
        firstDerivative += a * (response.response - p) * pStar / (p * q);
        
        // Second derivative (Fisher information, negated)
        secondDerivative -= Math.pow(a, 2) * pStar * pStar / (p * q);
      }
      
      // Avoid division by zero
      if (Math.abs(secondDerivative) < 0.0001) break;
      
      // Newton-Raphson update
      const delta = firstDerivative / (-secondDerivative);
      theta = theta + delta;
      
      // Bound theta to reasonable range
      theta = Math.max(-4, Math.min(4, theta));
      
      // Check convergence
      if (Math.abs(delta) < tolerance) break;
    }
    
    return theta;
  }
  
  /**
   * Calculate standard error of ability estimate
   */
  private calculateStandardError(): number {
    if (!this.session || this.session.responses.length === 0) {
      return 1.0;
    }
    
    const theta = this.session.abilityEstimate;
    let totalInformation = 0;
    
    // Sum information from all administered questions
    for (const response of this.session.responses) {
      const question = this.questionBank.find(q => q.id === response.questionId);
      if (!question) continue;
      
      totalInformation += this.calculateInformation(question.irt, theta);
    }
    
    // SE = 1 / sqrt(Information)
    if (totalInformation <= 0) return 1.0;
    
    return 1 / Math.sqrt(totalInformation);
  }
  
  /**
   * Check if test should stop
   */
  private shouldStop(): boolean {
    if (!this.session) return true;
    
    const { 
      totalQuestions, 
      minQuestions, 
      maxQuestions, 
      startTime, 
      timeLimit,
      confidenceInterval,
      standardError,
      passingStandard
    } = this.session;
    
    // Check time limit
    if (Date.now() - startTime >= timeLimit) {
      this.session.status = 'timed_out';
      return true;
    }
    
    // Check max questions
    if (totalQuestions >= maxQuestions) {
      this.session.status = 'max_questions';
      return true;
    }
    
    // Don't stop before minimum questions
    if (totalQuestions < minQuestions) {
      return false;
    }
    
    // 95% Confidence Interval Rule (NCLEX stopping rule)
    // Stop if entire CI is above or below passing standard
    const [lowerCI, upperCI] = confidenceInterval;
    
    if (standardError <= MIN_SE_FOR_STOP) {
      if (lowerCI > passingStandard) {
        // Entire CI above passing = PASS
        this.session.status = 'passed';
        return true;
      }
      
      if (upperCI < passingStandard) {
        // Entire CI below passing = FAIL
        this.session.status = 'failed';
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Finalize session and calculate results
   */
  private finalizeSession(): void {
    if (!this.session) return;
    
    // Determine pass/fail if not already set
    if (this.session.status === 'max_questions' || this.session.status === 'timed_out') {
      // Use last ability estimate vs passing standard
      if (this.session.abilityEstimate >= this.session.passingStandard) {
        this.session.status = 'passed';
      } else {
        this.session.status = 'failed';
      }
    }
  }
  
  /**
   * Get final results
   */
  getResults(): CATResult | null {
    if (!this.session) return null;
    
    const categoryPerformance: Record<NCLEXCategory, { correct: number; total: number; percentage: number }> = {} as any;
    
    // Calculate category performance
    for (const response of this.session.responses) {
      const question = this.questionBank.find(q => q.id === response.questionId);
      if (!question) continue;
      
      if (!categoryPerformance[question.category]) {
        categoryPerformance[question.category] = { correct: 0, total: 0, percentage: 0 };
      }
      
      categoryPerformance[question.category].total++;
      categoryPerformance[question.category].correct += response.response;
    }
    
    // Calculate percentages
    for (const category of Object.keys(categoryPerformance) as NCLEXCategory[]) {
      const perf = categoryPerformance[category];
      perf.percentage = perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
    }
    
    // Calculate passing probability
    const passingProbability = this.calculatePassingProbability();
    
    // Determine stopping reason
    let stoppingReason: 'confidence_interval' | 'max_questions' | 'time_limit';
    if (this.session.status === 'timed_out') {
      stoppingReason = 'time_limit';
    } else if (this.session.totalQuestions >= this.session.maxQuestions) {
      stoppingReason = 'max_questions';
    } else {
      stoppingReason = 'confidence_interval';
    }
    
    return {
      passed: this.session.status === 'passed',
      abilityEstimate: this.session.abilityEstimate,
      confidenceInterval: this.session.confidenceInterval,
      standardError: this.session.standardError,
      questionsAnswered: this.session.totalQuestions,
      timeSpent: Date.now() - this.session.startTime,
      passingProbability,
      categoryPerformance,
      stoppingReason
    };
  }
  
  /**
   * Calculate probability of passing based on current ability estimate
   */
  private calculatePassingProbability(): number {
    if (!this.session) return 0;
    
    const { abilityEstimate, standardError, passingStandard } = this.session;
    
    // Calculate z-score
    const z = (abilityEstimate - passingStandard) / standardError;
    
    // Convert to probability using standard normal CDF approximation
    const probability = this.normalCDF(z);
    
    return Math.round(probability * 100);
  }
  
  /**
   * Standard normal cumulative distribution function
   */
  private normalCDF(z: number): number {
    // Approximation using error function
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
   * Get current session state
   */
  getSessionState(): CATSessionState | null {
    return this.session;
  }
  
  /**
   * Get remaining time in milliseconds
   */
  getRemainingTime(): number {
    if (!this.session) return 0;
    
    const elapsed = Date.now() - this.session.startTime;
    return Math.max(0, this.session.timeLimit - elapsed);
  }
  
  /**
   * Check if time is up
   */
  isTimeUp(): boolean {
    return this.getRemainingTime() <= 0;
  }
}

export default HavenCATEngine;
