'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Brain,
  MessageSquare,
  BookOpen,
  GraduationCap,
  RefreshCw,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    dau: number;
    mau: number;
    totalQuestions: number;
    totalQuizSessions: number;
    totalCATSessions: number;
  };
  engagement: {
    avgQuestionsPerDay: number;
    avgAiChatsPerDay: number;
    avgFlashcardsPerDay: number;
    avgStudyMinutesPerDay: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    arpu: number;
    churnRate: number;
    activeSubscriptions: number;
  };
  userGrowthData: { month: string; users: number; newUsers: number }[];
  revenueTrend: { month: string; revenue: number }[];
  categoryPerformance: {
    name: string;
    code: string;
    questionCount: number;
    totalAttempts: number;
    passRate: number;
  }[];
  passDistribution: { high: number; medium: number; low: number };
  featureUsageData: { feature: string; usage: number }[];
  subscriptionDistribution: { tier: string; count: number }[];
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <AnalyticsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to Load Analytics</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const overviewStats = [
    { label: 'Total Users', value: data.overview.totalUsers.toLocaleString(), icon: Users, iconColor: 'text-blue-600' },
    { label: 'DAU', value: data.overview.dau.toLocaleString(), icon: UserCheck, iconColor: 'text-emerald-600' },
    { label: 'MAU', value: data.overview.mau.toLocaleString(), icon: Activity, iconColor: 'text-purple-600' },
    { label: 'Total Questions', value: data.overview.totalQuestions.toLocaleString(), icon: Brain, iconColor: 'text-amber-600' },
  ];

  const engagementStats = [
    { label: 'Avg Questions/Day', value: data.engagement.avgQuestionsPerDay.toLocaleString(), icon: BookOpen, iconColor: 'text-blue-600' },
    { label: 'Avg AI Chats/Day', value: data.engagement.avgAiChatsPerDay.toLocaleString(), icon: MessageSquare, iconColor: 'text-purple-600' },
    { label: 'Avg Flashcards/Day', value: data.engagement.avgFlashcardsPerDay.toLocaleString(), icon: Layers, iconColor: 'text-emerald-600' },
    { label: 'Avg Study Min/Day', value: data.engagement.avgStudyMinutesPerDay.toLocaleString(), icon: Activity, iconColor: 'text-amber-600' },
  ];

  const revenueStats = [
    { label: 'MRR', value: `$${data.revenue.mrr.toLocaleString()}`, icon: DollarSign, iconColor: 'text-emerald-600' },
    { label: 'ARR', value: `$${data.revenue.arr.toLocaleString()}`, icon: TrendingUp, iconColor: 'text-blue-600' },
    { label: 'ARPU', value: `$${data.revenue.arpu.toFixed(2)}`, icon: Users, iconColor: 'text-purple-600' },
    { label: 'Churn Rate', value: `${data.revenue.churnRate}%`, icon: RefreshCw, iconColor: 'text-amber-600' },
  ];

  const passDistPie = [
    { name: 'High (70%+)', value: data.passDistribution.high },
    { name: 'Medium (40-70%)', value: data.passDistribution.medium },
    { name: 'Low (<40%)', value: data.passDistribution.low },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <PageHeader
        title="Analytics"
        description="Platform usage, performance, and growth insights."
      >
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </PageHeader>

      {/* Platform Overview */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Platform Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Engagement */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          User Engagement (7-Day Avg)
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {engagementStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Revenue Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Revenue Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.userGrowthData}>
                    <defs>
                      <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <Tooltip
                      formatter={(value: any, name: any) => [Number(value).toLocaleString(), name === 'users' ? 'Total Users' : 'New Users']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#userGrowthGrad)" />
                    <Bar dataKey="newUsers" fill="#a5b4fc" radius={[2, 2, 0, 0]} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueTrend}>
                    <defs>
                      <linearGradient id="revTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revTrendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Usage */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Feature Usage (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.featureUsageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip
                      formatter={(value: any) => [Number(value).toLocaleString(), 'Usage']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="usage" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exam Readiness Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Exam Readiness (CAT Pass Probability)</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  30 Days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {passDistPie.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={passDistPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ percent }: any) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {passDistPie.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        formatter={(value: any, name: any) => [Number(value).toLocaleString(), name]}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No CAT session data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Performance Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Category Performance</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  NCLEX categories by pass rate and question volume
                </p>
              </div>
            </div>
          </CardHeader>
          {data.categoryPerformance.length === 0 ? (
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No category performance data available
              </p>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Category</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Questions</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Total Attempts</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.categoryPerformance.map((cat) => (
                    <tr key={cat.code} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Brain className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {cat.questionCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {cat.totalAttempts.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Progress value={cat.passRate} className="h-2 w-20" />
                          <span className="text-sm font-medium">{cat.passRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
