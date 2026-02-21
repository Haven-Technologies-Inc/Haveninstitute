"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "motion/react";
import {
  Brain,
  Zap,
  Trophy,
  Monitor,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Play,
  BarChart3,
  History,
  Sparkles,
} from "lucide-react";

const practiceModes = [
  {
    title: "Quick Quiz",
    description:
      "A fast 10-question quiz to sharpen your skills. Perfect for short study sessions and daily practice.",
    icon: Zap,
    href: "/practice/quiz",
    gradient: "from-blue-500 to-indigo-600",
    bgGlow: "bg-blue-500/10",
    questions: "10 questions",
    time: "~10 min",
  },
  {
    title: "Full Quiz",
    description:
      "Customizable quizzes with up to 100 questions. Select categories, difficulty, and enable a timer.",
    icon: Brain,
    href: "/practice/quiz",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/10",
    questions: "10-100 questions",
    time: "15-90 min",
  },
  {
    title: "CAT Simulator",
    description:
      "Computer Adaptive Testing that mimics the real NCLEX algorithm. Questions adapt to your ability level.",
    icon: Trophy,
    href: "/practice/cat",
    gradient: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/10",
    questions: "60-145 questions",
    time: "Up to 5 hrs",
  },
  {
    title: "NCLEX Exam Simulator",
    description:
      "The most realistic NCLEX simulation available. Full exam conditions with adaptive difficulty and timing.",
    icon: Monitor,
    href: "/practice/nclex",
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/10",
    questions: "Full exam",
    time: "5 hours",
  },
];

const recentSessions = [
  {
    id: "s1",
    type: "Quiz",
    title: "Pharmacology Quiz",
    score: 82,
    questions: 25,
    date: "2 hours ago",
    status: "completed" as const,
  },
  {
    id: "s2",
    type: "CAT",
    title: "CAT Simulation #8",
    score: 78,
    questions: 95,
    date: "Yesterday",
    status: "completed" as const,
  },
  {
    id: "s3",
    type: "Quiz",
    title: "Safety & Infection Control",
    score: 90,
    questions: 50,
    date: "2 days ago",
    status: "completed" as const,
  },
  {
    id: "s4",
    type: "NCLEX",
    title: "Full Simulation #3",
    score: 74,
    questions: 130,
    date: "3 days ago",
    status: "completed" as const,
  },
  {
    id: "s5",
    type: "Quiz",
    title: "Management of Care",
    score: 0,
    questions: 10,
    date: "4 days ago",
    status: "in-progress" as const,
  },
];

const performanceStats = [
  {
    label: "Total Questions",
    value: "2,847",
    change: "+142 this week",
    icon: CheckCircle2,
    color: "text-indigo-500",
  },
  {
    label: "Avg Accuracy",
    value: "78%",
    change: "+4% this month",
    icon: Target,
    color: "text-emerald-500",
  },
  {
    label: "Study Hours",
    value: "67h",
    change: "8.2h this week",
    icon: Clock,
    color: "text-amber-500",
  },
  {
    label: "Best Streak",
    value: "12 days",
    change: "Current: 7 days",
    icon: TrendingUp,
    color: "text-purple-500",
  },
];

export default function PracticePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 lg:p-10 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22%20opacity=%220.05%22/%3E%3C/svg%3E')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Practice Hub</h1>
              <p className="text-white/80 text-sm lg:text-base">
                Choose your practice mode and start mastering NCLEX
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      {/* Practice Modes Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Practice Modes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {practiceModes.map((mode, i) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    mode.bgGlow
                  )}
                />
                <CardContent className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110",
                        mode.gradient
                      )}
                    >
                      <mode.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {mode.description}
                      </p>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {mode.questions}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {mode.time}
                        </Badge>
                      </div>
                      <Button size="sm" className="group/btn" asChild>
                        <Link href={mode.href}>
                          Start
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Overview & Recent Sessions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Performance Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {performanceStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-normal"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Recent Sessions
          </h2>
          <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 space-y-3">
              {recentSessions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                      s.status === "completed"
                        ? "bg-emerald-500/10"
                        : "bg-amber-500/10"
                    )}
                  >
                    {s.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.type} &middot; {s.questions} Qs
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {s.status === "completed" ? (
                      <p
                        className={cn(
                          "text-sm font-bold",
                          s.score >= 80
                            ? "text-emerald-500"
                            : s.score >= 65
                            ? "text-amber-500"
                            : "text-red-500"
                        )}
                      >
                        {s.score}%
                      </p>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        In Progress
                      </Badge>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {s.date}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
