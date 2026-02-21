import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Brain,
  Trophy,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, courseSchema, faqSchema, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'NCLEX-RN Prep Course 2026 - AI-Powered | 95%+ Pass Rate',
  description:
    'Best NCLEX-RN preparation course with AI-powered adaptive learning. 50,000+ practice questions, realistic CAT simulations, AI tutor, and personalized study plans. 95%+ pass rate. Better than UWorld, Archer & Kaplan. Start free today.',
  path: '/nclex-rn',
  keywords: [
    'NCLEX-RN prep',
    'NCLEX-RN practice questions',
    'NCLEX-RN review course',
    'NCLEX-RN study guide',
    'NCLEX-RN CAT simulator',
    'pass NCLEX-RN first attempt',
    'best NCLEX-RN prep 2026',
    'NCLEX-RN test bank',
    'registered nurse exam prep',
    'RN licensure exam',
    'NCLEX-RN adaptive learning',
    'NCLEX-RN AI tutor',
    'UWorld NCLEX-RN alternative',
    'Archer NCLEX-RN alternative',
  ],
});

const rnFaqs = [
  {
    question: 'How many NCLEX-RN practice questions does Haven Institute offer?',
    answer:
      'Haven Institute offers 50,000+ NCLEX-RN practice questions covering all 8 client needs categories. Each question includes detailed rationales for correct and incorrect answers, helping you understand the reasoning behind each answer.',
  },
  {
    question: 'Is the CAT simulation realistic for NCLEX-RN?',
    answer:
      'Our CAT simulation uses the same adaptive algorithm as the real NCLEX-RN. It adjusts question difficulty based on your performance, can end between 75-145 questions, and replicates the Pearson VUE interface including calculator and exhibit features.',
  },
  {
    question: 'How does Haven Institute compare to UWorld for NCLEX-RN prep?',
    answer:
      'Haven Institute offers AI-powered adaptive learning that personalizes your study path, unlimited CAT simulations, a 24/7 AI tutor, and costs significantly less than UWorld. Our 95%+ pass rate speaks for itself.',
  },
  {
    question: 'Can I start studying for the NCLEX-RN for free?',
    answer:
      'Yes! Our Free plan includes 500 practice questions, 1 CAT simulation per month, basic analytics, and access to community study groups. Upgrade anytime for unlimited access.',
  },
];

const features = [
  {
    icon: Brain,
    title: 'AI Adaptive Learning',
    desc: 'Our AI engine analyzes your performance across all 8 NCLEX-RN client needs categories and creates a personalized study path that focuses on your weakest areas.',
  },
  {
    icon: Trophy,
    title: 'Realistic CAT Simulation',
    desc: 'Practice with computer adaptive tests that mirror the real NCLEX-RN. Variable-length exams (75-145 questions) with the same scoring algorithm used by NCSBN.',
  },
  {
    icon: BookOpen,
    title: '50,000+ Practice Questions',
    desc: 'Comprehensive question bank covering all NCLEX-RN test plan categories with detailed rationales, evidence-based explanations, and difficulty tracking.',
  },
  {
    icon: Sparkles,
    title: '24/7 AI Nursing Tutor',
    desc: 'Ask any nursing question and get instant, evidence-based answers. Our AI tutor explains complex pharmacology, pathophysiology, and clinical scenarios in clear language.',
  },
  {
    icon: Clock,
    title: 'Smart Study Planner',
    desc: 'AI-generated study schedules based on your exam date, available hours, and knowledge gaps. Adaptive planning that adjusts as your skills improve.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Detailed dashboards showing your readiness score, category breakdown, improvement trends, and predicted pass probability based on real student data.',
  },
];

const included = [
  'AI-powered adaptive questions',
  'Unlimited CAT exam simulations',
  'Detailed answer rationales',
  'Real-time performance analytics',
  'AI-generated study plans',
  'Community study groups',
  'Spaced repetition flashcards',
  '24/7 AI nursing tutor',
  'All 8 client needs categories',
  'Next-Generation NCLEX format',
  'Mobile app access',
  'Pass guarantee (Premium)',
];

const stats = [
  { value: '95%+', label: 'First-Attempt Pass Rate' },
  { value: '50,000+', label: 'Practice Questions' },
  { value: '10,000+', label: 'Students Passed' },
  { value: '4.9/5', label: 'Student Rating' },
];

export default function NCLEXRNPrepPage() {
  return (
    <div className="min-h-screen">
      <JsonLd
        data={courseSchema({
          name: 'NCLEX-RN Comprehensive Prep Course - Haven Institute',
          description:
            'AI-powered NCLEX-RN preparation with 50,000+ practice questions, realistic CAT simulations, AI tutor, and personalized study plans. 95%+ first-attempt pass rate.',
          url: '/nclex-rn',
          price: '0',
        })}
      />
      <JsonLd data={faqSchema(rnFaqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'NCLEX-RN Prep', url: '/nclex-rn' },
        ])}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-zinc-950 dark:to-zinc-900 pt-8 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[600px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            <Star className="mr-1 h-3 w-3" /> #1 Rated NCLEX-RN Prep Platform
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
            Pass Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              NCLEX-RN
            </span>{' '}
            on the First Attempt
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join 10,000+ nursing graduates who passed their NCLEX-RN with Haven
            Institute&apos;s AI-powered adaptive learning platform. Smarter prep, higher
            pass rates, lower cost than UWorld, Archer, or Kaplan.
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
                <div className="text-2xl lg:text-3xl font-bold text-primary">{stat.value}</div>
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
              Everything You Need to{' '}
              <span className="text-primary">Ace the NCLEX-RN</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-driven platform adapts to your learning style and knowledge gaps,
              ensuring you study smarter—not harder.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-6 w-6 text-primary" />
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
            What&apos;s Included in Your NCLEX-RN Prep
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

      {/* Competitor Comparison */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Students Choose Haven Over the Competition
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            See how Haven Institute stacks up against other popular NCLEX-RN prep platforms.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="py-3 px-4 font-semibold text-primary">Haven Institute</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">UWorld</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Archer</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Kaplan</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Adaptive Learning', true, false, false, false],
                  ['CAT Simulation', true, false, true, true],
                  ['AI Tutor (24/7)', true, false, false, false],
                  ['50,000+ Questions', true, true, false, false],
                  ['Personalized Study Plans', true, false, false, true],
                  ['Spaced Repetition', true, false, false, false],
                  ['Community Groups', true, false, false, false],
                  ['Free Plan Available', true, false, false, false],
                  ['Mobile Optimized', true, true, true, true],
                  ['Pass Guarantee', true, false, false, false],
                ].map(([feature, ...checks]) => (
                  <tr key={feature as string} className="border-b">
                    <td className="py-3 px-4 font-medium">{feature as string}</td>
                    {(checks as boolean[]).map((check, i) => (
                      <td key={i} className="py-3 px-4 text-center">
                        {check ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b font-semibold">
                  <td className="py-3 px-4">Starting Price</td>
                  <td className="py-3 px-4 text-center text-primary">Free</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">$439</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">$59/mo</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">$399</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/compare">
                See Full Comparison <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            NCLEX-RN Prep FAQs
          </h2>
          <div className="space-y-4">
            {rnFaqs.map((faq, i) => (
              <div
                key={i}
                className="bg-background rounded-xl border p-6 space-y-2"
              >
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to Pass the NCLEX-RN?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of nursing graduates who chose Haven Institute and passed on
            their first attempt. Start with our free plan—no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/signup">
                Get Started Free <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="/compare/uworld">Compare vs UWorld</Link>
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
