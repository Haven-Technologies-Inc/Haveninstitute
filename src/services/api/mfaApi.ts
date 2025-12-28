/**
 * MFA API Service
 * 
 * Frontend API client for Multi-Factor Authentication endpoints
 */

import apiClient from './client';

export interface MFASetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAStatus {
  mfaEnabled: boolean;
}

/**
 * Get MFA status for current user
 */
export const getMFAStatus = async (): Promise<MFAStatus> => {
  const response = await apiClient.get('/mfa/status');
  return response.data.data;
};

/**
 * Initialize MFA setup - returns QR code and backup codes
 */
export const setupMFA = async (): Promise<MFASetupResult> => {
  const response = await apiClient.post('/mfa/setup');
  return response.data.data;
};

/**
 * Enable MFA after verifying TOTP code
 */
export const enableMFA = async (totpCode: string): Promise<{ message: string }> => {
  const response = await apiClient.post('/mfa/enable', { totpCode });
  return response.data.data;
};

/**
 * Disable MFA (requires password)
 */
export const disableMFA = async (password: string): Promise<{ message: string }> => {
  const response = await apiClient.post('/mfa/disable', { password });
  return response.data.data;
};

/**
 * Verify TOTP code
 */
export const verifyTOTP = async (totpCode: string): Promise<{ valid: boolean }> => {
  const response = await apiClient.post('/mfa/verify', { totpCode });
  return response.data.data;
};

/**
 * Verify backup code
 */
export const verifyBackupCode = async (backupCode: string): Promise<{ valid: boolean }> => {
  const response = await apiClient.post('/mfa/verify-backup', { backupCode });
  return response.data.data;
};

/**
 * Regenerate backup codes (requires password)
 */
export const regenerateBackupCodes = async (password: string): Promise<{ backupCodes: string[] }> => {
  const response = await apiClient.post('/mfa/regenerate-backup', { password });
  return response.data.data;
};

export default {
  getMFAStatus,
  setupMFA,
  enableMFA,
  disableMFA,
  verifyTOTP,
  verifyBackupCode,
  regenerateBackupCodes,
};
