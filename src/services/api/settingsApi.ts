import api from '../api';

// ==================== SETTINGS TYPES ====================

export interface NotificationPreferences {
  email: {
    studyReminders: boolean;
    weeklyProgress: boolean;
    newContent: boolean;
    promotions: boolean;
    accountAlerts: boolean;
  };
  push: {
    studyReminders: boolean;
    dailyGoals: boolean;
    streakAlerts: boolean;
    groupActivity: boolean;
    aiTutorResponses: boolean;
  };
}

export interface StudyPreferences {
  dailyGoal: number;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  questionsPerSession: number;
  showExplanationsImmediately: boolean;
  autoAdvanceQuestions: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
  language: string;
  timezone: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgressOnLeaderboard: boolean;
  allowStudyGroupInvites: boolean;
  shareActivityWithFriends: boolean;
  allowDirectMessages: boolean;
}

export interface UserSettings {
  id: string;
  userId: string;
  notificationPreferences: NotificationPreferences;
  studyPreferences: StudyPreferences;
  displayPreferences: DisplayPreferences;
  privacySettings: PrivacySettings;
  twoFactorEnabled: boolean;
  sessionTimeoutMinutes: number;
  rememberMeEnabled: boolean;
  lastDataExport?: string;
  dataDeletionRequestedAt?: string;
}

export interface ProfileData {
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  nclexType?: 'RN' | 'PN';
  examDate?: string;
  targetScore?: number;
  preferredStudyTime?: string;
  goals?: string[];
}

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface AccountData {
  profile: any;
  settings: UserSettings;
  sessions: Session[];
  statistics: {
    accountAge: number;
    totalSessions: number;
    lastActive: string | null;
  };
}

// ==================== SETTINGS API ====================

export const settingsApi = {
  // Get user settings
  async getSettings(): Promise<UserSettings> {
    const response = await api.get('/settings');
    return response.data.data;
  },

  // Update notification preferences
  async updateNotifications(preferences: Partial<NotificationPreferences>): Promise<UserSettings> {
    const response = await api.put('/settings/notifications', preferences);
    return response.data.data;
  },

  // Update study preferences
  async updateStudyPreferences(preferences: Partial<StudyPreferences>): Promise<UserSettings> {
    const response = await api.put('/settings/study', preferences);
    return response.data.data;
  },

  // Update display preferences
  async updateDisplayPreferences(preferences: Partial<DisplayPreferences>): Promise<UserSettings> {
    const response = await api.put('/settings/display', preferences);
    return response.data.data;
  },

  // Update privacy settings
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<UserSettings> {
    const response = await api.put('/settings/privacy', settings);
    return response.data.data;
  },

  // Update profile
  async updateProfile(data: ProfileData): Promise<any> {
    const response = await api.put('/settings/profile', data);
    return response.data.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/settings/password', { currentPassword, newPassword });
  },

  // Update email
  async updateEmail(newEmail: string, password: string): Promise<any> {
    const response = await api.put('/settings/email', { newEmail, password });
    return response.data.data;
  },

  // Get sessions
  async getSessions(): Promise<Session[]> {
    const response = await api.get('/settings/sessions');
    return response.data.data;
  },

  // Revoke session
  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/settings/sessions/${sessionId}`);
  },

  // Revoke all other sessions
  async revokeOtherSessions(): Promise<{ message: string }> {
    const response = await api.delete('/settings/sessions');
    return response.data.data;
  },

  // Setup 2FA
  async setup2FA(): Promise<TwoFactorSetup> {
    const response = await api.post('/settings/2fa/setup');
    return response.data.data;
  },

  // Verify and activate 2FA
  async verify2FA(token: string): Promise<void> {
    await api.post('/settings/2fa/verify', { token });
  },

  // Disable 2FA
  async disable2FA(password: string): Promise<void> {
    await api.post('/settings/2fa/disable', { password });
  },

  // Get account data
  async getAccountData(): Promise<AccountData> {
    const response = await api.get('/settings/account');
    return response.data.data;
  },

  // Request data export
  async requestDataExport(): Promise<{ requestedAt: string }> {
    const response = await api.post('/settings/export');
    return response.data.data;
  },

  // Request account deletion
  async requestAccountDeletion(password: string): Promise<{ scheduledFor: string }> {
    const response = await api.post('/settings/delete-account', { password });
    return response.data.data;
  },

  // Cancel account deletion
  async cancelAccountDeletion(): Promise<void> {
    await api.post('/settings/cancel-deletion');
  }
};

// ==================== ADMIN API ====================

export const adminSettingsApi = {
  // Get all users
  async getUsers(params?: {
    search?: string;
    role?: string;
    subscriptionTier?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ users: any[]; total: number }> {
    const response = await api.get('/settings/admin/users', { params });
    return response.data.data;
  },

  // Get user stats
  async getUserStats(): Promise<any> {
    const response = await api.get('/settings/admin/users/stats');
    return response.data.data;
  },

  // Get user by ID
  async getUserById(userId: string): Promise<any> {
    const response = await api.get(`/settings/admin/users/${userId}`);
    return response.data.data;
  },

  // Update user
  async updateUser(userId: string, data: any): Promise<any> {
    const response = await api.put(`/settings/admin/users/${userId}`, data);
    return response.data.data;
  },

  // Deactivate user
  async deactivateUser(userId: string): Promise<any> {
    const response = await api.post(`/settings/admin/users/${userId}/deactivate`);
    return response.data.data;
  },

  // Reactivate user
  async reactivateUser(userId: string): Promise<any> {
    const response = await api.post(`/settings/admin/users/${userId}/reactivate`);
    return response.data.data;
  },

  // Reset user password
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await api.post(`/settings/admin/users/${userId}/reset-password`, { newPassword });
  }
};

export default settingsApi;
