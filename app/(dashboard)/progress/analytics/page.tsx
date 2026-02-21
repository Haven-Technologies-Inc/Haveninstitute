"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Target,
  Download,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  Activity,
  Zap,
  BookOpen,
} from "lucide-react";

const scoreTrend = [62, 65, 60, 68, 72, 70, 74, 78, 75, 80, 76, 82];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const categoryBreakdown = [
  { name: "Management of Care", score: 82, questions: 180, correct: 148, trend: "up" },
  { name: "Safety & Infection Control", score: 75, questions: 120, correct: 90, trend: "up" },
  { name: "Health Promotion", score: 68, questions: 95, correct: 65, trend: "down" },
  { name: "Psychosocial Integrity", score: 88, questions: 140, correct: 123, trend: "up" },
  { name: "Basic Care & Comfort", score: 71, questions: 110, correct: 78, trend: "stable" },
  { name: "Pharmacology", score: 55, questions: 200, correct: 110, trend: "down" },
  { name: "Risk Reduction", score: 63, questions: 85, correct: 54, trend: "up" },
  { name: "Physiological Adaptation", score: 60, questions: 160, correct: 96, trend: "down" },
];

const strengths = [
  { name: "Psychosocial Integrity", score: 88, tip: "Excellent! Maintain with regular review." },
  { name: "Management of Care", score: 82, tip: "Strong area. Focus on prioritization questions." },
  { name: "Safety & Infection Control", score: 75, tip: "Good progress. Review infection chains." },
];

const weaknesses = [
  { name: "Pharmacology", score: 55, tip: "Focus on drug classifications and side effects." },
  { name: "Physiological Adaptation", score: 60, tip: "Review fluid & electrolyte imbalances." },
  { name: "Risk Reduction", score: 63, tip: "Practice lab value interpretation questions." },
];

const studyTimeData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 2.0 },
  { day: "Fri", hours: 1.5 },
  { day: "Sat", hours: 4.0 },
  { day: "Sun", hours: 3.0 },
];

