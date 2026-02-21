import { LandingHero } from '@/components/landing/hero';
import { LandingNav } from '@/components/landing/nav';
import { LandingFeatures } from '@/components/landing/features';
import { LandingStats } from '@/components/landing/stats';
import { LandingTestimonials } from '@/components/landing/testimonials';
import { LandingPricing } from '@/components/landing/pricing';
import { LandingFAQ } from '@/components/landing/faq';
import { LandingFooter } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
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
