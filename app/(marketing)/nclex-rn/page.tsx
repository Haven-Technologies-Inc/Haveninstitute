import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Brain, Trophy, Users, BookOpen, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NCLEX-RN Prep - Haven Institute | Pass Your Nursing Exam',
  description: 'Comprehensive NCLEX-RN preparation with AI-powered adaptive learning. 10,000+ questions, CAT simulations, and personalized study plans. 98% pass rate.',
};

export default function NCLEXRNPrepPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1">NCLEX-RN Preparation</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold">
            Pass Your <span className="gradient-text">NCLEX-RN</span> on the First Attempt
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join 50,000+ nursing students who passed their NCLEX-RN with Haven Institute&apos;s
            AI-powered adaptive learning platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Start Free Today <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'Adaptive Learning', desc: 'AI adjusts to your strengths and weaknesses in real-time' },
            { icon: Trophy, title: 'CAT Simulation', desc: 'Practice with exams that mirror the real NCLEX-RN' },
            { icon: BookOpen, title: '10,000+ Questions', desc: 'Covering all 8 NCLEX-RN client needs categories' },
          ].map((f) => (
            <Card key={f.title} className="border-0 shadow-sm">
              <CardContent className="p-6 text-center space-y-3">
                <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">What&apos;s Included</h2>
          <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
            {[
              'AI-powered adaptive questions', 'Full CAT exam simulations',
              'Detailed rationales', 'Performance analytics',
              'Personalized study plans', 'Community support',
              'Spaced repetition flashcards', '24/7 AI tutor',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
