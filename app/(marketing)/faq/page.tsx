import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, faqSchema, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'FAQ - NCLEX Prep Questions Answered',
  description:
    'Find answers to frequently asked questions about Haven Institute NCLEX prep. Learn about pricing, features, CAT simulations, AI tutor, study plans, pass guarantee, and more.',
  path: '/faq',
  keywords: [
    'NCLEX prep FAQ',
    'Haven Institute FAQ',
    'NCLEX exam questions',
    'NCLEX prep help',
    'NCLEX CAT explained',
    'NCLEX study plan questions',
    'NCLEX pass guarantee',
    'NCLEX prep pricing',
  ],
});

interface FAQCategory {
  title: string;
  id: string;
  questions: Array<{ question: string; answer: string }>;
}

const faqCategories: FAQCategory[] = [
  {
    title: 'Platform & Features',
    id: 'features',
    questions: [
      {
        question: 'How does Haven Institute\'s AI-powered adaptive learning work?',
        answer:
          'Our AI engine analyzes your performance in real-time—tracking answer accuracy, response time, and knowledge patterns across all NCLEX content domains. It builds a personalized model of your strengths and weaknesses, then dynamically adjusts question difficulty and study focus to maximize learning efficiency. The more you study, the smarter it gets at identifying exactly what you need to review.',
      },
      {
        question: 'Does the CAT simulation accurately mirror the real NCLEX exam?',
        answer:
          'Yes. Our Computer Adaptive Testing simulation uses the same algorithmic logic as the official NCLEX-RN (75-145 questions) and NCLEX-PN (85-205 questions) exams. Questions increase or decrease in difficulty based on your performance, and the interface closely replicates the Pearson VUE testing environment, including calculator and exhibit features. This eliminates test-day surprises.',
      },
      {
        question: 'What is the AI tutor and how does it work?',
        answer:
          'The AI tutor is a 24/7 nursing knowledge assistant powered by advanced AI. You can ask it any nursing question—from pharmacology and pathophysiology to clinical decision-making—and get instant, evidence-based answers with detailed explanations. It\'s like having a personal nursing instructor available anytime you\'re studying.',
      },
      {
        question: 'How many practice questions are available?',
        answer:
          'Haven Institute offers 50,000+ practice questions covering all NCLEX-RN and NCLEX-PN test plan categories. Every question includes detailed rationales for both correct and incorrect answers, evidence-based explanations, and references to relevant nursing concepts.',
      },
      {
        question: 'Can I study on my phone, tablet, and computer?',
        answer:
          'Absolutely. Haven Institute is fully responsive and optimized for all devices. Your progress, flashcard decks, study plans, and analytics sync in real-time across all your devices. Study on your laptop at home, your tablet at the library, and your phone during commute—your learning never stops.',
      },
    ],
  },
  {
    title: 'Pricing & Plans',
    id: 'pricing',
    questions: [
      {
        question: 'Is there a free plan?',
        answer:
          'Yes! Our Free plan includes 500 practice questions, 1 CAT simulation per month, basic performance analytics, access to community study groups, and limited AI tutor interactions. It\'s a great way to experience Haven Institute before committing to a paid plan. No credit card required.',
      },
      {
        question: 'How much does Haven Institute cost?',
        answer:
          'We offer three plans: Free ($0/month), Pro ($29.99/month), and Premium ($49.99/month). Pro includes unlimited questions, unlimited CAT simulations, full AI tutor access, and advanced analytics. Premium adds a personalized study plan, priority support, and our pass guarantee.',
      },
      {
        question: 'Can I cancel my subscription anytime?',
        answer:
          'Yes, you can cancel your subscription at any time from your Account Settings page. Your access continues through the end of your current billing period. There are no cancellation fees or hidden charges.',
      },
      {
        question: 'Do you offer student discounts or group rates?',
        answer:
          'We offer group pricing for nursing schools and study groups of 10+ students. Contact us at support@havenstudy.com for group pricing details. We also periodically offer promotional discounts—follow us on social media to stay updated.',
      },
    ],
  },
  {
    title: 'NCLEX Exam Preparation',
    id: 'exam-prep',
    questions: [
      {
        question: 'What NCLEX content areas does Haven Institute cover?',
        answer:
          'We cover all NCLEX-RN test plan categories: Management of Care, Safety and Infection Control, Health Promotion and Maintenance, Psychosocial Integrity, Basic Care and Comfort, Pharmacological Therapies, Reduction of Risk Potential, and Physiological Adaptation. For NCLEX-PN, we cover all PN-specific content areas aligned with the NCSBN test plan.',
      },
      {
        question: 'How long should I study before taking the NCLEX?',
        answer:
          'Most students study for 4-8 weeks. Our AI study planner generates a personalized schedule based on your exam date, available study hours, and current knowledge level. If you\'re starting from scratch, 6-8 weeks is recommended. If you\'ve been reviewing during nursing school, 4-6 weeks may be sufficient.',
      },
      {
        question: 'What is the Next Generation NCLEX (NGN) format?',
        answer:
          'The Next Generation NCLEX includes new question types like extended drag-and-drop, cloze (drop-down), enhanced hot spot, matrix/grid, and highlighting. Haven Institute includes NGN-style questions in our question bank to ensure you\'re prepared for every question format you may encounter.',
      },
      {
        question: 'How does Haven Institute compare to other NCLEX prep programs?',
        answer:
          'Haven Institute offers unique AI-powered features that competitors don\'t: adaptive learning, AI tutoring, and smart study planning. Our question bank (50,000+) is significantly larger than UWorld (~2,100) and Archer (~2,500). Our 95%+ pass rate exceeds industry averages, and our Free plan lets you start without any financial commitment.',
      },
    ],
  },
  {
    title: 'Pass Guarantee & Results',
    id: 'guarantee',
    questions: [
      {
        question: 'What is the pass guarantee and how does it work?',
        answer:
          'Our Premium plan includes a pass guarantee. If you: (1) complete at least 80% of your personalized study plan, (2) score above 70% on three consecutive full-length CAT simulations, and (3) do not pass the NCLEX within 90 days of your exam—we\'ll extend your Premium subscription free of charge until you pass. We\'re that confident in our platform.',
      },
      {
        question: 'What is Haven Institute\'s pass rate?',
        answer:
          'Our students achieve a 95%+ first-attempt pass rate, significantly above the national average of approximately 87% for NCLEX-RN and 83% for NCLEX-PN. This success rate reflects the effectiveness of our AI-powered adaptive learning approach.',
      },
      {
        question: 'How do I know when I\'m ready to take the NCLEX?',
        answer:
          'Our performance analytics include a "Readiness Score" that predicts your likelihood of passing. When you consistently score above 70% on full-length CAT simulations and your readiness score is above 85%, you\'re likely ready. Your AI study plan will also indicate when you\'ve met your preparation milestones.',
      },
    ],
  },
  {
    title: 'Account & Technical',
    id: 'technical',
    questions: [
      {
        question: 'What devices and browsers are supported?',
        answer:
          'Haven Institute works on all modern browsers including Chrome, Firefox, Safari, and Edge. We support Windows, macOS, iOS, Android, and Linux. For the best experience, we recommend using the latest version of your preferred browser.',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link within minutes. If you don\'t see the email, check your spam folder or contact support@havenstudy.com.',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Yes. We use industry-standard encryption (TLS/SSL) for all data transmission, and your personal data is stored securely with encryption at rest. We never sell your personal information to third parties. See our Privacy Policy for full details.',
      },
    ],
  },
];

const allFaqs = faqCategories.flatMap((cat) => cat.questions);

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <JsonLd data={faqSchema(allFaqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'FAQ', url: '/faq' },
        ])}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50/50 to-white dark:from-zinc-950 dark:to-zinc-900 pt-8 pb-12">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            <HelpCircle className="mr-1 h-3 w-3" /> Help Center
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about preparing for the NCLEX with Haven
            Institute. Can&apos;t find your answer?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Quick Jump Nav */}
      <section className="py-4 border-b sticky top-16 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-2">
          {faqCategories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="text-sm px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
            >
              {cat.title}
            </a>
          ))}
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 space-y-16">
          {faqCategories.map((category) => (
            <div key={category.id} id={category.id} className="scroll-mt-32">
              <h2 className="text-2xl font-bold mb-6 pb-3 border-b">
                {category.title}
              </h2>
              <div className="space-y-6">
                {category.questions.map((faq, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="font-semibold text-base">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-muted/30 text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="text-2xl font-bold">Still Have Questions?</h2>
          <p className="text-muted-foreground">
            Our support team is happy to help. Reach out and we&apos;ll get back to you
            within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Contact Support <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
