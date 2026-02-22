import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = createMetadata({
  title: 'Privacy Policy | Haven Institute',
  description:
    'Haven Institute privacy policy. Learn how we collect, use, and protect your personal information when you use our NCLEX preparation platform at havenstudy.com.',
  path: '/privacy',
  keywords: [
    'Haven Institute privacy policy',
    'havenstudy.com privacy',
    'NCLEX prep privacy',
    'Haven study data protection',
  ],
});

const sections = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    content: [
      'We collect information you provide directly to us when you create an account, subscribe to a plan, use our platform, or contact our support team. This includes:',
      '- **Account Information**: Your name, email address, password, and optional profile details such as your nursing school and expected graduation date.',
      '- **Payment Information**: When you subscribe to a paid plan, our payment processor (Stripe) collects your billing address and payment card details. Haven Institute does not store your full credit card number on our servers.',
      '- **Study Data**: Your quiz answers, practice test results, flashcard progress, study session durations, CAT simulation scores, and other learning activity data generated through your use of the platform.',
      '- **Communications**: Messages you send to our support team, feedback you submit, and any content you post in community discussion forums or study groups.',
      '- **Device and Usage Information**: We automatically collect certain information when you access our platform, including your IP address, browser type and version, operating system, device identifiers, referring URLs, pages visited, features used, and timestamps of your activity.',
      '- **Cookies and Similar Technologies**: We use cookies, local storage, and similar technologies to maintain your session, remember your preferences, and understand how you use our platform. See our Cookies Policy for more details.',
    ],
  },
  {
    id: 'how-we-use-information',
    title: 'How We Use Your Information',
    content: [
      'We use the information we collect to provide, maintain, and improve our NCLEX preparation platform. Specifically, we use your information to:',
      '- **Provide Our Services**: Deliver personalized adaptive learning experiences, generate AI-powered study recommendations, track your progress, and operate the CAT simulation engine.',
      '- **Personalize Your Experience**: Tailor practice questions to your knowledge level, identify areas needing improvement, create customized study plans, and power our spaced repetition algorithms.',
      '- **Process Payments**: Manage subscriptions, process payments, send billing confirmations, and handle refund requests.',
      '- **Communicate With You**: Send account notifications, study reminders, progress reports, product updates, and respond to your support inquiries.',
      '- **Improve Our Platform**: Analyze aggregate usage patterns, conduct research on learning outcomes, improve our question bank and adaptive algorithms, and develop new features.',
      '- **Ensure Security**: Detect and prevent fraud, abuse, and unauthorized access to protect your account and our platform.',
      '- **Comply With Legal Obligations**: Meet our legal and regulatory requirements, enforce our Terms of Service, and respond to lawful requests from authorities.',
    ],
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing and Disclosure',
    content: [
      'We do not sell your personal information to third parties. We may share your information in the following limited circumstances:',
      '- **Service Providers**: We share information with trusted third-party vendors who assist us in operating our platform, including cloud hosting providers (e.g., Vercel, AWS), payment processors (Stripe), email service providers, and analytics tools. These providers are contractually obligated to use your data only to perform services on our behalf.',
      '- **Institutional Partners**: If you access Haven Institute through a nursing school or institutional partnership, we may share your progress data and performance summaries with authorized administrators at your institution, as outlined in the agreement between Haven Institute and your school.',
      '- **Community Features**: Content you voluntarily post in discussion forums, study groups, or other community features is visible to other users of those features.',
      '- **Legal Requirements**: We may disclose your information if required by law, subpoena, or other legal process, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.',
      '- **Business Transfers**: In connection with a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your personal information.',
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    content: [
      'We take the security of your personal information seriously and implement industry-standard measures to protect it:',
      '- All data transmitted between your browser and our servers is encrypted using TLS (Transport Layer Security) encryption.',
      '- We use encryption at rest for sensitive data stored in our databases.',
      '- Our platform undergoes regular security audits and penetration testing.',
      '- We maintain SOC 2 Type II compliance and follow HIPAA-compliant data handling practices.',
      '- Access to personal data is restricted to authorized employees and contractors who need it to perform their job functions.',
      '- We implement rate limiting, intrusion detection, and automated monitoring systems to detect and respond to potential security threats.',
      'While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we are committed to promptly notifying affected users in the unlikely event of a data breach.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and Tracking Technologies',
    content: [
      'We use cookies and similar technologies to enhance your experience on our platform. Cookies are small text files stored on your device that help us:',
      '- Keep you signed in to your account across sessions.',
      '- Remember your preferences and settings (e.g., dark mode, quiz preferences).',
      '- Understand how you navigate and use our platform so we can improve it.',
      '- Measure the effectiveness of our marketing campaigns.',
      'You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform. For a detailed breakdown of the cookies we use, please refer to our Cookies Policy.',
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Rights and Choices',
    content: [
      'Depending on your location, you may have the following rights regarding your personal information:',
      '- **Access**: You can request a copy of the personal information we hold about you by contacting us or exporting your data from your account settings.',
      '- **Correction**: You can update or correct your account information at any time through your account settings page.',
      '- **Deletion**: You can request deletion of your account and associated personal data by contacting support@havenstudy.com. We will process your request within 30 days, subject to any legal retention obligations.',
      '- **Data Portability**: You can request a machine-readable export of your study data, including quiz history, flashcard progress, and performance analytics.',
      '- **Opt-Out of Marketing**: You can unsubscribe from promotional emails at any time by clicking the unsubscribe link in any marketing email or updating your notification preferences in account settings.',
      '- **Cookie Preferences**: You can manage your cookie settings through your browser or our cookie preference tool.',
      'If you are a resident of California, the European Economic Area, or the United Kingdom, you may have additional rights under the CCPA, GDPR, or UK GDPR respectively. To exercise any of these rights, please contact us at support@havenstudy.com.',
    ],
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    content: [
      'Haven Institute is designed for nursing students and professionals who are typically 18 years of age or older. We do not knowingly collect personal information from children under the age of 13.',
      'If we become aware that we have collected personal information from a child under 13, we will take steps to promptly delete that information. If you believe that a child under 13 has provided us with personal information, please contact us immediately at support@havenstudy.com.',
    ],
  },
  {
    id: 'changes-to-policy',
    title: 'Changes to This Privacy Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:',
      '- Update the "Last Updated" date at the top of this page.',
      '- Notify you via email or through a prominent notice on our platform if the changes are significant.',
      '- Where required by law, obtain your consent before applying material changes to how we process your personal information.',
      'We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
      '- **Email**: support@havenstudy.com',
      '- **Mail**: Haven Institute, Attn: Privacy Team, San Francisco, CA, United States',
      '- **Response Time**: We aim to respond to all privacy-related inquiries within 30 days.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy' },
        ])}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            Legal
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Privacy{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your privacy matters to us. This policy explains how Haven Institute collects,
            uses, and protects your personal information.
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
