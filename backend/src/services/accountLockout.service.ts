/**
 * Account Lockout Service
 * Prevents brute force attacks by locking accounts after failed login attempts
 */

import { LoginAudit } from '../models/LoginAudit';
import { logger } from '../utils/logger';

interface LockoutConfig {
  maxAttempts: number;
  lockoutDuration: number; // in minutes
  attemptWindow: number; // in minutes
}

const DEFAULT_CONFIG: LockoutConfig = {
  maxAttempts: Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS) || 5,
  lockoutDuration: Number(process.env.ACCOUNT_LOCKOUT_DURATION_MINUTES) || 30,
  attemptWindow: 15 // 15 minutes window for counting attempts
};

export class AccountLockoutService {
  private static config: LockoutConfig = DEFAULT_CONFIG;

  /**
   * Check if account is currently locked
   */
  static async isAccountLocked(email: string): Promise<{
    isLocked: boolean;
    remainingTime?: number; // minutes
    lockoutUntil?: Date;
  }> {
    try {
      // Get recent failed attempts within the window
      const windowStart = new Date(Date.now() - this.config.attemptWindow * 60 * 1000);
      
      const recentFailures = await LoginAudit.count({
        where: {
          email,
          success: false,
          createdAt: {
            [require('sequelize').Op.gte]: windowStart
          }
        }
      });

      // Check for active lockout
      const lockoutThreshold = new Date(Date.now() - this.config.lockoutDuration * 60 * 1000);
      
      const lastFailure = await LoginAudit.findOne({
        where: {
          email,
          success: false,
          createdAt: {
            [require('sequelize').Op.gte]: lockoutThreshold
          }
        },
        order: [['createdAt', 'DESC']]
      });

      if (recentFailures >= this.config.maxAttempts && lastFailure) {
        const lockoutEnd = new Date(lastFailure.createdAt.getTime() + this.config.lockoutDuration * 60 * 1000);
        const remainingMinutes = Math.ceil((lockoutEnd.getTime() - Date.now()) / (60 * 1000));

        if (remainingMinutes > 0) {
          return {
            isLocked: true,
            remainingTime: remainingMinutes,
            lockoutUntil: lockoutEnd
          };
        }
      }

      return { isLocked: false };
    } catch (error) {
      logger.error('Error checking account lockout:', error);
      // Fail safe - don't lock out if we can't check
      return { isLocked: false };
    }
  }

  /**
   * Record a failed login attempt
   */
  static async recordFailedAttempt(email: string, ip?: string, userAgent?: string): Promise<void> {
    try {
      await LoginAudit.create({
        email,
        success: false,
        ipAddress: ip,
        userAgent,
        createdAt: new Date()
      });

      // Check if this attempt triggers a lockout
      const lockoutStatus = await this.isAccountLocked(email);
      if (lockoutStatus.isLocked) {
        logger.warn(`Account locked due to failed attempts: ${email}`, {
          ip,
          lockoutUntil: lockoutStatus.lockoutUntil
        });
      }
    } catch (error) {
      logger.error('Error recording failed attempt:', error);
    }
  }

  /**
   * Record a successful login and clear failed attempts
   */
  static async recordSuccessfulAttempt(email: string, userId: string, ip?: string, userAgent?: string): Promise<void> {
    try {
      // Record successful login
      await LoginAudit.create({
        email,
        userId,
        success: true,
        ipAddress: ip,
        userAgent,
        createdAt: new Date()
      });

      // Clear old failed attempts (older than the attempt window)
      const windowStart = new Date(Date.now() - this.config.attemptWindow * 60 * 1000);
      
      await LoginAudit.destroy({
        where: {
          email,
          success: false,
          createdAt: {
            [require('sequelize').Op.lt]: windowStart
          }
        }
      });
    } catch (error) {
      logger.error('Error recording successful attempt:', error);
    }
  }

  /**
   * Manually unlock an account
   */
  static async unlockAccount(email: string): Promise<boolean> {
    try {
      const deleted = await LoginAudit.destroy({
        where: {
          email,
          success: false
        }
      });

      logger.info(`Account unlocked: ${email}. Cleared ${deleted} failed attempts.`);
      return true;
    } catch (error) {
      logger.error('Error unlocking account:', error);
      return false;
    }
  }

  /**
   * Get account security status
   */
  static async getAccountSecurityStatus(email: string): Promise<{
    recentFailures: number;
    isLocked: boolean;
    lockoutUntil?: Date;
    lastSuccessfulLogin?: Date;
    lastFailedLogin?: Date;
  }> {
    try {
      const windowStart = new Date(Date.now() - this.config.attemptWindow * 60 * 1000);
      
      const recentFailures = await LoginAudit.count({
        where: {
          email,
          success: false,
          createdAt: {
            [require('sequelize').Op.gte]: windowStart
          }
        }
      });

      const lastSuccessful = await LoginAudit.findOne({
        where: { email, success: true },
        order: [['createdAt', 'DESC']]
      });

      const lastFailed = await LoginAudit.findOne({
        where: { email, success: false },
        order: [['createdAt', 'DESC']]
      });

      const lockoutStatus = await this.isAccountLocked(email);

      return {
        recentFailures,
        isLocked: lockoutStatus.isLocked,
        lockoutUntil: lockoutStatus.lockoutUntil,
        lastSuccessfulLogin: lastSuccessful?.createdAt,
        lastFailedLogin: lastFailed?.createdAt
      };
    } catch (error) {
      logger.error('Error getting account security status:', error);
      return {
        recentFailures: 0,
        isLocked: false
      };
    }
  }

  /**
   * Clean up old audit logs
   */
  static async cleanupOldLogs(olderThanDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
      
      const deleted = await LoginAudit.destroy({
        where: {
          createdAt: {
            [require('sequelize').Op.lt]: cutoffDate
          }
        }
      });

      logger.info(`Cleaned up ${deleted} old login audit records`);
      return deleted;
    } catch (error) {
      logger.error('Error cleaning up old logs:', error);
      return 0;
    }
  }

  /**
   * Update configuration
   */
  static updateConfig(newConfig: Partial<LockoutConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Account lockout configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  static getConfig(): LockoutConfig {
    return { ...this.config };
  }
}

export default AccountLockoutService;
