import { Request, Response } from 'express';
import { questionService, QuestionFilters, PaginationOptions } from '../services/question.service';
import { ResponseHandler, errorCodes } from '../utils/response';

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
}

export const questionController = new QuestionController();
