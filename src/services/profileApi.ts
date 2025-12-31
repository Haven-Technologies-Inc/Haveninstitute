/**
 * User Profile & Avatar Management API
 * Production-ready implementation using backend API calls
 */

import api from './api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bio?: string;
  educationLevel?: 'associate' | 'bachelor' | 'master' | 'doctorate';
  nursingProgram?: string;
  graduationDate?: string;
  targetExamDate?: string;
  preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  studyGoals?: string[];
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    studyReminders: boolean;
    progressUpdates: boolean;
    marketingEmails: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    accessibility: {
      fontSize: 'small' | 'medium' | 'large';
      highContrast: boolean;
      reducedMotion: boolean;
    };
  };
  subscription: {
    plan: 'free' | 'pro' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate: string;
    endDate?: string;
    autoRenew: boolean;
  };
  stats: {
    questionsCompleted: number;
    studyStreak: number;
    totalStudyTime: number;
    lastActive: string;
    joinDate: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AvatarUploadResponse {
  success: boolean;
  avatarUrl?: string;
  message: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Partial<UserProfile['address']>;
  bio?: string;
  educationLevel?: string;
  nursingProgram?: string;
  graduationDate?: string;
  targetExamDate?: string;
  preferredStudyTime?: string;
  studyGoals?: string[];
  socialLinks?: Partial<UserProfile['socialLinks']>;
}

export interface NotificationSettings {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  studyReminders?: boolean;
  progressUpdates?: boolean;
  marketingEmails?: boolean;
}

export interface PreferenceSettings {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  accessibility?: Partial<UserProfile['preferences']['accessibility']>;
}

// ============= PROFILE ENDPOINTS =============

export async function getCurrentUserProfile(userId: string): Promise<UserProfile> {
  const response = await api.get('/users/profile');
  return response.data.data;
}

export async function updateUserProfile(userId: string, data: ProfileUpdateData): Promise<UserProfile> {
  const response = await api.put('/users/profile', data);
  return response.data.data;
}

export async function uploadAvatar(userId: string, file: File): Promise<AvatarUploadResponse> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      message: 'Please upload a valid image file'
    };
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      message: 'File size must be less than 5MB'
    };
  }

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: true,
      avatarUrl: response.data.data.avatarUrl,
      message: 'Avatar uploaded successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error?.message || 'Failed to upload avatar'
    };
  }
}

export async function removeAvatar(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    await api.delete('/users/avatar');
    return { success: true, message: 'Avatar removed successfully' };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.error?.message || 'Failed to remove avatar' 
    };
  }
}

export async function updateNotificationSettings(
  userId: string,
  settings: NotificationSettings
): Promise<UserProfile> {
  const response = await api.put('/users/notifications', settings);
  return response.data.data;
}

export async function updatePreferences(
  userId: string,
  preferences: PreferenceSettings
): Promise<UserProfile> {
  const response = await api.put('/users/preferences', preferences);
  return response.data.data;
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    await api.put('/auth/password', {
      currentPassword,
      newPassword
    });
    
    return {
      success: true,
      message: 'Password updated successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error?.message || 'Failed to update password'
    };
  }
}

export async function deleteAccount(userId: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    await api.delete('/users/account', {
      data: { password }
    });
    
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error?.message || 'Failed to delete account'
    };
  }
}

export async function getActivityLog(userId: string, limit: number = 20): Promise<Array<{
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
}>> {
  const response = await api.get('/users/activity', {
    params: { limit }
  });
  return response.data.data || [];
}

export async function exportUserData(userId: string): Promise<string> {
  const response = await api.get('/users/export');
  return JSON.stringify(response.data.data, null, 2);
}
