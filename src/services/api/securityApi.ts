/**
 * Security API Service
 * 
 * Frontend API client for security and audit endpoints
 */

import apiClient from './client';

export interface LoginAuditEntry {
  id: string;
  eventType: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  failureReason?: string;
  createdAt: string;
}

export interface SecuritySummary {
  mfaEnabled: boolean;
  lastPasswordChange: string | null;
  recentLoginCount: number;
  suspiciousActivityDetected: boolean;
  activeSessions: number;
}

export interface ActiveSession {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  createdAt: string;
}

/**
 * Get security summary for current user
 */
export const getSecuritySummary = async (): Promise<SecuritySummary> => {
  const response = await apiClient.get('/security/summary');
  return response.data.data;
};

/**
 * Get login history for current user
 */
export const getLoginHistory = async (limit = 50): Promise<LoginAuditEntry[]> => {
  const response = await apiClient.get(`/security/login-history?limit=${limit}`);
  return response.data.data;
};

/**
 * Get active sessions for current user
 */
export const getActiveSessions = async (): Promise<ActiveSession[]> => {
  const response = await apiClient.get('/security/active-sessions');
  return response.data.data;
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/security/sessions/${sessionId}`);
  return response.data.data;
};

/**
 * Revoke all sessions except current
 */
export const revokeAllSessions = async (): Promise<{ message: string }> => {
  const response = await apiClient.post('/security/revoke-all');
  return response.data.data;
};

export default {
  getSecuritySummary,
  getLoginHistory,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
};
