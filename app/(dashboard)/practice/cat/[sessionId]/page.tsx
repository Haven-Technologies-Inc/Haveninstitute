"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import {
  Clock,
  Send,
  Gauge,
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Loader2,
} from "lucide-react";
import {
  QuestionRenderer,
  type QuestionData,
} from "@/components/questions/question-renderer";

interface CATSessionData {
  id: string;
  currentQuestion: any;
  currentAbility: number;
  standardError: number;
  passingProbability: number;
  totalQuestions?: number;
  maxQuestions?: number;
  minQuestions?: number;
  timeLimitSeconds?: number;
}

export default function CATSessionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [abilityEstimate, setAbilityEstimate] = useState(0);
  const [standardError, setStandardError] = useState(1);
  const [passingProbability, setPassingProbability] = useState(0.5);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60 * 60); // 5 hours
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxQuestions, setMaxQuestions] = useState(145);

  const questionStartTimeRef = useRef<number>(Date.now());

  // Initialize session from sessionStorage (set by the POST /api/cat response)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`cat-session-${sessionId}`);
      if (stored) {
        const data: CATSessionData = JSON.parse(stored);
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion);
          setAbilityEstimate(data.currentAbility ?? 0);
          setStandardError(data.standardError ?? 1);
          setPassingProbability(data.passingProbability ?? 0.5);
          if (data.maxQuestions) setMaxQuestions(data.maxQuestions);
          if (data.timeLimitSeconds) setTimeRemaining(data.timeLimitSeconds);
          questionStartTimeRef.current = Date.now();
        }
        // Clear sessionStorage after reading
        sessionStorage.removeItem(`cat-session-${sessionId}`);
        setLoading(false);
      } else {
        // No sessionStorage data - fetch session state from API
        fetchSessionState();
      }
    } catch (err) {
      console.error("Failed to load session data:", err);
      fetchSessionState();
    }
  }, [sessionId]);

  const fetchSessionState = async () => {
    try {
      const res = await fetch(`/api/cat/${sessionId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        if (data.completed) {
          router.push(`/practice/cat/${sessionId}/results`);
          return;
        }
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion);
          setAbilityEstimate(data.currentAbility ?? 0);
          setStandardError(data.standardError ?? 1);
          setPassingProbability(data.passingProbability ?? 0.5);
          setQuestionsAnswered(data.responses?.length ?? data.totalQuestions ?? 0);
          if (data.maxQuestions) setMaxQuestions(data.maxQuestions);
          if (data.timeLimitSeconds) setTimeRemaining(data.timeLimitSeconds);
          questionStartTimeRef.current = Date.now();
        }
        setLoading(false);
      } else {
        setError(json.error || "Failed to load CAT session.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setError("Failed to load CAT session. Please try again.");
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      // Time's up - redirect to results
      router.push(`/practice/cat/${sessionId}/results`);
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, sessionId, router]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (userAnswer === null || userAnswer === undefined || submitting) return;
    setSubmitting(true);
    setError(null);

    const timeSpentSeconds = Math.round(
      (Date.now() - questionStartTimeRef.current) / 1000
    );

    try {
      const res = await fetch(`/api/cat/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion?.id,
          userAnswer,
          timeSpentSeconds,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Failed to submit answer.");
        setSubmitting(false);
        return;
      }

      const result = json.data;

      // Update ability metrics
      setAbilityEstimate(result.currentAbility ?? abilityEstimate);
      setStandardError(result.standardError ?? standardError);
      setPassingProbability(result.passingProbability ?? passingProbability);
      setQuestionsAnswered((prev) => prev + 1);

      if (result.completed) {
        // CAT is finished - redirect to results
        router.push(`/practice/cat/${sessionId}/results`);
        return;
      }

      // Load next question
      if (result.nextQuestion) {
        setCurrentQuestion(result.nextQuestion);
        setUserAnswer(null);
        questionStartTimeRef.current = Date.now();
      }

      setSubmitting(false);
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setError("Failed to submit answer. Please try again.");
      setSubmitting(false);
    }
  }, [
    userAnswer,
    submitting,
    sessionId,
    currentQuestion,
    abilityEstimate,
    standardError,
    passingProbability,
    router,
  ]);

  // Ability meter calculation (normalize -3..3 to 0..100)
  const abilityPercent = ((abilityEstimate + 3) / 6) * 100;
  const passingLine = 50; // 0 on the scale

  // Map the API question to QuestionRenderer's QuestionData format
  const questionData: QuestionData | null = currentQuestion
    ? {
        id: currentQuestion.id,
        questionText: currentQuestion.questionText || currentQuestion.text || "",
        questionType: currentQuestion.questionType || currentQuestion.type || "multiple_choice",
        options: currentQuestion.options,
        scenario: currentQuestion.scenario,
        difficulty: currentQuestion.difficulty,
        categoryName: currentQuestion.categoryName || currentQuestion.category,
        hotSpotData: currentQuestion.hotSpotData,
      }
    : null;

  // Determine difficulty label from numeric value
  const getDifficultyInfo = () => {
    const diff =
      currentQuestion?.difficultyValue ??
      currentQuestion?.difficulty ??
      0;
    if (typeof diff === "number") {
      if (diff >= 2) return { label: "Hard", className: "bg-red-500/10 text-red-600" };
      if (diff >= 0) return { label: "Medium", className: "bg-amber-500/10 text-amber-600" };
      return { label: "Easy", className: "bg-emerald-500/10 text-emerald-600" };
    }
    // String difficulty
    if (diff === "hard") return { label: "Hard", className: "bg-red-500/10 text-red-600" };
    if (diff === "easy") return { label: "Easy", className: "bg-emerald-500/10 text-emerald-600" };
    return { label: "Medium", className: "bg-amber-500/10 text-amber-600" };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Loading CAT session...
          </p>
        </div>
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/practice/cat">Back to CAT</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const difficultyInfo = getDifficultyInfo();
  const categoryName =
    currentQuestion?.categoryName ||
    currentQuestion?.category ||
    "General";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/practice/cat">
              <X className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium">CAT Simulation</p>
            <p className="text-xs text-muted-foreground">
              Question {questionsAnswered + 1} &middot; {questionsAnswered}{" "}
              answered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-medium",
              timeRemaining <= 1800
                ? "bg-red-500/10 text-red-600"
                : timeRemaining <= 3600
                ? "bg-amber-500/10 text-amber-600"
                : "bg-muted text-foreground"
            )}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </div>
          <Badge variant="secondary">
            {questionsAnswered}/{maxQuestions}
          </Badge>
        </div>
      </motion.div>

      {/* Ability Meter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Ability Estimate</span>
              </div>
              <div className="flex items-center gap-1.5">
                {abilityEstimate > 0.3 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : abilityEstimate < -0.3 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <Minus className="h-4 w-4 text-amber-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-bold",
                    abilityEstimate > 0.3
                      ? "text-emerald-600"
                      : abilityEstimate < -0.3
                      ? "text-red-600"
                      : "text-amber-600"
                  )}
                >
                  {abilityEstimate > 0 ? "+" : ""}
                  {abilityEstimate.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="relative h-4 rounded-full bg-gradient-to-r from-red-500/20 via-amber-500/20 to-emerald-500/20 overflow-hidden">
              {/* Passing line marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-foreground/40 z-10"
                style={{ left: `${passingLine}%` }}
              />
              {/* Ability indicator */}
              <motion.div
                className={cn(
                  "absolute top-0.5 h-3 w-3 rounded-full shadow-md z-20",
                  abilityEstimate >= 0 ? "bg-emerald-500" : "bg-red-500"
                )}
                animate={{ left: `calc(${abilityPercent}% - 6px)` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">
                Below Passing
              </span>
              <span className="text-[10px] text-muted-foreground">
                Passing Standard
              </span>
              <span className="text-[10px] text-muted-foreground">
                Above Passing
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Question Card */}
      {questionData && (
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {categoryName}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", difficultyInfo.className)}
                >
                  {difficultyInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuestionRenderer
                question={questionData}
                userAnswer={userAnswer}
                onAnswerChange={setUserAnswer}
                disabled={submitting}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error Notice */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Warning Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
      >
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          You cannot go back to previous questions. Make sure you are confident
          in your answer before submitting.
        </p>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end gap-3"
      >
        <Button
          onClick={handleSubmitAnswer}
          disabled={userAnswer === null || userAnswer === undefined || submitting}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1.5" />
              Submit Answer
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
