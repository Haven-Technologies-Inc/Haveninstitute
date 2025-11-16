import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Ban,
  Shield,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  Download,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Award
} from 'lucide-react';
import { adminApi, AdminUser } from '../../lib/admin-api-endpoints';

export function UserManagementEnhanced() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro' | 'premium'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all');
  
  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    activeSubscriptions: 0
  });

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    tier: 'free' as 'free' | 'pro' | 'premium',
    status: 'active' as 'active' | 'cancelled' | 'expired',
    role: 'user' as 'user' | 'admin'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter, tierFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        adminApi.users.getAllUsers(),
        adminApi.users.getPlatformStatistics()
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(u => u.subscriptionTier === tierFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.subscriptionStatus === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      role: user.role
    });
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.users.updateUserSubscription(selectedUser.id, {
        tier: editForm.tier,
        status: editForm.status
      });

      // Reload data
      await loadData();
      setEditDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.users.updateUserRole(selectedUser.id, editForm.role);
      await loadData();
      setRoleDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change role. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.users.deleteUser(selectedUser.id);
      await loadData();
      setDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge variant="outline" className="bg-gray-100">Free</Badge>;
      case 'pro':
        return <Badge className="bg-blue-600">Pro</Badge>;
      case 'premium':
        return <Badge className="bg-purple-600">Premium</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle2 className="size-3 mr-1" />Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-orange-600"><XCircle className="size-3 mr-1" />Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-red-600"><Clock className="size-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="size-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">User Management</h1>
          <p className="text-gray-600">Manage users, subscriptions, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Export Users
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
            <UserPlus className="size-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="size-8 text-blue-600" />
              <TrendingUp className="size-5 text-green-600" />
            </div>
            <p className="text-3xl mb-1">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xs text-green-600 mt-1">+{stats.newUsersThisMonth} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="size-8 text-green-600" />
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <p className="text-3xl mb-1">{stats.activeUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Active Users (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="size-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800">{stats.activeSubscriptions}</Badge>
            </div>
            <p className="text-3xl mb-1">{stats.proUsers + stats.premiumUsers}</p>
            <p className="text-sm text-gray-600">Premium Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="size-8 text-green-600" />
            </div>
            <p className="text-3xl mb-1">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-xs text-gray-500 mt-1">${(stats.totalRevenue * 12).toFixed(2)}/year projected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={(value: any) => setTierFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline">{filteredUsers.length} users found</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="size-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg">{user.fullName}</h3>
                            {user.role === 'admin' && (
                              <Badge className="bg-red-600">
                                <Shield className="size-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                            <Mail className="size-4" />
                            {user.email}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            {getTierBadge(user.subscriptionTier)}
                            {getStatusBadge(user.subscriptionStatus)}
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="size-4" />
                              Joined {user.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>{user.totalStudyTime}h study time</span>
                            <span>•</span>
                            <span>{user.quizzesCompleted} quizzes</span>
                            <span>•</span>
                            <span>{user.catTestsTaken} CAT tests</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditForm({ ...editForm, role: user.role === 'admin' ? 'user' : 'admin' });
                            setRoleDialog(true);
                          }}
                        >
                          <Shield className="size-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="size-12 mx-auto mb-4 text-gray-400" />
                  <p>No users found matching your filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Subscription</DialogTitle>
            <DialogDescription>
              Update subscription tier and status for {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm mb-2 block">Subscription Tier</label>
              <Select value={editForm.tier} onValueChange={(value: any) => setEditForm({ ...editForm, tier: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro ($29.99/mo)</SelectItem>
                  <SelectItem value="premium">Premium ($49.99/mo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-2 block">Subscription Status</label>
              <Select value={editForm.status} onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialog} onOpenChange={setRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change role for {selectedUser?.fullName} to {editForm.role === 'admin' ? 'Administrator' : 'Regular User'}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(false)}>Cancel</Button>
            <Button onClick={handleChangeRole}>Change Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.fullName}? This action cannot be undone and will permanently remove all user data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
