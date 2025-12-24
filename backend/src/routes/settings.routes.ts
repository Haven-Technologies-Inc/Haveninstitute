/**
 * Settings Routes
 * 
 * API routes for user settings, profile, and account management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/authenticate';
import { settingsService } from '../services/settings.service';
import { ResponseHandler } from '../utils/response';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== USER SETTINGS ====================

/**
 * @route   GET /api/v1/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getSettings(req.userId!);
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/settings/notifications
 * @desc    Update notification preferences
 * @access  Private
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
 * @route   PUT /api/v1/settings/study
 * @desc    Update study preferences
 * @access  Private
 */
router.put('/study', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.updateStudyPreferences(req.userId!, req.body);
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/settings/display
 * @desc    Update display preferences
 * @access  Private
 */
router.put('/display', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.updateDisplayPreferences(req.userId!, req.body);
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/settings/privacy
 * @desc    Update privacy settings
 * @access  Private
 */
router.put('/privacy', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.updatePrivacySettings(req.userId!, req.body);
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

// ==================== PROFILE ====================

/**
 * @route   PUT /api/v1/settings/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await settingsService.updateProfile(req.userId!, req.body);
    ResponseHandler.success(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/settings/password
 * @desc    Change password
 * @access  Private
 */
router.put('/password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Missing required fields', 400);
    }

    await settingsService.changePassword(req.userId!, { currentPassword, newPassword });
    ResponseHandler.success(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/settings/email
 * @desc    Update email address
 * @access  Private
 */
router.put('/email', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { newEmail, password } = req.body;
    
    if (!newEmail || !password) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Missing required fields', 400);
    }

    const user = await settingsService.updateEmail(req.userId!, newEmail, password);
    ResponseHandler.success(res, user);
  } catch (error) {
    next(error);
  }
});

// ==================== SESSIONS ====================

/**
 * @route   GET /api/v1/settings/sessions
 * @desc    Get active sessions
 * @access  Private
 */
router.get('/sessions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await settingsService.getSessions(req.userId!);
    ResponseHandler.success(res, sessions);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/settings/sessions/:sessionId
 * @desc    Revoke a session
 * @access  Private
 */
router.delete('/sessions/:sessionId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await settingsService.revokeSession(req.userId!, req.params.sessionId);
    ResponseHandler.success(res, { message: 'Session revoked' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/settings/sessions
 * @desc    Revoke all other sessions
 * @access  Private
 */
router.delete('/sessions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentSessionId = req.headers['x-session-id'] as string;
    const count = await settingsService.revokeOtherSessions(req.userId!, currentSessionId);
    ResponseHandler.success(res, { message: `${count} sessions revoked` });
  } catch (error) {
    next(error);
  }
});

// ==================== TWO-FACTOR AUTH ====================

/**
 * @route   POST /api/v1/settings/2fa/setup
 * @desc    Set up two-factor authentication
 * @access  Private
 */
router.post('/2fa/setup', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await settingsService.enableTwoFactor(req.userId!);
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/settings/2fa/verify
 * @desc    Verify and activate 2FA
 * @access  Private
 */
router.post('/2fa/verify', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Verification code required', 400);
    }

    await settingsService.verifyAndActivateTwoFactor(req.userId!, token);
    ResponseHandler.success(res, { message: 'Two-factor authentication enabled' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/settings/2fa/disable
 * @desc    Disable two-factor authentication
 * @access  Private
 */
router.post('/2fa/disable', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Password required', 400);
    }

    await settingsService.disableTwoFactor(req.userId!, password);
    ResponseHandler.success(res, { message: 'Two-factor authentication disabled' });
  } catch (error) {
    next(error);
  }
});

// ==================== ACCOUNT DATA ====================

/**
 * @route   GET /api/v1/settings/account
 * @desc    Get full account data
 * @access  Private
 */
router.get('/account', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await settingsService.getAccountData(req.userId!);
    ResponseHandler.success(res, data);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/settings/export
 * @desc    Request data export
 * @access  Private
 */
router.post('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await settingsService.requestDataExport(req.userId!);
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/settings/delete-account
 * @desc    Request account deletion
 * @access  Private
 */
router.post('/delete-account', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Password required', 400);
    }

    const result = await settingsService.requestAccountDeletion(req.userId!, password);
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/settings/cancel-deletion
 * @desc    Cancel account deletion request
 * @access  Private
 */
router.post('/cancel-deletion', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await settingsService.cancelAccountDeletion(req.userId!);
    ResponseHandler.success(res, { message: 'Account deletion cancelled' });
  } catch (error) {
    next(error);
  }
});

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/v1/settings/admin/users
 * @desc    Get all users (admin)
 * @access  Admin
 */
router.get('/admin/users', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, role, subscriptionTier, isActive, page, limit } = req.query;
    
    const result = await settingsService.getAllUsers({
      search: search as string,
      role: role as string,
      subscriptionTier: subscriptionTier as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/settings/admin/users/stats
 * @desc    Get user statistics (admin)
 * @access  Admin
 */
router.get('/admin/users/stats', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await settingsService.getUserStats();
    ResponseHandler.success(res, stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/settings/admin/users/:userId
 * @desc    Get user by ID (admin)
 * @access  Admin
 */
router.get('/admin/users/:userId', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await settingsService.getUserById(req.params.userId);
    ResponseHandler.success(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/settings/admin/users/:userId
 * @desc    Update user (admin)
 * @access  Admin
 */
router.put('/admin/users/:userId', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await settingsService.adminUpdateUser(req.params.userId, req.body);
    ResponseHandler.success(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/settings/admin/users/:userId/deactivate
 * @desc    Deactivate user (admin)
 * @access  Admin
 */
router.post('/admin/users/:userId/deactivate', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await settingsService.deactivateUser(req.params.userId);
    ResponseHandler.success(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/settings/admin/users/:userId/reactivate
 * @desc    Reactivate user (admin)
 * @access  Admin
 */
router.post('/admin/users/:userId/reactivate', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await settingsService.reactivateUser(req.params.userId);
    ResponseHandler.success(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/settings/admin/users/:userId/reset-password
 * @desc    Reset user password (admin)
 * @access  Admin
 */
router.post('/admin/users/:userId/reset-password', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'New password required', 400);
    }

    await settingsService.adminResetPassword(req.params.userId, newPassword);
    ResponseHandler.success(res, { message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
