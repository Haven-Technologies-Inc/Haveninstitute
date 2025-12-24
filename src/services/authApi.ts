/**
 * Authentication API Service
 * Connects frontend to backend auth endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  nclexType?: 'RN' | 'PN';
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  subscriptionTier: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  preferredStudyTime?: string;
  nclexType?: string;
  examDate?: string;
  targetScore?: number;
  goals?: string[];
  weakAreas?: number[];
  hasCompletedOnboarding: boolean;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    token: string;
    refreshToken: string;
    redirectPath?: string;
    expiresIn?: number;
    message?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class AuthApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('haven_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'An error occurred');
    }

    return data;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<AuthResponse['data']>(response);

    if (result.success && result.data) {
      // Store tokens
      localStorage.setItem('haven_token', result.data.token);
      localStorage.setItem('haven_refresh_token', result.data.refreshToken);
    }

    return result as AuthResponse;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse['data']>(response);

    if (result.success && result.data) {
      // Store tokens
      localStorage.setItem('haven_token', result.data.token);
      localStorage.setItem('haven_refresh_token', result.data.refreshToken);
    }

    return result as AuthResponse;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      const result = await this.handleResponse<{ message: string }>(response);

      // Clear tokens regardless of response
      this.clearTokens();

      return result;
    } catch (error) {
      // Clear tokens even if logout fails
      this.clearTokens();
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return this.handleResponse<AuthUser>(response);
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('haven_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    const result = await this.handleResponse<AuthResponse['data']>(response);

    if (result.success && result.data) {
      // Update tokens
      localStorage.setItem('haven_token', result.data.token);
      localStorage.setItem('haven_refresh_token', result.data.refreshToken);
    }

    return result as AuthResponse;
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ token, password, confirmPassword }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ token }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async resendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async getActiveSessions(): Promise<ApiResponse<{ sessions: any[] }>> {
    const response = await fetch(`${this.baseUrl}/auth/sessions`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return this.handleResponse<{ sessions: any[] }>(response);
  }

  async revokeSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async logoutAllDevices(): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/logout-all`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    const result = await this.handleResponse<{ message: string }>(response);
    this.clearTokens();
    return result;
  }

  // Helper methods
  private clearTokens(): void {
    localStorage.removeItem('haven_token');
    localStorage.removeItem('haven_refresh_token');
  }

  getToken(): string | null {
    return localStorage.getItem('haven_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authApi = new AuthApiService();
export default authApi;
