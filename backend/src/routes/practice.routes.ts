/**
 * Practice Routes
 * 
 * Unified API routes for all practice modes:
 * - NCLEX Simulator (full exam simulation)
 * - Adaptive Test (CAT with IRT)
 * - Quick Practice (configurable practice)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { nclexSimulator } from '../services/nclex-simulator.service';
import { quickPractice } from '../services/quick-practice.service';
import { gamificationService } from '../services/gamification.service';
import { ResponseHandler } from '../utils/response';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== NCLEX SIMULATOR ROUTES ====================

/**
 * @route   POST /api/v1/practice/nclex/start
 * @desc    Start a new NCLEX simulation exam
 * @access  Private
 */
router.post('/nclex/start', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseHandler.error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
    }

    const result = await nclexSimulator.startExam(userId);
    ResponseHandler.success(res, result, 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/practice/nclex/:sessionId/answer
 * @desc    Submit answer for current NCLEX question
 * @access  Private
 */
router.post('/nclex/:sessionId/answer', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseHandler.error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
    }

    const { sessionId } = req.params;
    const { questionId, answer, timeSpent } = req.body;

    if (!questionId || !answer || typeof timeSpent !== 'number') {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Missing required fields', 400);
    }

    const answerArray = Array.isArray(answer) ? answer : [answer];
    const result = await nclexSimulator.submitAnswer(sessionId, questionId, answerArray, timeSpent);

    // Award gamification points for answering
    try {
      await gamificationService.awardPoints(userId, 'question_answered', {
        correct: result.isCorrect,
        difficulty: result.difficulty
      });
    } catch (e) {
      // Don't fail request if gamification fails
      console.error('Gamification award failed:', e);
    }

    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/practice/nclex/:sessionId/break
 * @desc    Take a break during NCLEX exam
 * @access  Private
 */
router.post('/nclex/:sessionId/break', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const result = await nclexSimulator.takeBreak(sessionId);
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/practice/nclex/:sessionId/end
 * @desc    End NCLEX exam early
 * @access  Private
 */
router.post('/nclex/:sessionId/end', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const result = await nclexSimulator.endExam(sessionId);

    // Award gamification points for completing CAT
    if (userId) {
      try {
        await gamificationService.awardPoints(userId, 'cat_completed', {
          passed: result.passed
        });
        // Check for new achievements
        await gamificationService.checkAchievements(userId);
      } catch (e) {
        console.error('Gamification award failed:', e);
      }
    }

    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/practice/nclex/:sessionId/result
 * @desc    Get NCLEX exam result
 * @access  Private
 */
router.get('/nclex/:sessionId/result', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const result = await nclexSimulator.getResult(sessionId);
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/practice/nclex/history
 * @desc    Get NCLEX exam history
 * @access  Private
 */
router.get('/nclex/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseHandler.error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const history = await nclexSimulator.getHistory(userId, limit);
    ResponseHandler.success(res, history);
  } catch (error) {
    next(error);
  }
});

// ==================== QUICK PRACTICE ROUTES ====================

/**
 * @route   POST /api/v1/practice/quick/start
 * @desc    Start a new quick practice session
 * @access  Private
 */
router.post('/quick/start', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseHandler.error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
    }

    const { questionCount, categories, difficulty, timed, timePerQuestion, instantFeedback } = req.body;

    const config = {
      questionCount: questionCount || 10,
      categories,
      difficulty,
      timed: timed || false,
      timePerQuestion: timePerQuestion || 90,
      instantFeedback: instantFeedback !== false,
      shuffleOptions: true
    };

    const result = await quickPractice.startPractice(userId, config);
    ResponseHandler.success(res, result, 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/practice/quick/:sessionId/question
 * @desc    Get current question in practice session
 * @access  Private
 */
router.get('/quick/:sessionId/question', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const question = await quickPractice.getCurrentQuestion(sessionId);
    
    if (!question) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'No current question', 404);
    }
    
    ResponseHandler.success(res, question);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/practice/quick/:sessionId/answer
 * @desc    Submit answer for quick practice question
 * @access  Private
 */
router.post('/quick/:sessionId/answer', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const { questionId, answer, timeSpent } = req.body;

    if (!questionId || !answer) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Missing required fields', 400);
    }

    const answerArray = Array.isArray(answer) ? answer : [answer];
    const result = await quickPractice.submitAnswer(
      sessionId,
      questionId,
      answerArray,
      timeSpent || 0
    );

    // Award gamification points for answering
    if (userId) {
      try {
        await gamificationService.awardPoints(userId, 'question_answered', {
          correct: result.isCorrect,
          difficulty: result.difficulty
        });
      } catch (e) {
        console.error('Gamification award failed:', e);
      }
    }

    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/practice/quick/:sessionId/complete
 * @desc    Complete quick practice session
 * @access  Private
 */
router.post('/quick/:sessionId/complete', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const result = await quickPractice.completeSession(sessionId);

    // Award gamification points for completing quiz
    if (userId) {
      try {
        const isPerfect = result.totalCorrect === result.totalQuestions;
        await gamificationService.awardPoints(userId, 'quiz_completed', {
          perfect: isPerfect
        });
        // Check for new achievements
        await gamificationService.checkAchievements(userId);
      } catch (e) {
        console.error('Gamification award failed:', e);
      }
    }

    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/practice/quick/:sessionId/result
 * @desc    Get quick practice result
 * @access  Private
 */
router.get('/quick/:sessionId/result', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const result = await quickPractice.getResult(sessionId);
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/practice/quick/history
 * @desc    Get quick practice history
 * @access  Private
 */
router.get('/quick/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseHandler.error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const history = await quickPractice.getHistory(userId, limit);
    ResponseHandler.success(res, history);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/practice/categories
 * @desc    Get available practice categories
 * @access  Private
 */
router.get('/categories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await quickPractice.getCategories();
    ResponseHandler.success(res, categories);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/practice/question-count
 * @desc    Get question count by criteria
 * @access  Private
 */
router.get('/question-count', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = req.query.categories 
      ? (req.query.categories as string).split(',') 
      : undefined;
    const difficulty = req.query.difficulty as string | undefined;

    const count = await quickPractice.getQuestionCount(
      categories as any,
      difficulty as any
    );
    
    ResponseHandler.success(res, { count });
  } catch (error) {
    next(error);
  }
});

export default router;
