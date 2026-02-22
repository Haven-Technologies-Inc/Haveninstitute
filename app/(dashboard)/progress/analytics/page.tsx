'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useUser } from '@/lib/hooks';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalQuizzes: number;
    totalCATs: number;
    averageScore: number;
    totalStudyHours: number;
    questionsAnswered: number;
  };
  recentQuizzes: Array<{
    score: number | null;
    totalQuestions: number | null;
    correctAnswers: number | null;
    completedAt: string | null;
    difficulty: string | null;
  }>;
  recentCATs: Array<{
    result: string | null;
    currentAbility: number | string | null;
    passingProbability: number | string | null;
    questionsAnswered: number;
    completedAt: string | null;
  }>;
  studyActivities: Array<{
    id: string;
    activityType: string;
    title: string | null;
    durationMinutes: number | null;
    questionsAttempted: number | null;
    questionsCorrect: number | null;
    score: number | string | null;
    category: string | null;
    createdAt: string;
  }>;
  dailyUsage: Array<{
    usageDate: string;
    questionsAttempted: number;
    studyTimeMinutes: number;
  }>;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to load analytics');
      const json = await res.json();
      setData(json.data || json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Analytics" description="Deep insights into your performance" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <PageHeader title="Analytics" description="Deep insights into your performance" />
        <EmptyState
          icon={AlertCircle}
          title="Failed to load analytics"
          description={error || 'An unexpected error occurred.'}
        >
          <Button onClick={fetchAnalytics} variant="outline">Try Again</Button>
        </EmptyState>
      </div>
    );
  }

  const { overview, recentQuizzes, recentCATs, studyActivities, dailyUsage } = data;

  // Build daily performance chart data (last 30 days)
  const dailyChartData = [...dailyUsage]
    .reverse()
    .map((d) => ({
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
        new Date(d.usageDate)
      ),
      questions: d.questionsAttempted,
      studyMinutes: d.studyTimeMinutes,
    }));

  // Build category performance from study activities
  const categoryMap = new Map<string, { correct: number; total: number }>();
  studyActivities.forEach((a) => {
    const cat = a.category || 'Other';
    const existing = categoryMap.get(cat) || { correct: 0, total: 0 };
    existing.correct += a.questionsCorrect || 0;
    existing.total += a.questionsAttempted || 0;
    categoryMap.set(cat, existing);
  });

  const categoryChartData = Array.from(categoryMap.entries()).map(([name, stats]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    fullName: name,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    questions: stats.total,
  }));

  // Build difficulty distribution from recent quizzes
  const difficultyMap = new Map<string, number>();
  recentQuizzes.forEach((q) => {
    const diff = q.difficulty || 'mixed';
    difficultyMap.set(diff, (difficultyMap.get(diff) || 0) + (q.totalQuestions || 0));
  });
  const difficultyChartData = Array.from(difficultyMap.entries()).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Build recent sessions table
  const recentSessions = [
    ...recentQuizzes.map((q) => ({
      date: q.completedAt || '',
      type: 'Practice Quiz',
      score:
        q.totalQuestions && q.correctAnswers
          ? `${Math.round((q.correctAnswers / q.totalQuestions) * 100)}%`
          : 'N/A',
      questions: q.totalQuestions || 0,
      time: '', // not tracked per quiz
    })),
    ...recentCATs.map((c) => ({
      date: c.completedAt || '',
      type: 'CAT Simulation',
      score: c.result === 'pass' ? 'Pass' : c.result === 'fail' ? 'Fail' : 'N/A',
      questions: c.questionsAnswered || 0,
      time: '',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Weak areas (categories below 70%)
  const weakAreas = categoryChartData.filter((c) => c.accuracy < 70 && c.questions > 0);

  // Calculate streak from dailyUsage
  let currentStreak = 0;
  const sortedUsage = [...dailyUsage].sort(
    (a, b) => new Date(b.usageDate).getTime() - new Date(a.usageDate).getTime()
  );
  for (const day of sortedUsage) {
    if (day.questionsAttempted > 0 || day.studyTimeMinutes > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Deep insights into your performance" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard
            label="Total Questions"
            value={overview.questionsAnswered.toLocaleString()}
            icon={CheckCircle2}
            iconColor="text-emerald-500"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard
            label="Accuracy"
            value={`${overview.averageScore}%`}
            icon={Target}
            iconColor="text-indigo-500"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            label="Study Time"
            value={`${overview.totalStudyHours}h`}
            icon={Clock}
            iconColor="text-amber-500"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard
            label="Current Streak"
            value={`${currentStreak} days`}
            icon={Flame}
            iconColor="text-orange-500"
          />
        </motion.div>
      </div>

      {/* Line Chart - Daily Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Daily Performance (Last 30 Days)</CardTitle>
            <CardDescription>Questions attempted and study time per day</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="questions"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    name="Questions"
                  />
                  <Line
                    type="monotone"
                    dataKey="studyMinutes"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="Study Minutes"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12 text-sm">No data available yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart - Category Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base">Category Performance</CardTitle>
              <CardDescription>Accuracy by content category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${value}%`, 'Accuracy']}
                    />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                      {categoryChartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.accuracy >= 70 ? '#22c55e' : entry.accuracy >= 50 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12 text-sm">No category data yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart - Difficulty Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base">Difficulty Distribution</CardTitle>
              <CardDescription>Questions by difficulty level</CardDescription>
            </CardHeader>
            <CardContent>
              {difficultyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {difficultyChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12 text-sm">No difficulty data yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Sessions</CardTitle>
            <CardDescription>Your latest study activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium text-muted-foreground p-3">Date</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Type</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Score</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((session, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          {session.date ? formatRelativeTime(session.date) : 'N/A'}
                        </td>
                        <td className="p-3">{session.type}</td>
                        <td className="p-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              session.score === 'Pass' || (parseInt(session.score) >= 70)
                                ? 'text-emerald-600 bg-emerald-500/10'
                                : session.score === 'Fail' || (parseInt(session.score) < 70 && session.score !== 'N/A')
                                ? 'text-red-600 bg-red-500/10'
                                : ''
                            )}
                          >
                            {session.score}
                          </Badge>
                        </td>
                        <td className="p-3">{session.questions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No sessions yet. Start practicing to see your data here.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <CardTitle className="text-base">Areas to Improve</CardTitle>
              </div>
              <CardDescription>Categories below 70% accuracy that need attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {weakAreas.map((area) => (
                <div
                  key={area.fullName || area.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                >
                  <div>
                    <p className="text-sm font-medium">{area.fullName || area.name}</p>
                    <p className="text-xs text-muted-foreground">{area.questions} questions attempted</p>
                  </div>
                  <Badge variant="secondary" className="text-amber-600 bg-amber-500/10">
                    {area.accuracy}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
