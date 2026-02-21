"use client";

import { useState, useEffect } from "react";
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
  Clock,
  Send,
  ChevronRight,
  Gauge,
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
} from "lucide-react";

interface CATQuestion {
  id: number;
  text: string;
  options: { label: string; text: string }[];
  difficulty: number; // -3 to 3 scale
  category: string;
}

const catQuestions: CATQuestion[] = [
  {
    id: 1,
    text: "A nurse is assessing a client who has been receiving total parenteral nutrition (TPN). Which laboratory value indicates a need for the nurse to contact the healthcare provider?",
    options: [
      { label: "A", text: "Serum albumin 3.8 g/dL" },
      { label: "B", text: "Blood glucose 320 mg/dL" },
      { label: "C", text: "Serum sodium 140 mEq/L" },
      { label: "D", text: "BUN 18 mg/dL" },
    ],
    difficulty: 0,
    category: "Reduction of Risk Potential",
  },
  {
    id: 2,
    text: "A nurse is caring for a client with a chest tube connected to a water-seal drainage system. Which finding requires immediate nursing intervention?",
    options: [
      { label: "A", text: "Continuous bubbling in the water-seal chamber" },
      { label: "B", text: "Gentle tidaling in the water-seal chamber" },
      { label: "C", text: "100 mL of drainage in the first hour" },
      { label: "D", text: "The drainage system is below the level of the chest" },
    ],
    difficulty: 1,
    category: "Physiological Adaptation",
  },
  {
    id: 3,
    text: "A client with type 1 diabetes is admitted with diabetic ketoacidosis (DKA). Which arterial blood gas results would the nurse expect?",
    options: [
      { label: "A", text: "pH 7.50, PaCO2 30, HCO3 24" },
      { label: "B", text: "pH 7.28, PaCO2 28, HCO3 14" },
      { label: "C", text: "pH 7.48, PaCO2 48, HCO3 32" },
      { label: "D", text: "pH 7.35, PaCO2 40, HCO3 22" },
    ],
    difficulty: 2,
    category: "Physiological Adaptation",
  },
  {
    id: 4,
    text: "A nurse is prioritizing care for multiple clients. Which client should the nurse assess first?",
    options: [
      { label: "A", text: "A client with a blood glucose of 180 mg/dL" },
      { label: "B", text: "A client 2 days postop with a temperature of 99.8\u00b0F" },
      { label: "C", text: "A client with COPD and an oxygen saturation of 87%" },
      { label: "D", text: "A client with a newly applied cast reporting numbness" },
    ],
    difficulty: 1,
    category: "Management of Care",
  },
  {
    id: 5,
    text: "A nurse is administering IV potassium chloride to a client with hypokalemia. Which action is essential before starting the infusion?",
    options: [
      { label: "A", text: "Verify the client has adequate urine output" },
      { label: "B", text: "Administer a test dose of 5 mEq" },
      { label: "C", text: "Place the client on a cardiac monitor" },
      { label: "D", text: "Both A and C" },
    ],
    difficulty: 1,
    category: "Pharmacological Therapies",
  },
];

export default function CATSessionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [abilityEstimate, setAbilityEstimate] = useState(0);
  const [abilityHistory, setAbilityHistory] = useState<number[]>([0]);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60 * 60); // 5 hours

  const question = catQuestions[currentQuestion];
  const totalPossible = 145;

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);

    // Simulate ability estimate change
    const isCorrect = Math.random() > 0.4;
    const change = isCorrect ? 0.15 + Math.random() * 0.2 : -(0.1 + Math.random() * 0.15);
    const newAbility = Math.max(-3, Math.min(3, abilityEstimate + change));
    setAbilityEstimate(newAbility);
    setAbilityHistory((prev) => [...prev, newAbility]);
    setQuestionsAnswered((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentQuestion >= catQuestions.length - 1) {
      router.push(`/practice/cat/${sessionId}/results`);
      return;
    }
    setCurrentQuestion((prev) => prev + 1);
    setSelectedAnswer(null);
    setIsSubmitted(false);
  };

  // Ability meter calculation (normalize -3..3 to 0..100)
  const abilityPercent = ((abilityEstimate + 3) / 6) * 100;
  const passingLine = 50; // 0 on the scale

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
            {questionsAnswered}/{totalPossible}
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
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {question.category}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  question.difficulty >= 2
                    ? "bg-red-500/10 text-red-600"
                    : question.difficulty >= 0
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-emerald-500/10 text-emerald-600"
                )}
              >
                {question.difficulty >= 2
                  ? "Hard"
                  : question.difficulty >= 0
                  ? "Medium"
                  : "Easy"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-base font-medium leading-relaxed">
                {question.text}
              </p>
            </div>

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selectedAnswer === option.label;
                return (
                  <motion.div
                    key={option.label}
                    whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                  >
                    <div
                      onClick={() => !isSubmitted && setSelectedAnswer(option.label)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                        isSubmitted
                          ? "cursor-default"
                          : "cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border",
                        !isSubmitted && !isSelected && "hover:border-primary/40 hover:bg-muted/50"
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
                          isSelected
                            ? "font-medium"
                            : "text-muted-foreground"
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

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end gap-3"
      >
        {!isSubmitted ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            <Send className="h-4 w-4 mr-1.5" />
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentQuestion >= catQuestions.length - 1
              ? "View Results"
              : "Next Question"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}
