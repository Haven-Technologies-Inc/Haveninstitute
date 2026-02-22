"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Target,
  Clock,
  Flame,
  Brain,
  Trophy,
  BarChart3,
  ArrowRight,
  Star,
  Award,
  Zap,
  BookOpen,
  CheckCircle2,
  Activity,
  Calendar,
  Shield,
  Heart,
  Sparkles,
} from "lucide-react";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weeklyActivity = [
  [3, 5, 2, 4, 1, 0, 3],
  [4, 2, 5, 3, 4, 2, 1],
  [1, 3, 4, 5, 2, 3, 4],
  [5, 4, 3, 2, 5, 1, 2],
];

const categories = [
  { name: "Management of Care", score: 82, icon: Shield, color: "from-indigo-500 to-blue-600" },
  { name: "Safety & Infection Control", score: 75, icon: Shield, color: "from-emerald-500 to-teal-600" },
  { name: "Health Promotion", score: 68, icon: Heart, color: "from-pink-500 to-rose-600" },
  { name: "Psychosocial Integrity", score: 88, icon: Brain, color: "from-purple-500 to-violet-600" },
  { name: "Basic Care & Comfort", score: 71, icon: Heart, color: "from-amber-500 to-orange-600" },
  { name: "Pharmacology", score: 55, icon: Zap, color: "from-red-500 to-pink-600" },
  { name: "Risk Reduction", score: 63, icon: Target, color: "from-cyan-500 to-blue-600" },
  { name: "Physiological Adaptation", score: 60, icon: Activity, color: "from-orange-500 to-red-600" },
];

const achievements = [
  { name: "First Quiz", desc: "Complete your first quiz", icon: Star, unlocked: true, color: "from-amber-400 to-yellow-500" },
  { name: "Week Warrior", desc: "7-day study streak", icon: Flame, unlocked: true, color: "from-orange-400 to-red-500" },
  { name: "Century Club", desc: "Answer 100 questions", icon: Trophy, unlocked: true, color: "from-indigo-400 to-purple-500" },
  { name: "Speed Demon", desc: "Finish quiz under 5 min", icon: Zap, unlocked: true, color: "from-emerald-400 to-teal-500" },
  { name: "Perfectionist", desc: "Score 100% on any quiz", icon: Award, unlocked: false, color: "from-gray-400 to-gray-500" },
  { name: "Knowledge King", desc: "Answer 1000 questions", icon: Brain, unlocked: false, color: "from-gray-400 to-gray-500" },
  { name: "Marathon Runner", desc: "30-day study streak", icon: Calendar, unlocked: false, color: "from-gray-400 to-gray-500" },
  { name: "CAT Master", desc: "Pass 10 CAT simulations", icon: Trophy, unlocked: false, color: "from-gray-400 to-gray-500" },
];

