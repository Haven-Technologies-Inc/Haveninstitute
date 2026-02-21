import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import {
  ArrowRight,
  Heart,
  Target,
  Users,
  BookOpen,
  Shield,
  GraduationCap,
  Award,
  Globe,
  Lightbulb,
} from 'lucide-react';

export const metadata = createMetadata({
  title: 'About Haven Institute | Our Mission to Transform NCLEX Preparation',
  description:
    'Learn about Haven Institute, the AI-powered NCLEX preparation platform founded by nursing educators. Our mission is to make high-quality NCLEX prep accessible and affordable for every nursing student.',
  path: '/about',
  keywords: [
    'about Haven Institute',
    'NCLEX prep company',
    'nursing education platform',
    'Haven Institute mission',
    'NCLEX prep team',
    'nursing exam preparation company',
    'AI nursing education',
    'Haven study about us',
  ],
});

const stats = [
  { value: '50,000+', label: 'Students Helped', icon: Users },
  { value: '98%', label: 'First-Attempt Pass Rate', icon: Target },
  { value: '50,000+', label: 'Practice Questions', icon: BookOpen },
  { value: '4.9/5', label: 'Average Student Rating', icon: Award },
];

const values = [
  {
    icon: Heart,
    title: 'Student-First Philosophy',
    description:
      'Every decision we make starts with a simple question: will this help our students pass the NCLEX? From feature development to pricing, student success is our north star.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation in Education',
    description:
      'We believe the future of nursing education lies at the intersection of AI and evidence-based pedagogy. We continuously invest in research and development to push the boundaries of what adaptive learning can achieve.',
  },
  {
    icon: Globe,
    title: 'Accessibility for All',
    description:
      'Quality NCLEX preparation should not be a privilege reserved for those who can afford $400+ programs. We offer a free tier and affordable paid plans to ensure every aspiring nurse has a path to licensure.',
  },
  {
    icon: Shield,
    title: 'Academic Integrity',
    description:
      'Our questions are 100% original, written and peer-reviewed by experienced nursing educators. We never reuse exam questions or engage in practices that compromise the integrity of the NCLEX.',
  },
  {
    icon: GraduationCap,
    title: 'Evidence-Based Learning',
    description:
      'Our platform is grounded in learning science research, including spaced repetition, active recall, interleaving, and desirable difficulties. We translate academic research into practical study tools.',
  },
  {
    icon: Users,
    title: 'Community and Support',
    description:
      'Studying for the NCLEX can feel isolating. We foster a supportive community where nursing students encourage each other, share strategies, and celebrate successes together.',
  },
];

const team = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Co-Founder & CEO',
    bio: 'Former nursing professor with 15 years of experience in NCLEX preparation. PhD in Nursing Education from Johns Hopkins University.',
  },
  {
    name: 'Michael Torres',
    role: 'Co-Founder & CTO',
    bio: 'Machine learning engineer and former edtech lead at a major education platform. MS in Computer Science from Stanford University.',
  },
  {
    name: 'Dr. Amanda Williams',
    role: 'Chief Academic Officer',
    bio: 'Board-certified nurse educator with 20 years of clinical and teaching experience. Oversees all question content and curriculum development.',
  },
  {
    name: 'James Park',
    role: 'VP of Engineering',
    bio: 'Full-stack engineer with a passion for building scalable education technology. Previously led engineering at two successful edtech startups.',
  },
  {
    name: 'Dr. Lisa Nguyen',
    role: 'Head of AI & Learning Science',
    bio: 'AI researcher specializing in adaptive learning systems. PhD in Cognitive Science with a focus on knowledge assessment modeling.',
  },
  {
    name: 'Rachel Johnson',
    role: 'Head of Student Success',
    bio: 'Registered nurse and former NCLEX tutor. Leads our student support team and designs the coaching programs for Premium members.',
  },
];

const milestones = [
  { year: '2024', event: 'Haven Institute founded by Dr. Sarah Chen and Michael Torres in San Francisco.' },
  { year: '2024', event: 'Launched beta platform with 5,000 practice questions and AI adaptive engine.' },
  { year: '2025', event: 'Reached 10,000 registered students. Expanded question bank to 25,000+ questions.' },
  { year: '2025', event: 'Introduced CAT simulation engine and AI tutor feature. Partnered with 50+ nursing schools.' },
  { year: '2026', event: 'Surpassed 50,000 students. Expanded to 50,000+ questions. Achieved 98% first-attempt pass rate.' },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'About', url: '/about' },
          ]),
          organizationSchema(),
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
              About Haven Institute
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Transforming How Nurses{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Prepare for the NCLEX
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Haven Institute was founded with a single mission: to make world-class NCLEX
              preparation accessible and affordable for every nursing student. We combine
              cutting-edge AI technology with proven learning science to deliver a preparation
              experience that adapts to you.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Our Story */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Our{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Story
              </span>
            </h2>
          </div>
          <div className="prose prose-lg dark:prose-invert mx-auto max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              Haven Institute was born out of frustration. Our co-founder, Dr. Sarah Chen, spent 15
              years as a nursing professor watching her students struggle with expensive, outdated NCLEX
              prep materials that failed to adapt to individual learning needs. Despite costing hundreds
              of dollars, these programs offered a one-size-fits-all approach that left many students
              underprepared and anxious.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              When she met Michael Torres, a machine learning engineer passionate about education
              technology, they realized they could build something fundamentally better. By combining
              Sarah&apos;s deep expertise in nursing education with Michael&apos;s AI and adaptive learning
              technology background, they created Haven Institute: an NCLEX prep platform that truly
              understands each student and creates a personalized path to success.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Today, Haven Institute serves over 50,000 nursing students across the United States.
              Our AI-powered platform has helped thousands of aspiring nurses pass the NCLEX on their
              first attempt, and we are just getting started. We continue to invest in research,
              expand our question bank, and refine our adaptive algorithms to stay at the forefront
              of nursing education technology.
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Our{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-start gap-6 ${
                    index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  <div className="hidden sm:block sm:w-1/2" />
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-indigo-500 border-2 border-background mt-1.5" />
                  <div className="pl-10 sm:pl-0 sm:w-1/2">
                    <Badge variant="outline" className="mb-2">{milestone.year}</Badge>
                    <p className="text-sm text-muted-foreground">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Our{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at Haven Institute, from the features we
              build to the way we support our students.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Meet Our{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Haven Institute is led by a team of nursing educators, AI researchers, and education
              technology experts united by a shared passion for improving nursing education.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trust Signals */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Nursing Schools Nationwide
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">50+</p>
              <p className="text-sm text-muted-foreground mt-1">Nursing School Partners</p>
            </div>
            <div className="p-6">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">SOC 2</p>
              <p className="text-sm text-muted-foreground mt-1">Type II Compliant</p>
            </div>
            <div className="p-6">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">HIPAA</p>
              <p className="text-sm text-muted-foreground mt-1">Compliant Platform</p>
            </div>
            <div className="p-6">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">99.9%</p>
              <p className="text-sm text-muted-foreground mt-1">Platform Uptime</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Join the Haven Institute Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Become part of a growing community of nursing students and educators who believe in a
            better way to prepare for the NCLEX. Start your free account today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
