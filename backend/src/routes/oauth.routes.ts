/**
 * OAuth Routes
 * 
 * API routes for OAuth authentication (Google, Apple)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { oauthService } from '../services/oauth.service';
import { ResponseHandler } from '../utils/response';
import { oauthRateLimiter } from '../middleware/securityRateLimit';

const router = Router();

// Apply rate limiting to all OAuth routes
router.use(oauthRateLimiter);

/**
 * @route   POST /api/v1/oauth/google
 * @desc    Login or register with Google OAuth
 * @access  Public
 */
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Google ID token required', 400);
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await oauthService.googleLogin(idToken, ipAddress, userAgent);

    ResponseHandler.success(res, {
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
      isNewUser: result.isNewUser,
      redirectPath: result.redirectPath,
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.use(authenticate);

/**
 * @route   POST /api/v1/oauth/google/link
 * @desc    Link Google account to existing user
 * @access  Private
 */
router.post('/google/link', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Google ID token required', 400);
    }

    const user = await oauthService.linkGoogleAccount(req.userId!, idToken);
    ResponseHandler.success(res, { message: 'Google account linked successfully', user });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/oauth/google/unlink
 * @desc    Unlink Google account from user
 * @access  Private
 */
router.delete('/google/unlink', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await oauthService.unlinkGoogleAccount(req.userId!);
    ResponseHandler.success(res, { message: 'Google account unlinked successfully', user });
  } catch (error) {
    next(error);
  }
});

export default router;
