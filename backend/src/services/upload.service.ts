import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload, UploadType } from '../models/FileUpload';
import { logger } from '../utils/logger';

export interface UploadOptions {
  userId?: string;
  uploadType: UploadType;
  referenceId?: string;
  referenceType?: string;
  isPublic?: boolean;
}

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES: Record<UploadType, string[]> = {
  avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  attachment: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  material: ['application/pdf', 'application/epub+zip', 'video/mp4', 'audio/mpeg', 'audio/mp3'],
  question_image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  other: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
};

export class UploadService {
  constructor() {
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    const directories = ['', 'avatars', 'attachments', 'materials', 'questions', 'other'];
    directories.forEach((dir) => {
      const fullPath = path.join(UPLOAD_DIR, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        logger.info(`Created upload directory: ${fullPath}`);
      }
    });
  }

  private getSubdirectory(uploadType: UploadType): string {
    const dirMap: Record<UploadType, string> = {
      avatar: 'avatars',
      attachment: 'attachments',
      material: 'materials',
      question_image: 'questions',
      other: 'other',
    };
    return dirMap[uploadType] || 'other';
  }

  validateFile(file: UploadedFile, uploadType: UploadType): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB)` };
    }

    // Check mime type
    const allowedTypes = ALLOWED_MIME_TYPES[uploadType] || ALLOWED_MIME_TYPES.other;
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: `File type ${file.mimetype} is not allowed for ${uploadType}` };
    }

    return { valid: true };
  }

  async uploadFile(file: UploadedFile, options: UploadOptions): Promise<FileUpload> {
    // Validate file
    const validation = this.validateFile(file, options.uploadType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const storedName = `${uuidv4()}${ext}`;
    const subdir = this.getSubdirectory(options.uploadType);
    const filePath = path.join(subdir, storedName);
    const fullPath = path.join(UPLOAD_DIR, filePath);

    // Save file to disk
    await fs.promises.writeFile(fullPath, file.buffer);

    // Create database record
    const upload = await FileUpload.create({
      userId: options.userId,
      originalName: file.originalname,
      storedName,
      filePath,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      uploadType: options.uploadType,
      referenceId: options.referenceId,
      referenceType: options.referenceType,
      isPublic: options.isPublic || false,
    });

    logger.info(`File uploaded: ${file.originalname} -> ${storedName}`);
    return upload;
  }

  async uploadMultiple(files: UploadedFile[], options: UploadOptions): Promise<FileUpload[]> {
    const uploads = await Promise.all(
      files.map((file) => this.uploadFile(file, options))
    );
    return uploads;
  }

  async getFileById(fileId: string): Promise<FileUpload | null> {
    return FileUpload.findByPk(fileId);
  }

  async getUserFiles(userId: string, uploadType?: UploadType): Promise<FileUpload[]> {
    const where: any = { userId };
    if (uploadType) {
      where.uploadType = uploadType;
    }
    return FileUpload.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async deleteFile(fileId: string, userId?: string): Promise<boolean> {
    const where: any = { id: fileId };
    if (userId) {
      where.userId = userId;
    }

    const file = await FileUpload.findOne({ where });
    if (!file) {
      return false;
    }

    // Delete from disk
    const fullPath = path.join(UPLOAD_DIR, file.filePath);
    try {
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      logger.error(`Failed to delete file from disk: ${fullPath}`, error);
    }

    // Delete from database
    await file.destroy();
    logger.info(`File deleted: ${file.originalName}`);
    return true;
  }

  async cleanupOrphanedFiles(): Promise<number> {
    // Find files in database
    const dbFiles = await FileUpload.findAll({
      attributes: ['filePath'],
    });
    const dbPaths = new Set(dbFiles.map((f) => f.filePath));

    // Find files on disk
    let deletedCount = 0;
    const subdirs = ['avatars', 'attachments', 'materials', 'questions', 'other'];

    for (const subdir of subdirs) {
      const dirPath = path.join(UPLOAD_DIR, subdir);
      if (!fs.existsSync(dirPath)) continue;

      const files = await fs.promises.readdir(dirPath);
      for (const file of files) {
        const relativePath = path.join(subdir, file);
        if (!dbPaths.has(relativePath)) {
          try {
            await fs.promises.unlink(path.join(UPLOAD_DIR, relativePath));
            deletedCount++;
          } catch (error) {
            logger.error(`Failed to delete orphaned file: ${relativePath}`, error);
          }
        }
      }
    }

    logger.info(`Cleaned up ${deletedCount} orphaned files`);
    return deletedCount;
  }

  getFilePath(fileId: string): string {
    return path.join(UPLOAD_DIR);
  }

  getPublicUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }
}

export const uploadService = new UploadService();
