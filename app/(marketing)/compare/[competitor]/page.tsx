import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema, comparisonSchema, faqSchema } from '@/lib/seo';
import { CheckCircle2, X, ArrowRight, Star, Trophy, Target, DollarSign, Zap } from 'lucide-react';

interface CompetitorData {
  slug: string;
  name: string;
  fullName: string;
  description: string;
  price: string;
  priceDetail: string;
  questions: string;
  passRate: string;
  strengths: string[];
  weaknesses: string[];
  features: Record<string, boolean>;
  overview: string;
  whySwitch: string;
  faqs: Array<{ question: string; answer: string }>;
}

const competitorData: Record<string, CompetitorData> = {
  uworld: {
    slug: 'uworld',
    name: 'UWorld',
    fullName: 'UWorld NCLEX',
    description: 'UWorld is one of the most well-known NCLEX prep question banks, recognized for its detailed explanations and high-quality practice questions.',
    price: '$400+',
    priceDetail: 'for a 90-day subscription with limited renewals available at additional cost',
    questions: '2,100+',
    passRate: 'Self-reported ~93%',
    strengths: [
      'Well-written question rationales with detailed explanations',
      'Strong reputation among nursing students and educators',
      'Good question quality with clinical vignettes',
      'Self-assessment exams for readiness evaluation',
    ],
    weaknesses: [
      'Expensive at $400+ for only 90 days of access',
      'No AI adaptive learning or personalized question selection',
      'Limited question bank size (2,100+ questions vs 50,000+)',
      'No AI tutor for on-demand help and concept explanation',
      'No free tier to try before purchasing',
      'No pass guarantee program',
      'No community features or study groups',
      'No integrated study planner for scheduling',
    ],
    features: {
      'AI Adaptive Learning': false,
      'CAT Exam Simulator': true,
      'AI Tutor (24/7)': false,
      'Spaced Repetition Flashcards': true,
      'Personalized Study Planner': false,
      'Pass Guarantee': false,
      'Free Tier': false,
      'Community Study Groups': false,
      'NGN Question Types': true,
      'Detailed Rationales': true,
      'Performance Analytics': true,
      'Mobile App': true,
    },
    overview:
      'UWorld has been a staple in NCLEX preparation for years, primarily known for its question bank quality. However, in an era of AI-powered personalized learning, UWorld relies on a traditional static question bank model. Students must manually select which topics to study, and the system does not adapt question difficulty or selection based on individual performance patterns. At $400+ for just 90 days of access, it represents one of the most expensive options on the market with fewer features than modern alternatives.',
    whySwitch:
      'Haven Institute offers everything UWorld provides and much more at a fraction of the cost. Our AI adaptive engine personalizes every study session to your unique knowledge profile, our question bank is 20 times larger with 50,000+ questions, and our AI tutor provides instant help 24/7. While UWorld charges $400+ for 90 days, Haven Institute starts completely free and offers comprehensive access from just $29.99 per month.',
    faqs: [
      {
        question: 'Is Haven Institute better than UWorld for NCLEX prep?',
        answer: 'Haven Institute offers more features at a lower price than UWorld. With AI adaptive learning, 50,000+ questions (vs UWorld\'s 2,100+), an AI tutor, and a pass guarantee, Haven Institute provides a more comprehensive and personalized NCLEX prep experience. UWorld is known for quality rationales, but Haven Institute matches this quality while adding significantly more features and flexibility.',
      },
      {
        question: 'How does Haven Institute\'s question bank compare to UWorld?',
        answer: 'Haven Institute offers over 50,000 practice questions compared to UWorld\'s approximately 2,100+. Both platforms provide detailed rationales for every answer choice and cover all NCLEX content areas including NGN question types. Haven Institute\'s larger bank means you will never run out of fresh questions and can practice more extensively in your weak areas.',
      },
      {
        question: 'Can I switch from UWorld to Haven Institute?',
        answer: 'Yes, switching is simple. Create a free Haven Institute account to explore the platform at no cost. Many nursing students use Haven Institute alongside or as a replacement for UWorld and find that the AI adaptive learning and larger question bank significantly improve their preparation. Your study progress in Haven Institute starts fresh with our AI learning your strengths and weaknesses from the first question.',
      },
    ],
  },
  archer: {
    slug: 'archer',
    name: 'Archer Review',
    fullName: 'Archer Review NCLEX',
    description: 'Archer Review is a newer NCLEX prep platform known for its readiness assessments and pass prediction algorithm.',
    price: '$60/mo',
    priceDetail: 'per month with optional add-ons for additional features',
    questions: '1,700+',
    passRate: 'Self-reported ~91%',
    strengths: [
      'Readiness assessments with pass prediction scores',
      'More affordable than UWorld and Kaplan',
      'Regularly updated question content',
      'CAT-style practice assessments',
    ],
    weaknesses: [
      'No AI adaptive learning technology',
      'Smaller question bank (1,700+ questions)',
      'No AI tutor for on-demand assistance',
      'No spaced repetition flashcard system',
      'No integrated study planner',
      'No free tier available',
      'No pass guarantee',
      'Limited community features',
    ],
    features: {
      'AI Adaptive Learning': false,
      'CAT Exam Simulator': true,
      'AI Tutor (24/7)': false,
      'Spaced Repetition Flashcards': false,
      'Personalized Study Planner': false,
      'Pass Guarantee': false,
      'Free Tier': false,
      'Community Study Groups': false,
      'NGN Question Types': true,
      'Detailed Rationales': true,
      'Performance Analytics': true,
      'Mobile App': true,
    },
    overview:
      'Archer Review has gained popularity as a more affordable alternative to UWorld, offering readiness assessments that attempt to predict your likelihood of passing the NCLEX. While the readiness assessment concept is useful, Archer relies on a traditional question bank approach without AI-powered adaptation. The question bank is relatively small at 1,700+ questions, and the platform lacks many modern features like an AI tutor, flashcards, and a study planner.',
    whySwitch:
      'Haven Institute offers a dramatically more complete NCLEX prep experience than Archer Review at comparable or lower pricing. For just $29.99 per month, Haven Institute provides AI adaptive learning, a 50,000+ question bank (30 times larger than Archer), an AI tutor, smart flashcards, a personalized study planner, and a pass guarantee. Archer charges $60 per month for a fraction of these features.',
    faqs: [
      {
        question: 'Is Haven Institute better than Archer Review?',
        answer: 'Haven Institute offers significantly more features and a larger question bank than Archer Review at a lower price point. Haven Institute provides AI adaptive learning, 50,000+ questions (vs Archer\'s 1,700+), an AI tutor, flashcards, a study planner, community groups, and a pass guarantee. Archer Review is primarily a question bank with readiness assessments, while Haven Institute is a comprehensive preparation platform.',
      },
      {
        question: 'How much can I save by switching from Archer to Haven Institute?',
        answer: 'Archer Review charges approximately $60 per month. Haven Institute\'s Pro plan is $29.99 per month, saving you over $30 per month while gaining access to AI adaptive learning, a much larger question bank, an AI tutor, flashcards, and a study planner. You can also start completely free to try the platform before committing.',
      },
      {
        question: 'Does Haven Institute have readiness assessments like Archer?',
        answer: 'Yes, Haven Institute provides readiness assessment through our CAT simulation engine, which uses the same adaptive algorithm as the real NCLEX exam. Unlike Archer\'s assessments, Haven Institute\'s CAT simulations are powered by AI that tracks your performance across all content domains and provides a comprehensive predicted pass probability score along with detailed analytics.',
      },
    ],
  },
  kaplan: {
    slug: 'kaplan',
    name: 'Kaplan',
    fullName: 'Kaplan NCLEX Prep',
    description: 'Kaplan is a long-established test preparation company offering NCLEX review courses with video content, question banks, and structured study plans.',
    price: '$400+',
    priceDetail: 'for a 3-month course, with premium packages costing significantly more',
    questions: '3,000+',
    passRate: 'Self-reported ~93%',
    strengths: [
      'Well-established brand with decades of test prep experience',
      'Video content library with instructor-led lessons',
      'Structured study schedules and curriculum',
      'Live and on-demand review classes available',
    ],
    weaknesses: [
      'Very expensive at $400+ for basic access',
      'No AI adaptive learning or personalized question paths',
      'Rigid, one-size-fits-all curriculum structure',
      'No AI tutor for on-demand help',
      'No free tier or low-cost entry option',
      'No pass guarantee on standard plans',
      'No integrated flashcard system',
      'Dated platform interface compared to modern alternatives',
    ],
    features: {
      'AI Adaptive Learning': false,
      'CAT Exam Simulator': true,
      'AI Tutor (24/7)': false,
      'Spaced Repetition Flashcards': false,
      'Personalized Study Planner': true,
      'Pass Guarantee': false,
      'Free Tier': false,
      'Community Study Groups': false,
      'NGN Question Types': true,
      'Detailed Rationales': true,
      'Performance Analytics': true,
      'Mobile App': true,
    },
    overview:
      'Kaplan has been in the test preparation business for decades and brings brand recognition and a structured approach to NCLEX prep. Their courses include video lectures, a question bank, and predetermined study schedules. However, Kaplan\'s approach is largely one-size-fits-all, relying on the same curriculum and study plan for all students regardless of individual strengths and weaknesses. At $400+ for the basic package, it represents a significant investment for what is essentially a traditional study course without AI personalization.',
    whySwitch:
      'Haven Institute offers a fundamentally more modern and effective NCLEX prep approach than Kaplan at a dramatically lower price. Our AI adaptive engine creates a truly personalized learning experience that Kaplan\'s rigid curriculum cannot match. With 50,000+ questions, an AI tutor, smart flashcards, and a pass guarantee, Haven Institute delivers more value from $29.99 per month than Kaplan delivers at $400+.',
    faqs: [
      {
        question: 'Is Haven Institute better than Kaplan for NCLEX prep?',
        answer: 'Haven Institute provides a more personalized, feature-rich, and affordable NCLEX prep experience than Kaplan. While Kaplan offers a structured curriculum with video content, Haven Institute\'s AI adaptive learning creates a truly personalized study path. Haven Institute also offers 50,000+ questions (vs Kaplan\'s 3,000+), an AI tutor, a pass guarantee, and starts at just $29.99 per month compared to Kaplan\'s $400+.',
      },
      {
        question: 'Does Haven Institute have video content like Kaplan?',
        answer: 'Haven Institute takes a different approach to content delivery. Instead of passive video lectures, Haven Institute uses active learning strategies powered by AI, including adaptive practice questions, interactive flashcards, and a 24/7 AI tutor that can explain any concept in detail. Research shows active learning is significantly more effective than passive video watching for exam preparation.',
      },
      {
        question: 'How much can I save switching from Kaplan to Haven Institute?',
        answer: 'Kaplan NCLEX prep costs $400+ for a 3-month course. Haven Institute\'s Pro plan is $29.99 per month, meaning 3 months costs just $89.97, saving you over $310. And unlike Kaplan, Haven Institute offers a free tier to get started, monthly billing with no long-term commitment, and significantly more features including AI adaptive learning and an AI tutor.',
      },
    ],
  },
  'nursing-com': {
    slug: 'nursing-com',
    name: 'Nursing.com',
    fullName: 'Nursing.com (NRSNG)',
    description: 'Nursing.com (formerly NRSNG) is a nursing education platform focused on video-based learning content and visual study tools.',
    price: '$39/mo',
    priceDetail: 'per month for full access to video library and study tools',
    questions: '6,000+',
    passRate: 'Not publicly disclosed',
    strengths: [
      'Extensive video content library with visual explanations',
      'Good for visual learners who prefer video-based instruction',
      'Flashcard and study tool collection',
      'Active online community and social media presence',
    ],
    weaknesses: [
      'No AI adaptive learning technology',
      'No AI tutor for on-demand personalized help',
      'No authentic CAT exam simulation',
      'Primary focus on video content rather than active practice',
      'No pass guarantee program',
      'Limited practice question analytics',
      'Not specifically designed as an NCLEX prep platform',
      'No personalized study planner with AI optimization',
    ],
    features: {
      'AI Adaptive Learning': false,
      'CAT Exam Simulator': false,
      'AI Tutor (24/7)': false,
      'Spaced Repetition Flashcards': true,
      'Personalized Study Planner': false,
      'Pass Guarantee': false,
      'Free Tier': false,
      'Community Study Groups': true,
      'NGN Question Types': false,
      'Detailed Rationales': true,
      'Performance Analytics': false,
      'Mobile App': true,
    },
    overview:
      'Nursing.com takes a video-first approach to nursing education, offering an extensive library of video lessons, visual study aids, and nursing concept breakdowns. While the video content can be helpful for understanding nursing concepts, the platform is not specifically designed as an NCLEX test preparation tool. It lacks key features like CAT simulations, AI adaptive learning, and comprehensive performance analytics that are essential for focused NCLEX preparation.',
    whySwitch:
      'Haven Institute is purpose-built for NCLEX preparation with AI adaptive learning, CAT simulations, and 50,000+ practice questions, while Nursing.com is primarily a general nursing education video platform. At $29.99 per month, Haven Institute costs less than Nursing.com\'s $39 per month while providing dramatically more exam-specific features including a CAT simulator, AI tutor, personalized study planner, and a pass guarantee.',
    faqs: [
      {
        question: 'Is Haven Institute better than Nursing.com for NCLEX prep?',
        answer: 'For dedicated NCLEX exam preparation, Haven Institute is significantly more effective than Nursing.com. Haven Institute is purpose-built for NCLEX prep with AI adaptive learning, CAT simulations, and 50,000+ practice questions. Nursing.com is primarily a video-based nursing education platform that is helpful for understanding concepts but lacks the focused test preparation tools needed for NCLEX success.',
      },
      {
        question: 'Can I use Haven Institute and Nursing.com together?',
        answer: 'Yes, some students use Nursing.com for video-based concept review alongside Haven Institute for dedicated NCLEX test preparation. However, many students find that Haven Institute\'s AI tutor and comprehensive question rationales provide all the concept explanation they need, making a separate video platform unnecessary.',
      },
      {
        question: 'Does Haven Institute have video content?',
        answer: 'Haven Institute focuses on active learning strategies rather than passive video consumption. Our AI tutor provides detailed, interactive explanations of any nursing concept on demand, and our question rationales offer thorough walkthroughs of disease processes, pharmacology, and clinical reasoning. Research consistently shows that active practice is more effective than passive video watching for exam preparation.',
      },
    ],
  },
  'remar-nurse': {
    slug: 'remar-nurse',
    name: 'Remar Nurse',
    fullName: 'Remar Review Virtual Trainer',
    description: 'Remar Nurse offers a Virtual Trainer program designed to guide nursing students through NCLEX preparation with a structured content review approach.',
    price: '$200+',
    priceDetail: 'one-time payment for the Virtual Trainer program',
    questions: '1,000+',
    passRate: 'Self-reported ~95%',
    strengths: [
      'One-time payment model instead of subscription',
      'Structured Virtual Trainer program with guided content',
      'Focus on content mastery and clinical reasoning',
      'Good for students who prefer guided learning paths',
    ],
    weaknesses: [
      'Very small question bank (1,000+ questions)',
      'No AI adaptive learning or personalization',
      'No CAT exam simulation',
      'No AI tutor for on-demand help',
      'No flashcard or spaced repetition tools',
      'No performance analytics dashboard',
      'Limited technology and dated platform',
      'No community features or study groups',
    ],
    features: {
      'AI Adaptive Learning': false,
      'CAT Exam Simulator': false,
      'AI Tutor (24/7)': false,
      'Spaced Repetition Flashcards': false,
      'Personalized Study Planner': false,
      'Pass Guarantee': false,
      'Free Tier': false,
      'Community Study Groups': false,
      'NGN Question Types': false,
      'Detailed Rationales': true,
      'Performance Analytics': false,
      'Mobile App': false,
    },
    overview:
      'Remar Nurse\'s Virtual Trainer is a structured NCLEX review program that guides students through content areas with a focus on mastery before moving forward. The program uses a sequential approach where students must demonstrate understanding of each topic before progressing. While this structure can be effective for some learners, it is rigid and does not adapt to individual needs. With approximately 1,000 practice questions and no CAT simulations, the platform is limited in its exam simulation capabilities.',
    whySwitch:
      'Haven Institute provides a dramatically more comprehensive and technologically advanced NCLEX prep experience than Remar Nurse. With AI adaptive learning, 50,000+ questions (50 times more than Remar), CAT simulations, an AI tutor, flashcards, analytics, and a pass guarantee, Haven Institute offers an unmatched preparation toolkit. Our free tier lets you get started at no cost, and our Pro plan at $29.99 per month provides ongoing access versus Remar\'s static one-time purchase.',
    faqs: [
      {
        question: 'Is Haven Institute better than Remar Nurse for NCLEX prep?',
        answer: 'Haven Institute offers a far more comprehensive NCLEX prep experience than Remar Nurse. With AI adaptive learning, 50,000+ practice questions (vs Remar\'s approximately 1,000), CAT simulations, an AI tutor, flashcards, a study planner, and analytics, Haven Institute provides tools that Remar simply does not have. While Remar\'s Virtual Trainer is structured, Haven Institute\'s AI creates a truly personalized learning path.',
      },
      {
        question: 'Remar is a one-time payment. Why should I choose Haven Institute\'s subscription?',
        answer: 'While Remar\'s one-time payment of $200+ seems attractive, you get limited content that does not update or adapt. Haven Institute\'s subscription model means you always have access to the latest questions, continuously improving AI, new features, and ongoing support. At $29.99 per month for Pro, just 2 months of Haven costs less than Remar while providing 50 times more questions and vastly more features.',
      },
      {
        question: 'Does Haven Institute have a structured program like Remar\'s Virtual Trainer?',
        answer: 'Yes, Haven Institute\'s AI-powered study planner creates a structured, personalized study program based on your exam date, available hours, and current knowledge level. Unlike Remar\'s one-size-fits-all approach, Haven Institute\'s planner dynamically adjusts your daily tasks based on your performance, ensuring you spend the right amount of time on each topic area.',
      },
    ],
  },
};

