'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import { StatCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Brain,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

// --- Types ---

interface DateRangeOption {
  value: string;
  label: string;
}

interface OverviewStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

interface CategoryPerformance {
  name: string;
  questionsAnswered: number;
  avgScore: number;
  passRate: number;
  trend: 'up' | 'down';
  trendValue: string;
}

interface RecentSignup {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  date: string;
}

// --- Mock Data ---

const dateRangeOptions: DateRangeOption[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

const overviewStats: OverviewStat[] = [
  {
    label: 'Total Users',
    value: '12,847',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    iconColor: 'text-blue-600',
  },
  {
    label: 'Active Users',
    value: '5,430',
    change: '+23.1%',
    trend: 'up',
    icon: UserCheck,
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Revenue',
    value: '$94,230',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    iconColor: 'text-purple-600',
  },
  {
    label: 'Pass Rate',
    value: '78.4%',
    change: '-1.3%',
    trend: 'down',
    icon: GraduationCap,
    iconColor: 'text-amber-600',
  },
];

const categoryPerformanceData: CategoryPerformance[] = [
  { name: 'Pharmacology', questionsAnswered: 45230, avgScore: 72.3, passRate: 74.1, trend: 'up', trendValue: '+2.4%' },
  { name: 'Medical-Surgical Nursing', questionsAnswered: 38940, avgScore: 68.7, passRate: 70.2, trend: 'down', trendValue: '-1.1%' },
  { name: 'Maternal & Newborn', questionsAnswered: 29180, avgScore: 76.5, passRate: 81.3, trend: 'up', trendValue: '+3.2%' },
  { name: 'Pediatric Nursing', questionsAnswered: 24670, avgScore: 74.1, passRate: 77.8, trend: 'up', trendValue: '+1.7%' },
  { name: 'Mental Health', questionsAnswered: 21350, avgScore: 71.9, passRate: 73.5, trend: 'down', trendValue: '-0.8%' },
  { name: 'Community Health', questionsAnswered: 18420, avgScore: 79.2, passRate: 84.6, trend: 'up', trendValue: '+4.1%' },
  { name: 'Leadership & Management', questionsAnswered: 15890, avgScore: 75.8, passRate: 79.4, trend: 'up', trendValue: '+1.9%' },
  { name: 'Fundamentals of Nursing', questionsAnswered: 34560, avgScore: 80.1, passRate: 86.2, trend: 'up', trendValue: '+2.8%' },
];

const recentSignupsData: RecentSignup[] = [
  { id: '1', name: 'Olivia Martinez', email: 'olivia.m@email.com', plan: 'premium', date: 'Feb 21, 2026' },
  { id: '2', name: 'Liam Thompson', email: 'liam.t@email.com', plan: 'pro', date: 'Feb 21, 2026' },
  { id: '3', name: 'Emma Wilson', email: 'emma.w@email.com', plan: 'free', date: 'Feb 21, 2026' },
  { id: '4', name: 'Noah Rodriguez', email: 'noah.r@email.com', plan: 'pro', date: 'Feb 20, 2026' },
  { id: '5', name: 'Ava Chen', email: 'ava.c@email.com', plan: 'premium', date: 'Feb 20, 2026' },
  { id: '6', name: 'Ethan Patel', email: 'ethan.p@email.com', plan: 'free', date: 'Feb 20, 2026' },
  { id: '7', name: 'Sophia Kim', email: 'sophia.k@email.com', plan: 'pro', date: 'Feb 19, 2026' },
  { id: '8', name: 'Mason Davis', email: 'mason.d@email.com', plan: 'free', date: 'Feb 19, 2026' },
];

const monthlyDataLabels = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const userGrowthValues = [8420, 9150, 10200, 10890, 11640, 12847];
const revenueValues = [62100, 68400, 75300, 79800, 87500, 94230];
const questionCompletionValues = [120400, 134200, 148900, 156700, 172300, 189500];

// --- Helpers ---

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  pro: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

function ChartPlaceholder({
  title,
  labels,
  values,
  color = 'bg-primary',
}: {
  title: string;
  labels: string[];
  values: number[];
  color?: string;
}) {
  const maxValue = Math.max(...values);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40 pt-4">
          {labels.map((label, i) => {
            const heightPercent = (values[i] / maxValue) * 100;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {typeof values[i] === 'number' && values[i] >= 1000
                    ? values[i] >= 1000000
                      ? `${(values[i] / 1000000).toFixed(1)}M`
                      : `${(values[i] / 1000).toFixed(0)}K`
                    : values[i]}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={cn('w-full rounded-t transition-all', color)}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryPerformanceChart({
  data,
}: {
  data: CategoryPerformance[];
}) {
  const sortedData = [...data].sort((a, b) => b.passRate - a.passRate);
  const topCategories = sortedData.slice(0, 6);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCategories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{cat.name}</span>
                <span className="text-muted-foreground ml-2 shrink-0">
                  {cat.passRate}%
                </span>
              </div>
              <Progress value={cat.passRate} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Page Component ---

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <PageHeader
        title="Analytics"
        description="Platform usage, performance, and growth insights."
      >
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-normal',
                    stat.trend === 'up'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  )}
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="User Growth"
          labels={monthlyDataLabels}
          values={userGrowthValues}
          color="bg-gradient-to-t from-blue-600/80 to-blue-400/60"
        />
        <ChartPlaceholder
          title="Revenue"
          labels={monthlyDataLabels}
          values={revenueValues}
          color="bg-gradient-to-t from-emerald-600/80 to-emerald-400/60"
        />
        <ChartPlaceholder
          title="Question Completions"
          labels={monthlyDataLabels}
          values={questionCompletionValues}
          color="bg-gradient-to-t from-purple-600/80 to-purple-400/60"
        />
        <CategoryPerformanceChart data={categoryPerformanceData} />
      </div>

      {/* Top Performing Categories Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Top Performing Categories</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Category breakdown by pass rate and question volume
              </p>
            </div>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Questions Answered
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Avg. Score
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Pass Rate
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {categoryPerformanceData
                .sort((a, b) => b.passRate - a.passRate)
                .map((cat) => (
                  <tr
                    key={cat.name}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {cat.questionsAnswered.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {cat.avgScore}%
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Progress value={cat.passRate} className="h-2 w-20" />
                        <span className="text-sm font-medium">{cat.passRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          cat.trend === 'up'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        )}
                      >
                        {cat.trend === 'up' ? (
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />
                        )}
                        {cat.trendValue}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Signups Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Signups</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Newest user registrations on the platform
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              View All Users
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Plan
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Signup Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentSignupsData.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className={cn('text-xs capitalize', planColors[user.plan])}
                    >
                      {user.plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
