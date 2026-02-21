"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "motion/react";
import {
  Brain,
  Play,
  Clock,
  Timer,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  Settings2,
  Sparkles,
  TrendingUp,
  Target,
  Layers,
} from "lucide-react";

const nclexCategories = [
  {
    id: "management-of-care",
    name: "Management of Care",
    questions: 182,
    color: "bg-indigo-500",
  },
  {
    id: "safety-infection",
    name: "Safety & Infection Control",
    questions: 124,
    color: "bg-emerald-500",
  },
  {
    id: "health-promotion",
    name: "Health Promotion & Maintenance",
    questions: 96,
    color: "bg-amber-500",
  },
  {
    id: "psychosocial",
    name: "Psychosocial Integrity",
    questions: 108,
    color: "bg-purple-500",
  },
  {
    id: "basic-care",
    name: "Basic Care & Comfort",
    questions: 134,
    color: "bg-blue-500",
  },
  {
    id: "pharmacology",
    name: "Pharmacological Therapies",
    questions: 156,
    color: "bg-pink-500",
  },
  {
    id: "risk-reduction",
    name: "Reduction of Risk Potential",
    questions: 142,
    color: "bg-orange-500",
  },
  {
    id: "physiological",
    name: "Physiological Adaptation",
    questions: 118,
    color: "bg-red-500",
  },
];

const recentResults = [
  {
    id: "r1",
    title: "Pharmacology",
    score: 82,
    total: 25,
    correct: 20,
    date: "2h ago",
  },
  {
    id: "r2",
    title: "Management of Care",
    score: 90,
    total: 50,
    correct: 45,
    date: "Yesterday",
  },
  {
    id: "r3",
    title: "Mixed Categories",
    score: 68,
    total: 100,
    correct: 68,
    date: "3 days ago",
  },
  {
    id: "r4",
    title: "Safety & Infection",
    score: 76,
    total: 10,
    correct: 8,
    date: "5 days ago",
  },
];

export default function QuizSetupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState("25");
  const [timerEnabled, setTimerEnabled] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedCategories.length === nclexCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(nclexCategories.map((c) => c.id));
    }
  };

  const handleStartQuiz = () => {
    const sessionId = `quiz-${Date.now()}`;
    router.push(`/practice/quiz/${sessionId}`);
  };

  return (
    <div className="space-y-8">
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
          <h1 className="text-2xl lg:text-3xl font-bold">Quiz Setup</h1>
          <p className="text-muted-foreground text-sm">
            Customize your quiz settings and start practicing
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Setup Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      Select Categories
                    </CardTitle>
                    <CardDescription>
                      Choose one or more NCLEX categories to focus on
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="text-xs"
                  >
                    {selectedCategories.length === nclexCategories.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nclexCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
                      selectedCategories.includes(category.id)
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.questions} questions available
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        category.color
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  Quiz Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">
                        Easy - Foundation Level
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium - Application Level
                      </SelectItem>
                      <SelectItem value="hard">
                        Hard - Analysis Level
                      </SelectItem>
                      <SelectItem value="mixed">
                        Mixed - All Difficulties
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of Questions
                  </label>
                  <Select
                    value={questionCount}
                    onValueChange={setQuestionCount}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Questions (~10 min)</SelectItem>
                      <SelectItem value="25">25 Questions (~25 min)</SelectItem>
                      <SelectItem value="50">50 Questions (~50 min)</SelectItem>
                      <SelectItem value="100">
                        100 Questions (~100 min)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timer Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Timer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Enable Timer</p>
                      <p className="text-xs text-muted-foreground">
                        1 minute per question countdown
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => setTimerEnabled(!timerEnabled)}
                    className={cn(
                      "relative h-6 w-11 rounded-full cursor-pointer transition-colors duration-200",
                      timerEnabled ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                        timerEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={handleStartQuiz}
                  size="lg"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                  disabled={selectedCategories.length === 0}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Quiz ({questionCount} Questions)
                </Button>
                {selectedCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Select at least one category to begin
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Results Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Recent Quiz Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold",
                        result.score >= 80
                          ? "bg-emerald-500/10 text-emerald-600"
                          : result.score >= 65
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-red-500/10 text-red-600"
                      )}
                    >
                      {result.score}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.correct}/{result.total} correct &middot;{" "}
                        {result.date}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">AI Suggestion</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on your recent scores, try focusing on{" "}
                  <strong>Pharmacological Therapies</strong> at{" "}
                  <strong>medium difficulty</strong> with 25 questions for
                  optimal improvement.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategories(["pharmacology"]);
                    setDifficulty("medium");
                    setQuestionCount("25");
                  }}
                >
                  Apply Suggestion
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
