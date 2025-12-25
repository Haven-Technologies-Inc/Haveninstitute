/**
 * AI Routes - API endpoints for AI features
 */

import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/ai/chat
 * @desc    Chat with AI tutor
 * @access  Private
 */
router.post('/chat', (req, res, next) => aiController.chat(req, res, next));

/**
 * @route   POST /api/v1/ai/chat/stream
 * @desc    Stream chat response (SSE)
 * @access  Private
 */
router.post('/chat/stream', (req, res, next) => aiController.chatStream(req, res, next));

/**
 * @route   POST /api/v1/ai/generate-questions
 * @desc    Generate NCLEX questions using AI
 * @access  Private
 */
router.post('/generate-questions', (req, res, next) => aiController.generateQuestions(req, res, next));

/**
 * @route   POST /api/v1/ai/study-plan
 * @desc    Generate personalized study plan
 * @access  Private
 */
router.post('/study-plan', (req, res, next) => aiController.generateStudyPlan(req, res, next));

/**
 * @route   POST /api/v1/ai/explain
 * @desc    Get AI explanation for a question
 * @access  Private
 */
router.post('/explain', (req, res, next) => aiController.explainQuestion(req, res, next));

/**
 * @route   POST /api/v1/ai/explain-question/:questionId
 * @desc    Generate AI explanation for a question by ID and optionally save it
 * @access  Private
 */
router.post('/explain-question/:questionId', (req, res, next) => aiController.explainQuestionById(req, res, next));

/**
 * @route   POST /api/v1/ai/clinical-analysis
 * @desc    Analyze clinical scenario using CJMM
 * @access  Private
 */
router.post('/clinical-analysis', (req, res, next) => aiController.analyzeClinicalScenario(req, res, next));

/**
 * @route   POST /api/v1/ai/summarize
 * @desc    Summarize content for flashcards
 * @access  Private
 */
router.post('/summarize', (req, res, next) => aiController.summarizeContent(req, res, next));

/**
 * @route   POST /api/v1/ai/recommendations
 * @desc    Get personalized study recommendations
 * @access  Private
 */
router.post('/recommendations', (req, res, next) => aiController.getRecommendations(req, res, next));

/**
 * @route   GET /api/v1/ai/session/:sessionId
 * @desc    Get tutoring session history
 * @access  Private
 */
router.get('/session/:sessionId', (req, res, next) => aiController.getSession(req, res, next));

/**
 * @route   DELETE /api/v1/ai/session/:sessionId
 * @desc    Clear tutoring session
 * @access  Private
 */
router.delete('/session/:sessionId', (req, res, next) => aiController.clearSession(req, res, next));

export default router;
