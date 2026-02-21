"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "motion/react";
import {
  Trophy,
  Play,
  ArrowLeft,
  Clock,
  Brain,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Info,
  CheckCircle2,
  XCircle,
  Sparkles,
  Gauge,
  BookOpen,
  Target,
  Layers,
  Loader2,
} from "lucide-react";

const catRules = [
  {
    icon: Layers,
    title: "60 - 145 Questions",
    desc: "The test adapts based on your performance. You may answer anywhere from 60 to 145 questions.",
  },
  {
    icon: Clock,
    title: "5 Hour Time Limit",
    desc: "You have a maximum of 5 hours to complete the entire examination.",
  },
  {
    icon: Brain,
    title: "Adaptive Difficulty",
    desc: "Questions get harder when you answer correctly and easier when you answer incorrectly.",
  },
  {
    icon: AlertTriangle,
    title: "No Going Back",
    desc: "Once you submit an answer, you cannot return to previous questions.",
  },
  {
    icon: Target,
    title: "Pass/Fail Decision",
    desc: "The algorithm determines your competence level with 95% confidence before stopping.",
  },
  {
    icon: ShieldCheck,
    title: "All Question Types",
    desc: "Includes multiple choice, select all that apply, ordered response, and fill-in-the-blank.",
  },
];

interface PastResult {
  id: string;
  date: string;
  type: string;
  result: string;
  questions: number;
  confidence: number;
  ability: number;
}

export default function CATStartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [examType, setExamType] = useState("rn");
  const [pastResults, setPastResults] = useState<PastResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch past CAT results
  useEffect(() => {
    async function fetchPastResults() {
      try {
        const res = await fetch("/api/cat?limit=5");
        const json = await res.json();
        if (json.success && json.data) {
          const mapped = json.data.map((s: any) => ({
            id: s.id,
            date: new Date(s.completedAt || s.createdAt).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            ),
            type: (s.nclexType || "RN").toUpperCase(),
            result: s.passed ? "Pass" : "Fail",
            questions: s.totalQuestions || s.responses?.length || 0,
            confidence: Math.round(
              (s.confidence || (1 - (s.standardError || 0.5))) * 100
            ),
            ability: s.finalAbility ?? s.currentAbility ?? 0,
          }));
          setPastResults(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch past CAT results:", err);
      } finally {
        setLoadingResults(false);
      }
    }
    fetchPastResults();
  }, []);

  const handleBeginCAT = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/cat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nclexType: examType,
          minQuestions: examType === "rn" ? 60 : 60,
          maxQuestions: examType === "rn" ? 145 : 145,
          timeLimitSeconds: 5 * 60 * 60,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        // Store the initial session data (including currentQuestion) in sessionStorage
        sessionStorage.setItem(
          `cat-session-${json.data.id}`,
          JSON.stringify(json.data)
        );
        router.push(`/practice/cat/${json.data.id}`);
      } else {
        setError(json.error || "Failed to start CAT session.");
        setStarting(false);
      }
    } catch (err) {
      console.error("Failed to start CAT session:", err);
      setError("Something went wrong. Please try again.");
      setStarting(false);
    }
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
          <h1 className="text-2xl lg:text-3xl font-bold">CAT Simulator</h1>
          <p className="text-muted-foreground text-sm">
            Computer Adaptive Testing - Just like the real NCLEX
          </p>
        </div>
      </motion.div>

      {/* Explanation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22%20opacity=%220.05%22/%3E%3C/svg%3E')] opacity-30" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">
              What is Computer Adaptive Testing?
            </h2>
            <p className="text-white/90 text-sm leading-relaxed max-w-2xl">
              CAT is the format used by the actual NCLEX examination. Unlike
              traditional tests, CAT adjusts the difficulty of each question
              based on your previous answers. If you answer correctly, the next
              question will be harder. If you answer incorrectly, it will be
              easier. The test continues until the algorithm determines your
              competence level with 95% confidence, or you reach the maximum
              number of questions.
            </p>
          </div>
        </div>
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Setup & Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rules Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  CAT Rules & Guidelines
                </CardTitle>
                <CardDescription>
                  Understand the format before you begin
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catRules.map((rule, i) => (
                  <motion.div
                    key={rule.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <rule.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rule.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rule.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Exam Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">NCLEX Type</label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rn">
                        NCLEX-RN (Registered Nurse)
                      </SelectItem>
                      <SelectItem value="pn">
                        NCLEX-PN (Practical Nurse)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <p className="text-xs text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleBeginCAT}
                  disabled={starting}
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
                >
                  {starting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Starting CAT...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Begin CAT Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Past Results Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Past CAT Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingResults ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : pastResults.length === 0 ? (
                  <div className="text-center py-6">
                    <Brain className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No past CAT results yet
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Complete your first CAT to see results here
                    </p>
                  </div>
                ) : (
                  pastResults.map((r) => (
                    <Link
                      key={r.id}
                      href={`/practice/cat/${r.id}/results`}
                      className="block"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                            r.result === "Pass"
                              ? "bg-emerald-500/10"
                              : "bg-red-500/10"
                          )}
                        >
                          {r.result === "Pass" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium">{r.result}</p>
                            <Badge variant="outline" className="text-[10px]">
                              {r.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {r.questions} Qs &middot; {r.confidence}% confidence
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {r.date}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium">Ability</p>
                          <p
                            className={cn(
                              "text-sm font-bold",
                              r.ability >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            )}
                          >
                            {r.ability > 0 ? "+" : ""}
                            {r.ability.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tip Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <h3 className="font-semibold text-sm">Pro Tip</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Treat each CAT simulation like the real exam. Find a quiet
                  environment, avoid distractions, and commit to completing the
                  full test. This builds endurance and reduces test-day anxiety.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
