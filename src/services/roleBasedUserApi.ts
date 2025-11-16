// Role-Based User Management API
// Comprehensive user management with role-based access control

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'instructor' | 'user';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned';
export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'users' | 'billing' | 'analytics' | 'settings';
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
  level: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  subscriptionPlan: SubscriptionPlan;
  phone?: string;
  dateOfBirth?: string;
  lastLogin?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
  stats: {
    questionsCompleted: number;
    studyTime: number;
    loginStreak: number;
    averageScore: number;
  };
  notes?: string;
  tags?: string[];
}

export interface RoleChangeLog {
  id: string;
  userId: string;
  changedBy: string;
  oldRole: UserRole;
  newRole: UserRole;
  reason: string;
  timestamp: string;
}

export interface UserActionLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  details?: any;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= PERMISSIONS SYSTEM =============

export const PERMISSIONS: Record<string, Permission> = {
  // Content Management
  'content.view': { id: 'content.view', name: 'View Content', description: 'View all content', category: 'content' },
  'content.create': { id: 'content.create', name: 'Create Content', description: 'Create new content', category: 'content' },
  'content.edit': { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content' },
  'content.delete': { id: 'content.delete', name: 'Delete Content', description: 'Delete content', category: 'content' },
  'content.publish': { id: 'content.publish', name: 'Publish Content', description: 'Publish content to users', category: 'content' },
  
  // User Management
  'users.view': { id: 'users.view', name: 'View Users', description: 'View user list and details', category: 'users' },
  'users.create': { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'users' },
  'users.edit': { id: 'users.edit', name: 'Edit Users', description: 'Edit user information', category: 'users' },
  'users.delete': { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'users' },
  'users.suspend': { id: 'users.suspend', name: 'Suspend Users', description: 'Suspend/ban user accounts', category: 'users' },
  'users.roles': { id: 'users.roles', name: 'Manage Roles', description: 'Assign and modify user roles', category: 'users' },
  
  // Billing & Revenue
  'billing.view': { id: 'billing.view', name: 'View Billing', description: 'View billing information', category: 'billing' },
  'billing.manage': { id: 'billing.manage', name: 'Manage Billing', description: 'Manage subscriptions and payments', category: 'billing' },
  'billing.refund': { id: 'billing.refund', name: 'Process Refunds', description: 'Process payment refunds', category: 'billing' },
  
  // Analytics
  'analytics.view': { id: 'analytics.view', name: 'View Analytics', description: 'View analytics and reports', category: 'analytics' },
  'analytics.export': { id: 'analytics.export', name: 'Export Analytics', description: 'Export analytics data', category: 'analytics' },
  
  // Settings
  'settings.view': { id: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'settings' },
  'settings.edit': { id: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', category: 'settings' },
  'settings.advanced': { id: 'settings.advanced', name: 'Advanced Settings', description: 'Access advanced settings', category: 'settings' }
};

// ============= ROLE CONFIGURATIONS =============

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.keys(PERMISSIONS),
    color: 'red',
    icon: 'Shield',
    level: 5
  },
  admin: {
    role: 'admin',
    label: 'Administrator',
    description: 'Manage users, content, and system settings',
    permissions: [
      'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish',
      'users.view', 'users.create', 'users.edit', 'users.suspend',
      'billing.view', 'billing.manage',
      'analytics.view', 'analytics.export',
      'settings.view', 'settings.edit'
    ],
    color: 'purple',
    icon: 'UserCog',
    level: 4
  },
  moderator: {
    role: 'moderator',
    label: 'Moderator',
    description: 'Manage content and moderate users',
    permissions: [
      'content.view', 'content.edit', 'content.publish',
      'users.view', 'users.suspend',
      'analytics.view'
    ],
    color: 'blue',
    icon: 'Shield',
    level: 3
  },
  instructor: {
    role: 'instructor',
    label: 'Instructor',
    description: 'Create and manage educational content',
    permissions: [
      'content.view', 'content.create', 'content.edit',
      'users.view',
      'analytics.view'
    ],
    color: 'green',
    icon: 'GraduationCap',
    level: 2
  },
  user: {
    role: 'user',
    label: 'User',
    description: 'Standard user with basic access',
    permissions: ['content.view'],
    color: 'gray',
    icon: 'User',
    level: 1
  }
};

// ============= MOCK DATA =============

const MOCK_USERS: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'admin@nursehaven.com',
    fullName: 'System Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    role: 'super_admin',
    status: 'active',
    subscriptionPlan: 'premium',
    lastLogin: new Date().toISOString(),
    loginCount: 523,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    permissions: ROLE_CONFIGS.super_admin.permissions,
    metadata: {
      ipAddress: '192.168.1.1',
      location: 'New York, NY'
    },
    stats: {
      questionsCompleted: 0,
      studyTime: 0,
      loginStreak: 45,
      averageScore: 0
    },
    tags: ['founder', 'technical']
  }
];

// Storage management
const USERS_STORAGE_KEY = 'rbac_users';
const ROLE_LOGS_KEY = 'role_change_logs';
const ACTION_LOGS_KEY = 'user_action_logs';

