'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Brain,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface DashboardData {
  users: { total: number; newThisWeek: number };
  subscriptions: {
    active: number;
    breakdown: { tier: string; count: number }[];
  };
  content: { totalQuestions: number };
  revenue: { monthly: number };
  alerts: { flaggedPosts: number; flaggedComments: number; totalFlagged: number };
  recentActivity: { type: string; text: string; time: string }[];
  monthlyRevenueData: { month: string; revenue: number }[];
  userGrowthData: { month: string; users: number }[];
}

const quickLinks = [
  { label: 'User Management', icon: Users, href: '/admin/users', desc: 'Manage users, roles & permissions' },
  { label: 'Question Bank', icon: Brain, href: '/admin/questions', desc: 'Create, edit & review questions' },
  { label: 'Content Management', icon: FileText, href: '/admin/content', desc: 'Books, materials & resources' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', desc: 'Platform usage & performance' },
  { label: 'Billing & Plans', icon: CreditCard, href: '/admin/billing', desc: 'Subscriptions & plans' },
  { label: 'System Settings', icon: Settings, href: '/admin/settings', desc: 'Platform configuration' },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch dashboard data');
      }
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Total Users',
      value: data.users.total.toLocaleString(),
      change: `+${data.users.newThisWeek} this week`,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Active Subscriptions',
      value: data.subscriptions.active.toLocaleString(),
      change: `${data.subscriptions.breakdown.length} tiers`,
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Monthly Revenue',
      value: `$${data.revenue.monthly.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: 'Last 30 days',
      icon: DollarSign,
      color: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Total Questions',
      value: data.content.totalQuestions.toLocaleString(),
      change: 'Active in bank',
      icon: Brain,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}. Here&apos;s your platform overview.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
                      stat.color
                    )}
                  >
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Revenue (12 Months)</CardTitle>
                <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Monthly
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyRevenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis
                      className="text-xs"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Growth Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">User Growth (12 Months)</CardTitle>
                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                  <Users className="h-3 w-3 mr-1" />
                  Cumulative
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis
                      className="text-xs"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [value.toLocaleString(), 'Users']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Management</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Link href={link.href}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <link.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              data.recentActivity.slice(0, 8).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full mt-2 shrink-0',
                      item.type === 'user'
                        ? 'bg-blue-500'
                        : item.type === 'payment'
                          ? 'bg-emerald-500'
                          : item.type === 'question'
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{item.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.time)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {data.alerts.totalFlagged > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {data.alerts.totalFlagged} item{data.alerts.totalFlagged !== 1 ? 's' : ''} flagged for review
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.alerts.flaggedPosts} post{data.alerts.flaggedPosts !== 1 ? 's' : ''},{' '}
                  {data.alerts.flaggedComments} comment{data.alerts.flaggedComments !== 1 ? 's' : ''} need moderation
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/content">Review</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
