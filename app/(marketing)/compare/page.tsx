import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema, comparisonSchema } from '@/lib/seo';
import {
  CheckCircle2,
  X,
  ArrowRight,
  Star,
  DollarSign,
  Zap,
  BookOpen,
  Brain,
  Shield,
} from 'lucide-react';

export const metadata = createMetadata({
  title: 'Compare NCLEX Prep Providers | Haven vs UWorld vs Archer vs Kaplan',
  description:
    'Compare Haven Institute with UWorld, Archer Review, Kaplan, Nursing.com, and Remar Nurse. Side-by-side NCLEX prep comparison of features, pricing, pass rates, and student reviews.',
  path: '/compare',
  keywords: [
    'best NCLEX prep comparison',
    'UWorld vs Archer',
    'NCLEX prep reviews',
    'best NCLEX prep 2026',
    'UWorld NCLEX alternative',
    'Archer review alternative',
    'Kaplan NCLEX alternative',
    'NCLEX prep comparison chart',
    'which NCLEX prep is best',
    'compare NCLEX study programs',
  ],
});

const competitors = [
  {
    slug: 'uworld',
    name: 'UWorld',
    tagline: 'Popular question bank with detailed explanations',
    price: '$400+ (90 days)',
    questions: '2,100+',
    aiAdaptive: false,
    catSim: true,
    aiTutor: false,
    flashcards: true,
    studyPlanner: false,
    passGuarantee: false,
    freeTier: false,
    communityGroups: false,
    rating: '4.5',
  },
  {
    slug: 'archer',
    name: 'Archer Review',
    tagline: 'Readiness assessments with pass prediction',
    price: '$60/mo',
    questions: '1,700+',
    aiAdaptive: false,
    catSim: true,
    aiTutor: false,
    flashcards: false,
    studyPlanner: false,
    passGuarantee: false,
    freeTier: false,
    communityGroups: false,
    rating: '4.2',
  },
  {
    slug: 'kaplan',
    name: 'Kaplan Nursing',
    tagline: 'Established test prep brand with video content',
    price: '$400+ (3 months)',
    questions: '3,000+',
    aiAdaptive: false,
    catSim: true,
    aiTutor: false,
    flashcards: false,
    studyPlanner: true,
    passGuarantee: false,
    freeTier: false,
    communityGroups: false,
    rating: '4.0',
  },
  {
    slug: 'nursing-com',
    name: 'Nursing.com',
    tagline: 'Video-focused nursing education platform',
    price: '$39/mo',
    questions: '6,000+',
    aiAdaptive: false,
    catSim: false,
    aiTutor: false,
    flashcards: true,
    studyPlanner: false,
    passGuarantee: false,
    freeTier: false,
    communityGroups: true,
    rating: '4.3',
  },
  {
    slug: 'remar-nurse',
    name: 'Remar Nurse',
    tagline: 'Virtual trainer NCLEX review program',
    price: '$200+ (one-time)',
    questions: '1,000+',
    aiAdaptive: false,
    catSim: false,
    aiTutor: false,
    flashcards: false,
    studyPlanner: false,
    passGuarantee: false,
    freeTier: false,
    communityGroups: false,
    rating: '4.1',
  },
];

const havenData = {
  name: 'Haven Institute',
  price: 'Free - $49.99/mo',
  questions: '50,000+',
  aiAdaptive: true,
  catSim: true,
  aiTutor: true,
  flashcards: true,
  studyPlanner: true,
  passGuarantee: true,
  freeTier: true,
  communityGroups: true,
  rating: '4.9',
};

const comparisonRows = [
  { label: 'Price', key: 'price' as const },
  { label: 'Practice Questions', key: 'questions' as const },
] as const;

const featureRows = [
  { label: 'AI Adaptive Learning', key: 'aiAdaptive' as const },
  { label: 'CAT Exam Simulator', key: 'catSim' as const },
  { label: 'AI Tutor (24/7)', key: 'aiTutor' as const },
  { label: 'Spaced Repetition Flashcards', key: 'flashcards' as const },
  { label: 'Personalized Study Planner', key: 'studyPlanner' as const },
  { label: 'Pass Guarantee', key: 'passGuarantee' as const },
  { label: 'Free Tier Available', key: 'freeTier' as const },
  { label: 'Community Study Groups', key: 'communityGroups' as const },
] as const;

function BooleanIcon({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
  ) : (
    <X className="h-5 w-5 text-red-400 mx-auto" />
  );
}

