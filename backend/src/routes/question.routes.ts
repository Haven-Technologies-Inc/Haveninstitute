import { Router } from 'express';
import { questionController } from '../controllers/question.controller';
import { authenticate, authorizeRole } from '../middleware/authenticate';

const router = Router();

// Public routes (still require authentication)
router.get('/', authenticate, questionController.getQuestions.bind(questionController));
router.get('/random', authenticate, questionController.getRandomQuestions.bind(questionController));
router.get('/statistics', authenticate, questionController.getStatistics.bind(questionController));
router.get('/:id', authenticate, questionController.getQuestionById.bind(questionController));

// Admin-only routes
router.post('/', authenticate, authorizeRole(['admin', 'instructor']), questionController.createQuestion.bind(questionController));
router.put('/:id', authenticate, authorizeRole(['admin', 'instructor']), questionController.updateQuestion.bind(questionController));
router.delete('/:id', authenticate, authorizeRole(['admin']), questionController.deleteQuestion.bind(questionController));

// Bulk import routes (admin only)
router.post('/import/json', authenticate, authorizeRole(['admin', 'instructor']), questionController.bulkImportJSON.bind(questionController));
router.post('/import/csv', authenticate, authorizeRole(['admin', 'instructor']), questionController.bulkImportCSV.bind(questionController));

export default router;
