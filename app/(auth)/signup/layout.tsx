import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Start Free NCLEX Prep - Create Your Haven Institute Account',
  description:
    'Create a free Haven Institute account and start preparing for the NCLEX today. AI-powered adaptive learning, 500+ free practice questions, and CAT simulations. No credit card required.',
  path: '/signup',
  keywords: [
    'NCLEX prep free trial',
    'free NCLEX practice questions',
    'create NCLEX prep account',
    'start NCLEX study free',
    'nursing exam prep signup',
  ],
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
