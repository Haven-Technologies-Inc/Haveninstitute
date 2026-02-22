"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  name: string;
  title: string;
  avatar: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Mitchell",
    title: "RN, BSN - Passed First Attempt",
    avatar: "SM",
    quote:
      "Haven Institute completely changed how I studied for the NCLEX. The AI-powered questions adapted to my weak areas and the CAT simulation made me feel so prepared on test day. I passed on my first attempt with confidence!",
    rating: 5,
  },
  {
    name: "James Rodriguez",
    title: "RN - Graduated May 2025",
    avatar: "JR",
    quote:
      "The adaptive learning technology is incredible. It identified my weaknesses in pharmacology and created a personalized study plan. The analytics dashboard helped me track my improvement over time. Worth every penny.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    title: "RN, MSN - Nursing Educator",
    avatar: "PP",
    quote:
      "As a nursing educator, I recommend Haven Institute to all my students. The question quality rivals UWorld, and the AI tutor provides explanations that are clear and evidence-based. The pass rates speak for themselves.",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export function LandingTestimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 dark:via-purple-950/10 to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 mb-6">
            Student Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Thousands
            </span>{" "}
            of Nurses
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from real nursing students who passed their NCLEX with Haven
            Institute.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <div className="group relative h-full">
                {/* Hover glow */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 blur-xl" />

                <div className="relative h-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/[0.08] p-6 sm:p-8 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-indigo-500/20 mb-4 flex-shrink-0" />

                  {/* Stars */}
                  <div className="mb-4">
                    <StarRating rating={testimonial.rating} />
                  </div>

                  {/* Quote text */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/30">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
