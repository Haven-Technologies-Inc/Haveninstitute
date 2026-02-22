"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  X,
  Loader2,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: any;
  difficulty: string;
  scenario?: string;
  hotSpotData?: any;
  category: { name: string; code: string };
}

interface QuizResponse {
  id: string;
  questionId: string;
  userAnswer: any;
  questionIndex: number;
  question: QuizQuestion;
}

interface QuizSessionData {
  id: string;
  status: string;
  totalQuestions: number;
  timeLimitMinutes: number | null;
  difficulty: string;
  questionCount: number;
  responses: QuizResponse[];
}

interface SubmitResult {
  isCorrect: boolean;
  score: number;
}

interface CompleteResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTimeSeconds: number;
  passed: boolean;
}

export default function QuizSessionPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const sessionApi = useApi<QuizSessionData>();
  const submitApi = useApi<SubmitResult>();
  const completeApi = useApi<CompleteResult>();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Track time spent per question
  const questionStartTime = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());
  const questionTimeSpent = useRef<Record<string, number>>({});

  // Load session data
  useEffect(() => {
    sessionApi.get(`/api/quiz/${sessionId}`);
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up timer when session loads
  useEffect(() => {
    if (sessionApi.data) {
      const session = sessionApi.data;
      if (session.status === "completed") {
        router.replace(`/practice/quiz/${sessionId}/results`);
        return;
      }
      if (session.timeLimitMinutes) {
        setTimerEnabled(true);
        setTimeRemaining(session.timeLimitMinutes * 60);
      }
      // Restore answers from existing responses
      if (session.responses?.length) {
        const existingAnswers: Record<string, any> = {};
        session.responses.forEach((r) => {
          if (r.userAnswer !== null && r.userAnswer !== undefined) {
            existingAnswers[r.questionId] = r.userAnswer;
          }
        });
        setAnswers(existingAnswers);
      }
    }
  }, [sessionApi.data, sessionId, router]);

  // Extract questions from the session responses
  const questions: QuizQuestion[] =
    sessionApi.data?.responses?.map((r) => r.question) ?? [];
  const totalQuestions = sessionApi.data?.totalQuestions ?? questions.length;
  const question = questions[currentQuestion];
  const progress =
    totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  // Timer countdown
  useEffect(() => {
    if (!timerEnabled || timeRemaining === null || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEnabled, timeRemaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Track question time when navigating
  const recordQuestionTime = useCallback(() => {
    if (question) {
      const elapsed = Math.round((Date.now() - questionStartTime.current) / 1000);
      const prev = questionTimeSpent.current[question.id] ?? 0;
      questionTimeSpent.current[question.id] = prev + elapsed;
    }
    questionStartTime.current = Date.now();
  }, [question]);

  const selectAnswer = useCallback(
    (answer: any) => {
      if (!question) return;
      setAnswers((prev) => ({ ...prev, [question.id]: answer }));
    },
    [question]
  );

  // Submit answer for current question to API
  const submitCurrentAnswer = useCallback(async () => {
    if (!question) return;
    const userAnswer = answers[question.id];
    if (userAnswer === undefined || userAnswer === null) return;

    const timeSpent = questionTimeSpent.current[question.id] ?? 0;

    await submitApi.post(`/api/quiz/${sessionId}`, {
      questionId: question.id,
      userAnswer,
      questionIndex: currentQuestion,
      timeSpentSeconds: timeSpent,
    });
  }, [question, answers, currentQuestion, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFlag = () => {
    if (!question) return;
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.add(question.id);
      }
      return next;
    });
  };

  const goNext = async () => {
    if (currentQuestion < totalQuestions - 1) {
      recordQuestionTime();
      await submitCurrentAnswer();
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const goPrev = async () => {
    if (currentQuestion > 0) {
      recordQuestionTime();
      await submitCurrentAnswer();
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const goToQuestion = async (index: number) => {
    if (index === currentQuestion) return;
    recordQuestionTime();
    await submitCurrentAnswer();
    setCurrentQuestion(index);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Submit current answer first
      recordQuestionTime();
      await submitCurrentAnswer();

      // Submit any unanswered questions that have answers
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.id !== question?.id && answers[q.id] !== undefined) {
          await submitApi.post(`/api/quiz/${sessionId}`, {
            questionId: q.id,
            userAnswer: answers[q.id],
            questionIndex: i,
            timeSpentSeconds: questionTimeSpent.current[q.id] ?? 0,
          });
        }
      }

      // Complete the quiz
      const totalTimeSeconds = Math.round(
        (Date.now() - sessionStartTime.current) / 1000
      );

      const result = await completeApi.patch(`/api/quiz/${sessionId}`, {
        totalTimeSeconds,
      });

      if (result) {
        router.push(`/practice/quiz/${sessionId}/results`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isLastQuestion = currentQuestion === totalQuestions - 1;

  // Loading state
  if (sessionApi.loading || !sessionApi.data) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading quiz session...</p>
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
            <h2 className="text-lg font-semibold">Error Loading Quiz</h2>
            <p className="text-sm text-muted-foreground">{sessionApi.error}</p>
            <Button variant="outline" asChild>
              <Link href="/practice/quiz">Back to Quiz Setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No questions loaded yet
  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-semibold">No Questions Found</h2>
            <p className="text-sm text-muted-foreground">
              This quiz session has no questions. Please try creating a new quiz.
            </p>
            <Button variant="outline" asChild>
              <Link href="/practice/quiz">Back to Quiz Setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Link href="/practice/quiz">
              <X className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium">Quiz Session</p>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestion + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {timerEnabled && timeRemaining !== null && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-medium",
                timeRemaining <= 60
                  ? "bg-red-500/10 text-red-600"
                  : timeRemaining <= 180
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-muted text-foreground"
              )}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
          <Badge variant="secondary">
            {answeredCount}/{totalQuestions} answered
          </Badge>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Progress value={progress} className="h-2" />
      </motion.div>

      {/* Question Card */}
      {question && (
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {question.category?.name ?? "Uncategorized"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      question.difficulty === "hard"
                        ? "bg-red-500/10 text-red-600"
                        : question.difficulty === "medium"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-emerald-500/10 text-emerald-600"
                    )}
                  >
                    {question.difficulty
                      ? question.difficulty.charAt(0).toUpperCase() +
                        question.difficulty.slice(1)
                      : "Mixed"}
                  </Badge>
                </div>
                <Button
                  variant={
                    flaggedQuestions.has(question.id) ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={toggleFlag}
                  className={cn(
                    flaggedQuestions.has(question.id) &&
                      "bg-amber-500 hover:bg-amber-600 text-white"
                  )}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {flaggedQuestions.has(question.id) ? "Flagged" : "Flag"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuestionRenderer
                question={{
                  id: question.id,
                  questionText: question.questionText,
                  questionType: question.questionType,
                  options: question.options,
                  scenario: question.scenario,
                  difficulty: question.difficulty,
                  categoryName: question.category?.name,
                  hotSpotData: question.hotSpotData,
                }}
                userAnswer={answers[question.id] ?? null}
                onAnswerChange={selectAnswer}
                showResult={false}
                disabled={submitting}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Question Navigator Dots */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-1.5 flex-wrap"
      >
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => goToQuestion(i)}
            className={cn(
              "h-8 w-8 rounded-lg text-xs font-medium transition-all duration-200",
              i === currentQuestion
                ? "bg-primary text-primary-foreground shadow-sm"
                : answers[q.id] !== undefined
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                : flaggedQuestions.has(q.id)
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {i + 1}
          </button>
        ))}
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentQuestion === 0 || submitting}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {isLastQuestion ? (
            <>
              {showSubmitConfirm ? (
                <div className="flex items-center gap-2 p-3 bg-card border rounded-xl shadow-lg">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    {answeredCount < totalQuestions
                      ? `${totalQuestions - answeredCount} unanswered. Submit anyway?`
                      : "Submit your quiz?"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSubmitConfirm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  disabled={submitting}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Submit Quiz
                </Button>
              )}
            </>
          ) : (
            <Button onClick={goNext} disabled={submitting}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