export default function ProgressPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const overallScore = 74;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Your Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your NCLEX preparation journey
          </p>
        </div>
        <Button asChild>
          <Link href="/progress/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Detailed Analytics
          </Link>
        </Button>
      </motion.div>

      {/* Overall Score Gauge + Stats */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Circular Score Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card glass className="relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
            <CardContent className="p-8 flex flex-col items-center justify-center relative z-10">
              <p className="text-sm font-medium text-muted-foreground mb-4">Overall Score</p>
              <div className="relative w-48 h-48 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-muted/20"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 85}
                    initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 85 * (1 - overallScore / 100),
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-5xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {overallScore}%
                  </motion.span>
                  <span className="text-xs text-muted-foreground mt-1">NCLEX Readiness</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+5% from last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          {[
            {
              label: "Total Questions",
              value: "1,247",
              change: "+23 today",
              icon: CheckCircle2,
              color: "text-indigo-500",
              bgColor: "bg-indigo-500/10",
              gradient: "from-indigo-500/10 to-blue-500/5",
            },
            {
              label: "Pass Rate",
              value: "76%",
              change: "+3% this week",
              icon: TrendingUp,
              color: "text-emerald-500",
              bgColor: "bg-emerald-500/10",
              gradient: "from-emerald-500/10 to-teal-500/5",
            },
            {
              label: "Study Hours",
              value: "48.5h",
              change: "6.8h this week",
              icon: Clock,
              color: "text-amber-500",
              bgColor: "bg-amber-500/10",
              gradient: "from-amber-500/10 to-orange-500/5",
            },
            {
              label: "Current Streak",
              value: "7 days",
              change: "Personal best!",
              icon: Flame,
              color: "text-orange-500",
              bgColor: "bg-orange-500/10",
              gradient: "from-orange-500/10 to-red-500/5",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <Card glass className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", stat.gradient)} />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-normal">
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
      </div>

      {/* Weekly Activity Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Weekly Activity</CardTitle>
                <CardDescription>Your study intensity over the past 4 weeks</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-3 w-3 rounded-sm",
                        level === 0 && "bg-muted",
                        level === 1 && "bg-emerald-200 dark:bg-emerald-900",
                        level === 2 && "bg-emerald-300 dark:bg-emerald-700",
                        level === 3 && "bg-emerald-400 dark:bg-emerald-600",
                        level === 4 && "bg-emerald-500 dark:bg-emerald-500",
                        level === 5 && "bg-emerald-600 dark:bg-emerald-400"
                      )}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Day labels */}
              <div className="flex gap-2 pl-16">
                {weekDays.map((day) => (
                  <div key={day} className="flex-1 text-center text-xs text-muted-foreground font-medium">
                    {day}
                  </div>
                ))}
              </div>
              {/* Week rows */}
              {weeklyActivity.map((week, wi) => (
                <div key={wi} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-14 text-right">
                    Week {wi + 1}
                  </span>
                  <div className="flex gap-2 flex-1">
                    {week.map((level, di) => (
                      <motion.div
                        key={di}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + wi * 0.05 + di * 0.02 }}
                        className={cn(
                          "flex-1 h-10 rounded-lg transition-all duration-200 hover:ring-2 hover:ring-primary/30 cursor-pointer",
                          level === 0 && "bg-muted/50",
                          level === 1 && "bg-emerald-200/60 dark:bg-emerald-900/40",
                          level === 2 && "bg-emerald-300/60 dark:bg-emerald-700/40",
                          level === 3 && "bg-emerald-400/60 dark:bg-emerald-600/40",
                          level === 4 && "bg-emerald-500/60 dark:bg-emerald-500/40",
                          level === 5 && "bg-emerald-600/60 dark:bg-emerald-400/40"
                        )}
                        title={`${level} study sessions`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Category Performance</CardTitle>
                <CardDescription>Your scores across all NCLEX categories</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/progress/analytics">
                  Details <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                      cat.color
                    )}
                  >
                    <cat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium truncate">{cat.name}</span>
                      <span
                        className={cn(
                          "text-sm font-bold ml-2",
                          cat.score >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                          cat.score >= 60 ? "text-amber-600 dark:text-amber-400" :
                          "text-red-600 dark:text-red-400"
                        )}
                      >
                        {cat.score}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full bg-gradient-to-r", cat.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{ duration: 1, delay: 0.6 + i * 0.05 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Achievements</CardTitle>
                <CardDescription>
                  {achievements.filter((a) => a.unlocked).length} of {achievements.length} unlocked
                </CardDescription>
              </div>
              <Badge variant="secondary">
                <Trophy className="h-3 w-3 mr-1" />
                {achievements.filter((a) => a.unlocked).length}/{achievements.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className={cn(
                    "relative flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300",
                    achievement.unlocked
                      ? "bg-gradient-to-b from-primary/5 to-transparent border-primary/20 hover:border-primary/40 hover:shadow-md cursor-pointer"
                      : "bg-muted/30 border-muted opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mb-2",
                      achievement.unlocked
                        ? cn("bg-gradient-to-br shadow-lg", achievement.color)
                        : "bg-muted"
                    )}
                  >
                    <achievement.icon
                      className={cn(
                        "h-6 w-6",
                        achievement.unlocked ? "text-white" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <p className="text-xs font-semibold">{achievement.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{achievement.desc}</p>
                  {achievement.unlocked && (
                    <div className="absolute -top-1 -right-1">
                      <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Link href="/progress/analytics">
            <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Detailed Analytics</p>
                  <p className="text-sm text-muted-foreground">Deep dive into your performance data</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/progress/planner">
            <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Study Planner</p>
                  <p className="text-sm text-muted-foreground">Plan and schedule your study sessions</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
