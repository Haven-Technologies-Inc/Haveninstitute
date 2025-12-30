/**
 * User Management API Service
 * Connects to real backend endpoints for user management
 */

import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'instructor' | 'editor' | 'moderator';
  subscription: 'Free' | 'Pro' | 'Premium';
  status: 'active' | 'suspended' | 'inactive';
  joinDate: string;
  lastActive: string;
  questionsAnswered: number;
  averageScore: number;
  userType?: 'nursing-student' | 'nclex-prep' | 'both';
  phone?: string;
  location?: string;
  graduationYear?: string;
  bio?: string;
  profileImage?: string;
  hoursStudied?: number;
  studyStreak?: number;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: 'all' | 'student' | 'admin' | 'instructor' | 'editor' | 'moderator';
  status?: 'all' | 'active' | 'suspended' | 'inactive';
  subscription?: 'all' | 'Free' | 'Pro' | 'Premium';
  userType?: 'all' | 'nursing-student' | 'nclex-prep' | 'both';
  sortBy?: 'name' | 'email' | 'joinDate' | 'lastActive' | 'averageScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Transform backend user to frontend User format
function transformUser(backendUser: any): User {
  return {
    id: backendUser.id,
    name: backendUser.fullName || backendUser.name || '',
    email: backendUser.email || '',
    role: backendUser.role || 'student',
    subscription: backendUser.subscriptionTier || 'Free',
    status: backendUser.isActive === false ? 'inactive' : 
            backendUser.status || 'active',
    joinDate: backendUser.createdAt ? new Date(backendUser.createdAt).toLocaleDateString() : '',
    lastActive: backendUser.lastLogin ? getTimeAgo(backendUser.lastLogin) : 'Never',
    questionsAnswered: backendUser.questionsAnswered || 0,
    averageScore: backendUser.averageScore || 0,
    userType: backendUser.userType,
    phone: backendUser.phone,
    location: backendUser.location,
    graduationYear: backendUser.graduationYear,
    bio: backendUser.bio,
    profileImage: backendUser.profileImage,
    hoursStudied: backendUser.hoursStudied,
    studyStreak: backendUser.studyStreak,
    isActive: backendUser.isActive,
    emailVerified: backendUser.emailVerified
  };
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

// GET: Fetch all users with filters and pagination
export async function getAllUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.subscription && filters.subscription !== 'all') params.append('subscriptionTier', filters.subscription);
    if (filters.status && filters.status !== 'all') {
      params.append('isActive', filters.status === 'active' ? 'true' : 'false');
    }
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));
    
    const response = await api.get(`/admin/users?${params}`);
    const data = response.data.data;
    
    return {
      data: data.users.map(transformUser),
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
      totalPages: data.pagination.totalPages
    };
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch users');
  }
}

// GET: Fetch single user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return transformUser(response.data.data);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch user');
  }
}

// POST: Create new user
export async function createUser(userData: Partial<User>): Promise<User> {
  try {
    const response = await api.post('/admin/users', {
      email: userData.email,
      fullName: userData.name,
      role: userData.role || 'student',
      subscriptionTier: userData.subscription || 'Free',
      sendInvite: true
    });
    return transformUser(response.data.data.user);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to create user');
  }
}

// PUT: Update existing user
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    const response = await api.put(`/admin/users/${id}`, {
      email: userData.email,
      fullName: userData.name,
      role: userData.role,
      subscriptionTier: userData.subscription,
      isActive: userData.status === 'active'
    });
    return transformUser(response.data.data.user);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to update user');
  }
}

// DELETE: Delete user
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await api.delete(`/admin/users/${id}`);
    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to delete user');
  }
}

// PATCH: Update user role
export async function updateUserRole(id: string, role: string): Promise<User> {
  try {
    const response = await api.put(`/admin/users/${id}`, { role });
    return transformUser(response.data.data.user);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to update role');
  }
}

// PATCH: Update user subscription
export async function updateUserSubscription(id: string, subscription: 'Free' | 'Pro' | 'Premium'): Promise<User> {
  try {
    const response = await api.put(`/admin/users/${id}`, { subscriptionTier: subscription });
    return transformUser(response.data.data.user);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to update subscription');
  }
}

