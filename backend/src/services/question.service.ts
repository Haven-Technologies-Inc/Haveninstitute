import { Op } from 'sequelize';
import { Question, NCLEXCategory, QuestionType, BloomLevel } from '../models/Question';

export interface QuestionFilters {
  category?: NCLEXCategory;
  questionType?: QuestionType;
  difficulty?: 'easy' | 'medium' | 'hard';
  bloomLevel?: BloomLevel;
  tags?: string[];
  isActive?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateQuestionInput {
  text: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
  category: NCLEXCategory;
  questionType?: QuestionType;
  bloomLevel?: BloomLevel;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  rationaleCorrect?: string;
  rationaleIncorrect?: string;
  source?: string;
  irtDiscrimination?: number;
  irtDifficulty?: number;
  irtGuessing?: number;
}

export interface UpdateQuestionInput extends Partial<CreateQuestionInput> {
  isActive?: boolean;
}

export interface BulkImportResult {
  success: number;
  failed: number;
  duplicatesSkipped: number;
  errors: { row: number; message: string }[];
}

class QuestionService {
  /**
   * Get all questions with filtering and pagination
   */
  async getQuestions(filters: QuestionFilters, pagination: PaginationOptions) {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.questionType) {
      where.questionType = filters.questionType;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.bloomLevel) {
      where.bloomLevel = filters.bloomLevel;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.text = { [Op.like]: `%${filters.search}%` };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { [Op.overlap]: filters.tags };
    }

    const { count, rows } = await Question.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      questions: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get a single question by ID
   */
  async getQuestionById(id: string) {
    const question = await Question.findByPk(id);
    if (!question) {
      throw new Error('Question not found');
    }
    return question;
  }

  /**
   * Create a new question
   */
  async createQuestion(input: CreateQuestionInput) {
    // Validate options have unique IDs
    const optionIds = input.options.map(o => o.id);
    if (new Set(optionIds).size !== optionIds.length) {
      throw new Error('Option IDs must be unique');
    }

    // Validate correct answers reference valid option IDs
    for (const answer of input.correctAnswers) {
      if (!optionIds.includes(answer)) {
        throw new Error(`Correct answer "${answer}" does not match any option ID`);
      }
    }

    // Auto-calculate IRT difficulty from legacy difficulty if not provided
    if (!input.irtDifficulty) {
      const difficultyMap = { easy: -1.5, medium: 0, hard: 1.5 };
      input.irtDifficulty = difficultyMap[input.difficulty || 'medium'];
    }

    const question = await Question.create(input as any);
    return question;
  }

  /**
   * Update an existing question
   */
  async updateQuestion(id: string, input: UpdateQuestionInput) {
    const question = await Question.findByPk(id);
    if (!question) {
      throw new Error('Question not found');
    }

    // Validate options if being updated
    if (input.options) {
      const optionIds = input.options.map(o => o.id);
      if (new Set(optionIds).size !== optionIds.length) {
        throw new Error('Option IDs must be unique');
      }

      // Validate correct answers if options are being changed
      const correctAnswers = input.correctAnswers || question.correctAnswers;
      for (const answer of correctAnswers) {
        if (!optionIds.includes(answer)) {
          throw new Error(`Correct answer "${answer}" does not match any option ID`);
        }
      }
    }

    await question.update(input);
    return question;
  }

  /**
   * Delete a question (soft delete by setting isActive = false)
   */
  async deleteQuestion(id: string, hard = false) {
    const question = await Question.findByPk(id);
    if (!question) {
      throw new Error('Question not found');
    }

    if (hard) {
      await question.destroy();
      return { message: 'Question permanently deleted' };
    } else {
      await question.update({ isActive: false });
      return { message: 'Question deactivated' };
    }
  }

  /**
   * Normalize question text for duplicate comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  /**
   * Check if a question already exists in the database (by similar text)
   */
  async checkDuplicateInDatabase(questionText: string): Promise<boolean> {
    const normalizedText = this.normalizeText(questionText);
    
    // Get first few words for initial filtering (performance optimization)
    const searchWords = normalizedText.split(' ').slice(0, 5).join(' ');
    
    if (searchWords.length < 10) return false;
    
    // Search for similar questions
    const potentialMatches = await Question.findAll({
      where: {
        text: { [Op.like]: `%${searchWords}%` }
      },
      limit: 10
    });

    // Check similarity with each potential match
    for (const existing of potentialMatches) {
      const existingNormalized = this.normalizeText(existing.text);
      
      // Simple word-based similarity
      const words1 = new Set(normalizedText.split(' '));
      const words2 = new Set(existingNormalized.split(' '));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      const similarity = intersection.size / union.size;
      
      if (similarity > 0.85) {
        return true; // Found a duplicate
      }
    }
    
    return false;
  }

