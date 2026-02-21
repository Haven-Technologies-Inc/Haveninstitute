'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Brain,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Layers,
  MessageSquare,
  ArrowRight,
  Sparkles,
  BarChart3,
  CalendarDays,
  GraduationCap,
  Zap,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getInitials } from '@/lib/utils';

const quickActions = [
  { label: 'Quick Quiz', icon: Brain, href: '/practice/quiz', color: 'from-blue-500 to-indigo-600', desc: '10 questions' },
  { label: 'CAT Test', icon: Trophy, href: '/practice/cat', color: 'from-purple-500 to-pink-600', desc: 'Adaptive' },
  { label: 'Flashcards', icon: Layers, href: '/study/flashcards', color: 'from-amber-500 to-orange-600', desc: 'Review' },
  { label: 'AI Tutor', icon: MessageSquare, href: '/study/ai', color: 'from-emerald-500 to-teal-600', desc: 'Ask anything' },
];

const categories = [
  { name: 'Management of Care', progress: 72, color: '#6366f1' },
  { name: 'Safety & Infection', progress: 65, color: '#10b981' },
  { name: 'Health Promotion', progress: 58, color: '#f59e0b' },
  { name: 'Psychosocial', progress: 81, color: '#8b5cf6' },
  { name: 'Basic Care', progress: 70, color: '#3b82f6' },
  { name: 'Pharmacology', progress: 45, color: '#ec4899' },
  { name: 'Risk Reduction', progress: 63, color: '#f97316' },
  { name: 'Physiological', progress: 55, color: '#ef4444' },
];

const recentActivity = [
  { type: 'quiz', title: 'Pharmacology Quiz', score: '8/10', time: '2h ago', icon: Brain },
  { type: 'cat', title: 'CAT Simulation #12', score: 'Pass - 85%', time: '5h ago', icon: Trophy },
  { type: 'flashcard', title: 'Safety Flashcards', score: '24 reviewed', time: '1d ago', icon: Layers },
  { type: 'study', title: 'AI Tutor Session', score: '45 min', time: '1d ago', icon: MessageSquare },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 lg:p-8 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22%20opacity=%220.05%22/%3E%3C/svg%3E')] opacity-30" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Student'}!
            </h1>
            <p className="text-white/80 text-sm lg:text-base">
              You&apos;re on a 7-day streak. Keep it going!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <Flame className="h-5 w-5 text-amber-300" />
              <div>
                <p className="text-xs text-white/70">Streak</p>
                <p className="font-bold">7 days</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <Target className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-xs text-white/70">Today&apos;s Goal</p>
                <p className="font-bold">12/20</p>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className={cn(
                      'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110',
                      action.color
                    )}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Questions Done', value: '1,247', change: '+23 today', icon: CheckCircle2, color: 'text-indigo-500' },
          { label: 'Avg Score', value: '76%', change: '+3% this week', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Study Time', value: '48h', change: '6.8h this week', icon: Clock, color: 'text-amber-500' },
          { label: 'CAT Score', value: '82%', change: 'Above passing', icon: GraduationCap, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                  <Badge variant="secondary" className="text-[10px] font-normal">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Performance - 2 cols */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">NCLEX Category Performance</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/progress/analytics">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{cat.name}</span>
                  <span className="font-medium">{cat.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity - 1 col */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.score}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Study Recommendations */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">AI Recommendation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Based on your recent performance, focus on <strong>Pharmacology</strong> and <strong>Physiological Adaptation</strong>.
                You&apos;re scoring below average in these areas. A targeted practice session could help.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href="/practice/quiz"><Play className="mr-1.5 h-3.5 w-3.5" /> Start Practice</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/progress/planner"><CalendarDays className="mr-1.5 h-3.5 w-3.5" /> View Study Plan</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
