import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Brain, Trophy, BookOpen, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NCLEX-PN Prep - Haven Institute | Pass Your LPN/LVN Exam',
  description: 'Comprehensive NCLEX-PN preparation with AI-powered adaptive learning. Practice questions, CAT simulations, and personalized study plans for LPN/LVN students.',
};

export default function NCLEXPNPrepPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1">NCLEX-PN Preparation</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold">
            Ace Your <span className="gradient-text">NCLEX-PN</span> Exam
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive LPN/LVN exam preparation with AI-powered adaptive learning
            tailored specifically for NCLEX-PN test takers.
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
            { icon: Brain, title: 'PN-Focused Content', desc: 'Questions specifically designed for NCLEX-PN scope of practice' },
            { icon: Trophy, title: 'CAT Simulation', desc: 'Practice with PN-specific adaptive testing algorithms' },
            { icon: BookOpen, title: 'Complete Coverage', desc: 'All PN client needs categories and clinical scenarios' },
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
              'PN-specific adaptive questions', 'CAT exam simulations',
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
