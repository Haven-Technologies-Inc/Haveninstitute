// User Profile & Avatar Management API
// Handles profile updates, avatar uploads, and user preferences

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock storage
const STORAGE_KEY = 'user_profiles';

const getStoredProfiles = (): Record<string, UserProfile> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveProfiles = (profiles: Record<string, UserProfile>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }
};

// Initialize default profile
const initializeProfile = (userId: string, email: string, fullName: string): UserProfile => {
  return {
    id: userId,
    email,
    fullName,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=667eea&color=fff&size=200`,
    notifications: {
      email: true,
      push: true,
      sms: false,
      studyReminders: true,
      progressUpdates: true,
      marketingEmails: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false
      }
    },
    subscription: {
      plan: 'free',
      status: 'active',
      startDate: new Date().toISOString(),
      autoRenew: false
    },
    stats: {
      questionsCompleted: 0,
      studyStreak: 0,
      totalStudyTime: 0,
      lastActive: new Date().toISOString(),
      joinDate: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// ============= PROFILE ENDPOINTS =============

export async function getCurrentUserProfile(userId: string): Promise<UserProfile> {
  await delay(300);
  
  const profiles = getStoredProfiles();
  
  if (!profiles[userId]) {
    // Get user data from auth context
    const users = JSON.parse(localStorage.getItem('nursehaven_users') || '[]');
    const user = users.find((u: any) => u.id === userId);
    
    if (user) {
      profiles[userId] = initializeProfile(userId, user.email, user.fullName || user.name);
      saveProfiles(profiles);
    } else {
      throw new Error('User not found');
    }
  }
  
  return profiles[userId];
}

export async function updateUserProfile(userId: string, data: ProfileUpdateData): Promise<UserProfile> {
  await delay(400);
  
  const profiles = getStoredProfiles();
  
  if (!profiles[userId]) {
    throw new Error('Profile not found');
  }
  
  profiles[userId] = {
    ...profiles[userId],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  saveProfiles(profiles);
  return profiles[userId];
}

export async function uploadAvatar(userId: string, file: File): Promise<AvatarUploadResponse> {
  await delay(1000);
  
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
  
  // In production, this would upload to cloud storage (S3, Cloudinary, etc.)
  // For now, we'll use a data URL
  const reader = new FileReader();
  
  return new Promise((resolve) => {
    reader.onload = async (e) => {
      const avatarUrl = e.target?.result as string;
      
      const profiles = getStoredProfiles();
      if (profiles[userId]) {
        profiles[userId].avatar = avatarUrl;
        profiles[userId].updatedAt = new Date().toISOString();
        saveProfiles(profiles);
      }
      
      resolve({
        success: true,
        avatarUrl,
        message: 'Avatar uploaded successfully'
      });
    };
    
    reader.readAsDataURL(file);
  });
}

export async function removeAvatar(userId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  
  const profiles = getStoredProfiles();
  
  if (!profiles[userId]) {
    return { success: false, message: 'Profile not found' };
  }
  
  const fullName = profiles[userId].fullName;
  profiles[userId].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=667eea&color=fff&size=200`;
  profiles[userId].updatedAt = new Date().toISOString();
  
  saveProfiles(profiles);
  
  return { success: true, message: 'Avatar removed successfully' };
}

export async function updateNotificationSettings(
  userId: string,
  settings: NotificationSettings
): Promise<UserProfile> {
  await delay(300);
  
  const profiles = getStoredProfiles();
  
  if (!profiles[userId]) {
    throw new Error('Profile not found');
  }
  
  profiles[userId].notifications = {
    ...profiles[userId].notifications,
    ...settings
  };
  profiles[userId].updatedAt = new Date().toISOString();
  
  saveProfiles(profiles);
  return profiles[userId];
}

export async function updatePreferences(
  userId: string,
  preferences: PreferenceSettings
): Promise<UserProfile> {
  await delay(300);
  
  const profiles = getStoredProfiles();
  
  if (!profiles[userId]) {
    throw new Error('Profile not found');
  }
  
  profiles[userId].preferences = {
    ...profiles[userId].preferences,
    ...preferences,
    accessibility: {
      ...profiles[userId].preferences.accessibility,
      ...(preferences.accessibility || {})
    }
  };
  profiles[userId].updatedAt = new Date().toISOString();
  
  saveProfiles(profiles);
  return profiles[userId];
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  await delay(500);
  
  // In production, verify current password against database
  // For now, simulate success
  if (newPassword.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  return {
    success: true,
    message: 'Password updated successfully'
  };
}

export async function deleteAccount(userId: string, password: string): Promise<{ success: boolean; message: string }> {
  await delay(500);
  
  // In production, verify password and permanently delete account
  const profiles = getStoredProfiles();
  delete profiles[userId];
  saveProfiles(profiles);
  
  return {
    success: true,
    message: 'Account deleted successfully'
  };
}

export async function getActivityLog(userId: string, limit: number = 20): Promise<Array<{
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
}>> {
  await delay(400);
  
  // Mock activity log
  return [
    {
      id: '1',
      action: 'login',
      description: 'Logged in successfully',
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      device: 'Chrome on Windows'
    },
    {
      id: '2',
      action: 'profile_update',
      description: 'Updated profile information',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.1',
      device: 'Chrome on Windows'
    },
    {
      id: '3',
      action: 'quiz_completed',
      description: 'Completed practice quiz',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.1',
      device: 'Chrome on Windows'
    }
  ].slice(0, limit);
}

export async function exportUserData(userId: string): Promise<string> {
  await delay(800);
  
  const profile = await getCurrentUserProfile(userId);
  const activityLog = await getActivityLog(userId, 100);
  
  const exportData = {
    profile,
    activityLog,
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}
