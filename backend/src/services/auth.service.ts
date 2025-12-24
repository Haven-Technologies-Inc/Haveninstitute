import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { jwtConfig, JWTPayload } from '../config/jwt';
import { errorCodes } from '../utils/response';
import emailService from './email.service';
import { logger } from '../utils/logger';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  nclexType?: 'RN' | 'PN';
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface DeviceInfo {
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class AuthService {
  // Token expiration times
  private readonly VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private readonly PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
  private readonly SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

  async register(data: RegisterData) {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw {
        status: 400,
        code: errorCodes.AUTH_EMAIL_EXISTS,
        message: 'Email already registered'
      };
    }

    // Generate email verification token
    const verificationToken = this.generateSecureToken();
    const verificationExpires = new Date(Date.now() + this.VERIFICATION_TOKEN_EXPIRY);

    // Create user
    const user = await User.create({
      email: data.email,
      passwordHash: data.password, // Will be hashed by hook
      fullName: data.fullName,
      nclexType: data.nclexType,
      goals: data.nclexType ? [`Pass NCLEX-${data.nclexType}`] : [],
      emailVerified: false,
      onboardingData: JSON.stringify({
        verificationToken: this.hashToken(verificationToken),
        verificationExpires: verificationExpires.toISOString()
      })
    } as any);

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, user.fullName);

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    logger.info(`New user registered: ${user.email}`);

    return {
      user: user.toJSON(),
      token,
      refreshToken,
      message: 'Registration successful. Please check your email to verify your account.'
    };
  }

  async login(data: LoginData, deviceInfo?: DeviceInfo) {
    // Find user
    const user = await User.findOne({
      where: {
        email: data.email,
        isActive: true
      }
    });

    if (!user) {
      throw {
        status: 401,
        code: errorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid email or password'
      };
    }

    // Verify password
    const isValid = await user.comparePassword(data.password);
    if (!isValid) {
      throw {
        status: 401,
        code: errorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid email or password'
      };
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const sessionExpiry = data.rememberMe ? this.REMEMBER_ME_EXPIRY : this.SESSION_EXPIRY;
    const { token, refreshToken } = await this.generateTokens(user, sessionExpiry);

    // Create session record
    await this.createSession(user.id, token, refreshToken, sessionExpiry, deviceInfo);

    // Determine redirect path based on user state
    const redirectPath = this.determineRedirectPath(user);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: user.toJSON(),
      token,
      refreshToken,
      redirectPath,
      expiresIn: sessionExpiry / 1000 // in seconds
    };
  }

  /**
   * Intelligent redirect path determination based on user state
   * Priority order:
   * 1. Admin/Staff roles → Admin dashboard
   * 2. Onboarding incomplete → Onboarding flow
   * 3. Email not verified → Verification reminder
   * 4. Low CAT performance → Remediation plan
   * 5. Default → User dashboard
   */
  private determineRedirectPath(user: User): { path: string; reason: string; priority: number } {
    // Admin/Staff roles get admin dashboard
    const adminRoles = ['admin', 'moderator', 'instructor', 'editor'];
    if (adminRoles.includes(user.role)) {
      return {
        path: '/admin',
        reason: 'admin_role',
        priority: 1
      };
    }

    // Check onboarding status
    if (!user.hasCompletedOnboarding) {
      return {
        path: '/onboarding',
        reason: 'onboarding_incomplete',
        priority: 2
      };
    }

    // Check email verification (soft block - still allow access but show reminder)
    if (!user.emailVerified) {
      return {
        path: '/app/dashboard',
        reason: 'email_unverified',
        priority: 3
      };
    }

    // Check for performance-based redirect (CAT score < 60% needs remediation)
    const onboardingData = this.parseOnboardingData(user.onboardingData);
    if (onboardingData?.lastCatScore !== undefined && onboardingData.lastCatScore < 60) {
      return {
        path: '/app/study-plan',
        reason: 'low_performance',
        priority: 4
      };
    }

    // Check subscription status for premium features
    if (user.subscriptionTier === 'Free' && onboardingData?.trialExpired) {
      return {
        path: '/app/subscription',
        reason: 'trial_expired',
        priority: 5
      };
    }

    // Default to dashboard
    return {
      path: '/app/dashboard',
      reason: 'default',
      priority: 10
    };
  }

  private parseOnboardingData(data: string | null): any {
    if (!data) return null;
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }

  async refreshToken(oldRefreshToken: string, deviceInfo?: DeviceInfo) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(oldRefreshToken, jwtConfig.refreshSecret) as { userId: string };

      // Verify session exists
      const refreshTokenHash = this.hashToken(oldRefreshToken);
      const session = await Session.findOne({
        where: {
          userId: decoded.userId,
          refreshTokenHash
        }
      });

      if (!session || session.isExpired()) {
        throw new Error('Session expired or invalid');
      }

      // Get user
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const { token, refreshToken } = await this.generateTokens(user);

      // Update session with new tokens
      await session.update({
        tokenHash: this.hashToken(token),
        refreshTokenHash: this.hashToken(refreshToken),
        ipAddress: deviceInfo?.ipAddress,
        userAgent: deviceInfo?.userAgent
      });

      return { token, refreshToken, user: user.toJSON() };
    } catch (error) {
      throw {
        status: 401,
        code: errorCodes.AUTH_TOKEN_EXPIRED,
        message: 'Invalid or expired refresh token'
      };
    }
  }

  async logout(userId: string, token: string) {
    try {
      const tokenHash = this.hashToken(token);
      await Session.destroy({
        where: {
          userId,
          tokenHash
        }
      });
      logger.info(`User logged out: ${userId}`);
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async logoutAllDevices(userId: string) {
    try {
      const deleted = await Session.destroy({
        where: { userId }
      });
      logger.info(`User logged out from all devices: ${userId}, sessions: ${deleted}`);
      return { message: `Logged out from ${deleted} device(s)` };
    } catch (error) {
      logger.error('Logout all error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = this.generateSecureToken();
    const resetExpires = new Date(Date.now() + this.PASSWORD_RESET_EXPIRY);

    // Store hashed token in user's onboarding data (temporary storage)
    const onboardingData = user.onboardingData ? JSON.parse(user.onboardingData) : {};
    onboardingData.passwordResetToken = this.hashToken(resetToken);
    onboardingData.passwordResetExpires = resetExpires.toISOString();
    
    await user.update({ onboardingData: JSON.stringify(onboardingData) });

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.fullName);

    logger.info(`Password reset requested for: ${email}`);

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  async resetPassword(data: PasswordResetData) {
    const hashedToken = this.hashToken(data.token);

    // Find user with valid reset token using JSON query
    const users = await User.findAll({
      where: {
        onboardingData: {
          [Op.ne]: null
        }
      }
    });
    
    let targetUser: User | null = null;
    for (const user of users) {
      if (user.onboardingData) {
        try {
          const onboardingData = typeof user.onboardingData === 'string' 
            ? JSON.parse(user.onboardingData) 
            : user.onboardingData;
          if (onboardingData.passwordResetToken === hashedToken) {
            const expires = new Date(onboardingData.passwordResetExpires);
            if (expires > new Date()) {
              targetUser = user;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!targetUser) {
      throw {
        status: 400,
        code: errorCodes.AUTH_TOKEN_EXPIRED,
        message: 'Invalid or expired reset token'
      };
    }

    // Update password and clear reset token
    const onboardingData = JSON.parse(targetUser.onboardingData || '{}');
    delete onboardingData.passwordResetToken;
    delete onboardingData.passwordResetExpires;

    await targetUser.update({
      passwordHash: data.password, // Will be hashed by hook
      onboardingData: JSON.stringify(onboardingData)
    });

    // Invalidate all existing sessions
    await Session.destroy({ where: { userId: targetUser.id } });

    logger.info(`Password reset successful for: ${targetUser.email}`);

    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  async changePassword(userId: string, data: ChangePasswordData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw {
        status: 404,
        code: errorCodes.AUTH_USER_NOT_FOUND,
        message: 'User not found'
      };
    }

    // Verify current password
    const isValid = await user.comparePassword(data.currentPassword);
    if (!isValid) {
      throw {
        status: 401,
        code: errorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Current password is incorrect'
      };
    }

    // Update password
    await user.update({ passwordHash: data.newPassword });

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Password changed successfully' };
  }

  async verifyEmail(token: string) {
    const hashedToken = this.hashToken(token);

    // Find user with valid verification token (only unverified users)
    const users = await User.findAll({ 
      where: { 
        emailVerified: false,
        onboardingData: { [Op.ne]: null }
      } 
    });
    
    let targetUser: User | null = null;
    for (const user of users) {
      if (user.onboardingData) {
        try {
          const onboardingData = typeof user.onboardingData === 'string' 
            ? JSON.parse(user.onboardingData) 
            : user.onboardingData;
          if (onboardingData.verificationToken === hashedToken) {
            const expires = new Date(onboardingData.verificationExpires);
            if (expires > new Date()) {
              targetUser = user;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!targetUser) {
      throw {
        status: 400,
        code: errorCodes.AUTH_TOKEN_EXPIRED,
        message: 'Invalid or expired verification token'
      };
    }

    // Update user as verified
    const onboardingData = JSON.parse(targetUser.onboardingData || '{}');
    delete onboardingData.verificationToken;
    delete onboardingData.verificationExpires;

    await targetUser.update({
      emailVerified: true,
      onboardingData: JSON.stringify(onboardingData)
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(targetUser.email, targetUser.fullName);

    logger.info(`Email verified for: ${targetUser.email}`);

    return { message: 'Email verified successfully. Welcome to Haven Institute!' };
  }

  async resendVerificationEmail(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw {
        status: 404,
        code: errorCodes.AUTH_USER_NOT_FOUND,
        message: 'User not found'
      };
    }

    if (user.emailVerified) {
      throw {
        status: 400,
        code: errorCodes.VAL_INVALID_INPUT,
        message: 'Email is already verified'
      };
    }

    // Generate new verification token
    const verificationToken = this.generateSecureToken();
    const verificationExpires = new Date(Date.now() + this.VERIFICATION_TOKEN_EXPIRY);

    const onboardingData = user.onboardingData ? JSON.parse(user.onboardingData) : {};
    onboardingData.verificationToken = this.hashToken(verificationToken);
    onboardingData.verificationExpires = verificationExpires.toISOString();

    await user.update({ onboardingData: JSON.stringify(onboardingData) });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, user.fullName);

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async getActiveSessions(userId: string) {
    const sessions = await Session.findAll({
      where: {
        userId,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    return sessions.map(s => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const deleted = await Session.destroy({
      where: { id: sessionId, userId }
    });

    if (deleted === 0) {
      throw {
        status: 404,
        code: errorCodes.RES_NOT_FOUND,
        message: 'Session not found'
      };
    }

    return { message: 'Session revoked successfully' };
  }

  private async generateTokens(user: User, expiryMs?: number) {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      subscription: user.subscriptionTier as any
    };

    const expiresIn = expiryMs ? `${Math.floor(expiryMs / 1000)}s` : jwtConfig.expiresIn;
    const refreshExpiresIn = expiryMs ? `${Math.floor(expiryMs / 1000)}s` : jwtConfig.refreshExpiresIn;

    // Generate access token
    const token = jwt.sign(
      payload as object,
      jwtConfig.secret as jwt.Secret,
      {
        expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      } as jwt.SignOptions
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id } as object,
      jwtConfig.refreshSecret as jwt.Secret,
      {
        expiresIn: refreshExpiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      } as jwt.SignOptions
    );

    return { token, refreshToken };
  }

  private async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    expiryMs: number,
    deviceInfo?: DeviceInfo
  ) {
    try {
      await Session.create({
        userId,
        tokenHash: this.hashToken(token),
        refreshTokenHash: this.hashToken(refreshToken),
        ipAddress: deviceInfo?.ipAddress,
        userAgent: deviceInfo?.userAgent,
        expiresAt: new Date(Date.now() + expiryMs)
      });
    } catch (error) {
      logger.error('Failed to create session:', error);
      // Don't throw - session creation failure shouldn't block login
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Cleanup expired sessions (call this periodically)
  async cleanupExpiredSessions() {
    const deleted = await Session.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() }
      }
    });
    logger.info(`Cleaned up ${deleted} expired sessions`);
    return deleted;
  }
}

export default new AuthService();
