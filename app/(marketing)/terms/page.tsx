import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = createMetadata({
  title: 'Terms of Service | Haven Institute',
  description:
    'Haven Institute terms of service. Read the terms and conditions that govern your use of the Haven Institute NCLEX preparation platform at havenstudy.com.',
  path: '/terms',
  keywords: [
    'Haven Institute terms of service',
    'havenstudy.com terms',
    'NCLEX prep terms and conditions',
    'Haven study terms',
  ],
});

const sections = [
  {
    id: 'acceptance-of-terms',
    title: 'Acceptance of Terms',
    content: [
      'By accessing or using the Haven Institute platform at havenstudy.com (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.',
      'These Terms constitute a legally binding agreement between you and Haven Institute ("we," "us," or "our"). We may update these Terms from time to time, and your continued use of the Service after such changes constitutes acceptance of the updated Terms.',
      'We will notify you of material changes to these Terms via email or through a prominent notice on our platform at least 30 days before the changes take effect.',
    ],
  },
  {
    id: 'account-registration',
    title: 'Account Registration',
    content: [
      'To access certain features of the Service, you must create an account. When registering, you agree to:',
      '- **Provide Accurate Information**: You must provide truthful, current, and complete information during registration and keep your account information updated.',
      '- **Maintain Account Security**: You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or use of your account.',
      '- **One Account Per Person**: Each individual may maintain only one account. Creating multiple accounts to exploit free trial periods or promotions is prohibited.',
      '- **Age Requirement**: You must be at least 18 years of age to create an account. By registering, you represent that you meet this age requirement.',
      'We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably believe are being used fraudulently.',
    ],
  },
  {
    id: 'subscription-payments',
    title: 'Subscription and Payments',
    content: [
      'Haven Institute offers both free and paid subscription plans. By subscribing to a paid plan, you agree to the following:',
      '- **Billing**: Paid subscriptions are billed in advance on a monthly or annual basis, depending on the plan you select. Your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date.',
      '- **Payment Processing**: All payments are processed securely through Stripe. Haven Institute does not store your full credit card information on our servers.',
      '- **Price Changes**: We may adjust subscription pricing from time to time. We will provide at least 30 days\' notice before any price increase takes effect. Price changes will apply at the start of your next billing cycle following the notice period.',
      '- **Refunds**: We offer a 14-day money-back guarantee for new paid subscriptions. If you are not satisfied with the Service within the first 14 days, contact support@havenstudy.com to request a full refund. After the 14-day period, refunds are issued at our discretion.',
      '- **Free Trial**: If you sign up for a free trial of a paid plan, you will not be charged until the trial period ends. You may cancel at any time during the trial without being charged.',
      '- **Cancellation**: You may cancel your subscription at any time through your account settings. Upon cancellation, you will retain access to your paid features until the end of your current billing period.',
    ],
  },
  {
    id: 'user-conduct',
    title: 'User Conduct',
    content: [
      'You agree to use the Service only for its intended educational purpose and in compliance with all applicable laws. The following activities are strictly prohibited:',
      '- **Content Redistribution**: Copying, reproducing, distributing, or sharing any questions, answers, explanations, study materials, or other proprietary content from the platform without our prior written consent.',
      '- **Unauthorized Access**: Attempting to access other users\' accounts, restricted areas of the platform, or our systems and servers without authorization.',
      '- **Automated Access**: Using bots, scrapers, crawlers, or any automated means to access, extract, or download content from the Service.',
      '- **Academic Dishonesty**: Using the Service to cheat on actual NCLEX examinations or any other academic assessments. Our platform is designed for study and preparation purposes only.',
      '- **Abuse and Harassment**: Engaging in abusive, threatening, harassing, or discriminatory behavior toward other users or Haven Institute staff in community forums, study groups, or communications.',
      '- **Misrepresentation**: Impersonating any person or entity, or falsely claiming an affiliation with any person, entity, or organization.',
      '- **Interference**: Disrupting or interfering with the Service, servers, or networks connected to the Service, including by introducing malware, viruses, or harmful code.',
      'Violation of these rules may result in immediate suspension or termination of your account without refund.',
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    content: [
      'All content on the Haven Institute platform, including but not limited to practice questions, answer explanations, study guides, CAT simulations, AI-generated recommendations, course materials, graphics, logos, and software, is the exclusive property of Haven Institute or its licensors and is protected by copyright, trademark, and other intellectual property laws.',
      '- **Limited License**: We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service and its content solely for your personal, non-commercial educational purposes in connection with NCLEX preparation.',
      '- **Restrictions**: You may not modify, adapt, translate, reverse-engineer, decompile, disassemble, or create derivative works based on the Service or its content without our prior written permission.',
      '- **User-Generated Content**: If you post content in community forums or study groups, you retain ownership of your original content but grant Haven Institute a worldwide, royalty-free, non-exclusive license to use, display, and distribute such content in connection with operating and promoting the Service.',
      '- **DMCA Compliance**: We respect the intellectual property rights of others. If you believe that any content on our platform infringes your copyright, please contact us at support@havenstudy.com with a detailed DMCA takedown notice.',
    ],
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    content: [
      'The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      '- **No Guarantee of Exam Results**: While Haven Institute is designed to help you prepare for the NCLEX examination, we do not guarantee that you will pass the NCLEX or achieve any particular score. Exam outcomes depend on many factors beyond our control, including your individual study effort, background knowledge, and test-day conditions.',
      '- **Content Accuracy**: We strive to ensure all practice questions, explanations, and study materials are accurate and up-to-date. However, nursing standards and NCLEX test plans may change, and we cannot guarantee that all content reflects the most current guidelines at all times.',
      '- **Service Availability**: We aim for high availability but do not guarantee uninterrupted or error-free access to the Service. We may perform scheduled maintenance, and the Service may be temporarily unavailable due to factors beyond our control.',
      '- **AI-Generated Content**: Certain features of the Service, including our AI tutor and personalized recommendations, utilize artificial intelligence. AI-generated responses are intended as educational aids and should not be considered a substitute for professional medical or nursing judgment.',
    ],
  },
  {
    id: 'limitation-of-liability',
    title: 'Limitation of Liability',
    content: [
      'To the maximum extent permitted by applicable law, Haven Institute and its officers, directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of or inability to use the Service.',
      'This includes, without limitation, damages for loss of profits, data, goodwill, or other intangible losses, even if we have been advised of the possibility of such damages.',
      'Our total aggregate liability to you for any claims arising out of or relating to these Terms or the Service shall not exceed the amount you paid to Haven Institute in the twelve (12) months preceding the event giving rise to the claim, or one hundred dollars ($100), whichever is greater.',
      'Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you. In such jurisdictions, our liability is limited to the maximum extent permitted by law.',
    ],
  },
  {
    id: 'termination',
    title: 'Termination',
    content: [
      'Either you or Haven Institute may terminate your account and these Terms at any time:',
      '- **Termination by You**: You may close your account at any time by contacting support@havenstudy.com or through your account settings. Upon termination, your right to access the Service will cease immediately, though you may request an export of your study data before account deletion.',
      '- **Termination by Us**: We may suspend or terminate your account immediately, without prior notice, if we determine that you have violated these Terms, engaged in fraudulent activity, or if we are required to do so by law. We may also terminate the Service or any part of it at any time with reasonable notice.',
      '- **Effect of Termination**: Upon termination, your license to use the Service is immediately revoked. We may delete your account data in accordance with our Privacy Policy and applicable data retention obligations. Any provisions of these Terms that by their nature should survive termination will continue to apply, including intellectual property rights, disclaimers, limitations of liability, and dispute resolution provisions.',
      '- **Refunds Upon Termination**: If we terminate your account without cause, we will provide a pro-rata refund for any unused portion of your current billing period. No refund will be issued if termination is due to a violation of these Terms.',
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law and Dispute Resolution',
    content: [
      'These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.',
      '- **Informal Resolution**: Before filing any formal legal proceedings, you agree to first contact us at support@havenstudy.com and attempt to resolve the dispute informally for at least 30 days.',
      '- **Arbitration**: If the dispute cannot be resolved informally, you and Haven Institute agree to resolve any claims relating to these Terms or the Service through final and binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration will take place in San Francisco, California, or remotely via video conference at the parties\' mutual agreement.',
      '- **Class Action Waiver**: You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.',
      '- **Exceptions**: Either party may seek injunctive or other equitable relief in a court of competent jurisdiction for claims related to intellectual property infringement or unauthorized access to the Service.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: [
      'If you have any questions about these Terms of Service, please contact us:',
      '- **Email**: support@havenstudy.com',
      '- **Mail**: Haven Institute, Attn: Legal Team, San Francisco, CA, United States',
      '- **Response Time**: We aim to respond to all Terms-related inquiries within 30 days.',
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' },
        ])}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            Legal
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Terms of{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using the Haven Institute
            NCLEX preparation platform.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: February 2026
          </p>
        </section>

        {/* Table of Contents */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Table of Contents</h2>
              <nav>
                <ol className="space-y-2 list-decimal list-inside">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </CardContent>
          </Card>
        </section>

        {/* Sections */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={section.id} id={section.id}>
                <h2 className="text-2xl font-bold mb-4">
                  <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                    {index + 1}.
                  </span>
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                          .replace(/^- /, '&bull; ')
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
