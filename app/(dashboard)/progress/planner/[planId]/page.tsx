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
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  MoreVertical,
  Sparkles,
  Flag,
  Play,
  BookOpen,
  Brain,
  Trophy,
  Flame,
  ArrowRight,
} from "lucide-react";

const plan = {
  id: "plan-1",
  name: "NCLEX-RN 8-Week Intensive",
  description: "A comprehensive, AI-generated study plan covering all NCLEX-RN categories with adaptive scheduling based on your performance. This plan adjusts difficulty and focus areas as you progress.",
  startDate: "Feb 1, 2026",
  endDate: "Mar 28, 2026",
  progress: 42,
  tasksCompleted: 28,
  totalTasks: 67,
  daysRemaining: 35,
  aiGenerated: true,
  weeklyHours: 15,
  currentWeek: 4,
  totalWeeks: 8,
};

const tasks = [
  { id: 1, title: "Complete Pharmacology Unit 1: Drug Classifications", category: "Pharmacology", duration: "2h", completed: true, week: 1 },
  { id: 2, title: "Practice Quiz: Antihypertensives & Cardiac Drugs", category: "Pharmacology", duration: "30m", completed: true, week: 1 },
  { id: 3, title: "Flashcard Review: Top 50 Drug Interactions", category: "Pharmacology", duration: "45m", completed: true, week: 1 },
  { id: 4, title: "Management of Care: Delegation Principles", category: "Management", duration: "1.5h", completed: true, week: 2 },
  { id: 5, title: "Practice Quiz: Prioritization & Delegation", category: "Management", duration: "30m", completed: true, week: 2 },
  { id: 6, title: "Safety & Infection Control Module", category: "Safety", duration: "2h", completed: true, week: 2 },
  { id: 7, title: "CAT Simulation Practice #1", category: "Assessment", duration: "1.5h", completed: true, week: 3 },
  { id: 8, title: "Review Weak Areas from CAT #1", category: "Review", duration: "1h", completed: false, week: 3 },
  { id: 9, title: "Psychosocial Integrity Deep Dive", category: "Psychosocial", duration: "2h", completed: false, week: 4 },
  { id: 10, title: "Practice Quiz: Therapeutic Communication", category: "Psychosocial", duration: "30m", completed: false, week: 4 },
  { id: 11, title: "Physiological Adaptation: Fluid & Electrolytes", category: "Physiology", duration: "2h", completed: false, week: 4 },
  { id: 12, title: "CAT Simulation Practice #2", category: "Assessment", duration: "1.5h", completed: false, week: 5 },
];

const milestones = [
  { title: "Foundation Phase Complete", date: "Feb 14", completed: true, description: "Core concepts reviewed" },
  { title: "Pharmacology Mastery", date: "Feb 28", completed: false, description: "Score 75%+ in pharma" },
  { title: "First CAT Pass", date: "Mar 5", completed: false, description: "Pass CAT simulation" },
  { title: "All Categories 70%+", date: "Mar 15", completed: false, description: "Baseline proficiency" },
  { title: "Mock Exam Pass", date: "Mar 22", completed: false, description: "Full-length mock exam" },
  { title: "Plan Complete", date: "Mar 28", completed: false, description: "Ready for NCLEX" },
];

export default function PlanDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showCompleted, setShowCompleted] = useState(true);

  const groupedTasks = tasks.reduce((acc, task) => {
    const key = `Week ${task.week}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold">{plan.name}</h1>
              {plan.aiGenerated && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{plan.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Edit3 className="mr-2 h-3.5 w-3.5" />
            Edit Plan
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete Plan
          </Button>
        </div>
      </motion.div>

      {/* Plan Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Progress", value: `${plan.progress}%`, icon: Target, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Tasks Done", value: `${plan.tasksCompleted}/${plan.totalTasks}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Days Left", value: `${plan.daysRemaining}`, icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Weekly Hours", value: `${plan.weeklyHours}h`, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card glass>
              <CardContent className="p-5">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center mb-2", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card glass>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium">
                Week {plan.currentWeek} of {plan.totalWeeks}
              </span>
              <span className="text-muted-foreground">
                {plan.startDate} - {plan.endDate}
              </span>
            </div>
            <Progress value={plan.progress} className="h-3" />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">{plan.tasksCompleted} completed</span>
              <span className="text-xs text-muted-foreground">{plan.totalTasks - plan.tasksCompleted} remaining</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </Button>
          </div>
          {Object.entries(groupedTasks).map(([week, weekTasks], gi) => {
            const filteredTasks = showCompleted
              ? weekTasks
              : weekTasks.filter((t) => !t.completed);
            if (filteredTasks.length === 0) return null;
            return (
              <motion.div
                key={week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + gi * 0.05 }}
              >
                <Card glass>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{week}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">
                        {weekTasks.filter((t) => t.completed).length}/{weekTasks.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer group",
                          task.completed && "opacity-60"
                        )}
                      >
                        <button className="shrink-0">
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-[10px]">{task.category}</Badge>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {task.duration}
                            </span>
                          </div>
                        </div>
                        {!task.completed && (
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Milestones Timeline */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card glass>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Milestones</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {milestones.map((milestone, i) => (
                  <div key={milestone.title} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border-2 shrink-0 transition-colors",
                          milestone.completed
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-muted-foreground/30 bg-background"
                        )}
                      >
                        {milestone.completed && (
                          <CheckCircle2 className="h-full w-full text-white p-0.5" />
                        )}
                      </div>
                      {i < milestones.length - 1 && (
                        <div
                          className={cn(
                            "w-px flex-1 mt-1",
                            milestone.completed ? "bg-emerald-500" : "bg-border"
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={cn(
                        "text-sm font-medium",
                        milestone.completed && "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {milestone.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {milestone.date}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI Adjustment</p>
                    <p className="text-xs text-muted-foreground">Optimize your plan</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Let AI adjust your remaining tasks based on your current performance and available time.
                </p>
                <Button size="sm" className="w-full">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Optimize Plan
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
