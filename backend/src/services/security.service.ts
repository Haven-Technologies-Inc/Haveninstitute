/**
 * Security Service
 * 
 * Handles login auditing, password history, and security events
 */

import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { LoginAudit, PasswordHistory, LoginEventType } from '../models/LoginAudit';
import { logger } from '../utils/logger';

const PASSWORD_HISTORY_COUNT = 5;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export interface LoginAuditEntry {
  userId?: string;
  email?: string;
  eventType: LoginEventType;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

export class SecurityService {
  /**
   * Record a login audit event
   */
  async recordLoginEvent(entry: LoginAuditEntry): Promise<LoginAudit> {
    const parsedUserAgent = this.parseUserAgent(entry.userAgent);

    return LoginAudit.create({
      ...entry,
      device: parsedUserAgent.device,
      browser: parsedUserAgent.browser,
      os: parsedUserAgent.os,
    });
  }

  /**
   * Get login history for a user
   */
  async getLoginHistory(userId: string, limit = 50): Promise<LoginAudit[]> {
    return LoginAudit.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  /**
   * Check if account is locked due to failed attempts
   */
  async isAccountLocked(email: string): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000);

    const failedAttempts = await LoginAudit.count({
      where: {
        email,
        eventType: 'login_failed',
        createdAt: { [Op.gte]: cutoffTime },
      },
    });

    return failedAttempts >= MAX_FAILED_ATTEMPTS;
  }

  /**
   * Get failed login attempts count
   */
  async getFailedAttempts(email: string): Promise<number> {
    const cutoffTime = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000);

    return LoginAudit.count({
      where: {
        email,
        eventType: 'login_failed',
        createdAt: { [Op.gte]: cutoffTime },
      },
    });
  }

  /**
   * Check if password was used before
   */
  async isPasswordReused(userId: string, newPassword: string): Promise<boolean> {
    const history = await PasswordHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: PASSWORD_HISTORY_COUNT,
    });

    for (const entry of history) {
      const isMatch = await bcrypt.compare(newPassword, entry.passwordHash);
      if (isMatch) return true;
    }

    return false;
  }

  /**
   * Add password to history
   */
  async addPasswordToHistory(userId: string, passwordHash: string): Promise<void> {
    await PasswordHistory.create({ userId, passwordHash });

    // Clean up old entries beyond the limit
    const entries = await PasswordHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    if (entries.length > PASSWORD_HISTORY_COUNT) {
      const entriesToDelete = entries.slice(PASSWORD_HISTORY_COUNT);
      await PasswordHistory.destroy({
        where: { id: entriesToDelete.map(e => e.id) },
      });
    }
  }

  /**
   * Get active sessions for user
   */
  async getActiveSessions(userId: string): Promise<LoginAudit[]> {
    const recentLogins = await LoginAudit.findAll({
      where: {
        userId,
        eventType: 'login_success',
        createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    return recentLogins;
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(userId: string, ipAddress?: string): Promise<boolean> {
    // Check for logins from multiple countries in short time
    const recentLogins = await LoginAudit.findAll({
      where: {
        userId,
        eventType: 'login_success',
        createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    // Check for unusual patterns
    const uniqueIPs = new Set(recentLogins.map(l => l.ipAddress));
    if (uniqueIPs.size > 5) {
      logger.warn(`Suspicious activity detected for user ${userId}: Multiple IPs in 24h`);
      return true;
    }

    return false;
  }

  /**
   * Parse user agent string
   */
  private parseUserAgent(userAgent?: string): { device: string; browser: string; os: string } {
    if (!userAgent) {
      return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    }

    let device = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect device
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
      device = /iPad/i.test(userAgent) ? 'Tablet' : 'Mobile';
    }

    // Detect browser
    if (/Chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/Safari/i.test(userAgent)) browser = 'Safari';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Edge/i.test(userAgent)) browser = 'Edge';

    // Detect OS
    if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Mac OS/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iOS|iPhone|iPad/i.test(userAgent)) os = 'iOS';

    return { device, browser, os };
  }

  /**
   * Get security summary for user
   */
  async getSecuritySummary(userId: string): Promise<{
    mfaEnabled: boolean;
    lastPasswordChange: Date | null;
    recentLoginCount: number;
    suspiciousActivityDetected: boolean;
    activeSessions: number;
  }> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const lastPasswordChange = await PasswordHistory.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    const recentLogins = await LoginAudit.count({
      where: {
        userId,
        eventType: 'login_success',
        createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    const activeSessions = await LoginAudit.count({
      where: {
        userId,
        eventType: 'login_success',
        createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const suspicious = await this.detectSuspiciousActivity(userId);

    return {
      mfaEnabled: user.mfaEnabled,
      lastPasswordChange: lastPasswordChange?.createdAt || null,
      recentLoginCount: recentLogins,
      suspiciousActivityDetected: suspicious,
      activeSessions,
    };
  }
}

export const securityService = new SecurityService();
export default securityService;