const maxTrendScore = Math.max(...scoreTrend);

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">Deep insights into your performance</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Avg Score", value: "74%", icon: Target, color: "text-indigo-500", bg: "bg-indigo-500/10" },
              { label: "Questions Done", value: "1,247", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Study Hours", value: "48.5h", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Improvement", value: "+12%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card glass>
                  <CardContent className="p-5">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Score Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="text-base">Score Trend</CardTitle>
                <CardDescription>Your average score over the past 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-64">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-xs text-muted-foreground">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>
                  {/* Chart area */}
                  <div className="ml-12 h-full flex items-end gap-1 pb-8 relative">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((line) => (
                      <div
                        key={line}
                        className="absolute left-0 right-0 border-t border-dashed border-muted/40"
                        style={{ bottom: `${(line / 100) * (100 - 12.5) + 12.5}%` }}
                      />
                    ))}
                    {/* Bars */}
                    {scoreTrend.map((score, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 relative z-10">
                        <motion.div
                          className={cn(
                            "w-full max-w-8 rounded-t-lg relative overflow-hidden",
                            score >= 75
                              ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                              : score >= 60
                              ? "bg-gradient-to-t from-amber-500 to-amber-400"
                              : "bg-gradient-to-t from-red-500 to-red-400"
                          )}
                          initial={{ height: 0 }}
                          animate={{ height: `${(score / 100) * 200}px` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                        >
                          <div className="absolute inset-0 bg-white/10" />
                        </motion.div>
                        <span className="text-[10px] text-muted-foreground">{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Strength & Weakness */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card glass className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <CardTitle className="text-base">Strengths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {strengths.map((item) => (
                    <div key={item.name} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        <Badge variant="success">{item.score}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card glass className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <CardTitle className="text-base">Areas to Improve</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weaknesses.map((item) => (
                    <div key={item.name} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        <Badge variant="destructive">{item.score}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Total Correct", value: "948", total: "1,247", pct: 76, color: "text-emerald-500" },
              { label: "Total Incorrect", value: "299", total: "1,247", pct: 24, color: "text-red-500" },
              { label: "Avg Time/Question", value: "1.2 min", total: "", pct: 0, color: "text-amber-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card glass>
                  <CardContent className="p-6 text-center">
                    <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
                    {stat.total && (
                      <p className="text-sm text-muted-foreground">out of {stat.total} ({stat.pct}%)</p>
                    )}
                    <p className="text-sm font-medium mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Performance by Question Type */}
          <Card glass>
            <CardHeader>
              <CardTitle className="text-base">Performance by Question Type</CardTitle>
              <CardDescription>How you perform across different question formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: "Multiple Choice", correct: 520, total: 680, pct: 76 },
                { type: "Select All That Apply", correct: 180, total: 260, pct: 69 },
                { type: "Ordering / Priority", correct: 95, total: 130, pct: 73 },
                { type: "Hot Spot / Exhibit", correct: 88, total: 100, pct: 88 },
                { type: "Fill in the Blank", correct: 65, total: 77, pct: 84 },
              ].map((item, i) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-muted-foreground">
                      {item.correct}/{item.total}{" "}
                      <span className={cn(
                        "font-semibold ml-1",
                        item.pct >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                        item.pct >= 60 ? "text-amber-600 dark:text-amber-400" :
                        "text-red-600 dark:text-red-400"
                      )}>
                        ({item.pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        item.pct >= 75 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                        item.pct >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                        "bg-gradient-to-r from-red-500 to-red-400"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card glass>
            <CardHeader>
              <CardTitle className="text-base">Score Distribution</CardTitle>
              <CardDescription>Distribution of your quiz scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {[
                  { range: "0-20", count: 2 },
                  { range: "21-40", count: 5 },
                  { range: "41-60", count: 12 },
                  { range: "61-80", count: 28 },
                  { range: "81-100", count: 18 },
                ].map((bucket, i) => {
                  const maxCount = 28;
                  return (
                    <div key={bucket.range} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-muted-foreground">{bucket.count}</span>
                      <motion.div
                        className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-500 relative overflow-hidden"
                        initial={{ height: 0 }}
                        animate={{ height: `${(bucket.count / maxCount) * 120}px` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                      >
                        <div className="absolute inset-0 bg-white/10" />
                      </motion.div>
                      <span className="text-[10px] text-muted-foreground">{bucket.range}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6 mt-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-base">Category Breakdown</CardTitle>
              <CardDescription>Detailed performance in each NCLEX category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryBreakdown.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{cat.name}</span>
                      <Badge
                        variant={cat.trend === "up" ? "success" : cat.trend === "down" ? "destructive" : "secondary"}
                        className="text-[10px]"
                      >
                        {cat.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                        {cat.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                        {cat.trend === "up" ? "Improving" : cat.trend === "down" ? "Declining" : "Stable"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{cat.correct}/{cat.questions} correct</span>
                      <span className={cn(
                        "font-bold",
                        cat.score >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                        cat.score >= 60 ? "text-amber-600 dark:text-amber-400" :
                        "text-red-600 dark:text-red-400"
                      )}>
                        {cat.score}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        cat.score >= 75 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                        cat.score >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                        "bg-gradient-to-r from-red-500 to-red-400"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.score}%` }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">AI-Powered Recommendation</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on your category scores, we recommend focusing on <strong>Pharmacology</strong> (55%) and{" "}
                    <strong>Physiological Adaptation</strong> (60%). Start with drug classification flashcards
                    and practice fluid/electrolyte questions for the most efficient improvement.
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/practice/quiz">Start Targeted Practice</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tab */}
        <TabsContent value="time" className="space-y-6 mt-6">
          {/* Weekly Study Time */}
          <Card glass>
            <CardHeader>
              <CardTitle className="text-base">Study Time Distribution</CardTitle>
              <CardDescription>Hours studied this week by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {studyTimeData.map((item, i) => {
                  const maxHours = 4;
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium">{item.hours}h</span>
                      <motion.div
                        className="w-full rounded-t-xl bg-gradient-to-t from-primary to-primary/60 relative overflow-hidden"
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.hours / maxHours) * 150}px` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                      >
                        <div className="absolute inset-0 bg-white/10" />
                      </motion.div>
                      <span className="text-xs text-muted-foreground font-medium">{item.day}</span>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total this week</span>
                <span className="font-bold">
                  {studyTimeData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)} hours
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Time Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Avg Daily Study", value: "2.5h", sub: "Goal: 3h/day", pct: 83 },
              { label: "Peak Study Time", value: "8-10 PM", sub: "Most productive hours", pct: 0 },
              { label: "Total Study Time", value: "48.5h", sub: "This month", pct: 0 },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card glass>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.sub}</p>
                    {metric.pct > 0 && (
                      <div className="mt-3">
                        <Progress value={metric.pct} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Study Sessions Log */}
          <Card glass>
            <CardHeader>
              <CardTitle className="text-base">Recent Study Sessions</CardTitle>
              <CardDescription>Your latest study activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { date: "Today", duration: "1h 30m", type: "Practice Quiz", questions: 25, score: "80%" },
                { date: "Today", duration: "45m", type: "Flashcard Review", questions: 40, score: "N/A" },
                { date: "Yesterday", duration: "2h 15m", type: "CAT Simulation", questions: 75, score: "Pass" },
                { date: "Yesterday", duration: "30m", type: "AI Tutor", questions: 0, score: "N/A" },
                { date: "2 days ago", duration: "1h 45m", type: "Practice Quiz", questions: 30, score: "73%" },
              ].map((session, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{session.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.date} - {session.duration}
                      {session.questions > 0 && ` - ${session.questions} questions`}
                    </p>
                  </div>
                  {session.score !== "N/A" && (
                    <Badge variant={session.score === "Pass" || parseInt(session.score) >= 75 ? "success" : "warning"}>
                      {session.score}
                    </Badge>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
