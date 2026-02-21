"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  Calendar,
  Target,
  BookOpen,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const NCLEX_CATEGORIES = [
  "Management of Care",
  "Safety and Infection Control",
  "Health Promotion and Maintenance",
  "Psychosocial Integrity",
  "Basic Care and Comfort",
  "Pharmacological Therapies",
  "Reduction of Risk Potential",
  "Physiological Adaptation",
];

const STUDY_GOALS = [
  { id: "pass-first-try", label: "Pass NCLEX on first attempt" },
  { id: "improve-weak-areas", label: "Improve weak areas" },
  { id: "build-confidence", label: "Build test-taking confidence" },
  { id: "daily-practice", label: "Consistent daily practice" },
  { id: "timed-practice", label: "Improve time management" },
  { id: "comprehensive-review", label: "Comprehensive content review" },
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [nclexType, setNclexType] = useState<"RN" | "PN" | null>(null);
  const [examDate, setExamDate] = useState("");
  const [studyGoals, setStudyGoals] = useState<string[]>([]);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return nclexType !== null;
      case 2:
        return true; // Exam date is optional
      case 3:
        return studyGoals.length > 0;
      case 4:
        return true; // Weak areas are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleStudyGoal = (goalId: string) => {
    setStudyGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const toggleWeakArea = (area: string) => {
    setWeakAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nclexType,
          examDate: examDate || null,
          studyGoals,
          weakAreas,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save onboarding data");
      }

      // Update the session to reflect completed onboarding
      await update({ hasCompletedOnboarding: true });

      toast.success("Setup complete! Welcome to Haven Institute.");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save your preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {Math.round(progressValue)}% complete
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      <Card glass className="border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-indigo-500/5">
        <AnimatePresence mode="wait">
          {/* Step 1: NCLEX Type */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3">
                  <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Stethoscope className="h-7 w-7 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">
                  Which NCLEX exam are you preparing for?
                </CardTitle>
                <CardDescription>
                  Select your exam type to personalize your study experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* RN Card */}
                  <button
                    type="button"
                    onClick={() => setNclexType("RN")}
                    className={cn(
                      "relative p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md",
                      nclexType === "RN"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-md shadow-indigo-500/10"
                        : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700"
                    )}
                  >
                    {nclexType === "RN" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </motion.div>
                    )}
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-3 shadow-sm">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">NCLEX-RN</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Registered Nurse
                    </p>
                  </button>

                  {/* PN Card */}
                  <button
                    type="button"
                    onClick={() => setNclexType("PN")}
                    className={cn(
                      "relative p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md",
                      nclexType === "PN"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-md shadow-purple-500/10"
                        : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-purple-300 dark:hover:border-purple-700"
                    )}
                  >
                    {nclexType === "PN" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </motion.div>
                    )}
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-3 shadow-sm">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">NCLEX-PN</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Practical Nurse
                    </p>
                  </button>
                </div>
              </CardContent>
            </motion.div>
          )}

          {/* Step 2: Exam Date */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3">
                  <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">
                  When is your exam date?
                </CardTitle>
                <CardDescription>
                  We&apos;ll create a personalized study schedule based on your
                  timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="examDate" className="text-sm font-medium">
                    Exam Date (optional)
                  </Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-11 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                  />
                </div>

                {examDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-4"
                  >
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(examDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>{" "}
                      until your exam. We&apos;ll optimize your study plan
                      accordingly.
                    </p>
                  </motion.div>
                )}

                <button
                  type="button"
                  onClick={() => setExamDate("")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  I haven&apos;t scheduled my exam yet
                </button>
              </CardContent>
            </motion.div>
          )}

          {/* Step 3: Study Goals */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3">
                  <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">
                  What are your study goals?
                </CardTitle>
                <CardDescription>
                  Select all that apply to customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {STUDY_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleStudyGoal(goal.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-lg border transition-all duration-200 text-left",
                      studyGoals.includes(goal.id)
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-300 dark:hover:border-emerald-700"
                    )}
                  >
                    <Checkbox
                      checked={studyGoals.includes(goal.id)}
                      onCheckedChange={() => toggleStudyGoal(goal.id)}
                      className="pointer-events-none"
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        studyGoals.includes(goal.id)
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-foreground"
                      )}
                    >
                      {goal.label}
                    </span>
                  </button>
                ))}
              </CardContent>
            </motion.div>
          )}

          {/* Step 4: Weak Areas */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3">
                  <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">
                  Any areas you&apos;d like to focus on?
                </CardTitle>
                <CardDescription>
                  Select topics where you need the most improvement (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                <div className="flex flex-wrap gap-2">
                  {NCLEX_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleWeakArea(category)}
                    >
                      <Badge
                        variant={
                          weakAreas.includes(category) ? "default" : "outline"
                        }
                        className={cn(
                          "cursor-pointer px-3 py-1.5 text-sm transition-all duration-200",
                          weakAreas.includes(category)
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-sm"
                            : "border-gray-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-zinc-900"
                        )}
                      >
                        {category}
                      </Badge>
                    </button>
                  ))}
                </div>

                {weakAreas.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {weakAreas.length} area{weakAreas.length > 1 ? "s" : ""}{" "}
                    selected. We&apos;ll prioritize these in your study plan.
                  </motion.p>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200"
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-green-500/25 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Complete setup
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => {
              if (step < currentStep) setCurrentStep(step);
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              step === currentStep
                ? "w-8 bg-indigo-600 dark:bg-indigo-400"
                : step < currentStep
                  ? "w-2 bg-indigo-400 dark:bg-indigo-600 cursor-pointer hover:bg-indigo-500"
                  : "w-2 bg-gray-200 dark:bg-zinc-700"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
