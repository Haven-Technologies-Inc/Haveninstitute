import { Request, Response } from 'express';
import { questionService, QuestionFilters, PaginationOptions } from '../services/question.service';
import { ResponseHandler, errorCodes } from '../utils/response';
import { documentParserService } from '../services/documentParser.service';
import { logger } from '../utils/logger';

export class QuestionController {
  /**
   * Get all questions with filtering and pagination
   */
  async getQuestions(req: Request, res: Response) {
    try {
      const filters: QuestionFilters = {
        category: req.query.category as any,
        questionType: req.query.questionType as any,
        difficulty: req.query.difficulty as any,
        bloomLevel: req.query.bloomLevel as any,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        search: req.query.search as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      };

      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
      };

      const result = await questionService.getQuestions(filters, pagination);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve questions', 500);
    }
  }

  /**
   * Get a single question by ID
   */
  async getQuestionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const question = await questionService.getQuestionById(id);
      return ResponseHandler.success(res, question);
    } catch (error) {
      if (error instanceof Error && error.message === 'Question not found') {
        return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Question not found', 404);
      }
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve question', 500);
    }
  }

  /**
   * Create a new question
   */
  async createQuestion(req: Request, res: Response) {
    try {
      const question = await questionService.createQuestion(req.body);
      return ResponseHandler.success(res, question, 201);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, error instanceof Error ? error.message : 'Failed to create question', 400);
    }
  }

  /**
   * Update an existing question
   */
  async updateQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const question = await questionService.updateQuestion(id, req.body);
      return ResponseHandler.success(res, question);
    } catch (error) {
      if (error instanceof Error && error.message === 'Question not found') {
        return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Question not found', 404);
      }
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, error instanceof Error ? error.message : 'Failed to update question', 400);
    }
  }

  /**
   * Delete a question
   */
  async deleteQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const hard = req.query.hard === 'true';
      const result = await questionService.deleteQuestion(id, hard);
      return ResponseHandler.success(res, result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Question not found') {
        return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Question not found', 404);
      }
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to delete question', 500);
    }
  }

  /**
   * Bulk import questions from JSON
   */
  async bulkImportJSON(req: Request, res: Response) {
    try {
      const { questions } = req.body;
      if (!Array.isArray(questions)) {
        return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'Request body must contain a "questions" array', 400);
      }

      const result = await questionService.bulkImport(questions);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to import questions', 500);
    }
  }

  /**
   * Bulk import questions from CSV
   */
  async bulkImportCSV(req: Request, res: Response) {
    try {
      const csvContent = req.body.csv || req.body;
      if (typeof csvContent !== 'string') {
        return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'Request body must contain CSV content as string', 400);
      }

      const questions = questionService.parseCSV(csvContent);
      const result = await questionService.bulkImport(questions);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to import questions', 500);
    }
  }

  /**
   * Get random questions for practice
   */
  async getRandomQuestions(req: Request, res: Response) {
    try {
      const count = parseInt(req.query.count as string) || 10;
      const filters: QuestionFilters = {
        category: req.query.category as any,
        difficulty: req.query.difficulty as any,
      };

      const questions = await questionService.getRandomQuestions(count, filters);
      return ResponseHandler.success(res, questions);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve questions', 500);
    }
  }

  /**
   * Get question statistics
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const stats = await questionService.getStatistics();
      return ResponseHandler.success(res, stats);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve statistics', 500);
    }
  }

  /**
   * Import questions from uploaded document file (PDF, Word, Excel)
   * Supports up to 500 questions per upload
   */
  async importFromFile(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'No file uploaded', 400);
      }

      const { category, difficulty, questionType } = req.body;
      
      logger.info(`Processing uploaded file: ${file.originalname} (${file.size} bytes)`);

      // Parse the document
      const parseResult = await documentParserService.parseDocument(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      if (parseResult.questions.length === 0) {
        return ResponseHandler.error(
          res, 
          errorCodes.VAL_INVALID_INPUT, 
          `No valid questions found in the document. ${parseResult.errors.length > 0 ? 'Errors: ' + parseResult.errors.slice(0, 5).join('; ') : ''}`,
          400
        );
      }

      // Apply default category/difficulty if provided
      const questionsToImport = parseResult.questions.map(q => ({
        ...q,
        category: q.category || category || 'safe_effective_care',
        difficulty: q.difficulty || difficulty || 'medium',
        questionType: q.questionType || questionType || 'multiple_choice',
      }));

      // Import questions to database
      const importResult = await questionService.bulkImport(questionsToImport);

      logger.info(`Imported ${importResult.success} questions from ${file.originalname}`);

      return ResponseHandler.success(res, {
        parsed: parseResult.totalFound,
        imported: importResult.success,
        failed: importResult.failed,
        errors: [...parseResult.errors, ...importResult.errors.map(e => `Row ${e.row}: ${e.message}`)].slice(0, 20),
        message: `Successfully imported ${importResult.success} questions from ${file.originalname}`
      });

    } catch (error) {
      logger.error('File import error:', error);
      return ResponseHandler.error(
        res, 
        errorCodes.SYS_INTERNAL_ERROR, 
        error instanceof Error ? error.message : 'Failed to import questions from file', 
        500
      );
    }
  }

  /**
   * Parse document and return preview (without saving)
   */
  async parseFilePreview(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'No file uploaded', 400);
      }

      logger.info(`Parsing file for preview: ${file.originalname}`);

      // Parse the document
      const parseResult = await documentParserService.parseDocument(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      return ResponseHandler.success(res, {
        totalFound: parseResult.totalFound,
        questions: parseResult.questions.slice(0, 50), // Return first 50 for preview
        errors: parseResult.errors.slice(0, 10),
        message: `Found ${parseResult.totalFound} questions in ${file.originalname}`
      });

    } catch (error) {
      logger.error('File parse error:', error);
      return ResponseHandler.error(
        res, 
        errorCodes.SYS_INTERNAL_ERROR, 
        error instanceof Error ? error.message : 'Failed to parse file', 
        500
      );
    }
  }
}

export const questionController = new QuestionController();
