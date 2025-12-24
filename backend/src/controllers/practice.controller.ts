import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { NCLEXSimulatorService } from '../services/nclex-simulator.service';
import { QuickPracticeService } from '../services/quick-practice.service';
import { ResponseHandler } from '../utils/response';

const nclexService = new NCLEXSimulatorService();
const quickPracticeService = new QuickPracticeService();

export class PracticeController {
  // ==================== NCLEX SIMULATOR ====================
  
  // Start NCLEX simulator exam
  static async startNCLEXExam(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const session = await nclexService.startExam(userId);
      return ResponseHandler.success(res, session, 201);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get current question in NCLEX exam
  static async getNCLEXQuestion(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      const question = await nclexService.getCurrentQuestion(sessionId, userId);
      if (!question) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'No question available', 404);
      }

      return ResponseHandler.success(res, question);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Submit answer in NCLEX exam
  static async submitNCLEXAnswer(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;
      const { answer, timeSpent } = req.body;

      const result = await nclexService.submitAnswer(sessionId, userId, answer, timeSpent);
      return ResponseHandler.success(res, result);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Take break in NCLEX exam
  static async takeNCLEXBreak(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      await nclexService.takeBreak(sessionId, userId);
      return ResponseHandler.success(res, { message: 'Break started' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // End break in NCLEX exam
  static async endNCLEXBreak(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      await nclexService.endBreak(sessionId, userId);
      return ResponseHandler.success(res, { message: 'Break ended' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // End NCLEX exam
  static async endNCLEXExam(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      const result = await nclexService.endExam(sessionId, userId);
      return ResponseHandler.success(res, result);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get NCLEX exam results
  static async getNCLEXResults(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      const results = await nclexService.getResults(sessionId, userId);
      if (!results) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Results not found', 404);
      }

      return ResponseHandler.success(res, results);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get NCLEX exam history
  static async getNCLEXHistory(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { page = '1', limit = '10' } = req.query;

      const history = await nclexService.getHistory(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );
      return ResponseHandler.success(res, history);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // ==================== QUICK PRACTICE ====================

  // Start quick practice session
  static async startQuickPractice(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { categoryId, difficulty, questionCount = 10 } = req.body;

      const session = await quickPracticeService.startSession(userId, {
        categoryId,
        difficulty,
        questionCount,
      });
      return ResponseHandler.success(res, session, 201);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get current question in quick practice
  static async getQuickPracticeQuestion(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      const question = await quickPracticeService.getCurrentQuestion(sessionId, userId);
      if (!question) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'No question available', 404);
      }

      return ResponseHandler.success(res, question);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Submit answer in quick practice
  static async submitQuickPracticeAnswer(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;
      const { answer, timeSpent } = req.body;

      const result = await quickPracticeService.submitAnswer(sessionId, userId, answer, timeSpent);
      return ResponseHandler.success(res, result);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // End quick practice session
  static async endQuickPractice(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      const result = await quickPracticeService.endSession(sessionId, userId);
      return ResponseHandler.success(res, result);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get quick practice results
  static async getQuickPracticeResults(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      const results = await quickPracticeService.getResults(sessionId, userId);
      if (!results) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Results not found', 404);
      }

      return ResponseHandler.success(res, results);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get quick practice history
  static async getQuickPracticeHistory(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { page = '1', limit = '10' } = req.query;

      const history = await quickPracticeService.getHistory(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );
      return ResponseHandler.success(res, history);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // ==================== COMMON ====================

  // Get available categories
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await quickPracticeService.getCategories();
      return ResponseHandler.success(res, categories);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get question counts by category
  static async getQuestionCounts(req: Request, res: Response) {
    try {
      const counts = await quickPracticeService.getQuestionCounts();
      return ResponseHandler.success(res, counts);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }
}
