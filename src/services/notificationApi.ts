/**
 * Notification API Service
 * Frontend service for managing notifications
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'system' | 'social' | 'subscription' | 'study';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class NotificationApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('haven_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'An error occurred');
    }
    return data.data;
  }

  async getNotifications(
    page: number = 1,
    limit: number = 20,
    type?: string,
    isRead?: boolean
  ): Promise<NotificationResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type) params.append('type', type);
    if (isRead !== undefined) params.append('isRead', isRead.toString());

    const response = await fetch(
      `${this.baseUrl}/notifications?${params}`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse<NotificationResponse>(response);
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch(
      `${this.baseUrl}/notifications/unread-count`,
      { headers: this.getHeaders() }
    );
    const data = await this.handleResponse<{ count: number }>(response);
    return data.count;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await fetch(
      `${this.baseUrl}/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );
  }

  async markAllAsRead(): Promise<void> {
    await fetch(
      `${this.baseUrl}/notifications/read-all`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await fetch(
      `${this.baseUrl}/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );
  }
}

export const notificationApi = new NotificationApiService();
export default notificationApi;