export default function ComparePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Compare', url: '/compare' },
          ]),
          comparisonSchema('Top NCLEX Prep Providers'),
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            NCLEX Prep Comparison
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Compare Haven Institute vs{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Top NCLEX Prep Providers
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Choosing the right NCLEX prep program is one of the most important decisions you will make
            as a nursing student. Compare Haven Institute side-by-side with UWorld, Archer Review,
            Kaplan, Nursing.com, and Remar Nurse to make an informed choice.
          </p>
        </section>

        {/* Quick Comparison Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Head-to-Head{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Comparisons
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Click any comparison below for a detailed, in-depth analysis of Haven Institute vs each competitor.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((competitor) => (
              <Link key={competitor.slug} href={`/compare/${competitor.slug}`}>
                <Card className="border-border/50 hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Haven vs {competitor.name}</CardTitle>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardDescription>{competitor.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Their Price:</span>
                        <span className="font-medium">{competitor.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Their Questions:</span>
                        <span className="font-medium">{competitor.questions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">AI Adaptive:</span>
                        <BooleanIcon value={competitor.aiAdaptive} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">AI Tutor:</span>
                        <BooleanIcon value={competitor.aiTutor} />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      View Full Comparison
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Comprehensive Comparison Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Complete Feature{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Comparison Matrix
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature compared across all major NCLEX prep providers. See exactly what you get
              with each platform.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-3 font-semibold text-sm w-48">Feature</th>
                  <th className="text-center py-4 px-3 font-semibold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                    Haven Institute
                  </th>
                  {competitors.map((c) => (
                    <th key={c.slug} className="text-center py-4 px-3 font-semibold text-sm text-muted-foreground">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Text rows */}
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 text-sm font-medium">{row.label}</td>
                    <td className="py-3 px-3 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                      {havenData[row.key]}
                    </td>
                    {competitors.map((c) => (
                      <td key={c.slug} className="py-3 px-3 text-center text-sm text-muted-foreground">
                        {c[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Rating row */}
                <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 text-sm font-medium">Average Rating</td>
                  <td className="py-3 px-3 text-center bg-indigo-50/50 dark:bg-indigo-950/20">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{havenData.rating}</span>
                    </div>
                  </td>
                  {competitors.map((c) => (
                    <td key={c.slug} className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-muted-foreground">{c.rating}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Boolean feature rows */}
                {featureRows.map((row) => (
                  <tr key={row.label} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 text-sm font-medium">{row.label}</td>
                    <td className="py-3 px-3 text-center bg-indigo-50/50 dark:bg-indigo-950/20">
                      <BooleanIcon value={havenData[row.key]} />
                    </td>
                    {competitors.map((c) => (
                      <td key={c.slug} className="py-3 px-3 text-center">
                        <BooleanIcon value={c[row.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Data gathered from publicly available sources as of February 2026. Pricing and features may change. Visit provider websites for the latest information.
          </p>
        </section>

        {/* Why Haven Wins */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Students Choose{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Haven Institute
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm text-center p-6">
              <DollarSign className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Best Value</h3>
              <p className="text-sm text-muted-foreground">
                More features at a fraction of the cost. Start free and get full access from just $29.99 per month.
              </p>
            </Card>
            <Card className="border-0 shadow-sm text-center p-6">
              <Brain className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">True AI Adaptive</h3>
              <p className="text-sm text-muted-foreground">
                The only NCLEX prep with genuine AI adaptive learning that personalizes every question to your level.
              </p>
            </Card>
            <Card className="border-0 shadow-sm text-center p-6">
              <BookOpen className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Largest Question Bank</h3>
              <p className="text-sm text-muted-foreground">
                Over 50,000 practice questions, dwarfing the competition. Never run out of fresh content to study.
              </p>
            </Card>
            <Card className="border-0 shadow-sm text-center p-6">
              <Shield className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Pass Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                The only major NCLEX prep to offer a pass guarantee. Follow the plan and pass, or we extend your access free.
              </p>
            </Card>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Pricing{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Comparison
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              See how much you save by choosing Haven Institute for your NCLEX preparation.
            </p>
          </div>
          <div className="space-y-4">
            <Card className="border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/10">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">Haven Institute</h3>
                  <p className="text-sm text-muted-foreground">Free tier available, Pro from $29.99/mo</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">$0 - $49.99</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </CardContent>
            </Card>
            {competitors.map((c) => (
              <Card key={c.slug} className="border-border/50">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-medium">{c.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to See the Difference for Yourself?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 50,000+ nursing students who switched to Haven Institute for a smarter, more
            affordable NCLEX prep experience. Start with a free account and discover why we are the
            top-rated NCLEX preparation platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
