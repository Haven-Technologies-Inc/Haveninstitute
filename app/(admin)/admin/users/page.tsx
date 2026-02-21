'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Ban,
  Shield,
  Users,
  UserPlus,
  UserCheck,
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  BookOpen,
  Activity,
} from 'lucide-react';
import { motion } from 'motion/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  subscription: 'free' | 'pro' | 'premium';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  joinedDate: string;
  questionsCompleted: number;
  studyHours: number;
  avatar?: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'student', subscription: 'premium', status: 'active', lastLogin: '2 hours ago', joinedDate: 'Jan 15, 2026', questionsCompleted: 1247, studyHours: 342, },
  { id: '2', name: 'Michael Chen', email: 'mchen@email.com', role: 'student', subscription: 'pro', status: 'active', lastLogin: '5 hours ago', joinedDate: 'Feb 3, 2026', questionsCompleted: 892, studyHours: 215, },
  { id: '3', name: 'Emily Davis', email: 'emily.d@email.com', role: 'instructor', subscription: 'premium', status: 'active', lastLogin: '1 day ago', joinedDate: 'Nov 28, 2025', questionsCompleted: 2341, studyHours: 567, },
  { id: '4', name: 'James Wilson', email: 'jwilson@email.com', role: 'student', subscription: 'free', status: 'inactive', lastLogin: '2 weeks ago', joinedDate: 'Dec 10, 2025', questionsCompleted: 156, studyHours: 34, },
  { id: '5', name: 'Maria Garcia', email: 'mgarcia@email.com', role: 'student', subscription: 'pro', status: 'active', lastLogin: '30 min ago', joinedDate: 'Jan 22, 2026', questionsCompleted: 634, studyHours: 178, },
  { id: '6', name: 'David Kim', email: 'dkim@email.com', role: 'admin', subscription: 'premium', status: 'active', lastLogin: 'Just now', joinedDate: 'Sep 5, 2025', questionsCompleted: 3120, studyHours: 890, },
  { id: '7', name: 'Ashley Brown', email: 'abrown@email.com', role: 'student', subscription: 'free', status: 'suspended', lastLogin: '1 month ago', joinedDate: 'Oct 14, 2025', questionsCompleted: 89, studyHours: 12, },
  { id: '8', name: 'Robert Taylor', email: 'rtaylor@email.com', role: 'instructor', subscription: 'premium', status: 'active', lastLogin: '3 hours ago', joinedDate: 'Aug 20, 2025', questionsCompleted: 1876, studyHours: 445, },
  { id: '9', name: 'Jennifer Martinez', email: 'jmartinez@email.com', role: 'student', subscription: 'pro', status: 'active', lastLogin: '12 hours ago', joinedDate: 'Feb 10, 2026', questionsCompleted: 412, studyHours: 98, },
  { id: '10', name: 'Thomas Anderson', email: 'tanderson@email.com', role: 'student', subscription: 'free', status: 'inactive', lastLogin: '3 days ago', joinedDate: 'Jan 30, 2026', questionsCompleted: 267, studyHours: 56, },
];

const roleColors: Record<string, string> = {
  student: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  instructor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  admin: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const subscriptionColors: Record<string, string> = {
  free: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  pro: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  premium: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  suspended: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const statusDot: Record<string, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-gray-400',
  suspended: 'bg-red-500',
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const itemsPerPage = 5;

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSub = subscriptionFilter === 'all' || user.subscription === subscriptionFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesSub && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = [
    { label: 'Total Users', value: '12,847', icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'New This Week', value: '234', icon: UserPlus, color: 'from-emerald-500 to-teal-600' },
    { label: 'Active Now', value: '1,892', icon: UserCheck, color: 'from-purple-500 to-pink-600' },
    { label: 'Admins', value: '8', icon: Shield, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage users, roles, and permissions across the platform.</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', stat.color)}>
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
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
                <Select value={subscriptionFilter} onValueChange={(v) => { setSubscriptionFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Subscription</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Last Login</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium text-sm whitespace-nowrap">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={cn('text-xs capitalize', roleColors[user.role])}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={cn('text-xs capitalize', subscriptionColors[user.subscription])}>
                        {user.subscription}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-2 w-2 rounded-full', statusDot[user.status])} />
                        <span className="text-sm capitalize">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-xl font-bold text-primary">
                                    {getInitials(selectedUser.name)}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-1">
                                      <Badge variant="secondary" className={cn('text-xs capitalize', roleColors[selectedUser.role])}>
                                        {selectedUser.role}
                                      </Badge>
                                      <Badge variant="secondary" className={cn('text-xs capitalize', subscriptionColors[selectedUser.subscription])}>
                                        {selectedUser.subscription}
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
                                      <p className="font-medium">{selectedUser.joinedDate}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-muted-foreground text-xs">Last Login</p>
                                      <p className="font-medium">{selectedUser.lastLogin}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-muted-foreground text-xs">Questions Done</p>
                                      <p className="font-medium">{selectedUser.questionsCompleted.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-muted-foreground text-xs">Study Hours</p>
                                      <p className="font-medium">{selectedUser.studyHours}h</p>
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
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
        </Card>
      </motion.div>
    </div>
  );
}
