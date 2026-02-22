import type { Metadata } from 'next';
import { LandingHero } from '@/components/landing/hero';
import { LandingNav } from '@/components/landing/nav';
import { LandingFeatures } from '@/components/landing/features';
import { LandingStats } from '@/components/landing/stats';
import { LandingTestimonials } from '@/components/landing/testimonials';
import { LandingPricing } from '@/components/landing/pricing';
import { LandingFAQ } from '@/components/landing/faq';
import { LandingFooter } from '@/components/landing/footer';
import { JsonLd } from '@/components/seo/json-ld';
import {
  courseSchema,
  faqSchema,
  localBusinessSchema,
  reviewSchema,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Haven Institute - #1 AI-Powered NCLEX Prep | Pass Your Nursing Exam First Try',
  description:
    'Pass the NCLEX-RN & NCLEX-PN on your first attempt. AI-powered adaptive learning with 50,000+ practice questions, CAT simulations, AI tutor, and personalized study plans. 95%+ pass rate. Start free today.',
  keywords: [
    'NCLEX prep',
    'NCLEX review course',
    'NCLEX practice questions',
    'NCLEX-RN prep',
    'NCLEX-PN prep',
    'nursing exam prep',
    'pass NCLEX first attempt',
    'best NCLEX prep 2026',
    'AI NCLEX tutor',
    'NCLEX CAT simulator',
    'NCLEX study guide',
    'NCLEX test bank',
    'adaptive NCLEX learning',
    'NCLEX prep online',
    'nursing licensure exam prep',
    'UWorld alternative',
    'Archer review alternative',
    'Kaplan NCLEX alternative',
  ],
  alternates: {
    canonical: 'https://www.havenstudy.com',
  },
};

const homeFaqs = [
  {
    question: 'How does the AI-powered adaptive learning work?',
    answer:
      'Our AI engine continuously analyzes your answers, response times, and patterns to build a personalized model of your knowledge. It identifies weak areas across all NCLEX content domains and dynamically adjusts question difficulty, ensuring maximum study efficiency.',
  },
  {
    question: 'Does the CAT simulation accurately mirror the real NCLEX exam?',
    answer:
      'Yes. Our Computer Adaptive Testing simulation uses the same algorithm logic as the official NCLEX-RN and NCLEX-PN exams. Questions increase or decrease in difficulty based on your performance, and the interface closely replicates the Pearson VUE testing environment.',
  },
  {
    question: 'What NCLEX content areas are covered?',
    answer:
      'We cover all NCLEX-RN test plan categories: Management of Care, Safety and Infection Control, Health Promotion and Maintenance, Psychosocial Integrity, Basic Care and Comfort, Pharmacological Therapies, Reduction of Risk Potential, and Physiological Adaptation.',
  },
  {
    question: 'Can I study on my phone or tablet?',
    answer:
      'Haven Institute is fully responsive and works on all devices. Your progress syncs in real-time across desktop, tablet, and smartphone.',
  },
  {
    question: 'What is the pass guarantee?',
    answer:
      'Our Premium plan includes a pass guarantee. If you complete at least 80% of your study plan, score above 70% on three consecutive CAT simulations, and do not pass within 90 days, we extend your subscription free until you pass.',
  },
];

const homeReviews = [
  {
    author: 'Sarah Johnson, RN',
    rating: 5,
    body: 'Haven Institute helped me pass the NCLEX-RN on my first attempt with 75 questions! The AI tutor was like having a personal instructor available 24/7.',
    datePublished: '2025-12-15',
  },
  {
    author: 'Michael Chen, RN',
    rating: 5,
    body: 'After failing with another prep program, I switched to Haven Institute. The adaptive questions targeted my weak areas perfectly. Passed in 76 questions!',
    datePublished: '2025-11-20',
  },
  {
    author: 'Jessica Martinez, LPN',
    rating: 5,
    body: 'Best NCLEX-PN prep out there. The CAT simulator was so realistic that the actual exam felt familiar. Worth every penny of the Premium plan.',
    datePublished: '2026-01-08',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <JsonLd
        data={courseSchema({
          name: 'NCLEX-RN & NCLEX-PN Comprehensive Prep Course',
          description:
            'AI-powered NCLEX preparation with 50,000+ practice questions, CAT simulations, personalized study plans, AI tutor, and performance analytics. 95%+ pass rate.',
          url: '/',
          price: '0',
        })}
      />
      <JsonLd data={faqSchema(homeFaqs)} />
      <JsonLd data={reviewSchema(homeReviews)} />
      <JsonLd data={localBusinessSchema()} />
      <LandingNav />
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingPricing />
      <LandingFAQ />
      <LandingFooter />
    </main>
  );
}
