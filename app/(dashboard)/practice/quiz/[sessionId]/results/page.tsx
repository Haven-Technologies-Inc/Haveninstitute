"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { motion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  BarChart3,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";

const categoryBreakdown = [
  { name: "Pharmacological Therapies", correct: 5, total: 6, percentage: 83 },
  { name: "Physiological Adaptation", correct: 3, total: 4, percentage: 75 },
  { name: "Management of Care", correct: 2, total: 3, percentage: 67 },
  { name: "Safety & Infection Control", correct: 4, total: 4, percentage: 100 },
  { name: "Psychosocial Integrity", correct: 1, total: 2, percentage: 50 },
  { name: "Basic Care & Comfort", correct: 3, total: 3, percentage: 100 },
  { name: "Health Promotion", correct: 2, total: 3, percentage: 67 },
  { name: "Reduction of Risk Potential", correct: 4, total: 5, percentage: 80 },
];

interface QuestionResult {
  id: number;
  text: string;
  category: string;
  yourAnswer: string;
  correctAnswer: string;
  status: "correct" | "incorrect" | "skipped";
  explanation: string;
}

const questionResults: QuestionResult[] = [
  {
    id: 1,
    text: "A nurse is caring for a client who has been prescribed warfarin. Which laboratory value should the nurse monitor most closely?",
    category: "Pharmacological Therapies",
    yourAnswer: "B",
    correctAnswer: "B",
    status: "correct",
    explanation:
      "INR is the standard test for monitoring warfarin therapy. The therapeutic range is typically 2.0-3.0.",
  },
  {
    id: 2,
    text: "A client is admitted with suspected myocardial infarction. Which nursing intervention should be performed first?",
    category: "Physiological Adaptation",
    yourAnswer: "A",
    correctAnswer: "D",
    status: "incorrect",
    explanation:
      "Establishing IV access and administering oxygen are priority interventions for suspected MI, following the ABCs of emergency care.",
  },
  {
    id: 3,
    text: "Which assessment finding should the nurse report immediately for a client receiving a blood transfusion?",
    category: "Reduction of Risk Potential",
    yourAnswer: "B",
    correctAnswer: "B",
    status: "correct",
    explanation:
      "Back pain and dark urine indicate a hemolytic transfusion reaction, which is a medical emergency requiring immediate intervention.",
  },
  {
    id: 4,
    text: "A nurse is teaching a client about digoxin. Which statement indicates understanding?",
    category: "Pharmacological Therapies",
    yourAnswer: "A",
    correctAnswer: "A",
    status: "correct",
    explanation:
      "Taking the pulse before each dose of digoxin is correct. The medication should be held if the pulse is below 60 bpm.",
  },
  {
    id: 5,
    text: "A nurse is caring for a client in Buck's traction. Which finding indicates a complication?",
    category: "Basic Care & Comfort",
    yourAnswer: "",
    correctAnswer: "B",
    status: "skipped",
    explanation:
      "Numbness and tingling indicate neurovascular compromise, which is a serious complication of traction that requires immediate intervention.",
  },
  {
    id: 6,
    text: "A nurse is planning care for a client who is at risk for falls. Which intervention is most appropriate?",
    category: "Safety & Infection Control",
    yourAnswer: "B",
    correctAnswer: "B",
    status: "correct",
    explanation:
      "Keeping the bed in the lowest position with side rails up is the most appropriate fall prevention measure.",
  },
  {
    id: 7,
    text: "Which priority nursing diagnosis is most appropriate for a client experiencing a panic attack?",
    category: "Psychosocial Integrity",
    yourAnswer: "D",
    correctAnswer: "B",
    status: "incorrect",
    explanation:
      "Anxiety is the priority nursing diagnosis during a panic attack. While ineffective coping may also apply, the immediate concern is the client's anxiety level.",
  },
  {
    id: 8,
    text: "A nurse is caring for a postoperative client who develops a wound evisceration. What is the priority nursing action?",
    category: "Physiological Adaptation",
    yourAnswer: "A",
    correctAnswer: "A",
    status: "correct",
    explanation:
      "Covering the wound with sterile saline-soaked dressings prevents tissue desiccation and contamination while preparing for surgical intervention.",
  },
  {
    id: 9,
    text: "Which topic is most important regarding safe sleep practices for an infant?",
    category: "Health Promotion",
    yourAnswer: "B",
    correctAnswer: "B",
    status: "correct",
    explanation:
      "The Back to Sleep campaign recommends placing infants on their backs to sleep to reduce the risk of SIDS.",
  },
  {
    id: 10,
    text: "Which task is most appropriate to delegate to an LPN?",
    category: "Management of Care",
    yourAnswer: "B",
    correctAnswer: "B",
    status: "correct",
    explanation:
      "Collecting data from a client with stable vital signs is within the LPN scope of practice. Care planning, evaluation, and initial assessment require an RN.",
  },
];

