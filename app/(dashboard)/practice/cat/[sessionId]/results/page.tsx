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
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { motion } from "motion/react";
import {
  Trophy,
  ArrowLeft,
  RotateCcw,
  TrendingUp,
  Clock,
  Brain,
  Gauge,
  Layers,
  Target,
  Loader2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  BookOpen,
  BarChart3,
  Shield,
} from "lucide-react";

interface CATResponse {
  questionId: string;
  isCorrect: boolean;
  abilityAfter: number;
  difficulty: number;
  categoryName: string;
  timeSpentSeconds: number;
}

interface CATSessionResult {
  id: string;
  passed: boolean;
  finalAbility: number;
  currentAbility: number;
  standardError: number;
  confidence: number;
  totalQuestions: number;
  nclexType: string;
  completedAt: string;
  createdAt: string;
  responses: CATResponse[];
}

function getDifficultyBucket(difficulty: number): string {
  if (difficulty <= -1.5) return "Very Easy";
  if (difficulty <= -0.5) return "Easy";
  if (difficulty <= 0.5) return "Medium";
  if (difficulty <= 1.5) return "Hard";
  return "Very Hard";
}

function getDifficultyColor(level: string): string {
  switch (level) {
    case "Very Easy":
      return "bg-emerald-400";
    case "Easy":
      return "bg-emerald-500";
    case "Medium":
      return "bg-amber-500";
    case "Hard":
      return "bg-orange-500";
    case "Very Hard":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function formatTimeTaken(startDate: string, endDate: string): string {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffMs = end - start;
  if (isNaN(diffMs) || diffMs < 0) return "N/A";
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function CATResultsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [sessionResult, setSessionResult] = useState<CATSessionResult | null>(
    null
  );
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/cat/${sessionId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSessionResult(json.data);
          // Fetch AI analysis in parallel
          fetchAnalysis();
        } else {
          setError(json.error || "Failed to load results.");
        }
      } catch (err) {
        console.error("Failed to fetch CAT results:", err);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    async function fetchAnalysis() {
      setAnalysisLoading(true);
      try {
        const res = await fetch(`/api/cat/${sessionId}/analysis`);
        const json = await res.json();
        if (json.success && json.data) {
          setAnalysis(json.data);
        }
      } catch {
        // Analysis is supplementary, don't block on errors
      } finally {
        setAnalysisLoading(false);
      }
    }

    fetchResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionResult) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm text-red-600">
              {error || "No results found."}
            </p>
            <Button variant="outline" asChild>
              <Link href="/practice/cat">Back to CAT</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    passed,
    finalAbility: rawFinalAbility,
    currentAbility,
    standardError,
    confidence: rawConfidence,
    totalQuestions: rawTotalQuestions,
    responses,
    completedAt,
    createdAt,
  } = sessionResult;

  const finalAbility = rawFinalAbility ?? currentAbility ?? 0;
  const questionsAnswered =
    rawTotalQuestions ?? responses?.length ?? 0;
  const confidencePercent = rawConfidence
    ? Math.round(rawConfidence * 100)
    : standardError
    ? Math.round((1 - standardError) * 100)
    : 0;
  const timeTaken = formatTimeTaken(createdAt, completedAt);

  // Build ability trend data from responses
  const abilityData: number[] = [0]; // Start at 0
  if (responses && responses.length > 0) {
    for (const r of responses) {
      abilityData.push(r.abilityAfter ?? abilityData[abilityData.length - 1]);
    }
  }

  // Build category performance from responses
  const categoryMap = new Map<
    string,
    { correct: number; total: number }
  >();
  if (responses) {
    for (const r of responses) {
      const cat = r.categoryName || "Unknown";
      const existing = categoryMap.get(cat) || { correct: 0, total: 0 };
      existing.total += 1;
      if (r.isCorrect) existing.correct += 1;
      categoryMap.set(cat, existing);
    }
  }
  const categoryResults = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      correct: data.correct,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Build difficulty distribution from responses
  const difficultyMap = new Map<string, number>();
  const orderedLevels = ["Very Easy", "Easy", "Medium", "Hard", "Very Hard"];
  for (const level of orderedLevels) {
    difficultyMap.set(level, 0);
  }
  if (responses) {
    for (const r of responses) {
      const bucket = getDifficultyBucket(r.difficulty ?? 0);
      difficultyMap.set(bucket, (difficultyMap.get(bucket) || 0) + 1);
    }
  }
  const difficultyDistribution = orderedLevels
    .map((level) => ({
      level,
      count: difficultyMap.get(level) || 0,
      color: getDifficultyColor(level),
    }))
    .filter((d) => d.count > 0);

  const totalDiffQuestions = difficultyDistribution.reduce(
    (sum, d) => sum + d.count,
    0
  );

  // SVG graph dimensions
  const graphWidth = 600;
  const graphHeight = 200;
  const padding = 30;
  const plotWidth = graphWidth - padding * 2;
  const plotHeight = graphHeight - padding * 2;

  const points =
    abilityData.length > 1
      ? abilityData.map((val, i) => {
          const x =
            padding + (i / (abilityData.length - 1)) * plotWidth;
          const y = padding + ((3 - val) / 6) * plotHeight; // -3 to 3 mapped to height
          return { x, y };
        })
      : [{ x: padding, y: padding + ((3 - 0) / 6) * plotHeight }];

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // Passing line y
  const passingY = padding + ((3 - 0) / 6) * plotHeight;

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
          <h1 className="text-2xl lg:text-3xl font-bold">CAT Results</h1>
          <p className="text-muted-foreground text-sm">
            Simulation completed &middot; {questionsAnswered} questions answered
          </p>
        </div>
      </motion.div>

      {/* Pass/Fail Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "relative overflow-hidden rounded-2xl p-8 text-white",
          passed
            ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
            : "bg-gradient-to-br from-red-500 via-rose-500 to-pink-500"
        )}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22%20opacity=%220.05%22/%3E%3C/svg%3E')] opacity-30" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-3 mb-2 justify-center lg:justify-start">
              <Trophy className="h-8 w-8" />
              <h2 className="text-3xl font-bold">
                {passed ? "PASSED" : "FAILED"}
              </h2>
            </div>
            <p className="text-white/80 text-sm">
              The CAT algorithm has determined your competence level with{" "}
              <strong>{confidencePercent}% confidence</strong>.
            </p>
          </div>
          <div className="flex items-center gap-4 lg:ml-auto">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
              <p className="text-xs text-white/70 mb-0.5">Confidence</p>
              <p className="text-2xl font-bold">{confidencePercent}%</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
              <p className="text-xs text-white/70 mb-0.5">Ability</p>
              <p className="text-2xl font-bold">
                {finalAbility > 0 ? "+" : ""}
                {finalAbility.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Questions Answered",
            value: questionsAnswered.toString(),
            icon: Brain,
            color: "text-indigo-500",
          },
          {
            label: "Time Taken",
            value: timeTaken,
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: "Final Ability",
            value: `${finalAbility > 0 ? "+" : ""}${finalAbility.toFixed(2)}`,
            icon: Gauge,
            color: "text-emerald-500",
          },
          {
            label: "Confidence",
            value: `${confidencePercent}%`,
            icon: Target,
            color: "text-purple-500",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border-0 shadow-sm bg-card/80 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="ability" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="ability">Ability Graph</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
          </TabsList>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {analysisLoading ? (
              <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-8 w-8 animate-pulse text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Analyzing your performance...</p>
                </CardContent>
              </Card>
            ) : analysis ? (
              <>
                {/* NCLEX Readiness Score */}
                <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm overflow-hidden">
                  <div className={cn(
                    "h-1.5",
                    analysis.readiness?.score >= 85 ? "bg-emerald-500" :
                    analysis.readiness?.score >= 70 ? "bg-amber-500" :
                    analysis.readiness?.score >= 55 ? "bg-orange-500" : "bg-red-500"
                  )} />
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      NCLEX Readiness Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className={cn(
                          "text-5xl font-bold",
                          analysis.readiness?.score >= 85 ? "text-emerald-500" :
                          analysis.readiness?.score >= 70 ? "text-amber-500" :
                          analysis.readiness?.score >= 55 ? "text-orange-500" : "text-red-500"
                        )}>
                          {analysis.readiness?.score || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                      </div>
                      <div className="flex-1">
                        <Badge className={cn(
                          "mb-2",
                          analysis.readiness?.level === 'exam_ready' ? "bg-emerald-500" :
                          analysis.readiness?.level === 'nearly_ready' ? "bg-amber-500" :
                          analysis.readiness?.level === 'developing' ? "bg-orange-500" : "bg-red-500"
                        )}>
                          {analysis.readiness?.level === 'exam_ready' ? 'Exam Ready' :
                           analysis.readiness?.level === 'nearly_ready' ? 'Nearly Ready' :
                           analysis.readiness?.level === 'developing' ? 'Developing' : 'Needs Preparation'}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{analysis.readiness?.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Predicted NCLEX Performance */}
                {analysis.predictedPerformance && (
                  <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Predicted NCLEX Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-2xl font-bold text-primary">
                            {analysis.predictedPerformance.passingProbability}%
                          </p>
                          <p className="text-xs text-muted-foreground">Passing Probability</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-2xl font-bold">
                            {analysis.predictedPerformance.predictedResult}
                          </p>
                          <p className="text-xs text-muted-foreground">Predicted Result</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-2xl font-bold">
                            {analysis.predictedPerformance.estimatedQuestionsOnRealExam?.min}-
                            {analysis.predictedPerformance.estimatedQuestionsOnRealExam?.max}
                          </p>
                          <p className="text-xs text-muted-foreground">Est. Questions on NCLEX</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-2xl font-bold capitalize">
                            {analysis.predictedPerformance.confidence}
                          </p>
                          <p className="text-xs text-muted-foreground">Confidence Level</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Personalized Recommendations
                      </CardTitle>
                      <CardDescription>
                        AI-powered study suggestions based on your performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.recommendations.map((rec: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={cn(
                            "p-4 rounded-xl border",
                            rec.priority === 'high' ? "border-red-500/20 bg-red-500/5" :
                            rec.priority === 'medium' ? "border-amber-500/20 bg-amber-500/5" :
                            "border-emerald-500/20 bg-emerald-500/5"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className={cn(
                              "text-[10px] shrink-0 mt-0.5",
                              rec.priority === 'high' ? "border-red-500/50 text-red-600" :
                              rec.priority === 'medium' ? "border-amber-500/50 text-amber-600" :
                              "border-emerald-500/50 text-emerald-600"
                            )}>
                              {rec.priority}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">{rec.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Time Analysis */}
                {analysis.timeAnalysis && (
                  <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Time Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-xl font-bold">{analysis.timeAnalysis.averagePerQuestion}s</p>
                          <p className="text-xs text-muted-foreground">Avg per Question</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-xl font-bold">{analysis.timeAnalysis.fastest}s</p>
                          <p className="text-xs text-muted-foreground">Fastest</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/30">
                          <p className="text-xl font-bold">{analysis.timeAnalysis.slowest}s</p>
                          <p className="text-xs text-muted-foreground">Slowest</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">AI analysis not available for this session.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Ability Graph */}
          <TabsContent value="ability">
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Ability Estimate Over Time
                </CardTitle>
                <CardDescription>
                  Your ability level as measured throughout the test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                    className="w-full h-auto min-w-[400px]"
                  >
                    {/* Grid lines */}
                    {[-2, -1, 0, 1, 2].map((val) => {
                      const y = padding + ((3 - val) / 6) * plotHeight;
                      return (
                        <g key={val}>
                          <line
                            x1={padding}
                            y1={y}
                            x2={graphWidth - padding}
                            y2={y}
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            strokeDasharray={val === 0 ? "none" : "4,4"}
                          />
                          <text
                            x={padding - 8}
                            y={y + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="currentColor"
                            opacity={0.5}
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Passing line */}
                    <line
                      x1={padding}
                      y1={passingY}
                      x2={graphWidth - padding}
                      y2={passingY}
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      strokeDasharray="6,4"
                      opacity={0.6}
                    />
                    <text
                      x={graphWidth - padding + 4}
                      y={passingY + 4}
                      fontSize="9"
                      fill="#ef4444"
                      opacity={0.8}
                    >
                      Pass
                    </text>

                    {/* Area fill */}
                    {points.length > 1 && (
                      <motion.path
                        d={`${pathD} L ${points[points.length - 1].x} ${passingY} L ${points[0].x} ${passingY} Z`}
                        fill="url(#areaGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ duration: 1 }}
                      />
                    )}

                    {/* Line */}
                    {points.length > 1 && (
                      <motion.path
                        d={pathD}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                    )}

                    {/* End point */}
                    {points.length > 1 && (
                      <motion.circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r={5}
                        fill={finalAbility >= 0 ? "#10b981" : "#ef4444"}
                        stroke="white"
                        strokeWidth={2}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2 }}
                      />
                    )}

                    <defs>
                      <linearGradient
                        id="lineGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop
                          offset="100%"
                          stopColor={
                            finalAbility >= 0 ? "#10b981" : "#ef4444"
                          }
                        />
                      </linearGradient>
                      <linearGradient
                        id="areaGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            finalAbility >= 0 ? "#10b981" : "#ef4444"
                          }
                        />
                        <stop
                          offset="100%"
                          stopColor={
                            finalAbility >= 0 ? "#10b981" : "#ef4444"
                          }
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Breakdown */}
          <TabsContent value="categories" className="space-y-4">
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                {categoryResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No category data available.
                  </p>
                ) : (
                  categoryResults.map((cat, i) => (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
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
                          transition={{
                            duration: 1,
                            delay: 0.2 + i * 0.05,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Difficulty Distribution */}
          <TabsContent value="difficulty">
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Difficulty Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of question difficulties you encountered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {difficultyDistribution.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No difficulty data available.
                  </p>
                ) : (
                  difficultyDistribution.map((d, i) => (
                    <motion.div
                      key={d.level}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{d.level}</span>
                        <span className="text-sm text-muted-foreground">
                          {d.count} questions (
                          {totalDiffQuestions > 0
                            ? Math.round(
                                (d.count / totalDiffQuestions) * 100
                              )
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", d.color)}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              totalDiffQuestions > 0
                                ? (d.count / totalDiffQuestions) * 100
                                : 0
                            }%`,
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.2 + i * 0.08,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push("/practice/cat")}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Take Another CAT
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
