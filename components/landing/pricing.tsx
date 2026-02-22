"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingPlan {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}

const fallbackPlans: PricingPlan[] = [
  {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    period: "forever",
    description: "Get started with the basics and explore the platform.",
    features: [
      "50 practice questions",
      "Basic performance stats",
      "1 CAT simulation",
      "Community forum access",
      "Mobile-friendly interface",
    ],
    cta: "Start Free Trial",
    href: "/signup",
  },
  {
    name: "Pro",
    monthlyPrice: "$29",
    yearlyPrice: "$19",
    period: "/month",
    description: "Everything you need for serious NCLEX preparation.",
    features: [
      "5,000+ practice questions",
      "Unlimited CAT simulations",
      "AI-powered study planner",
      "Advanced analytics dashboard",
      "Smart flashcard decks",
      "Detailed rationales",
      "Priority email support",
    ],
    cta: "Get Started",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Premium",
    monthlyPrice: "$49",
    yearlyPrice: "$39",
    period: "/month",
    description: "The ultimate NCLEX prep experience with 1-on-1 support.",
    features: [
      "10,000+ practice questions",
      "Everything in Pro",
      "AI tutor with chat support",
      "1-on-1 coaching sessions",
      "Custom study plans",
      "Pass guarantee program",
      "Live review sessions",
      "24/7 priority support",
    ],
    cta: "Get Started",
    href: "/signup?plan=premium",
  },
];

export function LandingPricing() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [plans, setPlans] = useState<PricingPlan[]>(fallbackPlans);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/admin/plans");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: PricingPlan[] = data.map(
              (plan: Record<string, unknown>) => ({
                name: (plan.name as string) || "Plan",
                monthlyPrice: `$${plan.monthlyPrice || plan.price || 0}`,
                yearlyPrice: `$${plan.yearlyPrice || Math.round(((plan.monthlyPrice as number) || (plan.price as number) || 0) * 0.8)}`,
                period:
                  (plan.name as string)?.toLowerCase() === "free"
                    ? "forever"
                    : "/month",
                description: (plan.description as string) || "",
                features: (plan.features as string[]) || [],
                cta:
                  (plan.name as string)?.toLowerCase() === "free"
                    ? "Start Free Trial"
                    : "Get Started",
                href:
                  (plan.name as string)?.toLowerCase() === "free"
                    ? "/signup"
                    : `/signup?plan=${(plan.name as string)?.toLowerCase()}`,
                popular: (plan.popular as boolean) || false,
              })
            );
            setPlans(mapped);
          }
        }
      } catch {
        // Use fallback plans on error
      }
    }

    fetchPlans();
  }, []);

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
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
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-6">
            Simple Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Invest in Your{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Nursing Career
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your preparation needs. Upgrade or cancel
            anytime.
          </p>
        </motion.div>

        {/* Billing Period Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <span
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              billingPeriod === "monthly"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingPeriod((prev) =>
                prev === "monthly" ? "yearly" : "monthly"
              )
            }
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              billingPeriod === "yearly"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                : "bg-muted"
            )}
            aria-label="Toggle billing period"
          >
            <motion.div
              className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
              animate={{ x: billingPeriod === "yearly" ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              billingPeriod === "yearly"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Yearly
          </span>
          {billingPeriod === "yearly" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-1 inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            >
              Save 20%
            </motion.span>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, i) => {
            const displayPrice =
              billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1 + 0.2,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className={cn("relative", plan.popular && "md:-mt-4 md:mb-4")}
              >
                {/* Gradient border for popular plan */}
                {plan.popular && (
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 z-0" />
                )}

                <div
                  className={cn(
                    "relative z-10 h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border p-6 sm:p-8 flex flex-col",
                    plan.popular
                      ? "border-transparent shadow-2xl shadow-indigo-500/10"
                      : "border-white/20 dark:border-white/[0.08] hover:shadow-lg transition-shadow duration-300"
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-lg px-4 py-1">
                        <Sparkles className="mr-1.5 h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <motion.span
                      key={displayPrice}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
                    >
                      {displayPrice}
                    </motion.span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>

                  {/* Yearly savings note */}
                  {billingPeriod === "yearly" && plan.period !== "forever" && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-xs text-emerald-600 dark:text-emerald-400"
                    >
                      Billed annually
                    </motion.p>
                  )}

                  {/* Description */}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {plan.description}
                  </p>

                  {/* Features List */}
                  <ul className="mt-8 space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center mt-0.5",
                            plan.popular
                              ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                              : "bg-indigo-500/10"
                          )}
                        >
                          <Check
                            className={cn(
                              "h-3 w-3",
                              plan.popular
                                ? "text-white"
                                : "text-indigo-600 dark:text-indigo-400"
                            )}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-8">
                    <Button
                      asChild
                      className={cn(
                        "w-full h-11",
                        plan.popular
                          ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
                          : "bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border/50"
                      )}
                    >
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include a 7-day free trial. No credit card required to start.
        </motion.p>
      </div>
    </section>
  );
}