const havenFeatures: Record<string, boolean> = {
  'AI Adaptive Learning': true,
  'CAT Exam Simulator': true,
  'AI Tutor (24/7)': true,
  'Spaced Repetition Flashcards': true,
  'Personalized Study Planner': true,
  'Pass Guarantee': true,
  'Free Tier': true,
  'Community Study Groups': true,
  'NGN Question Types': true,
  'Detailed Rationales': true,
  'Performance Analytics': true,
  'Mobile App': true,
};

export function generateStaticParams() {
  return [
    { competitor: 'uworld' },
    { competitor: 'archer' },
    { competitor: 'kaplan' },
    { competitor: 'nursing-com' },
    { competitor: 'remar-nurse' },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const data = competitorData[competitor];
  if (!data) return {};

  return createMetadata({
    title: `Haven Institute vs ${data.name} - NCLEX Prep Comparison 2026`,
    description: `Compare Haven Institute with ${data.fullName} for NCLEX preparation. Side-by-side comparison of features, pricing, question banks, and pass rates. See which NCLEX prep is better for you.`,
    path: `/compare/${data.slug}`,
    keywords: [
      `Haven Institute vs ${data.name}`,
      `${data.name} NCLEX alternative`,
      `${data.name} vs Haven`,
      `best NCLEX prep vs ${data.name}`,
      `${data.name} NCLEX review`,
      `${data.name} NCLEX pricing`,
      'NCLEX prep comparison',
      'best NCLEX prep 2026',
    ],
  });
}

export default async function CompetitorComparisonPage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  const data = competitorData[competitor];

  if (!data) {
    notFound();
  }

  const featureKeys = Object.keys(data.features);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Compare', url: '/compare' },
            { name: `Haven vs ${data.name}`, url: `/compare/${data.slug}` },
          ]),
          comparisonSchema(data.fullName),
          faqSchema(data.faqs),
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            NCLEX Prep Comparison
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Haven Institute vs {data.name} &mdash;{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Which NCLEX Prep is Better?
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {data.description} See how it compares to Haven Institute&apos;s AI-powered NCLEX preparation
            platform in this detailed side-by-side analysis.
          </p>
        </section>

        {/* Quick Stats */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-indigo-500" />
                  <CardTitle className="text-xl text-indigo-600 dark:text-indigo-400">Haven Institute</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">Free - $49.99/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-medium">50,000+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pass Rate:</span>
                  <span className="font-medium">98% first attempt</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">4.9/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-muted-foreground" />
                  <CardTitle className="text-xl">{data.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">{data.price} {data.priceDetail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-medium">{data.questions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pass Rate:</span>
                  <span className="font-medium">{data.passRate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="font-medium">See reviews</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Overview */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            {data.name}{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Overview
            </span>
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">{data.overview}</p>
        </section>

        {/* Feature Comparison Table */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Feature-by-Feature{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Comparison
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-sm">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                    Haven Institute
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-sm text-muted-foreground">
                    {data.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureKeys.map((feature) => (
                  <tr key={feature} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{feature}</td>
                    <td className="py-3 px-4 text-center">
                      {havenFeatures[feature] ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {data.features[feature] ? (
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
        </section>

        {/* Strengths & Weaknesses */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            {data.name} Strengths &amp;{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Weaknesses
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  {data.name} Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.strengths.map((strength) => (
                    <li key={strength} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                      <span className="text-sm text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <X className="h-5 w-5 text-red-400" />
                  {data.name} Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.weaknesses.map((weakness) => (
                    <li key={weakness} className="flex items-start gap-3">
                      <X className="h-4 w-4 text-red-400 shrink-0 mt-1" />
                      <span className="text-sm text-muted-foreground">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Switch */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/10">
            <CardContent className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="h-8 w-8 text-indigo-500" />
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Why Switch to Haven Institute?
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">{data.whySwitch}</p>
              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <DollarSign className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Save Money</p>
                  <p className="text-xs text-muted-foreground mt-1">Start free, Pro from $29.99/mo</p>
                </div>
                <div className="text-center p-4">
                  <Target className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Better Results</p>
                  <p className="text-xs text-muted-foreground mt-1">98% first-attempt pass rate</p>
                </div>
                <div className="text-center p-4">
                  <Star className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <p className="font-semibold text-sm">More Features</p>
                  <p className="text-xs text-muted-foreground mt-1">AI tutor, 50K+ questions, pass guarantee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <div className="space-y-4">
            {data.faqs.map((faq) => (
              <Card key={faq.question} className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Other Comparisons */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">Other NCLEX Prep Comparisons</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.values(competitorData)
              .filter((c) => c.slug !== data.slug)
              .map((c) => (
                <Button key={c.slug} variant="outline" size="sm" asChild>
                  <Link href={`/compare/${c.slug}`}>Haven vs {c.name}</Link>
                </Button>
              ))}
            <Button variant="outline" size="sm" asChild>
              <Link href="/compare">View All Comparisons</Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Try a Better NCLEX Prep?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 50,000+ nursing students who chose Haven Institute for smarter, more affordable
            NCLEX preparation. Start your free account today and experience the difference.
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
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Free plan available forever.
          </p>
        </section>
      </div>
    </>
  );
}
