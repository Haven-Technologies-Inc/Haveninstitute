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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "motion/react";
import {
  Monitor,
  Play,
  ArrowLeft,
  Clock,
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  Target,
  Timer,
  BookOpen,
  GraduationCap,
  Stethoscope,
  HeartPulse,
  Info,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Difficulty",
    desc: "Questions dynamically adjust to your performance level, just like the real NCLEX exam.",
  },
  {
    icon: Clock,
    title: "Realistic Timing",
    desc: "Full 5-hour time limit with optional break scheduling to simulate actual test conditions.",
  },
  {
    icon: Layers,
    title: "All Question Types",
    desc: "Multiple choice, select all that apply, ordered response, fill-in-the-blank, and hot spot questions.",
  },
  {
    icon: Target,
    title: "CAT Algorithm",
    desc: "Uses Item Response Theory to determine your competence level with statistical precision.",
  },
  {
    icon: Shield,
    title: "Complete Coverage",
    desc: "Questions across all 8 NCLEX client need categories with proper weighting.",
  },
  {
    icon: GraduationCap,
    title: "Detailed Analysis",
    desc: "Comprehensive results with category breakdowns, ability estimates, and study recommendations.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "The NCLEX simulator was incredibly close to the real thing. I passed on my first attempt!",
    score: "Pass - 75 questions",
  },
  {
    name: "James R.",
    text: "After 3 simulations, I felt confident and prepared. The adaptive difficulty really helped.",
    score: "Pass - 82 questions",
  },
];

export default function NCLEXSimulatorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [examType, setExamType] = useState("rn");
  const [timedMode, setTimedMode] = useState("timed");

  const handleStartSimulation = () => {
    const sessionId = `nclex-${Date.now()}`;
    router.push(`/practice/cat/${sessionId}`);
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
          <h1 className="text-2xl lg:text-3xl font-bold">
            NCLEX Exam Simulator
          </h1>
          <p className="text-muted-foreground text-sm">
            The most realistic NCLEX practice experience
          </p>
        </div>
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 lg:p-10 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22%20opacity=%220.05%22/%3E%3C/svg%3E')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-2">
                Most Realistic
              </Badge>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                Full NCLEX Simulation
              </h2>
              <p className="text-white/90 text-sm lg:text-base leading-relaxed max-w-2xl">
                Experience the NCLEX exactly as it will be on test day. Our
                simulator uses the same Computer Adaptive Testing algorithm,
                question format, timing, and scoring methodology as the actual
                examination. Build confidence and reduce test anxiety with the
                most authentic practice available.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "60-145 Questions", icon: Brain },
              { label: "5 Hour Limit", icon: Clock },
              { label: "CAT Algorithm", icon: Target },
              { label: "All 8 Categories", icon: Layers },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2"
              >
                <item.icon className="h-4 w-4 text-white/80" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Features & Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Simulation Features
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.desc}
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
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exam Type</label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timing Mode</label>
                    <Select value={timedMode} onValueChange={setTimedMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="timed">
                          Timed (5 hours - Recommended)
                        </SelectItem>
                        <SelectItem value="untimed">
                          Untimed (Practice mode)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Simulation Advisory
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This simulation is designed to replicate real exam
                      conditions. Plan for 2-5 hours of uninterrupted time.
                      Once started, the simulation cannot be paused. Treat this
                      as your real exam for the best results.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleStartSimulation}
                  size="lg"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Simulation
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Prep Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Pre-Simulation Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Find a quiet, distraction-free environment",
                  "Have a calculator ready (if needed)",
                  "Take a short break beforehand",
                  "Have water nearby",
                  "Silence your phone and notifications",
                  "Set aside 2-5 hours of uninterrupted time",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-semibold text-sm">Student Stories</h3>
                </div>
                {testimonials.map((t, i) => (
                  <div key={i} className="space-y-1.5">
                    <p className="text-xs text-muted-foreground italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">{t.name}</p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-emerald-500/10 text-emerald-600"
                      >
                        {t.score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
