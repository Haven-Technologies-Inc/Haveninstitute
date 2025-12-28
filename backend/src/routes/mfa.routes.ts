/**
 * MFA Routes
 * 
 * API routes for Multi-Factor Authentication
 */

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { mfaService } from '../services/mfa.service';
import { ResponseHandler } from '../utils/response';
import { mfaRateLimiter } from '../middleware/securityRateLimit';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Apply rate limiting to verification endpoints
router.use('/verify', mfaRateLimiter);
router.use('/verify-backup', mfaRateLimiter);

/**
 * @route   GET /api/v1/mfa/status
 * @desc    Check MFA status for current user
 * @access  Private
 */
router.get('/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isEnabled = await mfaService.isMFAEnabled(req.userId!);
    ResponseHandler.success(res, { mfaEnabled: isEnabled });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/mfa/setup
 * @desc    Initialize MFA setup
 * @access  Private
 */
router.post('/setup', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await mfaService.setupMFA(req.userId!);
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/mfa/enable
 * @desc    Enable MFA after verifying TOTP code
 * @access  Private
 */
router.post('/enable', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { totpCode } = req.body;

    if (!totpCode) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'TOTP code required', 400);
    }

    await mfaService.enableMFA(req.userId!, totpCode);
    ResponseHandler.success(res, { message: 'MFA enabled successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/mfa/disable
 * @desc    Disable MFA
 * @access  Private
 */
router.post('/disable', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;

    if (!password) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Password required', 400);
    }

    await mfaService.disableMFA(req.userId!, password);
    ResponseHandler.success(res, { message: 'MFA disabled successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/mfa/verify
 * @desc    Verify TOTP code
 * @access  Private
 */
router.post('/verify', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { totpCode } = req.body;

    if (!totpCode) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'TOTP code required', 400);
    }

    const isValid = await mfaService.verifyTOTP(req.userId!, totpCode);
    
    if (!isValid) {
      return ResponseHandler.error(res, 'AUTH_ERROR', 'Invalid TOTP code', 401);
    }

    ResponseHandler.success(res, { valid: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/mfa/verify-backup
 * @desc    Verify backup code
 * @access  Private
 */
router.post('/verify-backup', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { backupCode } = req.body;

    if (!backupCode) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Backup code required', 400);
    }

    const isValid = await mfaService.verifyBackupCode(req.userId!, backupCode);
    
    if (!isValid) {
      return ResponseHandler.error(res, 'AUTH_ERROR', 'Invalid backup code', 401);
    }

    ResponseHandler.success(res, { valid: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/mfa/regenerate-backup
 * @desc    Regenerate backup codes
 * @access  Private
 */
router.post('/regenerate-backup', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;

    if (!password) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Password required', 400);
    }

    const backupCodes = await mfaService.regenerateBackupCodes(req.userId!, password);
    ResponseHandler.success(res, { backupCodes });
  } catch (error) {
    next(error);
  }
});

export default router;
