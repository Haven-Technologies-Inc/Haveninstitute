"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/hooks/use-api";
import { useUser } from "@/lib/hooks/use-user";
import { QuestionRenderer } from "@/components/questions/question-renderer";
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
  Loader2,
  AlertCircle,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: any;
  correctAnswers: any;
  correctOrder?: any;
  hotSpotData?: any;
  explanation?: string;
  rationale?: string;
  difficulty: string;
  scenario?: string;
  category: { name: string; code: string };
}

interface QuizResponse {
  id: string;
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  timeSpentSeconds: number | null;
  questionIndex: number;
  question: QuizQuestion;
}

interface QuizSessionData {
  id: string;
  status: string;
  score: number | null;
  totalQuestions: number;
  correctAnswers: number | null;
  totalTimeSeconds: number | null;
  difficulty: string;
  timeLimitMinutes: number | null;
  startedAt: string;
  completedAt: string | null;
  responses: QuizResponse[];
}

export default function QuizResultsPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const sessionApi = useApi<QuizSessionData>();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Load session results
  useEffect(() => {
    sessionApi.get(`/api/quiz/${sessionId}`);
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state
  if (sessionApi.loading || !sessionApi.data) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionApi.error) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
            <h2 className="text-lg font-semibold">Error Loading Results</h2>
            <p className="text-sm text-muted-foreground">{sessionApi.error}</p>
            <Button variant="outline" asChild>
              <Link href="/practice/quiz">Back to Quiz Setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If session is not completed, redirect to the active quiz
  if (sessionApi.data.status !== "completed") {
    router.replace(`/practice/quiz/${sessionId}`);
    return null;
  }

  const quizSession = sessionApi.data;
  const responses = quizSession.responses ?? [];
  const totalQuestions = quizSession.totalQuestions;
  const correctCount = quizSession.correctAnswers ?? 0;
  const scorePercentage = quizSession.score ?? 0;
  const passed = scorePercentage >= 65;

  // Compute incorrect and skipped from responses
  const incorrectCount = responses.filter(
    (r) => !r.isCorrect && r.userAnswer !== null && r.userAnswer !== undefined && r.userAnswer !== ""
  ).length;
  const skippedCount = totalQuestions - correctCount - incorrectCount;

  // Format time
  const totalSeconds = quizSession.totalTimeSeconds ?? 0;
  const timeTaken =
    totalSeconds > 0
      ? `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60)
          .toString()
          .padStart(2, "0")}`
      : "N/A";

  // Build category breakdown from responses
  const categoryMap: Record<
    string,
    { name: string; correct: number; total: number }
  > = {};
  responses.forEach((r) => {
    const catCode = r.question.category?.code ?? "unknown";
    const catName = r.question.category?.name ?? "Unknown";
    if (!categoryMap[catCode]) {
      categoryMap[catCode] = { name: catName, correct: 0, total: 0 };
    }
    categoryMap[catCode].total++;
    if (r.isCorrect) {
      categoryMap[catCode].correct++;
    }
  });

  const categoryBreakdown = Object.values(categoryMap).map((cat) => ({
    ...cat,
    percentage: cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0,
  }));

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
                {categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No category data available.
                  </p>
                ) : (
                  categoryBreakdown.map((cat, i) => (
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
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Question Review */}
          <TabsContent value="review" className="space-y-3">
            {responses.map((r, i) => {
              const q = r.question;
              const status: "correct" | "incorrect" | "skipped" = r.isCorrect
                ? "correct"
                : r.userAnswer !== null &&
                  r.userAnswer !== undefined &&
                  r.userAnswer !== ""
                ? "incorrect"
                : "skipped";
              const isExpanded = expandedQuestion === r.questionId;

              return (
                <motion.div
                  key={r.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className={cn(
                      "border-0 shadow-sm bg-card/80 backdrop-blur-sm cursor-pointer transition-all",
                      isExpanded && "shadow-md"
                    )}
                    onClick={() =>
                      setExpandedQuestion(
                        isExpanded ? null : r.questionId
                      )
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            status === "correct"
                              ? "bg-emerald-500/10"
                              : status === "incorrect"
                              ? "bg-red-500/10"
                              : "bg-gray-500/10"
                          )}
                        >
                          {status === "correct" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : status === "incorrect" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <MinusCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              Q{i + 1}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {q.category?.name ?? "Unknown"}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium line-clamp-2">
                            {q.questionText}
                          </p>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-4 space-y-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <QuestionRenderer
                                question={{
                                  id: q.id,
                                  questionText: q.questionText,
                                  questionType: q.questionType,
                                  options: q.options,
                                  scenario: q.scenario,
                                  difficulty: q.difficulty,
                                  categoryName: q.category?.name,
                                  hotSpotData: q.hotSpotData,
                                }}
                                userAnswer={r.userAnswer}
                                onAnswerChange={() => {}}
                                showResult={true}
                                correctAnswers={q.correctAnswers}
                                correctOrder={q.correctOrder}
                                explanation={q.explanation}
                                rationale={q.rationale}
                                disabled={true}
                              />
                            </motion.div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
