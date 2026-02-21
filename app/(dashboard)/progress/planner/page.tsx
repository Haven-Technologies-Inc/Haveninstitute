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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  Flame,
  BookOpen,
  Brain,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flag,
} from "lucide-react";

const studyPlans = [
  {
    id: "plan-1",
    name: "NCLEX-RN 8-Week Intensive",
    description: "Comprehensive study plan covering all NCLEX categories",
    startDate: "2026-02-01",
    endDate: "2026-03-28",
    progress: 42,
    tasksCompleted: 28,
    totalTasks: 67,
    isActive: true,
    aiGenerated: true,
  },
  {
    id: "plan-2",
    name: "Pharmacology Deep Dive",
    description: "Focus on drug classifications, interactions, and side effects",
    startDate: "2026-02-10",
    endDate: "2026-03-10",
    progress: 25,
    tasksCompleted: 8,
    totalTasks: 32,
    isActive: true,
    aiGenerated: false,
  },
  {
    id: "plan-3",
    name: "CAT Simulation Practice",
    description: "Weekly CAT simulations with progressive difficulty",
    startDate: "2026-01-15",
    endDate: "2026-02-15",
    progress: 100,
    tasksCompleted: 12,
    totalTasks: 12,
    isActive: false,
    aiGenerated: true,
  },
];

const todaysTasks = [
  { id: 1, title: "Pharmacology: Antihypertensives Quiz", type: "quiz", duration: "30 min", completed: true },
  { id: 2, title: "Review: Cardiac Medication Flashcards", type: "review", duration: "20 min", completed: true },
  { id: 3, title: "Practice: Safety & Infection Control", type: "practice", duration: "45 min", completed: false },
  { id: 4, title: "AI Tutor: Fluid & Electrolyte Session", type: "tutor", duration: "30 min", completed: false },
  { id: 5, title: "CAT Simulation Mini-Test", type: "cat", duration: "60 min", completed: false },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekSchedule = [
  { day: "Mon", sessions: [{ time: "9:00 AM", title: "Pharmacology", type: "study" }, { time: "2:00 PM", title: "Practice Quiz", type: "quiz" }] },
  { day: "Tue", sessions: [{ time: "10:00 AM", title: "Management of Care", type: "study" }, { time: "4:00 PM", title: "Flashcard Review", type: "review" }] },
  { day: "Wed", sessions: [{ time: "9:00 AM", title: "CAT Simulation", type: "cat" }, { time: "1:00 PM", title: "AI Tutor", type: "tutor" }] },
  { day: "Thu", sessions: [{ time: "10:00 AM", title: "Safety & Infection", type: "study" }, { time: "3:00 PM", title: "Practice Quiz", type: "quiz" }] },
  { day: "Fri", sessions: [{ time: "9:00 AM", title: "Psychosocial", type: "study" }] },
  { day: "Sat", sessions: [{ time: "10:00 AM", title: "Weak Areas Review", type: "review" }, { time: "2:00 PM", title: "Full CAT Test", type: "cat" }] },
  { day: "Sun", sessions: [{ time: "11:00 AM", title: "Light Review", type: "review" }] },
];

const milestones = [
  { title: "Complete Pharmacology Module", date: "Feb 28", completed: false, daysLeft: 7 },
  { title: "First CAT Pass Score", date: "Mar 5", completed: false, daysLeft: 12 },
  { title: "All Categories Above 70%", date: "Mar 15", completed: false, daysLeft: 22 },
  { title: "Final Review Week", date: "Mar 22", completed: false, daysLeft: 29 },
];

export default function PlannerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const completedToday = todaysTasks.filter((t) => t.completed).length;

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
            <h1 className="text-2xl lg:text-3xl font-bold">Study Planner</h1>
            <p className="text-muted-foreground mt-1">Organize and track your study schedule</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Generate Plan
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </Button>
        </div>
      </motion.div>

      {/* Active Study Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Study Plans</h2>
          <Badge variant="secondary">{studyPlans.filter((p) => p.isActive).length} Active</Badge>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {studyPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <Link href={`/progress/planner/${plan.id}`}>
                <Card
                  glass
                  className={cn(
                    "group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full",
                    !plan.isActive && "opacity-60"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {plan.isActive ? (
                          <Badge variant="success" className="text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Completed</Badge>
                        )}
                        {plan.aiGenerated && (
                          <Badge variant="outline" className="text-[10px]">
                            <Sparkles className="h-2.5 w-2.5 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{plan.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{plan.progress}%</span>
                      </div>
                      <Progress value={plan.progress} className="h-1.5" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{plan.tasksCompleted}/{plan.totalTasks} tasks</span>
                        <span>{plan.startDate.split("-").slice(1).join("/")} - {plan.endDate.split("-").slice(1).join("/")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Weekly Schedule</CardTitle>
                  <CardDescription>Your study sessions this week</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
                    This Week
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weekSchedule.map((day, di) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + di * 0.03 }}
                    className={cn(
                      "flex gap-3 p-3 rounded-xl transition-colors",
                      di === 0 && "bg-primary/5 border border-primary/10"
                    )}
                  >
                    <div className="w-12 shrink-0 text-center">
                      <p className={cn("text-xs font-medium", di === 0 ? "text-primary" : "text-muted-foreground")}>
                        {day.day}
                      </p>
                      {di === 0 && (
                        <Badge variant="default" className="text-[9px] mt-1 px-1.5">Today</Badge>
                      )}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {day.sessions.map((s, si) => (
                        <div
                          key={si}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
                            s.type === "study" && "bg-blue-500/10 text-blue-700 dark:text-blue-400",
                            s.type === "quiz" && "bg-purple-500/10 text-purple-700 dark:text-purple-400",
                            s.type === "review" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                            s.type === "cat" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                            s.type === "tutor" && "bg-pink-500/10 text-pink-700 dark:text-pink-400"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {s.time} - {s.title}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Today + Milestones */}
        <div className="space-y-6">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card glass>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Today&apos;s Tasks</CardTitle>
                  <Badge variant={completedToday === todaysTasks.length ? "success" : "secondary"}>
                    {completedToday}/{todaysTasks.length}
                  </Badge>
                </div>
                <Progress value={(completedToday / todaysTasks.length) * 100} className="h-1.5" />
              </CardHeader>
              <CardContent className="space-y-2">
                {todaysTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                    className={cn(
                      "flex items-start gap-3 p-2.5 rounded-lg transition-colors hover:bg-muted/50",
                      task.completed && "opacity-60"
                    )}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", task.completed && "line-through text-muted-foreground")}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{task.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card glass>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Upcoming Milestones</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {milestones.map((milestone, i) => (
                  <motion.div
                    key={milestone.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex flex-col items-center mt-1">
                      <div className={cn(
                        "h-3 w-3 rounded-full border-2",
                        milestone.completed ? "bg-emerald-500 border-emerald-500" : "border-primary bg-background"
                      )} />
                      {i < milestones.length - 1 && (
                        <div className="w-px h-8 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{milestone.date}</span>
                        <span className="text-primary font-medium">({milestone.daysLeft}d left)</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
