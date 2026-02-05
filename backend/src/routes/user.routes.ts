/**
 * User Routes - Profile, Avatar, Preferences, Activity
 */

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { User } from '../models/User';
import { settingsService } from '../services/settings.service';
import { ResponseHandler } from '../utils/response';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/users/profile
 * Get current user profile
 */
router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['passwordHash', 'mfaSecret', 'mfaBackupCodes'] }
    });

    if (!user) {
      return ResponseHandler.error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // Build profile response
    const profile = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatarUrl,
      phone: user.phoneNumber,
      bio: user.bio,
      educationLevel: null,
      nursingProgram: null,
      graduationDate: null,
      targetExamDate: user.examDate,
      preferredStudyTime: user.preferredStudyTime,
      studyGoals: user.goals || [],
      notifications: {
        email: true,
        push: true,
        sms: false,
        studyReminders: true,
        progressUpdates: true,
        marketingEmails: false
      },
      preferences: {
        theme: 'auto',
        language: 'en',
        timezone: 'UTC',
        accessibility: {
          fontSize: 'medium',
          highContrast: false,
          reducedMotion: false
        }
      },
      subscription: {
        plan: user.subscriptionTier || 'free',
        status: 'active',
        startDate: user.createdAt?.toISOString() || new Date().toISOString(),
        autoRenew: true
      },
      stats: {
        questionsCompleted: 0,
        studyStreak: 0,
        totalStudyTime: 0,
        lastActive: user.lastLogin?.toISOString() || user.updatedAt?.toISOString(),
        joinDate: user.createdAt?.toISOString() || new Date().toISOString()
      },
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    };

    ResponseHandler.success(res, profile);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/users/profile
 * Update user profile
 */
router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return ResponseHandler.error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const { fullName, phone, bio, targetExamDate, preferredStudyTime, studyGoals } = req.body;

    const updateData: Record<string, unknown> = {};
    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phoneNumber = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (targetExamDate) updateData.examDate = new Date(targetExamDate);
    if (preferredStudyTime) updateData.preferredStudyTime = preferredStudyTime;
    if (studyGoals) updateData.goals = studyGoals;

    await user.update(updateData);

    logger.info(`Profile updated for user ${req.userId}`);
    ResponseHandler.success(res, { message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/users/avatar
 * Upload user avatar
 */
router.post('/avatar', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return ResponseHandler.error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // For now, use a placeholder avatar URL
    // In production, this would handle file upload to S3/cloud storage
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=667eea&color=fff&size=256`;
    
    await user.update({ avatarUrl });

    ResponseHandler.success(res, { avatarUrl, message: 'Avatar updated' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/users/avatar
 * Remove user avatar
 */
router.delete('/avatar', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return ResponseHandler.error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    await user.update({ avatarUrl: null });

    ResponseHandler.success(res, { message: 'Avatar removed' });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/users/notifications
 * Update notification settings
 */
router.put('/notifications', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.updateNotificationPreferences(req.userId!, req.body);
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/users/preferences
 * Update user preferences
 */
router.put('/preferences', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.updateDisplayPreferences(req.userId!, req.body);
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/users/activity
 * Get user activity log
 */
router.get('/activity', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Return empty activity for now - can be expanded later
    const activities: Array<{ id: string; action: string; description: string; timestamp: string }> = [];

    ResponseHandler.success(res, activities);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/users/export
 * Export user data (GDPR compliance)
 */
router.get('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['passwordHash', 'mfaSecret', 'mfaBackupCodes'] }
    });

    if (!user) {
      return ResponseHandler.error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const exportData = {
      profile: user.toJSON(),
      exportedAt: new Date().toISOString()
    };

    ResponseHandler.success(res, exportData);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/users/account
 * Delete user account
 */
router.delete('/account', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return ResponseHandler.error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // Soft delete - mark as inactive
    await user.update({ isActive: false });

    logger.info(`Account deactivated for user ${req.userId}`);
    ResponseHandler.success(res, { message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
