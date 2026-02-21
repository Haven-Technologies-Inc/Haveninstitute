import { Router } from 'express';
import { catController } from '../controllers/cat.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All CAT routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/cat/start
 * @desc    Start a new CAT session
 * @access  Private
 */
router.post('/start', (req, res, next) => catController.startSession(req, res, next));

/**
 * @route   GET /api/v1/cat/:sessionId
 * @desc    Get CAT session state
 * @access  Private
 */
router.get('/:sessionId', (req, res, next) => catController.getSession(req, res, next));

/**
 * @route   POST /api/v1/cat/:sessionId/answer
 * @desc    Submit an answer for the current question
 * @access  Private
 */
router.post('/:sessionId/answer', (req, res, next) => catController.submitAnswer(req, res, next));

/**
 * @route   POST /api/v1/cat/:sessionId/complete
 * @desc    Complete/end a CAT session
 * @access  Private
 */
router.post('/:sessionId/complete', (req, res, next) => catController.completeSession(req, res, next));

/**
 * @route   GET /api/v1/cat/:sessionId/result
 * @desc    Get CAT session result
 * @access  Private
 */
router.get('/:sessionId/result', (req, res, next) => catController.getResult(req, res, next));

/**
 * @route   GET /api/v1/cat/history
 * @desc    Get CAT history for authenticated user
 * @access  Private
 */
router.get('/history', (req, res, next) => catController.getHistory(req, res, next));

/**
 * @route   GET /api/v1/cat/ability
 * @desc    Get current ability estimate
 * @access  Private
 */
router.get('/ability', (req, res, next) => catController.getAbility(req, res, next));

export default router;
