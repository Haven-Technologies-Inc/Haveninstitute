/**
 * Settings Service
 * 
 * Manages user settings, profile updates, and account management
 */

import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { 
  UserSettings,
  NotificationPreferences,
  StudyPreferences,
  DisplayPreferences,
  PrivacySettings,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_STUDY_PREFERENCES,
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_PRIVACY_SETTINGS
} from '../models/UserSettings';
import { Session } from '../models/Session';
import { errorCodes } from '../utils/response';

export interface ProfileUpdateInput {
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  nclexType?: 'RN' | 'PN';
  examDate?: Date;
  targetScore?: number;
  preferredStudyTime?: string;
  goals?: string[];
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}

export interface AccountData {
  profile: User;
  settings: UserSettings;
  sessions: Session[];
  statistics: {
    accountAge: number;
    totalSessions: number;
    lastActive: Date | null;
  };
}

export class SettingsService {
  /**
   * Get or create user settings
   */
  async getSettings(userId: string): Promise<UserSettings> {
    let settings = await UserSettings.findOne({ where: { userId } });

    if (!settings) {
      settings = await UserSettings.create({
        userId,
        notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
        studyPreferences: DEFAULT_STUDY_PREFERENCES,
        displayPreferences: DEFAULT_DISPLAY_PREFERENCES,
        privacySettings: DEFAULT_PRIVACY_SETTINGS
      });
    }

    return settings;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<UserSettings> {
    const settings = await this.getSettings(userId);
    const current = settings.notificationPreferences;

    const updated = {
      email: { ...current.email, ...preferences.email },
      push: { ...current.push, ...preferences.push }
    };

    await settings.update({ notificationPreferences: updated });
    return settings;
  }

  /**
   * Update study preferences
   */
  async updateStudyPreferences(
    userId: string,
    preferences: Partial<StudyPreferences>
  ): Promise<UserSettings> {
    const settings = await this.getSettings(userId);
    const current = settings.studyPreferences;

    await settings.update({
      studyPreferences: { ...current, ...preferences }
    });
    return settings;
  }

  /**
   * Update display preferences
   */
  async updateDisplayPreferences(
    userId: string,
    preferences: Partial<DisplayPreferences>
  ): Promise<UserSettings> {
    const settings = await this.getSettings(userId);
    const current = settings.displayPreferences;

    await settings.update({
      displayPreferences: { ...current, ...preferences }
    });
    return settings;
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings_: Partial<PrivacySettings>
  ): Promise<UserSettings> {
    const settings = await this.getSettings(userId);
    const current = settings.privacySettings;

    await settings.update({
      privacySettings: { ...current, ...settings_ }
    });
    return settings;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: ProfileUpdateInput): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    await user.update(data);
    return user;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, data: PasswordChangeInput): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    const isValid = await user.comparePassword(data.currentPassword);
    if (!isValid) {
      throw { status: 400, code: errorCodes.AUTH_INVALID_CREDENTIALS, message: 'Current password is incorrect' };
    }

    if (data.newPassword.length < 8) {
      throw { status: 400, code: errorCodes.VAL_INVALID_INPUT, message: 'Password must be at least 8 characters' };
    }

