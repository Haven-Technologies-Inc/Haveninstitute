'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Activity,
  DollarSign,
  UserPlus,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  { label: 'Total Users', value: '12,847', change: '+234 this week', icon: Users, color: 'from-blue-500 to-indigo-600' },
  { label: 'Active Subscriptions', value: '3,451', change: '+89 this week', icon: CreditCard, color: 'from-emerald-500 to-teal-600' },
  { label: 'Monthly Revenue', value: '$94,230', change: '+12.3%', icon: DollarSign, color: 'from-purple-500 to-pink-600' },
  { label: 'Total Questions', value: '10,432', change: '+156 new', icon: Brain, color: 'from-amber-500 to-orange-600' },
];

const quickLinks = [
  { label: 'User Management', icon: Users, href: '/admin/users', desc: 'Manage users, roles & permissions' },
  { label: 'Question Bank', icon: Brain, href: '/admin/questions', desc: 'Create, edit & review questions' },
  { label: 'Content Management', icon: FileText, href: '/admin/content', desc: 'Books, materials & resources' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', desc: 'Platform usage & performance' },
  { label: 'Billing & Revenue', icon: CreditCard, href: '/admin/billing', desc: 'Subscriptions & transactions' },
  { label: 'System Settings', icon: Settings, href: '/admin/settings', desc: 'Platform configuration' },
];

const recentActivity = [
  { type: 'user', text: 'New user registered: Sarah Johnson', time: '5 min ago' },
  { type: 'payment', text: 'Pro subscription: Michael Chen ($29)', time: '12 min ago' },
  { type: 'question', text: '15 new questions added to Pharmacology', time: '1h ago' },
  { type: 'report', text: 'Discussion flagged for review', time: '2h ago' },
  { type: 'user', text: 'Premium upgrade: Emily Davis', time: '3h ago' },
];

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Admin Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name}. Here&apos;s your platform overview.</p>
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
                  <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center', stat.color)}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
                transition={{ delay: 0.2 + i * 0.05 }}
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
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className={cn(
                  'h-2 w-2 rounded-full mt-2 shrink-0',
                  item.type === 'user' ? 'bg-blue-500' :
                  item.type === 'payment' ? 'bg-emerald-500' :
                  item.type === 'question' ? 'bg-purple-500' :
                  'bg-amber-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
        <CardContent className="p-4 flex items-center gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">3 discussions flagged for review</p>
            <p className="text-xs text-muted-foreground">Community moderation items require attention</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/content">Review</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
