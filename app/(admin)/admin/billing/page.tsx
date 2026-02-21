'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
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
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  Receipt,
  Filter,
} from 'lucide-react';

// --- Types ---

interface BillingStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  trendPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

interface SubscriptionTier {
  name: string;
  count: number;
  percentage: number;
  revenue: string;
  color: string;
  bgColor: string;
}

interface Transaction {
  id: string;
  user: string;
  email: string;
  amount: string;
  type: 'subscription' | 'renewal' | 'upgrade' | 'downgrade' | 'refund';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  plan: string;
  date: string;
}

// --- Mock Data ---

const billingStats: BillingStat[] = [
  {
    label: 'MRR',
    value: '$94,230',
    change: '+8.2%',
    trend: 'up',
    trendPositive: true,
    icon: DollarSign,
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Total Revenue',
    value: '$847,450',
    change: '+15.4%',
    trend: 'up',
    trendPositive: true,
    icon: TrendingUp,
    iconColor: 'text-blue-600',
  },
  {
    label: 'Active Subscriptions',
    value: '3,451',
    change: '+89',
    trend: 'up',
    trendPositive: true,
    icon: CreditCard,
    iconColor: 'text-purple-600',
  },
  {
    label: 'Churn Rate',
    value: '3.2%',
    change: '-0.5%',
    trend: 'down',
    trendPositive: true,
    icon: RefreshCw,
    iconColor: 'text-amber-600',
  },
];

