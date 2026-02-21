"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { GraduationCap, Target, BookOpen, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  icon: React.ElementType;
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
  gradient: string;
  iconBg: string;
}

const statItems: StatItem[] = [
  {
    icon: GraduationCap,
    value: "50,000+",
    numericValue: 50000,
    suffix: "+",
    label: "Students Enrolled",
    gradient: "from-indigo-500 to-blue-500",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Target,
    value: "98%",
    numericValue: 98,
    suffix: "%",
    label: "Pass Rate",
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: BookOpen,
    value: "10,000+",
    numericValue: 10000,
    suffix: "+",
    label: "Practice Questions",
    gradient: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    icon: Headphones,
    value: "24/7",
    numericValue: 24,
    suffix: "/7",
    label: "Expert Support",
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, target]);

  const formatted =
    target >= 1000
      ? count.toLocaleString("en-US")
      : count.toString();

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

export function LandingStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-20 sm:py-28">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/50 dark:via-indigo-950/20 to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statItems.map((stat, i) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <div className="relative group">
                  {/* Gradient border glow on hover */}
                  <div
                    className={cn(
                      "absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm",
                      stat.gradient
                    )}
                  />

                  <div className="relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300">
                    {/* Icon */}
                    <div
                      className={cn(
                        "inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4",
                        stat.iconBg
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Value */}
                    <div
                      className={cn(
                        "text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                        stat.gradient
                      )}
                    >
                      <AnimatedCounter
                        target={stat.numericValue}
                        suffix={stat.suffix}
                        inView={inView}
                      />
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </div>
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
