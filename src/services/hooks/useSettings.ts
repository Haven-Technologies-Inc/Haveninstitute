import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, adminSettingsApi } from '../api/settingsApi';
import type { NotificationPreferences, StudyPreferences, DisplayPreferences, PrivacySettings, ProfileData } from '../api/settingsApi';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  settings: () => [...settingsKeys.all, 'user'] as const,
  sessions: () => [...settingsKeys.all, 'sessions'] as const,
  account: () => [...settingsKeys.all, 'account'] as const,
  adminUsers: (params?: any) => [...settingsKeys.all, 'admin', 'users', params] as const,
  adminUserStats: () => [...settingsKeys.all, 'admin', 'stats'] as const,
  adminUser: (id: string) => [...settingsKeys.all, 'admin', 'user', id] as const,
};

// ==================== USER SETTINGS HOOKS ====================

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.settings(),
    queryFn: () => settingsApi.getSettings(),
  });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) => 
      settingsApi.updateNotifications(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

export function useUpdateStudyPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: Partial<StudyPreferences>) => 
      settingsApi.updateStudyPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

export function useUpdateDisplayPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: Partial<DisplayPreferences>) => 
      settingsApi.updateDisplayPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Partial<PrivacySettings>) => 
      settingsApi.updatePrivacySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProfileData) => settingsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.account() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      settingsApi.changePassword(currentPassword, newPassword),
  });
}

export function useUpdateEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ newEmail, password }: { newEmail: string; password: string }) =>
      settingsApi.updateEmail(newEmail, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.account() });
    },
  });
}

// ==================== SESSION HOOKS ====================

export function useSessions() {
  return useQuery({
    queryKey: settingsKeys.sessions(),
    queryFn: () => settingsApi.getSessions(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => settingsApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions() });
    },
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => settingsApi.revokeOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions() });
    },
  });
}

// ==================== 2FA HOOKS ====================

export function useSetup2FA() {
  return useMutation({
    mutationFn: () => settingsApi.setup2FA(),
  });
}

export function useVerify2FA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => settingsApi.verify2FA(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

export function useDisable2FA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (password: string) => settingsApi.disable2FA(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

// ==================== ACCOUNT HOOKS ====================

export function useAccountData() {
  return useQuery({
    queryKey: settingsKeys.account(),
    queryFn: () => settingsApi.getAccountData(),
  });
}

export function useRequestDataExport() {
  return useMutation({
    mutationFn: () => settingsApi.requestDataExport(),
  });
}

export function useRequestAccountDeletion() {
  return useMutation({
    mutationFn: (password: string) => settingsApi.requestAccountDeletion(password),
  });
}

export function useCancelAccountDeletion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => settingsApi.cancelAccountDeletion(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

// ==================== ADMIN HOOKS ====================

export function useAdminUsers(params?: {
  search?: string;
  role?: string;
  subscriptionTier?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: settingsKeys.adminUsers(params),
    queryFn: () => adminSettingsApi.getUsers(params),
  });
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: settingsKeys.adminUserStats(),
    queryFn: () => adminSettingsApi.getUserStats(),
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: settingsKeys.adminUser(userId),
    queryFn: () => adminSettingsApi.getUserById(userId),
    enabled: !!userId,
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      adminSettingsApi.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useAdminDeactivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminSettingsApi.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useAdminReactivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminSettingsApi.reactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      adminSettingsApi.resetUserPassword(userId, newPassword),
  });
}
