import { Router } from 'express';
import multer from 'multer';
import { questionController } from '../controllers/question.controller';
import { authenticate, authorizeRole } from '../middleware/authenticate';

const router = Router();

// Configure multer for file uploads (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size for up to 1000 questions
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
      'text/plain',
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'];
    
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Supported: PDF, Word, Excel, CSV, TXT`));
    }
  },
});

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

// File upload routes (admin only) - supports PDF, Word, Excel up to 500 questions
router.post('/import/file', authenticate, authorizeRole(['admin', 'instructor']), upload.single('file'), questionController.importFromFile.bind(questionController));
router.post('/import/preview', authenticate, authorizeRole(['admin', 'instructor']), upload.single('file'), questionController.parseFilePreview.bind(questionController));

export default router;
