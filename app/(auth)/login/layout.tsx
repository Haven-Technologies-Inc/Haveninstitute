import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Sign In to Haven Institute - NCLEX Prep Dashboard',
  description:
    'Sign in to your Haven Institute account to access AI-powered NCLEX prep, practice questions, CAT simulations, and your personalized study plan.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
