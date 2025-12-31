/**
 * Question Generator Service
 * 
 * High-yield NCLEX question batch generation using AI
 * Supports all NextGen NCLEX question types with quality validation
 */

import { v4 as uuidv4 } from 'uuid';
import { getProvider } from './ai/providers';
import { 
  HIGH_YIELD_QUESTION_GENERATOR, 
  BATCH_GENERATION_SYSTEM,
  QUESTION_TYPE_PROMPTS 
} from './ai/prompts';
import { AIProvider } from './ai/types';
import { Question, NCLEXCategory, QuestionType, BloomLevel } from '../models/Question';
import { EventEmitter } from 'events';

// Types
export interface BatchGenerationRequest {
  questionTypes: QuestionType[];
  categories: NCLEXCategory[];
  difficulties: ('easy' | 'medium' | 'hard')[];
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalQuestions: number;
  topics?: string[];
  bloomLevels?: BloomLevel[];
  userId: string;
}

export interface GeneratedQuestion {
  questionType: QuestionType;
  text: string;
  scenario?: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
  rationaleCorrect?: string;
  rationaleIncorrect?: string;
  category: NCLEXCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomLevel: BloomLevel;
  irtDifficulty: number;
  irtDiscrimination?: number;
  tags: string[];
  clinicalPearl?: string;
  source?: string;
}

export interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  request: BatchGenerationRequest;
  progress: number;
  totalBatches: number;
  completedBatches: number;
  generatedQuestions: GeneratedQuestion[];
  savedQuestionIds: string[];
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Job storage (in production, use Redis)
const generationJobs: Map<string, GenerationJob> = new Map();

// Event emitter for real-time updates
export const generationEvents = new EventEmitter();

// Constants
const BATCH_SIZE = 5; // Questions per API call (reduced to fit token limits)
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

class QuestionGeneratorService {
  private defaultProvider: AIProvider;

  constructor() {
    this.defaultProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';
  }

  /**
   * Start a batch generation job
   */
  async startBatchGeneration(request: BatchGenerationRequest): Promise<string> {
    // Validate request
    if (request.totalQuestions < 1 || request.totalQuestions > 200) {
      throw new Error('Total questions must be between 1 and 200');
    }

    if (request.questionTypes.length === 0) {
      throw new Error('At least one question type must be selected');
    }

    if (request.categories.length === 0) {
      throw new Error('At least one category must be selected');
    }

    // Create job
    const jobId = uuidv4();
    const totalBatches = Math.ceil(request.totalQuestions / BATCH_SIZE);

    const job: GenerationJob = {
      id: jobId,
      status: 'pending',
      request,
      progress: 0,
      totalBatches,
      completedBatches: 0,
      generatedQuestions: [],
      savedQuestionIds: [],
      errors: [],
      startedAt: new Date()
    };

    generationJobs.set(jobId, job);

    // Start async generation
    this.runGenerationJob(jobId).catch(error => {
      console.error(`Generation job ${jobId} failed:`, error);
      const job = generationJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.errors.push(error.message);
        generationEvents.emit('jobUpdate', job);
      }
    });

