import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Brain,
  Trophy,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
  Star,
  Zap,
  Stethoscope,
  GraduationCap,
} from 'lucide-react';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, courseSchema, faqSchema, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'NCLEX-PN Prep Course 2026 - AI-Powered LPN/LVN Exam Prep',
  description:
    'Best NCLEX-PN preparation for LPN/LVN students. AI-powered adaptive learning, PN-specific practice questions, CAT simulations, and personalized study plans. 95%+ pass rate. Start free.',
  path: '/nclex-pn',
  keywords: [
    'NCLEX-PN prep',
    'NCLEX-PN practice questions',
    'NCLEX-PN review course',
    'NCLEX-PN study guide',
    'LPN exam prep',
    'LVN exam prep',
    'NCLEX-PN CAT simulator',
    'pass NCLEX-PN first attempt',
    'best NCLEX-PN prep 2026',
    'NCLEX-PN test bank',
    'practical nurse exam prep',
    'NCLEX-PN adaptive learning',
    'NCLEX-PN AI tutor',
    'vocational nurse licensure',
  ],
});

const pnFaqs = [
  {
    question: 'What is the difference between NCLEX-RN and NCLEX-PN prep?',
    answer:
      'The NCLEX-PN focuses on the scope of practice for Licensed Practical/Vocational Nurses (LPN/LVN). Haven Institute provides PN-specific content that covers the unique clinical scenarios, medication administration protocols, and patient care responsibilities relevant to the NCLEX-PN exam.',
  },
  {
    question: 'How many NCLEX-PN practice questions are available?',
    answer:
      'Haven Institute offers thousands of NCLEX-PN-specific practice questions. Each question is aligned with the NCSBN NCLEX-PN test plan and includes detailed rationales explaining both correct and incorrect answer choices.',
  },
  {
    question: 'Is the NCLEX-PN CAT simulation different from NCLEX-RN?',
    answer:
      'Yes. Our NCLEX-PN CAT simulation uses PN-specific content, difficulty levels, and the adaptive algorithm calibrated for the NCLEX-PN. The exam can end between 85-205 questions, matching the real PN exam format.',
  },
  {
    question: 'Do LPN/LVN students get the same features as RN students?',
    answer:
      'Absolutely. LPN/LVN students get access to all the same AI-powered features: adaptive learning, CAT simulations, AI tutor, flashcards, study planner, and performance analytics—all tailored specifically for NCLEX-PN content.',
  },
];

const features = [
  {
    icon: Stethoscope,
    title: 'PN-Specific Content',
    desc: 'Every question, simulation, and study resource is designed specifically for NCLEX-PN scope of practice, covering practical/vocational nursing clinical scenarios.',
  },
  {
    icon: Brain,
    title: 'AI Adaptive Learning',
    desc: 'Our AI identifies your knowledge gaps across PN content domains and creates a personalized learning path that maximizes your study efficiency.',
  },
  {
    icon: Trophy,
    title: 'PN CAT Simulation',
    desc: 'Practice with adaptive tests calibrated for the NCLEX-PN format. Variable-length exams (85-205 questions) using the same algorithm as the real exam.',
  },
  {
    icon: Sparkles,
    title: 'AI Nursing Tutor',
    desc: 'Get instant answers to PN-specific questions. Our AI explains medication administration, patient care procedures, and clinical scenarios in clear, simple language.',
  },
  {
    icon: Clock,
    title: 'Smart Study Planner',
    desc: 'AI-generated study schedules based on your PN exam date. The planner adapts as your knowledge improves, focusing time where you need it most.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Track your readiness across all NCLEX-PN categories with detailed dashboards showing your improvement trends and predicted pass probability.',
  },
];

const included = [
  'PN-specific adaptive questions',
  'NCLEX-PN CAT simulations',
  'Detailed answer rationales',
  'Real-time performance analytics',
  'AI-generated study plans',
  'Community study groups',
  'Spaced repetition flashcards',
  '24/7 AI nursing tutor',
  'All PN content categories',
  'LPN/LVN scope of practice focus',
  'Mobile access on any device',
  'Pass guarantee (Premium)',
];

const stats = [
  { value: '95%+', label: 'First-Attempt Pass Rate' },
  { value: 'PN-Specific', label: 'Question Bank' },
  { value: '5,000+', label: 'LPN/LVN Students Passed' },
  { value: '4.9/5', label: 'Student Rating' },
];

export default function NCLEXPNPrepPage() {
  return (
    <div className="min-h-screen">
      <JsonLd
        data={courseSchema({
          name: 'NCLEX-PN Comprehensive Prep Course - Haven Institute',
          description:
            'AI-powered NCLEX-PN preparation for LPN/LVN students with PN-specific practice questions, CAT simulations, AI tutor, and personalized study plans.',
          url: '/nclex-pn',
          price: '0',
        })}
      />
      <JsonLd data={faqSchema(pnFaqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'NCLEX-PN Prep', url: '/nclex-pn' },
        ])}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-zinc-950 dark:to-zinc-900 pt-8 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[600px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            <GraduationCap className="mr-1 h-3 w-3" /> LPN/LVN Exam Preparation
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
            Ace Your{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              NCLEX-PN
            </span>{' '}
            Exam
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive LPN/LVN exam preparation built specifically for practical
            nursing students. AI-powered adaptive learning tailored to the NCLEX-PN
            scope of practice.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Built for{' '}
              <span className="text-purple-600 dark:text-purple-400">LPN/LVN Success</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed with practical nursing students in mind—from
              PN-specific question content to scope-of-practice focused analytics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <f.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            What&apos;s Included in NCLEX-PN Prep
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-background">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">NCLEX-PN Prep FAQs</h2>
          <div className="space-y-4">
            {pnFaqs.map((faq, i) => (
              <div key={i} className="bg-background rounded-xl border p-6 space-y-2">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-muted/30 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to Pass the NCLEX-PN?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of LPN/LVN students who chose Haven Institute for their
            NCLEX-PN prep and passed on their first attempt.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/signup">
                Get Started Free <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="/nclex-rn">Looking for NCLEX-RN?</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            No credit card required. Upgrade or cancel anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
