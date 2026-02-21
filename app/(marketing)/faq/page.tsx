import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, faqSchema, breadcrumbSchema } from '@/lib/seo';
import { ArrowRight, HelpCircle } from 'lucide-react';

export const metadata = createMetadata({
  title: 'NCLEX Prep FAQ | Questions About Haven Institute Answered',
  description:
    'Find answers to frequently asked questions about Haven Institute NCLEX prep. Learn about AI adaptive learning, CAT simulations, pricing, pass guarantee, study plans, technical requirements, and more.',
  path: '/faq',
  keywords: [
    'NCLEX prep FAQ',
    'NCLEX exam questions answered',
    'Haven Institute FAQ',
    'NCLEX preparation questions',
    'NCLEX CAT explained',
    'NCLEX study plan questions',
    'NCLEX pass guarantee',
    'NCLEX prep pricing FAQ',
    'how to prepare for NCLEX',
    'NCLEX prep help',
  ],
});

interface FAQCategory {
  title: string;
  id: string;
  questions: Array<{ question: string; answer: string }>;
}

const faqCategories: FAQCategory[] = [
  {
    title: 'Platform Features',
    id: 'features',
    questions: [
      {
        question: 'How does Haven Institute\'s AI-powered adaptive learning work?',
        answer:
          'Our AI engine continuously analyzes your performance in real time, tracking answer accuracy, response time, confidence patterns, and knowledge retention across all NCLEX content domains. It builds a comprehensive learner profile that identifies your specific strengths and weaknesses, then dynamically adjusts question difficulty, topic selection, and study focus to maximize learning efficiency. Unlike traditional question banks that present random questions, our adaptive algorithm ensures every question you see is strategically chosen to target your most impactful learning opportunities. The more you study, the smarter the system gets at personalizing your experience.',
      },
      {
        question: 'Does the CAT simulation accurately mirror the real NCLEX exam?',
        answer:
          'Yes. Our Computer Adaptive Testing simulation uses the same algorithmic logic as the official NCLEX-RN (75-145 questions) and NCLEX-PN (85-205 questions) exams administered by Pearson VUE. Questions increase or decrease in difficulty based on your performance using a computerized adaptive testing algorithm. The interface closely replicates the actual testing environment, including the on-screen calculator, exhibit button, and the same question presentation format. We also include breaks at the appropriate intervals and provide a real-time assessment of your pass probability throughout the simulation. Many students report that the actual NCLEX felt familiar because of our CAT simulations.',
      },
      {
        question: 'What is the AI tutor and how does it work?',
        answer:
          'The AI tutor is a 24/7 nursing knowledge assistant powered by advanced artificial intelligence trained on nursing education content, clinical practice guidelines, and NCLEX test plan material. You can ask it any nursing question, from complex pharmacology drug interactions and pathophysiology disease processes to clinical judgment scenarios and nursing intervention prioritization. It provides instant, evidence-based answers with detailed explanations, relevant clinical examples, and memory aids. The AI tutor is available on Premium plans and can be accessed from any study session, flashcard review, or directly from the tutor chat interface.',
      },
      {
        question: 'How many practice questions are available in Haven Institute?',
        answer:
          'Haven Institute offers over 50,000 practice questions covering all NCLEX-RN and NCLEX-PN test plan categories. This is the largest NCLEX question bank available, significantly exceeding UWorld (approximately 2,100 questions), Archer Review (approximately 1,700 questions), and Kaplan (approximately 3,000 questions). Every question includes detailed rationales for both correct and incorrect answer choices, evidence-based explanations, and references to relevant nursing concepts. Our question bank includes all Next Generation NCLEX (NGN) item types including case studies, bow-tie questions, drag-and-drop, matrix/grid, cloze drop-down, and highlight text formats.',
      },
      {
        question: 'How do the smart flashcards work?',
        answer:
          'Our smart flashcards use a scientifically-validated spaced repetition algorithm to optimize your long-term memory retention. When you review a flashcard, the system calculates the optimal time to show it to you again based on how well you recalled the information. Cards you struggle with appear more frequently, while cards you have mastered are spaced out over longer intervals. We provide pre-built decks for critical NCLEX topics including pharmacology drug classifications, laboratory values and normal ranges, nursing procedures, and disease processes. You can also create custom flashcard decks from any question, rationale, or topic you encounter during your studies.',
      },
      {
        question: 'Can I study on my phone, tablet, and computer?',
        answer:
          'Absolutely. Haven Institute is fully responsive and optimized for all devices and screen sizes. Your progress, flashcard decks, study plans, performance analytics, and AI tutor conversations sync in real time across all your devices through your account. Study on your laptop at home, your tablet at the library, and your phone during your commute. The experience is seamless across platforms, and you can pick up exactly where you left off on any device.',
      },
    ],
  },
  {
    title: 'Pricing & Subscription',
    id: 'pricing',
    questions: [
      {
        question: 'Is there really a free plan for NCLEX preparation?',
        answer:
          'Yes. Haven Institute offers a genuinely free plan with no credit card required to sign up. The Free plan includes 50 practice questions, basic performance statistics, 1 CAT simulation, access to community forums, and a mobile-friendly interface. You can use the Free plan for as long as you want with no time restrictions. It is designed to let you experience the platform and see the value of our adaptive learning approach before deciding whether to upgrade.',
      },
      {
        question: 'How much does Haven Institute cost compared to competitors?',
        answer:
          'Haven Institute offers three plans: Free ($0 forever), Pro ($29.99 per month), and Premium ($49.99 per month). For comparison, UWorld NCLEX charges approximately $400 or more for a 90-day subscription, Kaplan NCLEX prep costs around $400 or more for a 3-month course, Archer Review charges about $60 per month, and Nursing.com charges $39 per month. Haven Institute provides more features, a larger question bank, and AI-powered tools at a significantly lower price point than all major competitors.',
      },
      {
        question: 'Can I cancel my subscription at any time?',
        answer:
          'Yes, you can cancel your subscription at any time from your Account Settings page with no penalties, fees, or questions asked. When you cancel, your access continues through the end of your current billing period. Your study history, performance data, and analytics are preserved even after cancellation, so you can always come back and pick up where you left off if you decide to re-subscribe.',
      },
      {
        question: 'Do you offer a money-back guarantee?',
        answer:
          'Yes, we offer a 14-day money-back guarantee on all paid plans. If you are not satisfied with Haven Institute within the first 14 days of your subscription, contact our support team at support@havenstudy.com for a full refund, no questions asked. Refunds are typically processed within 5-7 business days. Additionally, our Premium plan includes a pass guarantee (see the Pass Guarantee section below for details).',
      },
      {
        question: 'Do you offer student discounts or group pricing?',
        answer:
          'Yes, we offer special pricing for nursing school cohorts and student organizations. Groups of 10 or more students can receive up to 30% off Pro and Premium plans. Contact our sales team at sales@havenstudy.com for custom group pricing. We also partner with over 50 nursing schools nationwide that offer Haven Institute access to their students at discounted institutional rates. Additionally, we periodically run promotional discounts. Follow us on social media and subscribe to our newsletter to stay updated.',
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
          'We cover all NCLEX-RN test plan categories as defined by the National Council of State Boards of Nursing (NCSBN): Management of Care, Safety and Infection Control, Health Promotion and Maintenance, Psychosocial Integrity, Basic Care and Comfort, Pharmacological and Parenteral Therapies, Reduction of Risk Potential, and Physiological Adaptation. For NCLEX-PN, we cover all PN-specific content areas aligned with the current NCSBN test plan including Coordinated Care, Safety and Infection Control, Health Promotion, Psychosocial Integrity, Basic Care, Pharmacological Therapies, Risk Reduction, and Physiological Adaptation.',
      },
      {
        question: 'How long should I study before taking the NCLEX?',
        answer:
          'Most students study for 4 to 8 weeks before taking the NCLEX. Our AI-powered study planner generates a personalized schedule based on your specific exam date, available study hours per day, and current knowledge level assessed through an initial diagnostic evaluation. If you are starting from scratch, 6 to 8 weeks is recommended. If you have been reviewing during nursing school, 4 to 6 weeks may be sufficient. Students who use Haven Institute consistently for the recommended duration achieve our highest pass rates. The key is consistent daily study rather than marathon cramming sessions.',
      },
      {
        question: 'What are the Next Generation NCLEX (NGN) question types?',
        answer:
          'The Next Generation NCLEX introduced new question formats focused on clinical judgment measurement, including: Extended drag-and-drop (sequencing and categorization), Cloze/drop-down (selecting answers from embedded dropdown menus), Enhanced hot spot (identifying areas on images or diagrams), Matrix/grid (selecting multiple correct answers in a table format), Highlighting text (selecting relevant text from passages), Bow-tie items (connecting conditions, actions, and parameters), and Case studies (multi-part questions following a patient scenario). Haven Institute includes all NGN item types in our question bank and CAT simulations to ensure you are fully prepared for every format you may encounter on test day.',
      },
      {
        question: 'How does Haven Institute compare to UWorld, Archer, and Kaplan?',
        answer:
          'Haven Institute offers unique AI-powered features that competitors do not provide: adaptive learning that personalizes every question, an AI tutor available 24/7, smart flashcards with spaced repetition, and an AI-generated study planner. Our question bank of 50,000+ questions is significantly larger than UWorld (approximately 2,100), Archer (approximately 1,700), and Kaplan (approximately 3,000). We also offer a free tier, a pass guarantee, and pricing starting at just $29.99 per month compared to $400+ for UWorld and Kaplan. Visit our detailed comparison page at /compare for a full feature-by-feature analysis.',
      },
    ],
  },
  {
    title: 'Pass Guarantee & Results',
    id: 'guarantee',
    questions: [
      {
        question: 'What is Haven Institute\'s pass guarantee and how does it work?',
        answer:
          'Our Premium plan includes a comprehensive pass guarantee. To qualify, you must: (1) Complete at least 80% of your personalized AI-generated study plan, (2) Score above 70% on at least three consecutive full-length CAT simulations, and (3) Take the NCLEX within 90 days of meeting the readiness criteria. If you meet all three conditions and do not pass the NCLEX, we will extend your Premium subscription completely free of charge until you pass. There is no time limit on the extension. We are that confident in our platform and methodology. Contact support@havenstudy.com with your exam results to activate the guarantee.',
      },
      {
        question: 'What is Haven Institute\'s pass rate?',
        answer:
          'Students who use Haven Institute achieve a 98% first-attempt pass rate, which is significantly above the national average of approximately 87% for NCLEX-RN and 83% for NCLEX-PN. This pass rate is calculated from students who completed at least 50% of their study plan and took at least 5 CAT simulations before their exam. Our AI-powered adaptive learning approach ensures that students focus their study time on the areas that will have the greatest impact on their exam performance.',
      },
      {
        question: 'How do I know when I am ready to take the NCLEX?',
        answer:
          'Haven Institute provides multiple readiness indicators. Our performance analytics include a Readiness Score that predicts your likelihood of passing based on your performance across all content domains, question types, and difficulty levels. When you consistently score above 70% on full-length CAT simulations and your Readiness Score exceeds 85%, you are likely ready to take the exam. Your AI study planner will also indicate when you have met all preparation milestones. We recommend completing your full study plan and passing at least 3 consecutive CAT simulations before scheduling your exam date.',
      },
    ],
  },
  {
    title: 'Account & Technical',
    id: 'technical',
    questions: [
      {
        question: 'What devices and browsers does Haven Institute support?',
        answer:
          'Haven Institute works on all modern web browsers including Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge. We support Windows, macOS, iOS, Android, ChromeOS, and Linux operating systems. For the best experience, we recommend using the latest version of your preferred browser. Our platform is a Progressive Web App (PWA), which means you can install it on your home screen for an app-like experience without needing to download from an app store.',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot Password" on the login page and enter the email address associated with your account. You will receive a password reset link within minutes. The reset link expires after 24 hours for security purposes. If you do not see the email, check your spam or junk folder. If you still have trouble, contact our support team at support@havenstudy.com and we will help you regain access to your account.',
      },
      {
        question: 'Is my data secure on Haven Institute?',
        answer:
          'Yes, data security is a top priority at Haven Institute. We use industry-standard TLS/SSL encryption for all data transmission and AES-256 encryption for data at rest. Our platform is SOC 2 Type II compliant and HIPAA compliant. We never sell your personal information to third parties. All payment processing is handled securely through Stripe with PCI DSS Level 1 compliance. For full details, please review our Privacy Policy at /privacy.',
      },
      {
        question: 'What happens to my progress if I cancel or downgrade my plan?',
        answer:
          'Your study history, performance data, analytics, and completed question history are preserved regardless of your plan status. If you downgrade from a paid plan, you will still be able to view your historical performance data. You simply will not have access to premium features until you re-subscribe. If you later upgrade again, all your historical data is still there and the AI will resume personalizing your experience based on your complete study history.',
      },
    ],
  },
];

