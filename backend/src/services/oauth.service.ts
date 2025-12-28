/**
 * OAuth Service
 * 
 * Handles OAuth authentication with Google, Apple, and other providers
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { jwtConfig } from '../config/jwt';
import { logger } from '../utils/logger';

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface OAuthLoginResult {
  user: User;
  token: string;
  refreshToken: string;
  isNewUser: boolean;
  redirectPath: string;
}

export class OAuthService {
  /**
   * Verify Google ID token and extract payload
   */
  async verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      return {
        sub: payload.sub,
        email: payload.email!,
        email_verified: payload.email_verified || false,
        name: payload.name || '',
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
      };
    } catch (error) {
      logger.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: User): { token: string; refreshToken: string } {
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    return { token, refreshToken };
  }

  /**
   * Create session for user
   */
  private async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Session> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return Session.create({
      userId,
      tokenHash,
      refreshTokenHash,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      expiresAt,
    });
  }

  /**
   * Determine redirect path based on user state
   */
  private determineRedirectPath(user: User): string {
    if (user.role === 'admin') return '/admin';
    if (!user.hasCompletedOnboarding) return '/onboarding';
    return '/app/dashboard';
  }

  /**
   * Login or register user via Google OAuth
   */
  async googleLogin(idToken: string, ipAddress?: string, userAgent?: string): Promise<OAuthLoginResult> {
    const googlePayload = await this.verifyGoogleToken(idToken);

    let user = await User.findOne({ where: { email: googlePayload.email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        email: googlePayload.email,
        fullName: googlePayload.name || `${googlePayload.given_name || ''} ${googlePayload.family_name || ''}`.trim(),
        passwordHash: '',
        emailVerified: googlePayload.email_verified,
        avatarUrl: googlePayload.picture,
        googleId: googlePayload.sub,
        authProvider: 'google',
        isActive: true,
        role: 'student',
        subscriptionTier: 'Free',
        hasCompletedOnboarding: false,
      } as Partial<User>);

      logger.info(`New user registered via Google OAuth: ${user.email}`);
    } else {
      if (!user.googleId) {
        await user.update({
          googleId: googlePayload.sub,
          avatarUrl: user.avatarUrl || googlePayload.picture,
          emailVerified: true,
        });
      }
    }

    const { token, refreshToken } = this.generateTokens(user);
    await this.createSession(user.id, token, refreshToken, ipAddress, userAgent);
    const redirectPath = this.determineRedirectPath(user);

    return { user, token, refreshToken, isNewUser, redirectPath };
  }

  /**
   * Link Google account to existing user
   */
  async linkGoogleAccount(userId: string, idToken: string): Promise<User> {
    const googlePayload = await this.verifyGoogleToken(idToken);

    const existingUser = await User.findOne({ where: { googleId: googlePayload.sub } });
    if (existingUser && existingUser.id !== userId) {
      throw new Error('This Google account is already linked to another user');
    }

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    await user.update({
      googleId: googlePayload.sub,
      avatarUrl: user.avatarUrl || googlePayload.picture,
    });

    logger.info(`Google account linked for user: ${user.email}`);
    return user;
  }

  /**
   * Unlink Google account from user
   */
  async unlinkGoogleAccount(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!user.passwordHash) {
      throw new Error('Cannot unlink Google account - please set a password first');
    }

    await user.update({ googleId: null, authProvider: 'local' });
    logger.info(`Google account unlinked for user: ${user.email}`);
    return user;
  }
}

export const oauthService = new OAuthService();
export default oauthService;