  /**
   * Bulk import questions from JSON array with duplicate detection
   */
  async bulkImport(questions: CreateQuestionInput[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: 0,
      failed: 0,
      duplicatesSkipped: 0,
      errors: [],
    };

    for (let i = 0; i < questions.length; i++) {
      try {
        // Check for duplicate in database
        const isDuplicate = await this.checkDuplicateInDatabase(questions[i].text);
        
        if (isDuplicate) {
          result.duplicatesSkipped++;
          result.errors.push({
            row: i + 1,
            message: 'Duplicate question - already exists in database',
          });
          continue;
        }
        
        await this.createQuestion(questions[i]);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Parse CSV content to question format
   */
  parseCSV(csvContent: string): CreateQuestionInput[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const questions: CreateQuestionInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: any = {};

      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || '';
      });

      // Parse options (expecting format: "A:text|B:text|C:text|D:text")
      const optionsParts = (row.options || '').split('|');
      const options = optionsParts.map((part: string) => {
        const [id, ...textParts] = part.split(':');
        return { id: id.trim(), text: textParts.join(':').trim() };
      }).filter((o: any) => o.id && o.text);

      // Parse correct answers (comma-separated IDs)
      const correctAnswers = (row.correct_answers || row.correctanswers || row.answer || '')
        .split(',')
        .map((a: string) => a.trim())
        .filter((a: string) => a);

      // Parse tags (comma-separated)
      const tags = (row.tags || '')
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t);

      questions.push({
        text: row.text || row.question || '',
        options,
        correctAnswers,
        explanation: row.explanation || row.rationale || '',
        category: (row.category || 'safe_effective_care') as NCLEXCategory,
        questionType: (row.question_type || row.type || 'multiple_choice') as QuestionType,
        bloomLevel: (row.bloom_level || row.bloom || 'apply') as BloomLevel,
        difficulty: (row.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
        tags: tags.length > 0 ? tags : undefined,
        rationaleCorrect: row.rationale_correct,
        rationaleIncorrect: row.rationale_incorrect,
        source: row.source,
      });
    }

    return questions;
  }

  /**
   * Parse a single CSV line, handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  }

  /**
   * Get random questions for quiz/CAT
   */
  async getRandomQuestions(count: number, filters?: QuestionFilters) {
    const where: any = { isActive: true };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }

    const questions = await Question.findAll({
      where,
      order: Question.sequelize?.random(),
      limit: count,
    });

    return questions;
  }

  /**
   * Get questions for CAT based on ability level
   */
  async getQuestionsForCAT(abilityLevel: number, excludeIds: string[], category?: NCLEXCategory) {
    const where: any = {
      isActive: true,
      id: { [Op.notIn]: excludeIds },
      irtDifficulty: {
        [Op.between]: [abilityLevel - 1.5, abilityLevel + 1.5],
      },
    };

    if (category) {
      where.category = category;
    }

    const questions = await Question.findAll({
      where,
      order: [
        // Order by information value (closer to ability = more informative)
        Question.sequelize?.literal(`ABS(irt_difficulty - ${abilityLevel})`) as any,
      ],
      limit: 10,
    });

    return questions;
  }

  /**
   * Update question statistics after answering
   */
  async recordAnswer(questionId: string, isCorrect: boolean) {
    const question = await Question.findByPk(questionId);
    if (!question) return;

    await question.update({
      timesAnswered: question.timesAnswered + 1,
      timesCorrect: isCorrect ? question.timesCorrect + 1 : question.timesCorrect,
    });
  }

  /**
   * Get question statistics
   */
  async getStatistics() {
    const total = await Question.count();
    const active = await Question.count({ where: { isActive: true } });

    const byCategory = await Question.findAll({
      attributes: [
        'category',
        [Question.sequelize!.fn('COUNT', Question.sequelize!.col('id')), 'count'],
      ],
      group: ['category'],
      raw: true,
    });

    const byDifficulty = await Question.findAll({
      attributes: [
        'difficulty',
        [Question.sequelize!.fn('COUNT', Question.sequelize!.col('id')), 'count'],
      ],
      group: ['difficulty'],
      raw: true,
    });

    const byType = await Question.findAll({
      attributes: [
        'questionType',
        [Question.sequelize!.fn('COUNT', Question.sequelize!.col('id')), 'count'],
      ],
      group: ['questionType'],
      raw: true,
    });

    return {
      total,
      active,
      inactive: total - active,
      byCategory,
      byDifficulty,
      byType,
    };
  }
}

export const questionService = new QuestionService();
