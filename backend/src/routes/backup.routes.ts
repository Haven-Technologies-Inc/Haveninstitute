/**
 * Backup Routes
 * Administrative endpoints for database backup and recovery
 */

import { Router, Request, Response } from 'express';
import { BackupService } from '../services/backup.service';
import { ResponseHandler } from '../utils/response';
import { authenticate } from '../middleware/authenticate';
import { AuthRequest } from '../middleware/authenticate';

const router = Router();

// All backup routes require admin authentication
router.use(authenticate);

// Middleware to check admin role
const requireAdmin = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== 'admin') {
    return ResponseHandler.error(res, 'FORBIDDEN', 'Admin access required', 403);
  }
  next();
};

router.use(requireAdmin);

/**
 * Create immediate backup
 * POST /api/v1/backup/create
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const result = await BackupService.performBackup();
    
    if (result.success) {
      ResponseHandler.success(res, {
        backupId: result.backupId,
        filename: result.filename,
        size: result.size,
        duration: result.duration,
        timestamp: result.timestamp
      }, 201);
    } else {
      ResponseHandler.error(res, 'BACKUP_FAILED', result.error || 'Backup failed', 500);
    }
  } catch (error: any) {
    ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

/**
 * List all available backups
 * GET /api/v1/backup/list
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const backups = await BackupService.listBackups();
    
    ResponseHandler.success(res, {
      backups: backups.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      total: backups.length
    });
  } catch (error: any) {
    ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

/**
 * Get backup configuration
 * GET /api/v1/backup/config
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = BackupService.getConfig();
    
    ResponseHandler.success(res, {
      config: {
        enabled: config.enabled,
        schedule: config.schedule,
        retentionDays: config.retentionDays,
        compressionEnabled: config.compressionEnabled,
        encryptionEnabled: config.encryptionEnabled
        // Don't expose backup path for security
      }
    });
  } catch (error: any) {
    ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

/**
 * Update backup configuration
 * PUT /api/v1/backup/config
 */
router.put('/config', async (req: Request, res: Response) => {
  try {
    const { 
      enabled, 
      schedule, 
      retentionDays, 
      compressionEnabled, 
      encryptionEnabled 
    } = req.body;
    
    const newConfig: any = {};
    
    if (typeof enabled === 'boolean') newConfig.enabled = enabled;
    if (typeof schedule === 'string') newConfig.schedule = schedule;
    if (typeof retentionDays === 'number' && retentionDays > 0) {
      newConfig.retentionDays = retentionDays;
    }
    if (typeof compressionEnabled === 'boolean') {
      newConfig.compressionEnabled = compressionEnabled;
    }
    if (typeof encryptionEnabled === 'boolean') {
      newConfig.encryptionEnabled = encryptionEnabled;
    }
    
    BackupService.updateConfig(newConfig);
    
    ResponseHandler.success(res, {
      message: 'Backup configuration updated',
      config: newConfig
    });
  } catch (error: any) {
    ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

/**
 * Clean up old backups
 * POST /api/v1/backup/cleanup
 */
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const deletedCount = await BackupService.cleanupOldBackups();
    
    ResponseHandler.success(res, {
      message: `Cleaned up ${deletedCount} old backup files`,
      deletedCount
    });
  } catch (error: any) {
    ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

/**
 * Test backup functionality
 * POST /api/v1/backup/test
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const testResult = await BackupService.testBackup();
    
    if (testResult.success) {
      ResponseHandler.success(res, {
        message: testResult.message,
        status: 'success'
      });
    } else {
      ResponseHandler.error(res, 'BACKUP_TEST_FAILED', testResult.message, 500);
    }
  } catch (error: any) {
    ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

/**
 * Get backup statistics
 * GET /api/v1/backup/stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const backups = await BackupService.listBackups();
    const config = BackupService.getConfig();
    
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const recentBackups = backups.filter(backup => {
      const daysSinceCreation = (Date.now() - new Date(backup.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 7;
    });
    
    const stats = {
      totalBackups: backups.length,
      totalSize,
      averageSize: backups.length > 0 ? totalSize / backups.length : 0,
      recentBackups: recentBackups.length,
      oldestBackup: backups.length > 0 ? backups[0].createdAt : null,
      newestBackup: backups.length > 0 ? backups[backups.length - 1].createdAt : null,
      config: {
        enabled: config.enabled,
        retentionDays: config.retentionDays,
        compressionEnabled: config.compressionEnabled,
        encryptionEnabled: config.encryptionEnabled
      }
    };
    
    ResponseHandler.success(res, stats);
  } catch (error: any) {
    ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
  }
});

export default router;
