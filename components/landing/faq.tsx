"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does the AI-powered adaptive learning work?",
    answer:
      "Our AI engine continuously analyzes your answers, response times, and patterns to build a personalized model of your knowledge. It identifies weak areas across all NCLEX content domains and dynamically adjusts question difficulty. As you improve in certain areas, the system shifts focus to topics that need more attention, ensuring maximum study efficiency and comprehensive coverage.",
  },
  {
    question: "Does the CAT simulation accurately mirror the real NCLEX exam?",
    answer:
      "Yes. Our Computer Adaptive Testing simulation uses the same algorithm logic as the official NCLEX-RN and NCLEX-PN exams. Questions increase or decrease in difficulty based on your performance, the test can end between 75 and 145 questions, and the interface closely replicates the Pearson VUE testing environment including the calculator and exhibit features. This helps eliminate test-day surprises.",
  },
  {
    question: "What NCLEX content areas are covered?",
    answer:
      "We cover all NCLEX-RN test plan categories: Management of Care, Safety and Infection Control, Health Promotion and Maintenance, Psychosocial Integrity, Basic Care and Comfort, Pharmacological Therapies, Reduction of Risk Potential, and Physiological Adaptation. Each category includes hundreds of questions with detailed rationales explaining both correct and incorrect answer choices.",
  },
  {
    question: "Can I study on my phone or tablet?",
    answer:
      "Absolutely. Haven Institute is fully responsive and optimized for all devices. You can seamlessly switch between your desktop, tablet, and smartphone without losing progress. Your study history, flashcard decks, and analytics sync in real-time across all your devices so you can study whenever and wherever it is convenient.",
  },
  {
    question: "What is the pass guarantee, and how does it work?",
    answer:
      "Our Premium plan includes a pass guarantee. If you complete at least 80% of your personalized study plan, score above 70% on three consecutive full-length CAT simulations, and do not pass the NCLEX within 90 days of your exam, we will extend your Premium subscription free of charge until you pass. We are confident in our platform and committed to your success.",
  },
];

export function LandingFAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 dark:via-indigo-950/10 to-transparent" />
      </div>

      <div ref={ref} className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-6">
            Common Questions
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about preparing for the NCLEX with Haven
            Institute.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="group bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-white/[0.08] overflow-hidden transition-all duration-300 data-[state=open]:shadow-lg data-[state=open]:shadow-indigo-500/5 data-[state=open]:border-indigo-500/20"
              >
                <AccordionTrigger className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-medium text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 [&[data-state=open]>svg]:rotate-180 cursor-pointer">
                  {faq.question}
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4 transition-transform duration-300 ease-out" />
                </AccordionTrigger>
                <AccordionContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