    return jobId;
  }

  /**
   * Run the generation job
   */
  private async runGenerationJob(jobId: string): Promise<void> {
    const job = generationJobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    generationEvents.emit('jobUpdate', job);

    const { request } = job;
    const questionsPerBatch = BATCH_SIZE;
    let remainingQuestions = request.totalQuestions;

    // Calculate distribution
    const distribution = this.calculateDistribution(request);

    try {
      for (let batchIndex = 0; batchIndex < job.totalBatches; batchIndex++) {
        // Re-check job status from map (may have been cancelled externally)
        const currentJob = generationJobs.get(jobId);
        if (!currentJob || currentJob.status === 'cancelled') break;

        const batchSize = Math.min(questionsPerBatch, remainingQuestions);
        const batchDistribution = this.getBatchDistribution(distribution, batchIndex, job.totalBatches, batchSize);

        // Generate batch with retries
        let questions: GeneratedQuestion[] = [];
        let retries = 0;

        while (retries < MAX_RETRIES) {
          try {
            questions = await this.generateBatch(batchDistribution, request);
            break;
          } catch (error: any) {
            retries++;
            if (retries >= MAX_RETRIES) {
              job.errors.push(`Batch ${batchIndex + 1} failed after ${MAX_RETRIES} retries: ${error.message}`);
            } else {
              await this.delay(RETRY_DELAY * retries);
            }
          }
        }

        // Validate and add questions
        for (const question of questions) {
          const validation = this.validateQuestion(question);
          if (validation.isValid) {
            job.generatedQuestions.push(question);
          } else {
            job.errors.push(`Invalid question: ${validation.errors.join(', ')}`);
          }
        }

        // Update progress
        job.completedBatches++;
        job.progress = Math.round((job.completedBatches / job.totalBatches) * 100);
        remainingQuestions -= batchSize;

        // Estimate time remaining
        const elapsed = Date.now() - job.startedAt.getTime();
        const avgTimePerBatch = elapsed / job.completedBatches;
        job.estimatedTimeRemaining = Math.round(avgTimePerBatch * (job.totalBatches - job.completedBatches) / 1000);

        generationEvents.emit('jobUpdate', job);
      }

      // Save to database
      if (job.generatedQuestions.length > 0) {
        const savedIds = await this.saveQuestionsToDatabase(job.generatedQuestions);
        job.savedQuestionIds = savedIds;
      }

      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;
      generationEvents.emit('jobUpdate', job);
      generationEvents.emit('jobComplete', job);

    } catch (error: any) {
      job.status = 'failed';
      job.errors.push(error.message);
      generationEvents.emit('jobUpdate', job);
      generationEvents.emit('jobFailed', job);
    }
  }

  /**
   * Generate a batch of questions
   */
  private async generateBatch(
    distribution: BatchDistribution,
    request: BatchGenerationRequest
  ): Promise<GeneratedQuestion[]> {
    const ai = getProvider(this.defaultProvider);
    
    // Build the generation prompt
    const prompt = this.buildGenerationPrompt(distribution, request);

    const result = await ai.chat([
      { role: 'system', content: HIGH_YIELD_QUESTION_GENERATOR + '\n\n' + BATCH_GENERATION_SYSTEM },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.8,
      maxTokens: 4000
    });

    // Parse response
    return this.parseGeneratedQuestions(result.content);
  }

  /**
   * Build the generation prompt for a batch
   */
  private buildGenerationPrompt(distribution: BatchDistribution, request: BatchGenerationRequest): string {
    const typeInstructions = distribution.questionTypes.map(qt => 
      `- ${qt.count} ${qt.type} questions: ${QUESTION_TYPE_PROMPTS[qt.type] || ''}`
    ).join('\n');

    const categoryList = distribution.categories.map(c => 
      `- ${c.category}: ${c.count} questions`
    ).join('\n');

    const difficultyList = distribution.difficulties.map(d => 
      `- ${d.difficulty}: ${d.count} questions`
    ).join('\n');

    const topicsSection = request.topics && request.topics.length > 0 
      ? `\nFocus on these specific topics:\n${request.topics.map(t => `- ${t}`).join('\n')}`
      : '';

    return `Generate exactly ${distribution.totalCount} HIGH-YIELD NCLEX questions with the following specifications:

## Question Type Distribution
${typeInstructions}

## Category Distribution (NCLEX Client Needs)
${categoryList}

## Difficulty Distribution
${difficultyList}
${topicsSection}

## Requirements
1. Each question must be UNIQUE with different clinical scenarios
2. Include SPECIFIC patient data (age, vitals, labs) in every question
3. Every distractor must represent a common student error
4. Provide comprehensive rationales that teach, not just explain
5. Include clinical pearls for high-yield learning
6. Map IRT difficulty parameters accurately

Return ONLY a valid JSON array containing ${distribution.totalCount} question objects.
Do NOT include any markdown formatting, code blocks, or additional text.
Start directly with [ and end with ]`;
  }

  /**
   * Parse generated questions from AI response
   */
  private parseGeneratedQuestions(content: string): GeneratedQuestion[] {
    try {
      // Try to extract JSON array
      let jsonStr = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
      }
      
      // Find the JSON array
      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        throw new Error('No JSON array found in response');
      }

      const questions = JSON.parse(arrayMatch[0]) as GeneratedQuestion[];
      
      // Validate basic structure
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      return questions.map(q => this.normalizeQuestion(q));
    } catch (error: any) {
      console.error('Failed to parse generated questions:', error);
      console.error('Raw content:', content.substring(0, 500));
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Normalize a question to ensure consistent structure
   */
  private normalizeQuestion(q: any): GeneratedQuestion {
    return {
      questionType: q.questionType || 'multiple_choice',
      text: q.text || '',
      scenario: q.scenario,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswer],
      explanation: q.explanation || '',
      rationaleCorrect: q.rationaleCorrect,
      rationaleIncorrect: q.rationaleIncorrect,
      category: q.category || 'management_of_care',
      difficulty: q.difficulty || 'medium',
      bloomLevel: q.bloomLevel || 'apply',
      irtDifficulty: typeof q.irtDifficulty === 'number' ? q.irtDifficulty : 0,
      irtDiscrimination: typeof q.irtDiscrimination === 'number' ? q.irtDiscrimination : 1.0,
      tags: Array.isArray(q.tags) ? q.tags : [],
      clinicalPearl: q.clinicalPearl,
      source: q.source
    };
  }

  /**
   * Validate a generated question
   */
  validateQuestion(question: GeneratedQuestion): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!question.text || question.text.length < 20) {
      errors.push('Question text is too short or missing');
    }

    if (!question.options || question.options.length < 2) {
      errors.push('Question must have at least 2 options');
    }

    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      errors.push('Question must have at least one correct answer');
    }

    if (!question.explanation || question.explanation.length < 20) {
      errors.push('Explanation is too short or missing');
    }

    // Validate correct answers exist in options
    if (question.options && question.correctAnswers) {
      const optionIds = question.options.map(o => o.id);
      for (const answer of question.correctAnswers) {
        if (!optionIds.includes(answer)) {
          errors.push(`Correct answer "${answer}" not found in options`);
        }
      }
    }

    // Validate category
    const validCategories: NCLEXCategory[] = [
      'management_of_care', 'safety_infection_control', 'health_promotion',
      'psychosocial_integrity', 'basic_care_comfort', 'pharmacological_therapies',
      'risk_reduction', 'physiological_adaptation'
    ];
    if (!validCategories.includes(question.category)) {
      warnings.push(`Unknown category: ${question.category}`);
    }

    // Validate question type
    const validTypes: QuestionType[] = [
      'multiple_choice', 'select_all', 'ordered_response', 'cloze_dropdown',
      'hot_spot', 'matrix', 'highlight', 'bow_tie', 'case_study'
    ];
    if (!validTypes.includes(question.questionType)) {
      warnings.push(`Unknown question type: ${question.questionType}`);
    }

    // Quality warnings
    if (question.text.length < 100) {
      warnings.push('Question stem may be too brief for NCLEX standards');
    }

    if (!question.clinicalPearl) {
      warnings.push('Missing clinical pearl - consider adding for high-yield value');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Save questions to database
   */
  private async saveQuestionsToDatabase(questions: GeneratedQuestion[]): Promise<string[]> {
    const savedIds: string[] = [];

    for (const q of questions) {
      try {
        const question = await Question.create({
          id: uuidv4(),
          text: q.text,
          options: q.options,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation + (q.clinicalPearl ? `\n\n💡 Clinical Pearl: ${q.clinicalPearl}` : ''),
          category: q.category,
          questionType: q.questionType,
          bloomLevel: q.bloomLevel,
          difficulty: q.difficulty,
          irtDifficulty: q.irtDifficulty,
          irtDiscrimination: q.irtDiscrimination || 1.0,
          irtGuessing: q.questionType === 'multiple_choice' ? 0.25 : 0.1,
          tags: q.tags,
          rationaleCorrect: q.rationaleCorrect,
          rationaleIncorrect: q.rationaleIncorrect,
          source: q.source || 'AI Generated (High-Yield)',
          isActive: true,
          timesAnswered: 0,
          timesCorrect: 0
        });

        savedIds.push(question.id);
      } catch (error: any) {
        console.error('Failed to save question:', error);
      }
    }

    return savedIds;
  }

  /**
   * Calculate distribution of questions across types, categories, and difficulties
   */
  private calculateDistribution(request: BatchGenerationRequest): FullDistribution {
    const { totalQuestions, questionTypes, categories, difficulties, difficultyDistribution } = request;

    // Question types - distribute evenly if not specified
    const questionsPerType = Math.floor(totalQuestions / questionTypes.length);
    const typeDistribution = questionTypes.map((type, index) => ({
      type,
      count: index === questionTypes.length - 1 
        ? totalQuestions - (questionsPerType * (questionTypes.length - 1))
        : questionsPerType
    }));

    // Categories - use NCLEX weights or distribute evenly
    const categoryWeights: Record<NCLEXCategory, number> = {
      management_of_care: 0.20,
      safety_infection_control: 0.12,
      health_promotion: 0.09,
      psychosocial_integrity: 0.09,
      basic_care_comfort: 0.09,
      pharmacological_therapies: 0.15,
      risk_reduction: 0.12,
      physiological_adaptation: 0.14
    };

    let categoryDistribution: { category: NCLEXCategory; count: number }[];
    
    if (categories.length === 8) {
      // Use NCLEX weights
      let remaining = totalQuestions;
      categoryDistribution = categories.map((category, index) => {
        if (index === categories.length - 1) {
          return { category, count: remaining };
        }
        const count = Math.round(totalQuestions * categoryWeights[category]);
        remaining -= count;
        return { category, count };
      });
    } else {
      // Distribute evenly among selected categories
      const perCategory = Math.floor(totalQuestions / categories.length);
      categoryDistribution = categories.map((category, index) => ({
        category,
        count: index === categories.length - 1 
          ? totalQuestions - (perCategory * (categories.length - 1))
          : perCategory
      }));
    }

    // Difficulties - use provided distribution or default
    const defaultDistribution = { easy: 20, medium: 50, hard: 30 };
    const dist = difficultyDistribution || defaultDistribution;
    const total = dist.easy + dist.medium + dist.hard;

    const difficultyDist = difficulties.map(difficulty => ({
      difficulty,
      count: Math.round(totalQuestions * (dist[difficulty] / total))
    }));

    // Adjust to ensure total matches
    const diffSum = difficultyDist.reduce((sum, d) => sum + d.count, 0);
    if (diffSum !== totalQuestions && difficultyDist.length > 0) {
      difficultyDist[0].count += totalQuestions - diffSum;
    }

    return {
      totalCount: totalQuestions,
      questionTypes: typeDistribution,
      categories: categoryDistribution,
      difficulties: difficultyDist
    };
  }

  /**
   * Get batch-specific distribution
   */
  private getBatchDistribution(
    full: FullDistribution,
    batchIndex: number,
    totalBatches: number,
    batchSize: number
  ): BatchDistribution {
    // Simplified: just take a portion of each distribution
    const fraction = batchSize / full.totalCount;

    return {
      totalCount: batchSize,
      questionTypes: full.questionTypes.map(t => ({
        type: t.type,
        count: Math.max(1, Math.round(t.count * fraction))
      })).filter(t => t.count > 0),
      categories: full.categories.map(c => ({
        category: c.category,
        count: Math.max(1, Math.round(c.count * fraction))
      })).filter(c => c.count > 0),
      difficulties: full.difficulties.map(d => ({
        difficulty: d.difficulty,
        count: Math.max(1, Math.round(d.count * fraction))
      })).filter(d => d.count > 0)
    };
  }

  /**
   * Get job status
   */
  getJob(jobId: string): GenerationJob | null {
    return generationJobs.get(jobId) || null;
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = generationJobs.get(jobId);
    if (job && job.status === 'processing') {
      job.status = 'cancelled';
      generationEvents.emit('jobUpdate', job);
      return true;
    }
    return false;
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(userId: string): GenerationJob[] {
    return Array.from(generationJobs.values())
      .filter(job => job.request.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  /**
   * Clean up old jobs
   */
  cleanupOldJobs(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [jobId, job] of generationJobs.entries()) {
      if (now - job.startedAt.getTime() > maxAgeMs) {
        generationJobs.delete(jobId);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Types for internal use
interface FullDistribution {
  totalCount: number;
  questionTypes: { type: QuestionType; count: number }[];
  categories: { category: NCLEXCategory; count: number }[];
  difficulties: { difficulty: 'easy' | 'medium' | 'hard'; count: number }[];
}

type BatchDistribution = FullDistribution;

// Export singleton instance
export const questionGeneratorService = new QuestionGeneratorService();
export default questionGeneratorService;