const getStoredUsers = (): AdminUser[] => {
  if (typeof window === 'undefined') return MOCK_USERS;
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : MOCK_USERS;
};

const saveUsers = (users: AdminUser[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
};

const getRoleLogs = (): RoleChangeLog[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ROLE_LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveRoleLogs = (logs: RoleChangeLog[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ROLE_LOGS_KEY, JSON.stringify(logs));
  }
};

const getActionLogs = (): UserActionLog[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ACTION_LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveActionLogs = (logs: UserActionLog[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTION_LOGS_KEY, JSON.stringify(logs));
  }
};

const logAction = (userId: string, action: string, description: string, performedBy: string, details?: any) => {
  const logs = getActionLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    userId,
    action,
    description,
    performedBy,
    timestamp: new Date().toISOString(),
    details
  });
  saveActionLogs(logs.slice(0, 1000)); // Keep last 1000 logs
};

// ============= USER MANAGEMENT ENDPOINTS =============

export async function getAllUsers(filters?: {
  role?: UserRole;
  status?: UserStatus;
  subscriptionPlan?: SubscriptionPlan;
  search?: string;
}): Promise<AdminUser[]> {
  await delay(300);
  
  let users = getStoredUsers();
  
  if (filters) {
    if (filters.role) {
      users = users.filter(u => u.role === filters.role);
    }
    if (filters.status) {
      users = users.filter(u => u.status === filters.status);
    }
    if (filters.subscriptionPlan) {
      users = users.filter(u => u.subscriptionPlan === filters.subscriptionPlan);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(u => 
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
  }
  
  return users;
}

export async function getUserById(userId: string): Promise<AdminUser | null> {
  await delay(200);
  const users = getStoredUsers();
  return users.find(u => u.id === userId) || null;
}

export async function createUser(data: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt' | 'permissions' | 'loginCount' | 'stats'>): Promise<AdminUser> {
  await delay(400);
  
  const users = getStoredUsers();
  const roleConfig = ROLE_CONFIGS[data.role];
  
  const newUser: AdminUser = {
    ...data,
    id: `user-${Date.now()}`,
    permissions: roleConfig.permissions,
    loginCount: 0,
    stats: {
      questionsCompleted: 0,
      studyTime: 0,
      loginStreak: 0,
      averageScore: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  logAction(newUser.id, 'user_created', `User account created with role: ${data.role}`, 'admin-1');
  
  return newUser;
}

export async function updateUser(userId: string, data: Partial<AdminUser>): Promise<AdminUser> {
  await delay(400);
  
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  users[index] = {
    ...users[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  saveUsers(users);
  logAction(userId, 'user_updated', 'User information updated', 'admin-1', data);
  
  return users[index];
}

export async function deleteUser(userId: string, performedBy: string): Promise<{ success: boolean; message: string }> {
  await delay(400);
  
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  const user = users[userIndex];
  
  // Prevent deleting super admin
  if (user.role === 'super_admin') {
    return { success: false, message: 'Cannot delete super administrator' };
  }
  
  users.splice(userIndex, 1);
  saveUsers(users);
  
  logAction(userId, 'user_deleted', `User account deleted`, performedBy);
  
  return { success: true, message: 'User deleted successfully' };
}

// ============= ROLE MANAGEMENT =============

export async function changeUserRole(
  userId: string,
  newRole: UserRole,
  reason: string,
  changedBy: string
): Promise<AdminUser> {
  await delay(400);
  
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  const oldRole = users[index].role;
  const roleConfig = ROLE_CONFIGS[newRole];
  
  users[index].role = newRole;
  users[index].permissions = roleConfig.permissions;
  users[index].updatedAt = new Date().toISOString();
  
  saveUsers(users);
  
  // Log role change
  const roleLogs = getRoleLogs();
  roleLogs.unshift({
    id: `role-log-${Date.now()}`,
    userId,
    changedBy,
    oldRole,
    newRole,
    reason,
    timestamp: new Date().toISOString()
  });
  saveRoleLogs(roleLogs);
  
  logAction(userId, 'role_changed', `Role changed from ${oldRole} to ${newRole}`, changedBy, { reason });
  
  return users[index];
}

export async function getRoleChangeLogs(userId?: string): Promise<RoleChangeLog[]> {
  await delay(300);
  const logs = getRoleLogs();
  return userId ? logs.filter(l => l.userId === userId) : logs;
}

export async function getAllPermissions(): Promise<Permission[]> {
  await delay(200);
  return Object.values(PERMISSIONS);
}

export async function getRolePermissions(role: UserRole): Promise<Permission[]> {
  await delay(200);
  const roleConfig = ROLE_CONFIGS[role];
  return roleConfig.permissions.map(p => PERMISSIONS[p]).filter(Boolean);
}

export async function getAllRoles(): Promise<RoleConfig[]> {
  await delay(200);
  return Object.values(ROLE_CONFIGS);
}

// ============= STATUS MANAGEMENT =============

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
  reason: string,
  performedBy: string
): Promise<AdminUser> {
  await delay(400);
  
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  const oldStatus = users[index].status;
  users[index].status = status;
  users[index].updatedAt = new Date().toISOString();
  
  saveUsers(users);
  
  logAction(userId, 'status_changed', `Status changed from ${oldStatus} to ${status}`, performedBy, { reason });
  
  return users[index];
}

export async function suspendUser(userId: string, reason: string, performedBy: string): Promise<AdminUser> {
  return updateUserStatus(userId, 'suspended', reason, performedBy);
}

export async function banUser(userId: string, reason: string, performedBy: string): Promise<AdminUser> {
  return updateUserStatus(userId, 'banned', reason, performedBy);
}

export async function activateUser(userId: string, performedBy: string): Promise<AdminUser> {
  return updateUserStatus(userId, 'active', 'User reactivated', performedBy);
}

// ============= BULK OPERATIONS =============

export async function bulkUpdateUsers(
  userIds: string[],
  updates: Partial<AdminUser>,
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  await delay(600);
  
  const users = getStoredUsers();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const userId of userIds) {
    try {
      const index = users.findIndex(u => u.id === userId);
      if (index !== -1) {
        users[index] = {
          ...users[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        success++;
        logAction(userId, 'bulk_update', 'User updated via bulk operation', performedBy, updates);
      } else {
        failed++;
        errors.push(`User ${userId} not found`);
      }
    } catch (error) {
      failed++;
      errors.push(`Error updating user ${userId}`);
    }
  }
  
  saveUsers(users);
  
  return { success, failed, errors };
}

export async function bulkDeleteUsers(userIds: string[], performedBy: string): Promise<{ success: number; failed: number; errors: string[] }> {
  await delay(600);
  
  const users = getStoredUsers();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  const filteredUsers = users.filter(user => {
    if (userIds.includes(user.id)) {
      if (user.role === 'super_admin') {
        failed++;
        errors.push(`Cannot delete super admin: ${user.email}`);
        return true;
      }
      success++;
      logAction(user.id, 'bulk_delete', 'User deleted via bulk operation', performedBy);
      return false;
    }
    return true;
  });
  
  saveUsers(filteredUsers);
  
  return { success, failed, errors };
}

// ============= ACTION LOGS =============

export async function getUserActionLogs(userId?: string, limit: number = 50): Promise<UserActionLog[]> {
  await delay(300);
  const logs = getActionLogs();
  const filtered = userId ? logs.filter(l => l.userId === userId) : logs;
  return filtered.slice(0, limit);
}

export async function clearActionLogs(olderThan?: string): Promise<{ deleted: number }> {
  await delay(300);
  
  let logs = getActionLogs();
  const originalCount = logs.length;
  
  if (olderThan) {
    logs = logs.filter(l => new Date(l.timestamp) > new Date(olderThan));
  } else {
    logs = [];
  }
  
  saveActionLogs(logs);
  
  return { deleted: originalCount - logs.length };
}

// ============= STATISTICS =============

export async function getUserStatistics(): Promise<{
  total: number;
  byRole: Record<UserRole, number>;
  byStatus: Record<UserStatus, number>;
  byPlan: Record<SubscriptionPlan, number>;
  activeToday: number;
  newThisWeek: number;
  newThisMonth: number;
}> {
  await delay(300);
  
  const users = getStoredUsers();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  
  return {
    total: users.length,
    byRole: {
      super_admin: users.filter(u => u.role === 'super_admin').length,
      admin: users.filter(u => u.role === 'admin').length,
      moderator: users.filter(u => u.role === 'moderator').length,
      instructor: users.filter(u => u.role === 'instructor').length,
      user: users.filter(u => u.role === 'user').length
    },
    byStatus: {
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      banned: users.filter(u => u.status === 'banned').length
    },
    byPlan: {
      free: users.filter(u => u.subscriptionPlan === 'free').length,
      pro: users.filter(u => u.subscriptionPlan === 'pro').length,
      premium: users.filter(u => u.subscriptionPlan === 'premium').length
    },
    activeToday: users.filter(u => u.lastLogin && new Date(u.lastLogin) > todayStart).length,
    newThisWeek: users.filter(u => new Date(u.createdAt) > weekAgo).length,
    newThisMonth: users.filter(u => new Date(u.createdAt) > monthAgo).length
  };
}

// ============= AUTHORIZATION =============

export function hasPermission(user: AdminUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: AdminUser, permissions: string[]): boolean {
  return permissions.some(p => user.permissions.includes(p));
}

export function hasAllPermissions(user: AdminUser, permissions: string[]): boolean {
  return permissions.every(p => user.permissions.includes(p));
}

export function canManageUser(currentUser: AdminUser, targetUser: AdminUser): boolean {
  const currentLevel = ROLE_CONFIGS[currentUser.role].level;
  const targetLevel = ROLE_CONFIGS[targetUser.role].level;
  
  // Can only manage users with lower role level
  return currentLevel > targetLevel && hasPermission(currentUser, 'users.edit');
}
