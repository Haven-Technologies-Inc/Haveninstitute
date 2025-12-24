import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All quiz routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/quiz/start
 * @desc    Start a new quiz session
 * @access  Private
 */
router.post('/start', (req, res, next) => quizController.startQuiz(req, res, next));

/**
 * @route   GET /api/v1/quiz/categories
 * @desc    Get available quiz categories
 * @access  Private
 */
router.get('/categories', (req, res, next) => quizController.getCategories(req, res, next));

/**
 * @route   GET /api/v1/quiz/history
 * @desc    Get quiz history for authenticated user
 * @access  Private
 */
router.get('/history', (req, res, next) => quizController.getHistory(req, res, next));

/**
 * @route   GET /api/v1/quiz/:sessionId/question
 * @desc    Get current question in a session
 * @access  Private
 */
router.get('/:sessionId/question', (req, res, next) => quizController.getCurrentQuestion(req, res, next));

/**
 * @route   POST /api/v1/quiz/:sessionId/answer
 * @desc    Submit answer for current question
 * @access  Private
 */
router.post('/:sessionId/answer', (req, res, next) => quizController.submitAnswer(req, res, next));

/**
 * @route   POST /api/v1/quiz/:sessionId/complete
 * @desc    Complete/end a quiz session
 * @access  Private
 */
router.post('/:sessionId/complete', (req, res, next) => quizController.completeQuiz(req, res, next));

/**
 * @route   GET /api/v1/quiz/:sessionId/result
 * @desc    Get quiz session result
 * @access  Private
 */
router.get('/:sessionId/result', (req, res, next) => quizController.getResult(req, res, next));

export default router;