const allFaqs = faqCategories.flatMap((cat) => cat.questions);

export default function FAQPage() {
  return (
    <>
      <JsonLd
        data={[
          faqSchema(allFaqs),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'FAQ', url: '/faq' },
          ]),
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            <HelpCircle className="mr-1 h-3 w-3" /> Help Center
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about preparing for the NCLEX with Haven Institute.
            Find detailed answers about our platform features, pricing, exam preparation
            strategies, pass guarantee, and technical requirements.
          </p>
          <p className="mt-3 text-muted-foreground">
            Can&apos;t find your answer?{' '}
            <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Contact our support team
            </Link>
          </p>
        </section>

        {/* Quick Jump Nav */}
        <section className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-center gap-2" aria-label="FAQ categories">
            {faqCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="text-sm px-4 py-1.5 rounded-full border border-border/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-500/30 transition-all duration-200"
              >
                {cat.title}
              </a>
            ))}
          </nav>
        </section>

        {/* FAQ Content */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-16">
            {faqCategories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8 pb-4 border-b border-border">
                  {category.title}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((faq) => (
                    <Card key={faq.question} className="border-border/50">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-base mb-3">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Related Resources</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/features">Platform Features</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing">Pricing Plans</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/compare">Compare Providers</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/testimonials">Student Reviews</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/nclex-rn">NCLEX-RN Prep</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/nclex-pn">NCLEX-PN Prep</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/blog">Study Tips Blog</Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Still Have Questions?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our support team is happy to help. Reach out and we will get back to you within 24 hours.
            Or start your free account to explore the platform yourself.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
