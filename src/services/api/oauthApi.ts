/**
 * OAuth API Service
 * 
 * Frontend API client for OAuth authentication endpoints
 */

import apiClient from './client';

export interface OAuthLoginResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
  };
  token: string;
  refreshToken: string;
  isNewUser: boolean;
  redirectPath: string;
}

export interface LinkedAccount {
  provider: 'google' | 'apple';
  linkedAt: string;
  email?: string;
}

/**
 * Login or register with Google OAuth
 */
export const googleLogin = async (idToken: string): Promise<OAuthLoginResult> => {
  const response = await apiClient.post('/oauth/google', { idToken });
  return response.data.data;
};

/**
 * Link Google account to existing user
 */
export const linkGoogleAccount = async (idToken: string) => {
  const response = await apiClient.post('/oauth/google/link', { idToken });
  return response.data;
};

/**
 * Unlink Google account from user
 */
export const unlinkGoogleAccount = async () => {
  const response = await apiClient.delete('/oauth/google/unlink');
  return response.data;
};

/**
 * Get linked OAuth accounts for current user
 */
export const getLinkedAccounts = async (): Promise<LinkedAccount[]> => {
  const response = await apiClient.get('/oauth/accounts');
  return response.data.data;
};

export default {
  googleLogin,
  linkGoogleAccount,
  unlinkGoogleAccount,
  getLinkedAccounts,
};
