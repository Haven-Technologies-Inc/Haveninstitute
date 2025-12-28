/**
 * Progress Routes
 * 
 * API routes for user progress tracking and statistics
 */

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { progressService } from '../services/progress.service';
import { ResponseHandler } from '../utils/response';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/progress/daily
 * @desc    Get daily statistics
 * @access  Private
 */
router.get('/daily', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    const stats = await progressService.getDailyStats(req.userId!, targetDate);
    ResponseHandler.success(res, stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/progress/weekly
 * @desc    Get weekly statistics
 * @access  Private
 */
router.get('/weekly', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { weekOffset = '0' } = req.query;
    const stats = await progressService.getWeeklyStats(req.userId!, parseInt(weekOffset as string));
    ResponseHandler.success(res, stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/progress/overall
 * @desc    Get overall progress
 * @access  Private
 */
router.get('/overall', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const progress = await progressService.getOverallProgress(req.userId!);
    ResponseHandler.success(res, progress);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/progress/streak
 * @desc    Get study streak
 * @access  Private
 */
router.get('/streak', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const streak = await progressService.calculateStreak(req.userId!);
    ResponseHandler.success(res, streak);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/progress/activity
 * @desc    Record study activity
 * @access  Private
 */
router.post('/activity', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { activityType, description, metadata } = req.body;

    if (!activityType || !description) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'activityType and description required', 400);
    }

    const activity = await progressService.recordActivity(
      req.userId!,
      activityType,
      description,
      metadata
    );

    ResponseHandler.success(res, activity, 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/progress/export
 * @desc    Export user data (GDPR)
 * @access  Private
 */
router.get('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await progressService.exportUserData(req.userId!);
    ResponseHandler.success(res, data);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/progress/account
 * @desc    Delete user account and all data (GDPR)
 * @access  Private
 */
router.delete('/account', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { confirmDelete } = req.body;

    if (confirmDelete !== 'DELETE_MY_ACCOUNT') {
      return ResponseHandler.error(
        res, 
        'VALIDATION_ERROR', 
        'Please confirm deletion by sending confirmDelete: "DELETE_MY_ACCOUNT"', 
        400
      );
    }

    const success = await progressService.deleteUserAccount(req.userId!);
    
    if (!success) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'User not found', 404);
    }

    ResponseHandler.success(res, { message: 'Account and all data deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
