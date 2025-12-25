import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateVerifyEmail
} from '../middleware/validation';

const router = Router();

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validateRefreshToken, authController.refreshToken);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', authLimiter, validateForgotPassword, authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', authLimiter, validateResetPassword, authController.resetPassword);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate current session)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices (invalidate all sessions)
 * @access  Private
 */
router.post('/logout-all', authenticate, authController.logoutAllDevices);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password (requires current password)
 * @access  Private
 */
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification link
 * @access  Private
 */
router.post('/resend-verification', authenticate, authController.resendVerificationEmail);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get all active sessions for current user
 * @access  Private
 */
router.get('/sessions', authenticate, authController.getActiveSessions);

/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @desc    Revoke a specific session
 * @access  Private
 */
router.delete('/sessions/:sessionId', authenticate, authController.revokeSession);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   PUT /api/v1/auth/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', authenticate, authController.updatePreferences);

export default router;
