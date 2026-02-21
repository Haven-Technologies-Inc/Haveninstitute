import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, courseSchema, faqSchema, breadcrumbSchema } from '@/lib/seo';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Zap,
  HelpCircle,
} from 'lucide-react';

export const metadata = createMetadata({
  title: 'NCLEX Prep Pricing | Affordable Plans Starting Free - Haven Institute',
  description:
    'Haven Institute NCLEX prep pricing: Free ($0), Pro ($29.99/mo), and Premium ($49.99/mo) plans. Compare and save vs UWorld ($400+), Archer ($60/mo), and Kaplan ($400+). Money-back guarantee included.',
  path: '/pricing',
  keywords: [
    'NCLEX prep pricing',
    'affordable NCLEX prep',
    'NCLEX prep cost',
    'NCLEX review course price',
    'cheap NCLEX prep',
    'NCLEX prep free trial',
    'UWorld NCLEX price',
    'Archer review cost',
    'Kaplan NCLEX pricing',
    'best value NCLEX prep',
  ],
});

const pricingFaqs = [
  {
    question: 'Is there really a free plan for Haven Institute NCLEX prep?',
    answer:
      'Yes, Haven Institute offers a completely free plan with no credit card required. The Free plan includes 50 practice questions, basic performance statistics, 1 CAT simulation, access to community forums, and a mobile-friendly interface. You can use the Free plan for as long as you want with no time restrictions.',
  },
  {
    question: 'Can I switch between plans at any time?',
    answer:
      'Absolutely. You can upgrade or downgrade your plan at any time. When you upgrade, you get immediate access to all features of your new plan. When you downgrade, you retain access to your current plan features until the end of your billing cycle. No penalties or fees for switching.',
  },
  {
    question: 'How does the money-back guarantee work?',
    answer:
      'We offer a 14-day money-back guarantee on all paid plans. If you are not satisfied with Haven Institute within the first 14 days of your subscription, contact our support team for a full refund, no questions asked. Additionally, our Premium plan includes a pass guarantee, so if you complete at least 80% of your study plan and do not pass the NCLEX, we extend your subscription for free.',
  },
  {
    question: 'How does Haven Institute pricing compare to UWorld and Kaplan?',
    answer:
      'Haven Institute offers significantly more value at a lower price point. UWorld NCLEX charges approximately $400 or more for a limited-time subscription. Kaplan NCLEX prep costs around $400 or more. Archer Review charges about $60 per month. Haven Institute starts completely free and offers comprehensive access from just $29.99 per month with no long-term commitment required, saving you hundreds of dollars.',
  },
  {
    question: 'Do you offer student discounts or group pricing?',
    answer:
      'Yes, we offer special pricing for nursing school cohorts and student organizations. Groups of 10 or more students can receive up to 30% off Pro and Premium plans. Contact our sales team at sales@havenstudy.com for custom group pricing. We also occasionally run seasonal promotions and discount events.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and PayPal. All payments are processed securely through Stripe with 256-bit SSL encryption. Your financial information is never stored on our servers.',
  },
  {
    question: 'Is there a contract or commitment required?',
    answer:
      'No contracts or long-term commitments. All Haven Institute plans are billed monthly and you can cancel at any time. When you cancel, you retain access to your plan features until the end of your current billing period. Your progress, study data, and analytics are preserved even after cancellation.',
  },
  {
    question: 'What happens to my data if I cancel or downgrade?',
    answer:
      'Your study history, performance data, and analytics are preserved regardless of your plan status. If you downgrade from a paid plan, you will still be able to view your historical performance data and completed question history. You simply will not have access to premium features until you re-subscribe.',
  },
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with the basics and explore the platform at no cost.',
    features: [
      { text: '50 practice questions', included: true },
      { text: 'Basic performance stats', included: true },
      { text: '1 CAT simulation', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Mobile-friendly interface', included: true },
      { text: 'AI-powered study planner', included: false },
      { text: 'AI tutor access', included: false },
      { text: 'Smart flashcard decks', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Pass guarantee', included: false },
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    description: 'Everything you need for serious, comprehensive NCLEX preparation.',
    features: [
      { text: '5,000+ practice questions', included: true },
      { text: 'Unlimited CAT simulations', included: true },
      { text: 'AI-powered study planner', included: true },
      { text: 'Advanced analytics dashboard', included: true },
      { text: 'Smart flashcard decks', included: true },
      { text: 'Detailed rationales', included: true },
      { text: 'Priority email support', included: true },
      { text: 'NGN question types', included: true },
      { text: 'AI tutor access', included: false },
      { text: 'Pass guarantee', included: false },
    ],
    cta: 'Get Started',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Premium',
    price: '$49.99',
    period: '/month',
    description: 'The ultimate NCLEX prep experience with AI tutor and pass guarantee.',
    features: [
      { text: '50,000+ practice questions', included: true },
      { text: 'Everything in Pro', included: true },
      { text: 'AI tutor with 24/7 chat', included: true },
      { text: '1-on-1 coaching sessions', included: true },
      { text: 'Custom study plans', included: true },
      { text: 'Pass guarantee program', included: true },
      { text: 'Live review sessions', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Content request priority', included: true },
    ],
    cta: 'Get Started',
    href: '/signup?plan=premium',
    popular: false,
  },
];

const competitorPricing = [
  { name: 'Haven Institute (Pro)', price: '$29.99/mo', savings: '--', features: 'Full access, AI adaptive learning, unlimited CAT sims' },
  { name: 'UWorld NCLEX', price: '$400+ (90 days)', savings: 'Save $310+', features: 'Question bank, limited simulations' },
  { name: 'Archer Review', price: '$60/mo', savings: 'Save $30/mo', features: 'Question bank, readiness assessments' },
  { name: 'Kaplan NCLEX', price: '$400+ (3 months)', savings: 'Save $310+', features: 'Question bank, video lessons, practice tests' },
  { name: 'Nursing.com', price: '$39/mo', savings: 'Save $9/mo', features: 'Video lessons, basic practice questions' },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Pricing', url: '/pricing' },
          ]),
          courseSchema({
            name: 'Haven Institute NCLEX Prep - Free Plan',
            description: 'Free NCLEX preparation with 50 practice questions, basic stats, and 1 CAT simulation.',
            url: '/pricing',
            price: '0',
          }),
          courseSchema({
            name: 'Haven Institute NCLEX Prep - Pro Plan',
            description: 'Comprehensive NCLEX preparation with 5,000+ questions, unlimited CAT simulations, AI study planner, and advanced analytics.',
            url: '/pricing',
            price: '29.99',
          }),
          courseSchema({
            name: 'Haven Institute NCLEX Prep - Premium Plan',
            description: 'Ultimate NCLEX preparation with 50,000+ questions, AI tutor, 1-on-1 coaching, pass guarantee, and 24/7 priority support.',
            url: '/pricing',
            price: '49.99',
          }),
          faqSchema(pricingFaqs),
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Invest in Your{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Nursing Career
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the NCLEX prep plan that fits your needs and budget. Start for free, upgrade when
            you are ready, and cancel anytime. No hidden fees, no long-term contracts.
          </p>
        </section>

        {/* Pricing Tiers */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative overflow-hidden ${
                  tier.popular
                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 md:-mt-4 md:mb-4'
                    : 'border-border/50 shadow-sm'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    {tier.popular && (
                      <Badge className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    className={`w-full mb-6 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:brightness-110'
                        : ''
                    }`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    <Link href={tier.href}>
                      {tier.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? '' : 'text-muted-foreground/60'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            All paid plans include a 14-day money-back guarantee. No credit card required for the Free plan.
          </p>
        </section>

        {/* Money-Back Guarantee */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">14-Day Money-Back Guarantee</h3>
                <p className="text-muted-foreground">
                  We are confident you will love Haven Institute. Try any paid plan risk-free for 14 days.
                  If you are not completely satisfied with your NCLEX prep experience, contact our support
                  team for a full refund. Our Premium plan also includes a pass guarantee that extends your
                  subscription for free if you follow the program and do not pass.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Compare & Save */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Compare &amp; Save vs{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Competitor Pricing
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              See how much you can save by choosing Haven Institute over UWorld, Archer, Kaplan, and
              other NCLEX prep providers. More features, lower price.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-sm">Provider</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Price</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Your Savings</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Included Features</th>
                </tr>
              </thead>
              <tbody>
                {competitorPricing.map((row, index) => (
                  <tr
                    key={row.name}
                    className={`border-b border-border/50 ${
                      index === 0
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-medium'
                        : 'hover:bg-muted/30'
                    } transition-colors`}
                  >
                    <td className="py-3 px-4 text-sm">
                      {index === 0 ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{row.name}</span>
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{row.price}</td>
                    <td className="py-3 px-4 text-sm">
                      {index === 0 ? (
                        <Badge variant="success">Best Value</Badge>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{row.savings}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{row.features}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/compare">
                View Full Comparison <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <CreditCard className="h-8 w-8 text-indigo-500" />
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                256-bit SSL encryption powered by Stripe. Your financial data is always protected.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Zap className="h-8 w-8 text-indigo-500" />
              <h3 className="font-semibold">Cancel Anytime</h3>
              <p className="text-sm text-muted-foreground">
                No contracts, no commitments. Cancel your subscription at any time with no penalties.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <HelpCircle className="h-8 w-8 text-indigo-500" />
              <h3 className="font-semibold">Dedicated Support</h3>
              <p className="text-sm text-muted-foreground">
                Our nursing education support team is available to help you get the most from your subscription.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Pricing{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                FAQ
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Have questions about our pricing? Find answers to the most common questions below.
            </p>
          </div>
          <div className="space-y-4">
            {pricingFaqs.map((faq) => (
              <Card key={faq.question} className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Start Preparing for the NCLEX Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of nursing students who chose Haven Institute for affordable, AI-powered
            NCLEX preparation. Your journey to becoming a licensed nurse starts here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features">Explore All Features</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
