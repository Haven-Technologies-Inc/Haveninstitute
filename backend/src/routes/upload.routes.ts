import { Router, Response } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { uploadService } from '../services/upload.service';
import { ResponseHandler } from '../utils/response';
type UploadType = 'avatar' | 'attachment' | 'material' | 'question_image' | 'other';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// All routes require authentication
router.use(authenticate);

// Upload single file
router.post('/single', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const file = req.file;
    
    if (!file) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'No file provided', 400);
    }

    const { uploadType = 'other', referenceId, referenceType, isPublic } = req.body;

    const uploadedFile = await uploadService.uploadFile(
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      {
        userId,
        uploadType: uploadType as UploadType,
        referenceId,
        referenceType,
        isPublic: isPublic === 'true',
      }
    );

    return ResponseHandler.success(res, {
      id: uploadedFile.id,
      originalName: uploadedFile.originalName,
      url: uploadedFile.publicUrl,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.fileSizeBytes,
    }, 201);
  } catch (error: any) {
    return ResponseHandler.error(res, 'UPLOAD_ERROR', error.message, 400);
  }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'No files provided', 400);
    }

    const { uploadType = 'other', referenceId, referenceType, isPublic } = req.body;

    const uploadedFiles = await uploadService.uploadMultiple(
      files.map((file) => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      })),
      {
        userId,
        uploadType: uploadType as UploadType,
        referenceId,
        referenceType,
        isPublic: isPublic === 'true',
      }
    );

    return ResponseHandler.success(res, uploadedFiles.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      url: f.publicUrl,
      mimeType: f.mimeType,
      size: f.fileSizeBytes,
    })), 201);
  } catch (error: any) {
    return ResponseHandler.error(res, 'UPLOAD_ERROR', error.message, 400);
  }
});

// Upload avatar
router.post('/avatar', upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const file = req.file;
    
    if (!file) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'No file provided', 400);
    }

    const uploadedFile = await uploadService.uploadFile(
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      {
        userId,
        uploadType: 'avatar',
        isPublic: true,
      }
    );

    return ResponseHandler.success(res, {
      id: uploadedFile.id,
      url: uploadedFile.publicUrl,
    }, 201);
  } catch (error: any) {
    return ResponseHandler.error(res, 'UPLOAD_ERROR', error.message, 400);
  }
});

// Get user's files
router.get('/my-files', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { uploadType } = req.query;

    const files = await uploadService.getUserFiles(
      userId,
      uploadType as UploadType | undefined
    );

    return ResponseHandler.success(res, files.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      url: f.publicUrl,
      mimeType: f.mimeType,
      size: f.fileSizeBytes,
      uploadType: f.uploadType,
      createdAt: f.createdAt,
    })));
  } catch (error: any) {
    return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

// Delete file
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const success = await uploadService.deleteFile(id, userId);
    if (!success) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'File not found', 404);
    }

    return ResponseHandler.success(res, { message: 'File deleted' });
  } catch (error: any) {
    return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

export default router;
