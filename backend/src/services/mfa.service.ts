/**
 * MFA Service
 * 
 * Handles Multi-Factor Authentication with TOTP
 */

import crypto from 'crypto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { User } from '../models/User';
import { logger } from '../utils/logger';

const APP_NAME = 'Haven Institute';

export interface MFASetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class MFAService {
  /**
   * Generate a new MFA secret and QR code
   */
  async setupMFA(userId: string): Promise<MFASetupResult> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (user.mfaEnabled) {
      throw new Error('MFA is already enabled');
    }

    // Generate secret
    const secret = authenticator.generateSecret();

    // Generate QR code URL
    const otpauthUrl = authenticator.keyuri(user.email, APP_NAME, secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store secret temporarily (will be confirmed when user verifies)
    await user.update({
      mfaSecret: secret,
      mfaBackupCodes: backupCodes.map(code => this.hashBackupCode(code)),
    });

    logger.info(`MFA setup initiated for user: ${user.email}`);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Verify TOTP code and enable MFA
   */
  async enableMFA(userId: string, totpCode: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!user.mfaSecret) {
      throw new Error('MFA setup not initiated');
    }

    if (user.mfaEnabled) {
      throw new Error('MFA is already enabled');
    }

    const isValid = authenticator.verify({
      token: totpCode,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    await user.update({ mfaEnabled: true });
    logger.info(`MFA enabled for user: ${user.email}`);

    return true;
  }

  /**
   * Disable MFA
   */
  async disableMFA(userId: string, password: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!user.mfaEnabled) {
      throw new Error('MFA is not enabled');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    await user.update({
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
    });

    logger.info(`MFA disabled for user: ${user.email}`);
    return true;
  }

  /**
   * Verify TOTP code during login
   */
  async verifyTOTP(userId: string, totpCode: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new Error('MFA is not enabled for this user');
    }

    const isValid = authenticator.verify({
      token: totpCode,
      secret: user.mfaSecret,
    });

    return isValid;
  }

  /**
   * Verify backup code during login
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!user.mfaEnabled || !user.mfaBackupCodes) {
      throw new Error('MFA is not enabled for this user');
    }

    const hashedCode = this.hashBackupCode(backupCode);
    const codeIndex = user.mfaBackupCodes.indexOf(hashedCode);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    const updatedCodes = [...user.mfaBackupCodes];
    updatedCodes.splice(codeIndex, 1);
    await user.update({ mfaBackupCodes: updatedCodes });

    logger.info(`Backup code used for user: ${user.email}`);
    return true;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, password: string): Promise<string[]> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!user.mfaEnabled) {
      throw new Error('MFA is not enabled');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const backupCodes = this.generateBackupCodes();
    await user.update({
      mfaBackupCodes: backupCodes.map(code => this.hashBackupCode(code)),
    });

    logger.info(`Backup codes regenerated for user: ${user.email}`);
    return backupCodes;
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    return user?.mfaEnabled || false;
  }

  /**
   * Generate random backup codes
   */
  private generateBackupCodes(count = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  /**
   * Hash backup code for storage
   */
  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code.replace('-', '')).digest('hex');
  }
}

export const mfaService = new MFAService();
export default mfaService;
