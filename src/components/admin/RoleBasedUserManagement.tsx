import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Shield,
  Key,
  Activity,
  Download,
  Upload,
  Loader2,
  XCircle,
  AlertCircle,
  Crown,
  UserCog,
  GraduationCap,
  User as UserIcon
} from 'lucide-react';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  updateUserStatus,
  suspendUser,
  banUser,
  activateUser,
  getUserStatistics,
  getRoleChangeLogs,
  getUserActionLogs,
  getAllRoles,
  bulkUpdateUsers,
  bulkDeleteUsers,
  type AdminUser,
  type UserRole,
  type UserStatus,
  type SubscriptionPlan,
  type RoleConfig,
  ROLE_CONFIGS
} from '../../services/roleBasedUserApi';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';

export function RoleBasedUserManagement() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    role: '' as UserRole | '',
    status: '' as UserStatus | '',
    subscriptionPlan: '' as SubscriptionPlan | '',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(filters.role || filters.status || filters.subscriptionPlan || filters.search ? filters : undefined),
        getUserStatistics()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedUsers.size} users? This cannot be undone.`)) return;
    
    try {
      const result = await bulkDeleteUsers(Array.from(selectedUsers), currentUser?.id || 'admin-1');
      toast.success(`${result.success} users deleted successfully`);
      if (result.failed > 0) {
        toast.error(`${result.failed} users failed: ${result.errors.join(', ')}`);
      }
      setSelectedUsers(new Set());
      loadData();
    } catch (error) {
      toast.error('Failed to delete users');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return <Crown className="size-4" />;
      case 'admin': return <UserCog className="size-4" />;
      case 'moderator': return <Shield className="size-4" />;
      case 'instructor': return <GraduationCap className="size-4" />;
      default: return <UserIcon className="size-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    return ROLE_CONFIGS[role]?.color || 'gray';
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'banned': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 dark:text-white mb-2">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage users with role-based access control</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="size-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="size-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeToday}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Activity className="size-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.newThisWeek}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <UserPlus className="size-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Premium Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.byPlan.premium}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Crown className="size-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole | '' })}
              className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="instructor">Instructor</option>
              <option value="user">User</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus | '' })}
              className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>

            <select
              value={filters.subscriptionPlan}
              onChange={(e) => setFilters({ ...filters, subscriptionPlan: e.target.value as SubscriptionPlan | '' })}
              className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setFilters({ role: '', status: '', subscriptionPlan: '', search: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-purple-900 dark:text-purple-200">
                {selectedUsers.size} user(s) selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
                  Clear Selection
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="size-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="size-4"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Last Login</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="size-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=667eea&color=fff&size=40`}
                          alt={user.fullName}
                          className="size-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.fullName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {ROLE_CONFIGS[user.role].label}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{user.subscriptionPlan.toUpperCase()}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <UserActionsDropdown user={user} onUpdate={loadData} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// User Actions Dropdown
function UserActionsDropdown({ user, onUpdate }: { user: AdminUser; onUpdate: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <MoreVertical className="size-5" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20">
            <button
              onClick={() => { setShowRoleModal(true); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Key className="size-4" />
              Change Role
            </button>
            <button
              onClick={() => { setShowStatusModal(true); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <AlertCircle className="size-4" />
              Change Status
            </button>
            <button
              onClick={async () => {
                if (confirm('Delete this user?')) {
                  try {
                    await deleteUser(user.id, 'admin-1');
                    toast.success('User deleted');
                    onUpdate();
                  } catch (error) {
                    toast.error('Failed to delete user');
                  }
                }
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="size-4" />
              Delete User
            </button>
          </div>
        </>
      )}

      {showRoleModal && (
        <RoleChangeModal
          user={user}
          onClose={() => setShowRoleModal(false)}
          onSuccess={() => { setShowRoleModal(false); onUpdate(); }}
        />
      )}

      {showStatusModal && (
        <StatusChangeModal
          user={user}
          onClose={() => setShowStatusModal(false)}
          onSuccess={() => { setShowStatusModal(false); onUpdate(); }}
        />
      )}
    </div>
  );
}

// Role Change Modal
function RoleChangeModal({ user, onClose, onSuccess }: { user: AdminUser; onClose: () => void; onSuccess: () => void }) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setSaving(true);
    try {
      await changeUserRole(user.id, selectedRole, reason, 'admin-1');
      toast.success('Role changed successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to change role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Change User Role</CardTitle>
          <CardDescription className="dark:text-gray-400">Update role for {user.fullName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {Object.values(ROLE_CONFIGS).map((role) => (
                <option key={role.role} value={role.role}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Reason</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you changing this role?"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Key className="size-4 mr-2" />}
              Change Role
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Status Change Modal
function StatusChangeModal({ user, onClose, onSuccess }: { user: AdminUser; onClose: () => void; onSuccess: () => void }) {
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user.status);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setSaving(true);
    try {
      await updateUserStatus(user.id, selectedStatus, reason, 'admin-1');
      toast.success('Status changed successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to change status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Change User Status</CardTitle>
          <CardDescription className="dark:text-gray-400">Update status for {user.fullName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Select Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as UserStatus)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Reason</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you changing this status?"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              Change Status
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Create User Modal
function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'user' as UserRole,
    status: 'active' as UserStatus,
    subscriptionPlan: 'free' as SubscriptionPlan
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!formData.email || !formData.fullName) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      await createUser({
        ...formData,
        metadata: {},
        stats: {
          questionsCompleted: 0,
          studyTime: 0,
          loginStreak: 0,
          averageScore: 0
        }
      });
      toast.success('User created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Create New User</CardTitle>
          <CardDescription className="dark:text-gray-400">Add a new user to the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Full Name *</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {Object.values(ROLE_CONFIGS).map((role) => (
                <option key={role.role} value={role.role}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Subscription Plan</label>
            <select
              value={formData.subscriptionPlan}
              onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as SubscriptionPlan })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <UserPlus className="size-4 mr-2" />}
              Create User
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
