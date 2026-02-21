import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema, softwareApplicationSchema } from '@/lib/seo';
import {
  Brain,
  Monitor,
  BookOpen,
  MessageSquare,
  Layers,
  CalendarDays,
  BarChart3,
  Users,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

export const metadata = createMetadata({
  title: 'NCLEX Prep Features | AI Tutor, CAT Simulator, 50K+ Questions - Haven Institute',
  description:
    'Explore Haven Institute NCLEX prep features: AI adaptive learning, CAT exam simulator, 50,000+ practice questions, AI tutor, smart flashcards, study planner, analytics, and community groups. Everything you need to pass the NCLEX.',
  path: '/features',
  keywords: [
    'NCLEX prep features',
    'AI NCLEX tutor',
    'NCLEX CAT simulator',
    'NCLEX practice questions',
    'adaptive NCLEX learning',
    'NCLEX study planner',
    'NCLEX flashcards',
    'NCLEX performance analytics',
    'best NCLEX prep features',
    'NCLEX review course features',
  ],
});

const features = [
  {
    icon: Brain,
    title: 'AI Adaptive Learning',
    badge: 'Core Technology',
    description:
      'Our proprietary AI engine continuously analyzes your performance across all NCLEX content domains to build a comprehensive learner profile. It identifies knowledge gaps, adjusts question difficulty in real time, and creates a personalized learning path that maximizes your study efficiency.',
    details: [
      'Real-time difficulty adjustment based on your responses',
      'Personalized question selection targeting weak areas',
      'Continuous learner model refinement with every answer',
      'Content domain coverage tracking and gap analysis',
    ],
  },
  {
    icon: Monitor,
    title: 'CAT Exam Simulation',
    badge: 'Exam Ready',
    description:
      'Practice with Computer Adaptive Testing simulations that replicate the exact algorithm and interface of the official NCLEX-RN and NCLEX-PN exams. Experience the same variable-length format, question difficulty escalation, and decision rules used by Pearson VUE on test day.',
    details: [
      'Authentic 75-145 question variable-length format',
      'Pearson VUE-style interface with calculator and exhibits',
      'Real-time pass/fail probability estimation',
      'Post-exam analytics with detailed performance breakdown',
    ],
  },
  {
    icon: BookOpen,
    title: '50,000+ Practice Questions',
    badge: 'Largest Bank',
    description:
      'Access the most comprehensive NCLEX question bank available, featuring over 50,000 expertly written practice questions covering every client needs category, including Next Generation NCLEX (NGN) item types. Each question includes thorough rationales for both correct and incorrect answers.',
    details: [
      'All 8 NCLEX-RN client needs categories fully covered',
      'Next Generation NCLEX (NGN) question formats included',
      'Detailed rationales for every answer choice',
      'Questions written and reviewed by NCLEX content experts',
    ],
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor',
    badge: 'Always Available',
    description:
      'Get instant, expert-level help from our AI tutor trained specifically on NCLEX content and nursing clinical knowledge. Ask questions about disease processes, pharmacology, lab values, nursing interventions, or any topic you encounter during your studies. Available 24/7 without scheduling delays.',
    details: [
      '24/7 instant access to NCLEX-specialized AI assistance',
      'Deep explanations of disease processes and pathophysiology',
      'Pharmacology drug interactions and mechanism walkthroughs',
      'Critical thinking coaching for clinical judgment questions',
    ],
  },
  {
    icon: Layers,
    title: 'Smart Flashcards',
    badge: 'Retention Boost',
    description:
      'Master essential nursing concepts with spaced repetition flashcards powered by evidence-based learning science. Our algorithm schedules reviews at optimal intervals to move knowledge from short-term to long-term memory, ensuring you retain critical information for test day and beyond.',
    details: [
      'Evidence-based spaced repetition scheduling algorithm',
      'Pre-built decks for pharmacology, lab values, and procedures',
      'Create custom flashcard decks from any question or topic',
      'Progress tracking with mastery level indicators',
    ],
  },
  {
    icon: CalendarDays,
    title: 'Study Planner',
    badge: 'Stay On Track',
    description:
      'Generate a personalized study schedule based on your exam date, available study hours, and current knowledge level. The AI-powered planner automatically adapts your daily tasks based on your progress, ensuring balanced coverage across all NCLEX domains without burnout.',
    details: [
      'Customizable schedules based on your exam date and availability',
      'AI-driven daily task recommendations',
      'Automatic rebalancing when you fall behind or get ahead',
      'Integration with practice tests and flashcard review sessions',
    ],
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    badge: 'Data Driven',
    description:
      'Track your NCLEX readiness with comprehensive analytics dashboards that visualize your progress across every content domain, question type, and difficulty level. Identify trends, monitor improvement rates, and make data-driven decisions about where to focus your study time.',
    details: [
      'Domain-by-domain performance breakdown and trends',
      'Question type analysis (multiple choice, SATA, NGN)',
      'Predicted NCLEX pass probability score',
      'Weekly and monthly progress reports with actionable insights',
    ],
  },
  {
    icon: Users,
    title: 'Community Study Groups',
    badge: 'Social Learning',
    description:
      'Join a supportive community of nursing students preparing for the NCLEX. Collaborate in study groups, participate in group discussions, share tips and strategies, and motivate each other on the journey to becoming licensed nurses.',
    details: [
      'Create or join topic-specific study groups',
      'Discussion forums moderated by nursing professionals',
      'Peer accountability and progress sharing',
      'Group challenges and leaderboards for motivation',
    ],
  },
];

const comparisonFeatures = [
  { feature: 'AI Adaptive Learning', haven: true, uworld: false, archer: false, kaplan: false },
  { feature: 'CAT Exam Simulator', haven: true, uworld: true, archer: true, kaplan: true },
  { feature: '50,000+ Questions', haven: true, uworld: false, archer: false, kaplan: false },
  { feature: 'AI Tutor (24/7)', haven: true, uworld: false, archer: false, kaplan: false },
  { feature: 'Spaced Repetition Flashcards', haven: true, uworld: true, archer: false, kaplan: false },
  { feature: 'Personalized Study Planner', haven: true, uworld: false, archer: false, kaplan: true },
  { feature: 'Performance Analytics', haven: true, uworld: true, archer: true, kaplan: true },
  { feature: 'Community Study Groups', haven: true, uworld: false, archer: false, kaplan: false },
  { feature: 'NGN Question Types', haven: true, uworld: true, archer: true, kaplan: true },
  { feature: 'Mobile Optimized', haven: true, uworld: true, archer: true, kaplan: true },
  { feature: 'Pass Guarantee', haven: true, uworld: false, archer: false, kaplan: false },
  { feature: 'Free Tier Available', haven: true, uworld: false, archer: false, kaplan: false },
];

export default function FeaturesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Features', url: '/features' },
          ]),
          softwareApplicationSchema(),
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            Platform Features
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Every Feature You Need to{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Pass the NCLEX
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Haven Institute combines AI-powered adaptive learning, realistic CAT simulations, and
            50,000+ practice questions into one comprehensive NCLEX preparation platform. Discover
            why thousands of nursing students choose us over UWorld, Archer, and Kaplan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Built for{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                NCLEX Success
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed by nursing education experts and powered by cutting-edge AI
              to give you the highest possible chance of passing on your first attempt.
            </p>
          </div>

          <div className="space-y-12">
            {features.map((feature, index) => (
              <Card key={feature.title} className="overflow-hidden border-0 shadow-md">
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:direction-rtl' : ''}`}>
                  <CardHeader className="p-8 sm:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <Badge variant="secondary">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl mb-4">{feature.title}</CardTitle>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardHeader>
                  <CardContent className="p-8 sm:p-10 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col justify-center">
                    <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                      Key Capabilities
                    </h3>
                    <ul className="space-y-3">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Differentiators */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Haven Institute Stands{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Above the Rest
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We built Haven Institute from the ground up with the latest in AI and learning science
              to deliver a NCLEX prep experience that legacy platforms simply cannot match.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm text-center p-8">
              <Sparkles className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-First Approach</h3>
              <p className="text-sm text-muted-foreground">
                Unlike legacy NCLEX prep platforms that bolt on AI as an afterthought, Haven Institute was
                designed from day one around artificial intelligence, delivering truly personalized learning
                experiences that adapt to your unique needs.
              </p>
            </Card>
            <Card className="border-0 shadow-sm text-center p-8">
              <Shield className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Pass Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                We are so confident in our platform that Premium members receive a pass guarantee. Complete
                your study plan and if you do not pass, we extend your subscription for free until you do.
                No other major NCLEX prep provider offers this level of commitment.
              </p>
            </Card>
            <Card className="border-0 shadow-sm text-center p-8">
              <Zap className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Affordable Excellence</h3>
              <p className="text-sm text-muted-foreground">
                Get more features at a fraction of the cost. While UWorld charges $400+ and Kaplan runs
                $400+ for limited access, Haven Institute starts free and offers unlimited access from just
                $29.99 per month with no long-term commitment required.
              </p>
            </Card>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Feature Comparison:{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Haven vs Competitors
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              See how Haven Institute stacks up against UWorld, Archer Review, and Kaplan NCLEX prep
              on the features that matter most for your exam success.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-sm">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-sm">
                    <span className="text-indigo-600 dark:text-indigo-400">Haven Institute</span>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-sm text-muted-foreground">UWorld</th>
                  <th className="text-center py-4 px-4 font-semibold text-sm text-muted-foreground">Archer</th>
                  <th className="text-center py-4 px-4 font-semibold text-sm text-muted-foreground">Kaplan</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.haven ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.uworld ? (
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.archer ? (
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.kaplan ? (
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Comparison based on publicly available feature lists as of 2026. Visit individual provider websites for the most current information.
          </p>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Experience the Future of NCLEX Prep?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join over 50,000 nursing students who have already discovered a better way to prepare for
            the NCLEX. Start your free account today and see why Haven Institute is the
            fastest-growing NCLEX preparation platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/compare">Compare All Providers</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Free plan available forever.
          </p>
        </section>
      </div>
    </>
  );
}
