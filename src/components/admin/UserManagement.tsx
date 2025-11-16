import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Shield,
  Download,
  UserPlus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  Send,
  Key,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Crown,
  Star,
  X,
  MapPin,
  Phone
} from 'lucide-react';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserSubscription,
  updateUserStatus,
  suspendUser,
  activateUser,
  getUserStats,
  exportUsersToCSV,
  sendEmailToUser,
  resetUserPassword,
  type User,
  type UserFilters
} from '../../services/userApi';
import { 
  sendEmail,
  sendPasswordResetEmail,
  sendAdminNotificationEmail 
} from '../../services/zohoMailApi';
import { toast } from 'sonner';

export function UserManagement() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    inactive: 0,
    students: 0,
    admins: 0,
    freeUsers: 0,
    proUsers: 0,
    premiumUsers: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all');
  const [filterSubscription, setFilterSubscription] = useState<'all' | 'Free' | 'Pro' | 'Premium'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'joinDate' | 'lastActive' | 'averageScore'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialogs
  const [viewUserDialog, setViewUserDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [emailUserDialog, setEmailUserDialog] = useState(false);
  const [suspendUserDialog, setSuspendUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'admin',
    subscription: 'Free' as 'Free' | 'Pro' | 'Premium',
    status: 'active' as 'active' | 'suspended' | 'inactive',
    phone: '',
    location: '',
    graduationYear: '',
    userType: 'nursing-student' as 'nursing-student' | 'nclex-prep' | 'both'
  });

  const [emailFormData, setEmailFormData] = useState({
    subject: '',
    message: ''
  });

  const [suspendReason, setSuspendReason] = useState('');

  // Load data
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, searchQuery, filterRole, filterStatus, filterSubscription, sortBy, sortOrder]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const filters: UserFilters = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        role: filterRole,
        status: filterStatus,
        subscription: filterSubscription,
        sortBy,
        sortOrder
      };
      const response = await getAllUsers(filters);
      setUsers(response.data);
      setTotalUsers(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  // Handlers
  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setViewUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      status: user.status,
      phone: user.phone || '',
      location: user.location || '',
      graduationYear: user.graduationYear || '',
      userType: user.userType || 'nursing-student'
    });
    setEditUserDialog(true);
  };

  const handleCreateUser = () => {
    setUserFormData({
      name: '',
      email: '',
      role: 'student',
      subscription: 'Free',
      status: 'active',
      phone: '',
      location: '',
      graduationYear: '',
      userType: 'nursing-student'
    });
    setCreateUserDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteUserDialog(true);
  };

  const handleEmailUser = (user: User) => {
    setSelectedUser(user);
    setEmailFormData({ subject: '', message: '' });
    setEmailUserDialog(true);
  };

  const handleSuspendUser = (user: User) => {
    setSelectedUser(user);
    setSuspendReason('');
    setSuspendUserDialog(true);
  };

  const handleActivateUser = async (user: User) => {
    try {
      await activateUser(user.id);
      toast.success(`${user.name} has been activated`);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      await resetUserPassword(user.id);
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportUsersToCSV({
        search: searchQuery,
        role: filterRole,
        status: filterStatus,
        subscription: filterSubscription
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  // Form submissions
  const submitCreateUser = async () => {
    try {
      await createUser({
        ...userFormData,
        questionsAnswered: 0,
        averageScore: 0
      });
      toast.success('User created successfully');
      setCreateUserDialog(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const submitEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser.id, userFormData);
      toast.success('User updated successfully');
      setEditUserDialog(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const submitDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setDeleteUserDialog(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const submitEmailUser = async () => {
    if (!selectedUser) return;
    
    try {
      await sendEmailToUser(selectedUser.id, emailFormData.subject, emailFormData.message);
      toast.success(`Email sent to ${selectedUser.email}`);
      setEmailUserDialog(false);
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const submitSuspendUser = async () => {
    if (!selectedUser) return;
    
    try {
      await suspendUser(selectedUser.id, suspendReason);
      toast.success(`${selectedUser.name} has been suspended`);
      setSuspendUserDialog(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 dark:text-white mb-2">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage students and administrators</p>
        </div>
        <Button 
          onClick={handleCreateUser}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <UserPlus className="size-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400">Total Users</p>
              <UserCheck className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-3xl dark:text-white">{stats.total}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {stats.students} students, {stats.admins} admins
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400">Active Users</p>
              <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-3xl dark:text-white">{stats.active}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {stats.suspended} suspended, {stats.inactive} inactive
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400">Premium Users</p>
              <Crown className="size-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-3xl dark:text-white">{stats.premiumUsers}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {stats.proUsers} Pro, {stats.freeUsers} Free
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400">Revenue</p>
              <Award className="size-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-3xl dark:text-white">
              ${(stats.premiumUsers * 49.99 + stats.proUsers * 29.99).toFixed(0)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Monthly recurring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">User Directory</CardTitle>
          <CardDescription className="dark:text-gray-400">Search and filter users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value as any);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              value={filterSubscription}
              onChange={(e) => {
                setFilterSubscription(e.target.value as any);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Plans</option>
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Premium">Premium</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="joinDate">Sort by Join Date</option>
              <option value="lastActive">Sort by Activity</option>
              <option value="averageScore">Sort by Score</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {users.length} of {totalUsers} users
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="dark:text-gray-400"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="size-12 mb-4" />
              <p className="text-lg">No users found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">User</th>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Role</th>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Subscription</th>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Activity</th>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Performance</th>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-full flex items-center justify-center text-white ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-500'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                              <Mail className="size-3" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }>
                          {user.role === 'admin' && <Shield className="size-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          user.subscription === 'Premium' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          user.subscription === 'Pro' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }>
                          {user.subscription === 'Premium' && <Crown className="size-3 mr-1" />}
                          {user.subscription === 'Pro' && <Star className="size-3 mr-1" />}
                          {user.subscription}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          user.status === 'suspended'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar className="size-3" />
                            <span>Joined {user.joinDate}</span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-500">Last: {user.lastActive}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'student' ? (
                          <div className="text-sm">
                            <p className="text-gray-900 dark:text-white mb-1">{user.questionsAnswered} questions</p>
                            <p className={`${
                              user.averageScore >= 80 ? 'text-green-600 dark:text-green-400' :
                              user.averageScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {user.averageScore}% avg
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-500 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
                            <DropdownMenuLabel className="dark:text-white">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            <DropdownMenuItem onClick={() => handleViewUser(user)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                              <Eye className="size-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                              <Edit className="size-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailUser(user)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                              <Send className="size-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(user)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                              <Key className="size-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            {user.status === 'suspended' ? (
                              <DropdownMenuItem 
                                onClick={() => handleActivateUser(user)}
                                className="text-green-600 dark:text-green-400 dark:hover:bg-gray-700"
                              >
                                <CheckCircle className="size-4 mr-2" />
                                Activate User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleSuspendUser(user)}
                                className="text-orange-600 dark:text-orange-400 dark:hover:bg-gray-700"
                              >
                                <Ban className="size-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <ChevronLeft className="size-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              Next
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* View User Dialog */}
      <Dialog open={viewUserDialog} onOpenChange={setViewUserDialog}>
        <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">User Details</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Complete information about this user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className={`size-16 rounded-full flex items-center justify-center text-white text-2xl ${
                  selectedUser.role === 'admin' 
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}>
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl dark:text-white">{selectedUser.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={
                      selectedUser.subscription === 'Premium' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      selectedUser.subscription === 'Pro' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }>
                      {selectedUser.subscription}
                    </Badge>
                    <Badge className={
                      selectedUser.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedUser.status === 'suspended'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600 dark:text-gray-400">Join Date</Label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-gray-400">Last Active</Label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.lastActive}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Phone</Label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.location && (
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Location</Label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.location}</p>
                  </div>
                )}
                {selectedUser.graduationYear && (
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Expected Graduation</Label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.graduationYear}</p>
                  </div>
                )}
                {selectedUser.userType && (
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">User Type</Label>
                    <p className="text-gray-900 dark:text-white capitalize">{selectedUser.userType.replace('-', ' ')}</p>
                  </div>
                )}
              </div>

              {/* Performance Stats */}
              {selectedUser.role === 'student' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-3 dark:text-white">Performance Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600 dark:text-gray-400">Questions Answered</Label>
                      <p className="text-2xl dark:text-white">{selectedUser.questionsAnswered}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 dark:text-gray-400">Average Score</Label>
                      <p className={`text-2xl ${
                        selectedUser.averageScore >= 80 ? 'text-green-600 dark:text-green-400' :
                        selectedUser.averageScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {selectedUser.averageScore}%
                      </p>
                    </div>
                    {selectedUser.hoursStudied && (
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Hours Studied</Label>
                        <p className="text-2xl dark:text-white">{selectedUser.hoursStudied}h</p>
                      </div>
                    )}
                    {selectedUser.studyStreak !== undefined && (
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Study Streak</Label>
                        <p className="text-2xl dark:text-white">{selectedUser.studyStreak} days</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
        <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Create New User</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Add a new student or administrator</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-300">Full Name *</Label>
                <Input
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Email *</Label>
                <Input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Role *</Label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <Label className="dark:text-gray-300">Subscription *</Label>
                <select
                  value={userFormData.subscription}
                  onChange={(e) => setUserFormData({ ...userFormData, subscription: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <Label className="dark:text-gray-300">Phone</Label>
                <Input
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Location</Label>
                <Input
                  value={userFormData.location}
                  onChange={(e) => setUserFormData({ ...userFormData, location: e.target.value })}
                  placeholder="City, State"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Graduation Year</Label>
                <Input
                  value={userFormData.graduationYear}
                  onChange={(e) => setUserFormData({ ...userFormData, graduationYear: e.target.value })}
                  placeholder="e.g., 2025"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">User Type</Label>
                <select
                  value={userFormData.userType}
                  onChange={(e) => setUserFormData({ ...userFormData, userType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="nursing-student">Nursing Student</option>
                  <option value="nclex-prep">NCLEX Prep</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserDialog(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
              Cancel
            </Button>
            <Button onClick={submitCreateUser} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
        <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit User</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-300">Full Name</Label>
                <Input
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Role</Label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <Label className="dark:text-gray-300">Subscription</Label>
                <select
                  value={userFormData.subscription}
                  onChange={(e) => setUserFormData({ ...userFormData, subscription: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <Label className="dark:text-gray-300">Status</Label>
                <select
                  value={userFormData.status}
                  onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <Label className="dark:text-gray-300">Phone</Label>
                <Input
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Location</Label>
                <Input
                  value={userFormData.location}
                  onChange={(e) => setUserFormData({ ...userFormData, location: e.target.value })}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Graduation Year</Label>
                <Input
                  value={userFormData.graduationYear}
                  onChange={(e) => setUserFormData({ ...userFormData, graduationYear: e.target.value })}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserDialog(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
              Cancel
            </Button>
            <Button onClick={submitEditUser} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Delete User</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                <strong>{selectedUser.name}</strong> ({selectedUser.email}) will be permanently deleted.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserDialog(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
              Cancel
            </Button>
            <Button onClick={submitDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email User Dialog */}
      <Dialog open={emailUserDialog} onOpenChange={setEmailUserDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Send Email</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Send an email to {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="dark:text-gray-300">Subject</Label>
              <Input
                value={emailFormData.subject}
                onChange={(e) => setEmailFormData({ ...emailFormData, subject: e.target.value })}
                placeholder="Email subject..."
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="dark:text-gray-300">Message</Label>
              <Textarea
                value={emailFormData.message}
                onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                placeholder="Email message..."
                rows={6}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailUserDialog(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
              Cancel
            </Button>
            <Button onClick={submitEmailUser} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Send className="size-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={suspendUserDialog} onOpenChange={setSuspendUserDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Suspend User</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Temporarily suspend {selectedUser?.name}'s account access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="dark:text-gray-300">Reason for Suspension</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Explain why this user is being suspended..."
                rows={4}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                The user will not be able to access their account while suspended. They can be reactivated at any time.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendUserDialog(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
              Cancel
            </Button>
            <Button onClick={submitSuspendUser} className="bg-orange-600 hover:bg-orange-700">
              <Ban className="size-4 mr-2" />
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}