// PATCH: Update user status
export async function updateUserStatus(id: string, status: 'active' | 'suspended' | 'inactive'): Promise<User> {
  try {
    const response = await api.put(`/admin/users/${id}`, { 
      isActive: status === 'active'
    });
    return transformUser(response.data.data.user);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to update status');
  }
}

// POST: Suspend user (toggle status)
export async function suspendUser(id: string, _reason?: string): Promise<User> {
  try {
    const response = await api.post(`/admin/users/${id}/toggle-status`);
    return transformUser(response.data.data.user);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to suspend user');
  }
}

// POST: Activate user
export async function activateUser(id: string): Promise<User> {
  try {
    const response = await api.post(`/admin/users/${id}/toggle-status`);
    return transformUser(response.data.data.user);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to activate user');
  }
}

// GET: Get user statistics
export async function getUserStats() {
  try {
    const response = await api.get('/admin/users/stats');
    const stats = response.data.data;
    
    // Transform backend stats to frontend format
    const roleMap: Record<string, number> = {};
    const subMap: Record<string, number> = {};
    
    (stats.roleDistribution || []).forEach((r: any) => {
      roleMap[r.role] = parseInt(r.count);
    });
    
    (stats.subscriptionDistribution || []).forEach((s: any) => {
      subMap[s.subscriptionTier] = parseInt(s.count);
    });
    
    return {
      total: stats.totalUsers || 0,
      active: stats.activeUsers || 0,
      suspended: 0,
      inactive: (stats.totalUsers || 0) - (stats.activeUsers || 0),
      students: roleMap['student'] || 0,
      admins: roleMap['admin'] || 0,
      freeUsers: subMap['Free'] || 0,
      proUsers: subMap['Pro'] || 0,
      premiumUsers: subMap['Premium'] || 0
    };
  } catch (error: any) {
    console.error('Failed to fetch user stats:', error);
    return {
      total: 0, active: 0, suspended: 0, inactive: 0,
      students: 0, admins: 0, freeUsers: 0, proUsers: 0, premiumUsers: 0
    };
  }
}

// GET: Export users to CSV
export async function exportUsersToCSV(filters: UserFilters = {}): Promise<string> {
  const { data } = await getAllUsers({ ...filters, page: 1, limit: 1000 });
  
  const headers = ['Name', 'Email', 'Role', 'Subscription', 'Status', 'Join Date', 'Last Active', 'Questions', 'Avg Score'];
  const rows = data.map(user => [
    user.name,
    user.email,
    user.role,
    user.subscription,
    user.status,
    user.joinDate,
    user.lastActive,
    user.questionsAnswered.toString(),
    user.averageScore.toString()
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  return csv;
}

// POST: Send email to user
export async function sendEmailToUser(id: string, subject: string, message: string): Promise<boolean> {
  try {
    // This would call a backend endpoint to send email
    console.log(`Sending email to user ${id}: ${subject}`);
    // For now, just log it - implement actual email sending via backend
    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to send email');
  }
}

// POST: Send bulk email to users
export async function sendBulkEmail(userIds: string[], subject: string, message: string): Promise<boolean> {
  console.log(`Sending bulk email to ${userIds.length} users: ${subject}`);
  return true;
}

// GET: Get user activity log
export async function getUserActivityLog(_id: string): Promise<any[]> {
  // This would fetch from backend activity log
  return [];
}

// POST: Reset user password
export async function resetUserPassword(id: string): Promise<boolean> {
  try {
    await api.post(`/admin/users/${id}/reset-password`, { sendEmail: true });
    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to reset password');
  }
}

// POST: Resend invite email
export async function resendInviteEmail(id: string): Promise<boolean> {
  try {
    await api.post(`/admin/users/${id}/resend-invite`);
    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to resend invite');
  }
}

// POST: Change user password (admin function)
export async function changeUserPassword(id: string, sendEmail: boolean = true): Promise<{ tempPassword: string }> {
  try {
    const response = await api.post(`/admin/users/${id}/reset-password`, { sendEmail });
    return { tempPassword: response.data.data.tempPassword };
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to change password');
  }
}
