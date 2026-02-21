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
  Trophy,
  ArrowLeft,
  RotateCcw,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Target,
  Clock,
  Brain,
  Gauge,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const abilityData = [
  0, 0.15, 0.32, 0.18, 0.45, 0.62, 0.48, 0.71, 0.85, 0.72, 0.91, 1.02,
  0.88, 1.05, 1.12, 0.98, 1.15, 1.22, 1.08, 1.24,
];

const categoryResults = [
  { name: "Management of Care", correct: 12, total: 15, percentage: 80 },
  { name: "Safety & Infection Control", correct: 8, total: 10, percentage: 80 },
  { name: "Health Promotion", correct: 5, total: 8, percentage: 63 },
  { name: "Psychosocial Integrity", correct: 6, total: 8, percentage: 75 },
  { name: "Basic Care & Comfort", correct: 7, total: 9, percentage: 78 },
  { name: "Pharmacological Therapies", correct: 10, total: 14, percentage: 71 },
  { name: "Risk Reduction", correct: 9, total: 11, percentage: 82 },
  { name: "Physiological Adaptation", correct: 8, total: 10, percentage: 80 },
];

const difficultyDistribution = [
  { level: "Very Easy", count: 5, color: "bg-emerald-400" },
  { level: "Easy", count: 12, color: "bg-emerald-500" },
  { level: "Medium", count: 28, color: "bg-amber-500" },
  { level: "Hard", count: 25, color: "bg-orange-500" },
  { level: "Very Hard", count: 15, color: "bg-red-500" },
];

export default function CATResultsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const passed = true;
  const confidencePercent = 92;
  const finalAbility = 1.24;
  const questionsAnswered = 85;
  const timeTaken = "2h 18m";
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

  const points = abilityData.map((val, i) => {
    const x = padding + (i / (abilityData.length - 1)) * plotWidth;
    const y = padding + ((3 - val) / 6) * plotHeight; // -3 to 3 mapped to height
    return { x, y };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // passing line y
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
        ].map((stat, i) => (
          <Card key={stat.label} className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ability">Ability Graph</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
          </TabsList>

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
                    <motion.path
                      d={`${pathD} L ${points[points.length - 1].x} ${passingY} L ${points[0].x} ${passingY} Z`}
                      fill="url(#areaGradient)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ duration: 1 }}
                    />

                    {/* Line */}
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

                    {/* End point */}
                    <motion.circle
                      cx={points[points.length - 1].x}
                      cy={points[points.length - 1].y}
                      r={5}
                      fill="#10b981"
                      stroke="white"
                      strokeWidth={2}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2 }}
                    />

                    <defs>
                      <linearGradient
                        id="lineGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient
                        id="areaGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
                {categoryResults.map((cat, i) => (
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
                        transition={{ duration: 1, delay: 0.2 + i * 0.05 }}
                      />
                    </div>
                  </motion.div>
                ))}
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
                {difficultyDistribution.map((d, i) => (
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
                        {Math.round((d.count / totalDiffQuestions) * 100)}%)
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", d.color)}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(d.count / totalDiffQuestions) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.08 }}
                      />
                    </div>
                  </motion.div>
                ))}
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
