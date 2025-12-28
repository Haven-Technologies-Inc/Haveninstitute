/**
 * Security Routes
 * 
 * API routes for security features (login history, sessions)
 */

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { securityService } from '../services/security.service';
import { ResponseHandler } from '../utils/response';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/security/summary
 * @desc    Get security summary for current user
 * @access  Private
 */
router.get('/summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await securityService.getSecuritySummary(req.userId!);
    ResponseHandler.success(res, summary);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/security/login-history
 * @desc    Get login history for current user
 * @access  Private
 */
router.get('/login-history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = '50' } = req.query;
    const history = await securityService.getLoginHistory(req.userId!, parseInt(limit as string));
    ResponseHandler.success(res, history);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/security/active-sessions
 * @desc    Get active sessions for current user
 * @access  Private
 */
router.get('/active-sessions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await securityService.getActiveSessions(req.userId!);
    ResponseHandler.success(res, sessions);
  } catch (error) {
    next(error);
  }
});

export default router;