const subscriptionTiers: SubscriptionTier[] = [
  {
    name: 'Free',
    count: 9396,
    percentage: 73.1,
    revenue: '$0',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    name: 'Pro',
    count: 2184,
    percentage: 17.0,
    revenue: '$63,336',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    name: 'Premium',
    count: 1267,
    percentage: 9.9,
    revenue: '$62,083',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
];

const recentTransactions: Transaction[] = [
  {
    id: 'TXN-2026-001',
    user: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    amount: '$49.00',
    type: 'subscription',
    status: 'completed',
    plan: 'Premium',
    date: 'Feb 21, 2026',
  },
  {
    id: 'TXN-2026-002',
    user: 'Michael Chen',
    email: 'mchen@email.com',
    amount: '$29.00',
    type: 'subscription',
    status: 'completed',
    plan: 'Pro',
    date: 'Feb 21, 2026',
  },
  {
    id: 'TXN-2026-003',
    user: 'Emily Davis',
    email: 'emily.d@email.com',
    amount: '$49.00',
    type: 'renewal',
    status: 'completed',
    plan: 'Premium',
    date: 'Feb 20, 2026',
  },
  {
    id: 'TXN-2026-004',
    user: 'James Wilson',
    email: 'jwilson@email.com',
    amount: '$29.00',
    type: 'upgrade',
    status: 'completed',
    plan: 'Pro',
    date: 'Feb 20, 2026',
  },
  {
    id: 'TXN-2026-005',
    user: 'Maria Garcia',
    email: 'mgarcia@email.com',
    amount: '-$29.00',
    type: 'refund',
    status: 'refunded',
    plan: 'Pro',
    date: 'Feb 19, 2026',
  },
  {
    id: 'TXN-2026-006',
    user: 'David Kim',
    email: 'dkim@email.com',
    amount: '$49.00',
    type: 'renewal',
    status: 'completed',
    plan: 'Premium',
    date: 'Feb 19, 2026',
  },
  {
    id: 'TXN-2026-007',
    user: 'Ashley Brown',
    email: 'abrown@email.com',
    amount: '$29.00',
    type: 'subscription',
    status: 'pending',
    plan: 'Pro',
    date: 'Feb 19, 2026',
  },
  {
    id: 'TXN-2026-008',
    user: 'Robert Taylor',
    email: 'rtaylor@email.com',
    amount: '$49.00',
    type: 'upgrade',
    status: 'completed',
    plan: 'Premium',
    date: 'Feb 18, 2026',
  },
  {
    id: 'TXN-2026-009',
    user: 'Jennifer Martinez',
    email: 'jmartinez@email.com',
    amount: '$29.00',
    type: 'subscription',
    status: 'failed',
    plan: 'Pro',
    date: 'Feb 18, 2026',
  },
  {
    id: 'TXN-2026-010',
    user: 'Thomas Anderson',
    email: 'tanderson@email.com',
    amount: '$29.00',
    type: 'downgrade',
    status: 'completed',
    plan: 'Pro',
    date: 'Feb 17, 2026',
  },
];

const revenueMonthlyLabels = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const revenueMonthlyValues = [62100, 68400, 75300, 79800, 87500, 94230];

// --- Helpers ---

const typeColors: Record<string, string> = {
  subscription: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  renewal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  upgrade: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  downgrade: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  refund: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const statusDot: Record<string, string> = {
  completed: 'bg-emerald-500',
  pending: 'bg-amber-500',
  failed: 'bg-red-500',
  refunded: 'bg-gray-400',
};

// --- Page Component ---

export default function AdminBillingPage() {
  const [transactionFilter, setTransactionFilter] = useState<string>('all');

  const filteredTransactions =
    transactionFilter === 'all'
      ? recentTransactions
      : recentTransactions.filter((t) => t.status === transactionFilter);

  const totalSubscribers = subscriptionTiers.reduce((sum, tier) => sum + tier.count, 0);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <PageHeader
        title="Billing & Revenue"
        description="Manage subscriptions, transactions, and revenue analytics."
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {billingStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-normal',
                    stat.trendPositive
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

      {/* Subscription Breakdown + Revenue Trend */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subscription Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Subscription Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Active subscriptions by tier
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {totalSubscribers.toLocaleString()} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Stacked bar visualization */}
            <div className="h-4 rounded-full overflow-hidden flex">
              {subscriptionTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn('h-full transition-all', tier.color)}
                  style={{ width: `${tier.percentage}%` }}
                />
              ))}
            </div>

            {/* Tier details */}
            <div className="space-y-4">
              {subscriptionTiers.map((tier) => (
                <div key={tier.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-3 w-3 rounded-full', tier.color)} />
                    <div>
                      <p className="text-sm font-medium">{tier.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tier.count.toLocaleString()} users
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{tier.revenue}</p>
                    <p className="text-xs text-muted-foreground">
                      {tier.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Summary row */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paid conversion rate</span>
              <span className="font-bold">
                {(
                  ((subscriptionTiers[1].count + subscriptionTiers[2].count) /
                    totalSubscribers) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend Placeholder Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Monthly recurring revenue over 6 months
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                +51.7%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bar chart placeholder */}
            <div className="flex items-end gap-2 h-48 pt-4">
              {revenueMonthlyLabels.map((label, i) => {
                const maxValue = Math.max(...revenueMonthlyValues);
                const heightPercent = (revenueMonthlyValues[i] / maxValue) * 100;
                return (
                  <div
                    key={label}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-muted-foreground font-medium">
                      ${(revenueMonthlyValues[i] / 1000).toFixed(0)}K
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-emerald-600/80 to-emerald-400/60 transition-all"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Highest Month</p>
                <p className="font-semibold">Feb - $94,230</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Avg Monthly Growth</p>
                <p className="font-semibold text-emerald-600">+8.6%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Latest payment activity across the platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={transactionFilter}
                onValueChange={setTransactionFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Receipt className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Transaction
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTransactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {txn.id}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {txn.plan}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">{txn.user}</p>
                      <p className="text-xs text-muted-foreground">{txn.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        txn.amount.startsWith('-')
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      {txn.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className={cn('text-xs capitalize', typeColors[txn.type])}
                    >
                      {txn.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          statusDot[txn.status]
                        )}
                      />
                      <span className="text-sm capitalize">{txn.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {txn.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of{' '}
            {recentTransactions.length} transactions
          </p>
          <Button variant="outline" size="sm">
            Load More
          </Button>
        </div>
      </Card>
    </div>
  );
}
