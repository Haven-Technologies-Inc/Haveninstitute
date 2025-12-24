import apiClient from './client';

export type NotificationType = 'system' | 'achievement' | 'reminder' | 'social' | 'subscription' | 'study';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationApi = {
  // Get user notifications
  getNotifications: async (
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.isRead !== undefined) params.append('isRead', String(filters.isRead));
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await apiClient.get(`/notifications?${params.toString()}`);
    return response.data.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data.count;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },
};

export default notificationApi;