    user.passwordHash = data.newPassword;
    await user.save();
  }

  /**
   * Update email
   */
  async updateEmail(userId: string, newEmail: string, password: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw { status: 400, code: errorCodes.AUTH_INVALID_CREDENTIALS, message: 'Password is incorrect' };
    }

    const existing = await User.findOne({ where: { email: newEmail } });
    if (existing && existing.id !== userId) {
      throw { status: 400, code: errorCodes.AUTH_EMAIL_EXISTS, message: 'Email already in use' };
    }

    await user.update({ email: newEmail, emailVerified: false });
    return user;
  }

  /**
   * Get active sessions
   */
  async getSessions(userId: string): Promise<Session[]> {
    return Session.findAll({
      where: { userId },
      order: [['lastActive', 'DESC']]
    });
  }

  /**
   * Revoke session
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const deleted = await Session.destroy({
      where: { id: sessionId, userId }
    });

    if (deleted === 0) {
      throw { status: 404, code: errorCodes.RES_NOT_FOUND, message: 'Session not found' };
    }
  }

  /**
   * Revoke all other sessions
   */
  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const deleted = await Session.destroy({
      where: {
        userId,
        id: { [Op.ne]: currentSessionId }
      }
    });
    return deleted;
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const speakeasy = await import('speakeasy');
    const QRCode = await import('qrcode');

    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    const secret = speakeasy.default.generateSecret({
      name: `NCLEX Prep (${user.email})`,
      length: 20
    });

    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    const settings = await this.getSettings(userId);
    await settings.update({
      twoFactorSecret: secret.base32,
      twoFactorBackupCodes: backupCodes
    });

    const qrCode = await QRCode.default.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes
    };
  }

  /**
   * Verify and activate two-factor authentication
   */
  async verifyAndActivateTwoFactor(userId: string, token: string): Promise<void> {
    const speakeasy = await import('speakeasy');

    const settings = await this.getSettings(userId);
    if (!settings.twoFactorSecret) {
      throw { status: 400, code: errorCodes.VAL_INVALID_INPUT, message: '2FA not set up' };
    }

    const verified = speakeasy.default.totp.verify({
      secret: settings.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      throw { status: 400, code: errorCodes.AUTH_INVALID_CREDENTIALS, message: 'Invalid verification code' };
    }

    await settings.update({ twoFactorEnabled: true });
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(userId: string, password: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw { status: 400, code: errorCodes.AUTH_INVALID_CREDENTIALS, message: 'Password is incorrect' };
    }

    const settings = await this.getSettings(userId);
    await settings.update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null
    });
  }

  /**
   * Get full account data (for export)
   */
  async getAccountData(userId: string): Promise<AccountData> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    const settings = await this.getSettings(userId);
    const sessions = await this.getSessions(userId);

    const accountAge = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      profile: user,
      settings,
      sessions,
      statistics: {
        accountAge,
        totalSessions: sessions.length,
        lastActive: user.lastLogin || null
      }
    };
  }

  /**
   * Request data export
   */
  async requestDataExport(userId: string): Promise<{ requestedAt: Date }> {
    const settings = await this.getSettings(userId);
    const requestedAt = new Date();
    
    await settings.update({ lastDataExport: requestedAt });
    
    // In production, this would trigger an async job to compile user data
    // and send an email with download link
    
    return { requestedAt };
  }

  /**
   * Request account deletion
   */
  async requestAccountDeletion(userId: string, password: string): Promise<{ scheduledFor: Date }> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw { status: 400, code: errorCodes.AUTH_INVALID_CREDENTIALS, message: 'Password is incorrect' };
    }

    const settings = await this.getSettings(userId);
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 30); // 30 day grace period

    await settings.update({ dataDeletionRequestedAt: new Date() });

    return { scheduledFor };
  }

  /**
   * Cancel account deletion request
   */
  async cancelAccountDeletion(userId: string): Promise<void> {
    const settings = await this.getSettings(userId);
    await settings.update({ dataDeletionRequestedAt: null });
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get all users (admin)
   */
  async getAllUsers(options: {
    search?: string;
    role?: string;
    subscriptionTier?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ users: User[]; total: number }> {
    const { search, role, subscriptionTier, isActive, page = 1, limit = 20 } = options;

    const where: any = {};
    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { fullName: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;
    if (subscriptionTier) where.subscriptionTier = subscriptionTier;
    if (isActive !== undefined) where.isActive = isActive;

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      attributes: { exclude: ['passwordHash'] }
    });

    return { users: rows, total: count };
  }

  /**
   * Get user by ID (admin)
   */
  async getUserById(userId: string): Promise<User> {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    return user;
  }

  /**
   * Update user (admin)
   */
  async adminUpdateUser(userId: string, data: {
    fullName?: string;
    email?: string;
    role?: string;
    subscriptionTier?: string;
    isActive?: boolean;
  }): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    if (data.email && data.email !== user.email) {
      const existing = await User.findOne({ where: { email: data.email } });
      if (existing) {
        throw { status: 400, code: errorCodes.AUTH_EMAIL_EXISTS, message: 'Email already in use' };
      }
    }

    await user.update(data);
    return user;
  }

  /**
   * Deactivate user (admin)
   */
  async deactivateUser(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    await user.update({ isActive: false });
    
    // Revoke all sessions
    await Session.destroy({ where: { userId } });

    return user;
  }

  /**
   * Reactivate user (admin)
   */
  async reactivateUser(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    await user.update({ isActive: true });
    return user;
  }

  /**
   * Reset user password (admin)
   */
  async adminResetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { status: 404, code: errorCodes.AUTH_USER_NOT_FOUND, message: 'User not found' };
    }

    user.passwordHash = newPassword;
    await user.save();

    // Revoke all sessions
    await Session.destroy({ where: { userId } });
  }

  /**
   * Get user statistics (admin)
   */
  async getUserStats() {
    const total = await User.count();
    const active = await User.count({ where: { isActive: true } });
    const verified = await User.count({ where: { emailVerified: true } });

    const byRole = await User.findAll({
      attributes: [
        'role',
        [User.sequelize!.fn('COUNT', '*'), 'count']
      ],
      group: ['role']
    });

    const bySubscription = await User.findAll({
      attributes: [
        'subscriptionTier',
        [User.sequelize!.fn('COUNT', '*'), 'count']
      ],
      group: ['subscriptionTier']
    });

    const newThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(1))
        }
      }
    });

    return {
      total,
      active,
      inactive: total - active,
      verified,
      newThisMonth,
      byRole: byRole.map(r => ({ role: r.role, count: (r as any).getDataValue('count') })),
      bySubscription: bySubscription.map(s => ({ 
        tier: s.subscriptionTier, 
        count: (s as any).getDataValue('count') 
      }))
    };
  }
}

export const settingsService = new SettingsService();
export default settingsService;
