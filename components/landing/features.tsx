"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Brain,
  Trophy,
  Layers,
  CalendarDays,
  BarChart3,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description:
      "Adaptive algorithms analyze your performance in real-time, focusing on weak areas and adjusting question difficulty to maximize your learning efficiency.",
    gradient: "from-indigo-500/10 to-blue-500/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: Trophy,
    title: "CAT Simulation",
    description:
      "Experience the exact Computer Adaptive Testing format used in the real NCLEX exam. Our simulator mirrors the real test conditions for total readiness.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    description:
      "Leverage spaced repetition algorithms to retain critical nursing concepts. Cards adapt to your memory patterns for optimal long-term retention.",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    description:
      "AI-generated study plans tailored to your exam date, availability, and progress. Stay on track with personalized daily and weekly goals.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track your progress with detailed performance analytics. Visualize strengths, identify gaps, and monitor your readiness score over time.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join study groups, participate in forums, and connect with fellow nursing students. Share strategies and support each other on the journey.",
    gradient: "from-rose-500/10 to-red-500/10",
    iconColor: "text-rose-500",
  },
];

export function LandingFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-6">
            Powerful Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Pass
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Our comprehensive platform combines cutting-edge AI with proven study
            methods to give you the best possible preparation for the NCLEX exam.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <div className="group relative h-full">
                  {/* Hover glow */}
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 blur-xl" />

                  <div className="relative h-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/[0.08] p-6 sm:p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-1">
                    {/* Icon */}
                    <div
                      className={cn(
                        "inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br mb-5",
                        feature.gradient
                      )}
                    >
                      <Icon className={cn("h-6 w-6", feature.iconColor)} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Subtle gradient line at bottom */}
                    <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
