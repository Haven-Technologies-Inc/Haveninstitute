/**
 * Admin API Service
 * Frontend service for admin operations including user management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'instructor' | 'editor' | 'moderator' | 'admin';
  subscriptionTier: 'Free' | 'Pro' | 'Premium';
  isActive: boolean;
  emailVerified: boolean;
  hasCompletedOnboarding: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  role?: 'student' | 'instructor' | 'editor' | 'moderator' | 'admin';
  password?: string;
  sendInvite?: boolean;
  subscriptionTier?: 'Free' | 'Pro' | 'Premium';
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  role?: 'student' | 'instructor' | 'editor' | 'moderator' | 'admin';
  subscriptionTier?: 'Free' | 'Pro' | 'Premium';
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  subscriptionTier?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface PaginatedUsersResponse {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  recentSignups: number;
  roleDistribution: Array<{ role: string; count: number }>;
  subscriptionDistribution: Array<{ subscriptionTier: string; count: number }>;
}

class AdminApiService {
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

  // ==================== USER MANAGEMENT ====================

  async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedUsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.subscriptionTier) params.append('subscriptionTier', filters.subscriptionTier);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.emailVerified !== undefined) params.append('emailVerified', filters.emailVerified.toString());

    const response = await fetch(
      `${this.baseUrl}/admin/users?${params}`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse<PaginatedUsersResponse>(response);
  }

  async getUserById(userId: string): Promise<AdminUser> {
    const response = await fetch(
      `${this.baseUrl}/admin/users/${userId}`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse<AdminUser>(response);
  }

  async getUserStats(): Promise<UserStats> {
    const response = await fetch(
      `${this.baseUrl}/admin/users/stats`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse<UserStats>(response);
  }

  async createUser(data: CreateUserRequest): Promise<{ user: AdminUser; tempPassword?: string; message: string }> {
    const response = await fetch(
      `${this.baseUrl}/admin/users`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<{ user: AdminUser; tempPassword?: string; message: string }>(response);
  }

  async updateUser(userId: string, data: UpdateUserRequest): Promise<{ user: AdminUser; message: string }> {
    const response = await fetch(
      `${this.baseUrl}/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<{ user: AdminUser; message: string }>(response);
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await fetch(
      `${this.baseUrl}/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<{ message: string }>(response);
  }

  async resetUserPassword(userId: string, sendEmail: boolean = true): Promise<{ message: string; tempPassword: string }> {
    const response = await fetch(
      `${this.baseUrl}/admin/users/${userId}/reset-password`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ sendEmail }),
      }
    );
    return this.handleResponse<{ message: string; tempPassword: string }>(response);
  }

  async toggleUserStatus(userId: string): Promise<{ user: AdminUser; message: string }> {
    const response = await fetch(
      `${this.baseUrl}/admin/users/${userId}/toggle-status`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<{ user: AdminUser; message: string }>(response);
  }

  async resendInvite(userId: string): Promise<{ message: string }> {
    const response = await fetch(
      `${this.baseUrl}/admin/users/${userId}/resend-invite`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<{ message: string }>(response);
  }

  // ==================== EMAIL CONFIGURATION ====================

  async getEmailConfig(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/admin/email/config`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${this.baseUrl}/admin/email/test-connection`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${this.baseUrl}/admin/email/send-test`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ to }),
      }
    );
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }
}

export const adminApi = new AdminApiService();
export default adminApi;
