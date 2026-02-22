'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn, getInitials, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  Shield,
  Users,
  UserPlus,
  UserCheck,
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Activity,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: string;
  subscriptionTier: string;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  stripeCustomerId: string | null;
  _count: { quizSessions: number; catSessions: number };
}

const roleColors: Record<string, string> = {
  student: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  instructor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  editor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  moderator: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  admin: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const tierColors: Record<string, string> = {
  Free: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  Pro: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Premium: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (tierFilter !== 'all') params.set('tier', tierFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const json = await res.json();
      setUsers(json.data.users);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, roleFilter, tierFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async (userId: string, updates: Record<string, any>) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update user');
      }
      const json = await res.json();
      toast.success('User updated successfully');

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...json.data } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, ...json.data } : prev));
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Stats from current data
  const activeCount = users.filter((u) => u.isActive).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage users, roles, and permissions across the platform.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: total.toLocaleString(), icon: Users, color: 'from-blue-500 to-indigo-600' },
          { label: 'New This Week', value: '-', icon: UserPlus, color: 'from-emerald-500 to-teal-600' },
          { label: 'Active (page)', value: String(activeCount), icon: UserCheck, color: 'from-purple-500 to-pink-600' },
          { label: 'Admins (page)', value: String(adminCount), icon: Shield, color: 'from-amber-500 to-orange-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
                      stat.color
                    )}
                  >
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select
                  value={roleFilter}
                  onValueChange={(v) => {
                    setRoleFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={tierFilter}
                  onValueChange={(v) => {
                    setTierFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error State */}
      {error && (
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No users found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                        User
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                        Email
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                        Role
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                        Tier
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 hidden xl:table-cell">
                        Last Login
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {users.map((user, i) => (
                      <tr
                        key={user.id}
                        className="hover:bg-muted/20 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                              {getInitials(user.fullName)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium text-sm whitespace-nowrap block">
                                {user.fullName}
                              </span>
                              <span className="text-xs text-muted-foreground md:hidden">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs capitalize',
                              roleColors[user.role] || ''
                            )}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              tierColors[user.subscriptionTier] || ''
                            )}
                          >
                            {user.subscriptionTier}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                user.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                              )}
                            />
                            <span className="text-sm">
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap hidden xl:table-cell">
                          {user.lastLogin
                            ? formatRelativeTime(user.lastLogin)
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedUser(user);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                'h-8 w-8',
                                user.isActive
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'text-emerald-500 hover:text-emerald-600'
                              )}
                              onClick={() =>
                                handleUpdateUser(user.id, {
                                  isActive: !user.isActive,
                                })
                              }
                              disabled={actionLoading}
                            >
                              {user.isActive ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border/50 gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * limit + 1} to{' '}
                  {Math.min(currentPage * limit, total)} of {total} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-xl font-bold text-primary">
                  {getInitials(selectedUser.fullName)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs capitalize',
                        roleColors[selectedUser.role]
                      )}
                    >
                      {selectedUser.role}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs',
                        tierColors[selectedUser.subscriptionTier]
                      )}
                    >
                      {selectedUser.subscriptionTier}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Joined</p>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Last Login</p>
                    <p className="font-medium">
                      {selectedUser.lastLogin
                        ? formatRelativeTime(selectedUser.lastLogin)
                        : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Quiz Sessions</p>
                    <p className="font-medium">
                      {selectedUser._count.quizSessions}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">CAT Sessions</p>
                    <p className="font-medium">
                      {selectedUser._count.catSessions}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick actions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Change Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(v) =>
                    handleUpdateUser(selectedUser.id, { role: v })
                  }
                  disabled={actionLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Change Tier</Label>
                <Select
                  value={selectedUser.subscriptionTier}
                  onValueChange={(v) =>
                    handleUpdateUser(selectedUser.id, { subscriptionTier: v })
                  }
                  disabled={actionLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    handleUpdateUser(selectedUser.id, {
                      isActive: !selectedUser.isActive,
                    })
                  }
                  disabled={actionLoading}
                >
                  {selectedUser.isActive ? (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <a href={`mailto:${selectedUser.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