export default function QuizResultsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const totalQuestions = questionResults.length;
  const correctCount = questionResults.filter(
    (q) => q.status === "correct"
  ).length;
  const incorrectCount = questionResults.filter(
    (q) => q.status === "incorrect"
  ).length;
  const skippedCount = questionResults.filter(
    (q) => q.status === "skipped"
  ).length;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercentage >= 65;
  const timeTaken = "8:42";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" asChild>
          <Link href="/practice">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Quiz Results</h1>
          <p className="text-muted-foreground text-sm">
            Session completed &middot; {totalQuestions} questions
          </p>
        </div>
      </motion.div>

      {/* Score Circle & Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden">
          <div
            className={cn(
              "h-2",
              passed
                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                : "bg-gradient-to-r from-red-400 to-rose-500"
            )}
          />
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Score Circle */}
              <div className="relative">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    initial={{
                      strokeDashoffset: 2 * Math.PI * 52,
                    }}
                    animate={{
                      strokeDashoffset:
                        2 * Math.PI * 52 * (1 - scorePercentage / 100),
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={passed ? "#10b981" : "#ef4444"}
                      />
                      <stop
                        offset="100%"
                        stopColor={passed ? "#14b8a6" : "#f43f5e"}
                      />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-4xl font-bold"
                  >
                    {scorePercentage}%
                  </motion.span>
                  <Badge
                    variant={passed ? "default" : "destructive"}
                    className={cn(
                      "mt-1",
                      passed && "bg-emerald-500 hover:bg-emerald-600"
                    )}
                  >
                    {passed ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-600">
                    {correctCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-600">
                    {incorrectCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-500/10">
                  <MinusCircle className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-600">
                    {skippedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">
                    {timeTaken}
                  </p>
                  <p className="text-xs text-muted-foreground">Time Taken</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="breakdown" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
            <TabsTrigger value="review">Question Review</TabsTrigger>
          </TabsList>

          {/* Category Breakdown */}
          <TabsContent value="breakdown" className="space-y-4">
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                {categoryBreakdown.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {cat.correct}/{cat.total}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs min-w-[3rem] justify-center",
                            cat.percentage >= 80
                              ? "bg-emerald-500/10 text-emerald-600"
                              : cat.percentage >= 65
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-red-500/10 text-red-600"
                          )}
                        >
                          {cat.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          cat.percentage >= 80
                            ? "bg-emerald-500"
                            : cat.percentage >= 65
                            ? "bg-amber-500"
                            : "bg-red-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Question Review */}
          <TabsContent value="review" className="space-y-3">
            {questionResults.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className={cn(
                    "border-0 shadow-sm bg-card/80 backdrop-blur-sm cursor-pointer transition-all",
                    expandedQuestion === q.id && "shadow-md"
                  )}
                  onClick={() =>
                    setExpandedQuestion(
                      expandedQuestion === q.id ? null : q.id
                    )
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          q.status === "correct"
                            ? "bg-emerald-500/10"
                            : q.status === "incorrect"
                            ? "bg-red-500/10"
                            : "bg-gray-500/10"
                        )}
                      >
                        {q.status === "correct" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : q.status === "incorrect" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <MinusCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            Q{q.id}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {q.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium line-clamp-2">
                          {q.text}
                        </p>

                        {expandedQuestion === q.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 space-y-2"
                          >
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                Your answer:{" "}
                                <span
                                  className={cn(
                                    "font-medium",
                                    q.status === "correct"
                                      ? "text-emerald-600"
                                      : q.status === "incorrect"
                                      ? "text-red-600"
                                      : "text-gray-400"
                                  )}
                                >
                                  {q.yourAnswer || "Skipped"}
                                </span>
                              </span>
                              {q.status !== "correct" && (
                                <span className="text-muted-foreground">
                                  Correct:{" "}
                                  <span className="font-medium text-emerald-600">
                                    {q.correctAnswer}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                              <div className="flex items-start gap-2">
                                <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {q.explanation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {expandedQuestion === q.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push("/practice/quiz")}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button className="w-full sm:w-auto" asChild>
          <Link href="/practice">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Practice
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
