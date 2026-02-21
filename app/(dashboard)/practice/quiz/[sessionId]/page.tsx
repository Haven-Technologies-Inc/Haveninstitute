"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: { label: string; text: string }[];
  category: string;
  difficulty: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "A nurse is caring for a client who has been prescribed warfarin. Which laboratory value should the nurse monitor most closely?",
    options: [
      { label: "A", text: "Complete blood count (CBC)" },
      { label: "B", text: "International Normalized Ratio (INR)" },
      { label: "C", text: "Blood urea nitrogen (BUN)" },
      { label: "D", text: "Serum potassium level" },
    ],
    category: "Pharmacological Therapies",
    difficulty: "Medium",
  },
  {
    id: 2,
    text: "A client is admitted with suspected myocardial infarction. Which nursing intervention should be performed first?",
    options: [
      { label: "A", text: "Administer sublingual nitroglycerin" },
      { label: "B", text: "Obtain a 12-lead ECG" },
      { label: "C", text: "Draw cardiac enzyme levels" },
      { label: "D", text: "Establish IV access and administer oxygen" },
    ],
    category: "Physiological Adaptation",
    difficulty: "Hard",
  },
  {
    id: 3,
    text: "Which assessment finding should the nurse report immediately for a client receiving a blood transfusion?",
    options: [
      { label: "A", text: "Temperature of 99.0\u00b0F (37.2\u00b0C)" },
      { label: "B", text: "Back pain and dark urine" },
      { label: "C", text: "Mild itching at the IV site" },
      { label: "D", text: "Heart rate increase from 72 to 80 bpm" },
    ],
    category: "Reduction of Risk Potential",
    difficulty: "Medium",
  },
  {
    id: 4,
    text: "A nurse is teaching a client about digoxin. Which statement by the client indicates understanding of the teaching?",
    options: [
      { label: "A", text: "\"I will take my pulse before each dose.\"" },
      { label: "B", text: "\"I can take this medication with antacids.\"" },
      { label: "C", text: "\"I should double up if I miss a dose.\"" },
      { label: "D", text: "\"I will increase my potassium intake only if I feel weak.\"" },
    ],
    category: "Pharmacological Therapies",
    difficulty: "Easy",
  },
  {
    id: 5,
    text: "A nurse is caring for a client in Buck\u2019s traction. Which finding indicates a complication that requires immediate intervention?",
    options: [
      { label: "A", text: "The weights are hanging freely" },
      { label: "B", text: "The client reports numbness and tingling in the affected extremity" },
      { label: "C", text: "The knots in the rope are not touching the pulley" },
      { label: "D", text: "The client is in a supine position" },
    ],
    category: "Basic Care & Comfort",
    difficulty: "Medium",
  },
  {
    id: 6,
    text: "A nurse is planning care for a client who is at risk for falls. Which intervention is most appropriate?",
    options: [
      { label: "A", text: "Apply bilateral wrist restraints" },
      { label: "B", text: "Keep the bed in the lowest position with side rails up" },
      { label: "C", text: "Administer a sedative at bedtime" },
      { label: "D", text: "Restrict the client to bed rest" },
    ],
    category: "Safety & Infection Control",
    difficulty: "Easy",
  },
  {
    id: 7,
    text: "Which priority nursing diagnosis is most appropriate for a client experiencing a panic attack?",
    options: [
      { label: "A", text: "Disturbed sleep pattern" },
      { label: "B", text: "Anxiety" },
      { label: "C", text: "Social isolation" },
      { label: "D", text: "Ineffective coping" },
    ],
    category: "Psychosocial Integrity",
    difficulty: "Easy",
  },
  {
    id: 8,
    text: "A nurse is caring for a postoperative client who develops a wound evisceration. What is the priority nursing action?",
    options: [
      { label: "A", text: "Cover the wound with sterile saline-soaked dressings" },
      { label: "B", text: "Attempt to replace the organs into the abdominal cavity" },
      { label: "C", text: "Apply an abdominal binder tightly" },
      { label: "D", text: "Position the client in high Fowler\u2019s position" },
    ],
    category: "Physiological Adaptation",
    difficulty: "Hard",
  },
  {
    id: 9,
    text: "A nurse is providing discharge teaching to a new mother about infant care. Which topic is most important to address regarding safe sleep practices?",
    options: [
      { label: "A", text: "The infant should sleep on the stomach" },
      { label: "B", text: "The infant should be placed on the back to sleep" },
      { label: "C", text: "Soft blankets and pillows should be in the crib" },
      { label: "D", text: "Co-sleeping is the safest sleeping arrangement" },
    ],
    category: "Health Promotion & Maintenance",
    difficulty: "Easy",
  },
  {
    id: 10,
    text: "A charge nurse is delegating tasks to a licensed practical nurse (LPN). Which task is most appropriate to delegate?",
    options: [
      { label: "A", text: "Develop a nursing care plan for a newly admitted client" },
      { label: "B", text: "Collect data from a client with stable vital signs" },
      { label: "C", text: "Evaluate the effectiveness of pain medication" },
      { label: "D", text: "Perform the initial assessment of a newly admitted client" },
    ],
    category: "Management of Care",
    difficulty: "Medium",
  },
];

export default function QuizSessionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 min for 10 questions
  const [timerEnabled] = useState(true);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const questions = sampleQuestions;
  const totalQuestions = questions.length;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (!timerEnabled || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEnabled, timeRemaining]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const toggleFlag = () => {
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

  const goNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    router.push(`/practice/quiz/${sessionId}/results`);
  };

  const isLastQuestion = currentQuestion === totalQuestions - 1;

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
          {timerEnabled && (
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
                  {question.category}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    question.difficulty === "Hard"
                      ? "bg-red-500/10 text-red-600"
                      : question.difficulty === "Medium"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  )}
                >
                  {question.difficulty}
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
            {/* Question Text */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-base font-medium leading-relaxed">
                {question.text}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option.label;
                return (
                  <motion.div
                    key={option.label}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      onClick={() => selectAnswer(question.id, option.label)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </div>
                      <p
                        className={cn(
                          "text-sm transition-colors",
                          isSelected ? "font-medium" : "text-muted-foreground"
                        )}
                      >
                        {option.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
            onClick={() => setCurrentQuestion(i)}
            className={cn(
              "h-8 w-8 rounded-lg text-xs font-medium transition-all duration-200",
              i === currentQuestion
                ? "bg-primary text-primary-foreground shadow-sm"
                : answers[q.id]
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
          disabled={currentQuestion === 0}
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
                  <Button size="sm" variant="ghost" onClick={() => setShowSubmitConfirm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSubmit}>
                    Confirm
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Submit Quiz
                </Button>
              )}
            </>
          ) : (
            <Button onClick={goNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
