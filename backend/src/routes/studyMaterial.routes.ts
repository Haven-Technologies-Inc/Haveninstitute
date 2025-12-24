import { Router } from 'express';
import { studyMaterialController } from '../controllers/studyMaterial.controller';
import { authenticate, authorizeRole } from '../middleware/authenticate';

const router = Router();

// Public routes (require auth)
router.get('/', authenticate, studyMaterialController.getMaterials.bind(studyMaterialController));
router.get('/featured', authenticate, studyMaterialController.getFeatured.bind(studyMaterialController));
router.get('/popular', authenticate, studyMaterialController.getPopular.bind(studyMaterialController));
router.get('/statistics', authenticate, studyMaterialController.getStatistics.bind(studyMaterialController));
router.get('/:id', authenticate, studyMaterialController.getMaterialById.bind(studyMaterialController));

// User library routes
router.get('/user/library', authenticate, studyMaterialController.getUserLibrary.bind(studyMaterialController));
router.get('/:id/progress', authenticate, studyMaterialController.getMaterialProgress.bind(studyMaterialController));
router.put('/:id/progress', authenticate, studyMaterialController.updateProgress.bind(studyMaterialController));
router.post('/:id/bookmark', authenticate, studyMaterialController.addBookmark.bind(studyMaterialController));
router.post('/:id/highlight', authenticate, studyMaterialController.addHighlight.bind(studyMaterialController));
router.post('/:id/favorite', authenticate, studyMaterialController.toggleFavorite.bind(studyMaterialController));
router.post('/:id/rate', authenticate, studyMaterialController.rateMaterial.bind(studyMaterialController));
router.post('/:id/download', authenticate, studyMaterialController.recordDownload.bind(studyMaterialController));

// Admin routes
router.post('/', authenticate, authorizeRole(['admin', 'instructor']), studyMaterialController.createMaterial.bind(studyMaterialController));
router.put('/:id', authenticate, authorizeRole(['admin', 'instructor']), studyMaterialController.updateMaterial.bind(studyMaterialController));
router.delete('/:id', authenticate, authorizeRole(['admin']), studyMaterialController.deleteMaterial.bind(studyMaterialController));

export default router;
