import { Request, Response, NextFunction } from 'express';
import { quizService } from '../services/quiz.service';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
  userId?: string;
}

export class QuizController {
  /**
   * Start a new quiz session
   * POST /api/v1/quiz/start
   */
  async startQuiz(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { category, difficulty, questionCount } = req.body;

      const result = await quizService.startQuiz(userId, {
        category,
        difficulty,
        questionCount
      });

      res.status(201).json(result);
    } catch (error: any) {
      if (error.message?.includes('Not enough questions')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Get current question
   * GET /api/v1/quiz/:sessionId/question
   */
  async getCurrentQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await quizService.getCurrentQuestion(sessionId, userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Session not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Submit answer
   * POST /api/v1/quiz/:sessionId/answer
   */
  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { questionId, answer, timeSpent } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!questionId || !answer) {
        return res.status(400).json({ message: 'Missing questionId or answer' });
      }

      const answerArray = Array.isArray(answer) ? answer : [answer];

      const result = await quizService.submitAnswer(
        sessionId,
        userId,
        questionId,
        answerArray,
        timeSpent || 0
      );

      res.json(result);
    } catch (error: any) {
      if (error.message === 'Session not found' || error.message === 'Question not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Complete quiz
   * POST /api/v1/quiz/:sessionId/complete
   */
  async completeQuiz(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await quizService.completeQuiz(sessionId, userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Session not found') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Get quiz result
   * GET /api/v1/quiz/:sessionId/result
   */
  async getResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await quizService.getQuizResult(sessionId, userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Session not found') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Get quiz history
   * GET /api/v1/quiz/history
   */
  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await quizService.getHistory(userId, { limit, category });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get quiz categories
   * GET /api/v1/quiz/categories
   */
  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await quizService.getCategories();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const quizController = new QuizController();
export default quizController;
