"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/20 blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/25 to-pink-500/20 blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent blur-[100px]" />

        {/* Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Gradient line accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[600px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <Badge className="mb-6 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15 px-4 py-1.5">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                AI-Powered NCLEX Prep
              </Badge>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Pass the{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                NCLEX
              </span>{" "}
              on Your First Attempt
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Our AI-powered adaptive learning platform personalizes your study
              path, identifies weak areas, and builds your confidence to pass the
              NCLEX on your first attempt.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 hover:brightness-110 transition-all duration-300 h-12 px-8 text-base"
              >
                <Link href="/signup">
                  Start Studying Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base border-border/50 hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
              className="mt-14 flex items-center gap-8 justify-center lg:justify-start"
            >
              {[
                { value: "95%+", label: "Pass Rate" },
                { value: "50,000+", label: "Questions" },
                { value: "10,000+", label: "Students" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex flex-col items-center lg:items-start">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Mockup Card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative hidden lg:block"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-2xl" />

            {/* Mockup Question Card */}
            <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                  Question 42 of 145
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  CAT Mode
                </div>
              </div>

              {/* Category */}
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 tracking-wider uppercase">
                Pharmacology
              </div>

              {/* Question */}
              <p className="text-base font-medium text-foreground leading-relaxed">
                A nurse is preparing to administer IV potassium chloride to a
                patient with hypokalemia. Which action should the nurse take
                first?
              </p>

              {/* Answer Options */}
              <div className="space-y-3">
                {[
                  "Administer the medication via IV push",
                  "Verify the patient's serum potassium level",
                  "Mix the medication in a large-volume IV bag",
                  "Place the patient on a cardiac monitor",
                ].map((option, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-default",
                      i === 1
                        ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10"
                        : "border-border/30 hover:border-indigo-500/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5"
                    )}
                  >
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-semibold",
                        i === 1
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border/50 text-muted-foreground"
                      )}
                    >
                      {i === 1 ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm",
                        i === 1
                          ? "text-emerald-700 dark:text-emerald-300 font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {option}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[29%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">29%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  02:34 remaining
                </div>
              </div>
            </div>

            {/* Floating mini elements */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-border/30 px-4 py-2.5 flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Correct!</div>
                <div className="text-[10px] text-muted-foreground">+15 XP earned</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-3 -left-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-border/30 px-4 py-2.5"
            >
              <div className="text-xs font-semibold text-foreground">AI Confidence</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">87%</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
