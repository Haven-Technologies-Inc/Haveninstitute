import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = createMetadata({
  title: 'Cookies Policy | Haven Institute',
  description:
    'Haven Institute cookies policy. Learn about the cookies and similar technologies we use on our NCLEX preparation platform at havenstudy.com and how to manage them.',
  path: '/cookies',
  keywords: [
    'Haven Institute cookies policy',
    'havenstudy.com cookies',
    'NCLEX prep cookies',
    'Haven study cookie settings',
  ],
});

const cookieTypes = [
  {
    name: 'Essential Cookies',
    description:
      'These cookies are strictly necessary for the operation of our platform. They enable core functionality such as account authentication, session management, security protections, and load balancing. Without these cookies, the Service cannot function properly.',
    examples: [
      { cookie: 'session_id', purpose: 'Maintains your authenticated session', duration: 'Session' },
      { cookie: 'csrf_token', purpose: 'Prevents cross-site request forgery attacks', duration: 'Session' },
      { cookie: 'cookie_consent', purpose: 'Stores your cookie preference choices', duration: '1 year' },
    ],
    canDisable: false,
  },
  {
    name: 'Analytics Cookies',
    description:
      'These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. We use this data to analyze usage patterns, identify popular features, detect performance issues, and improve the overall user experience.',
    examples: [
      { cookie: '_ga / _gid', purpose: 'Google Analytics visitor tracking', duration: '2 years / 24 hours' },
      { cookie: 'ph_session', purpose: 'PostHog product analytics and session replay', duration: '1 year' },
    ],
    canDisable: true,
  },
  {
    name: 'Functional Cookies',
    description:
      'These cookies enable enhanced functionality and personalization features that are not strictly necessary but improve your experience. They remember your preferences and settings so you do not have to re-enter them each time you visit.',
    examples: [
      { cookie: 'theme', purpose: 'Stores your light/dark mode preference', duration: '1 year' },
      { cookie: 'quiz_prefs', purpose: 'Remembers your preferred quiz settings (question count, timer)', duration: '6 months' },
      { cookie: 'locale', purpose: 'Stores your language and region preference', duration: '1 year' },
    ],
    canDisable: true,
  },
  {
    name: 'Marketing Cookies',
    description:
      'These cookies are used to deliver relevant advertisements and measure the effectiveness of our marketing campaigns. They may be set by us or by third-party advertising partners and are used to build a profile of your interests to show you relevant content on other sites.',
    examples: [
      { cookie: '_fbp', purpose: 'Facebook Pixel for ad measurement', duration: '3 months' },
      { cookie: '_gcl_au', purpose: 'Google Ads conversion tracking', duration: '3 months' },
    ],
    canDisable: true,
  },
];

const sections = [
  {
    id: 'what-are-cookies',
    title: 'What Are Cookies',
    content: [
      'Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give site owners useful information about how their site is being used.',
      'Cookies can be "first-party" (set by the website you are visiting) or "third-party" (set by a different domain than the one you are visiting). They can also be "session" cookies (deleted when you close your browser) or "persistent" cookies (remain on your device for a set period or until you delete them).',
      'In addition to cookies, we may also use similar technologies such as local storage, session storage, and pixel tags to collect and store information.',
    ],
  },
  {
    id: 'managing-cookies',
    title: 'Managing Cookies',
    content: [
      'You have several options for managing cookies on our platform:',
      '- **Browser Settings**: Most web browsers allow you to control cookies through their settings. You can typically choose to block all cookies, accept all cookies, or be notified when a cookie is set so you can decide whether to accept it. Consult your browser\'s help documentation for specific instructions.',
      '- **Opt-Out Links**: For third-party analytics and advertising cookies, you can opt out through the following services: Google Analytics Opt-Out (tools.google.com/dlpage/gaoptout), Network Advertising Initiative (optout.networkadvertising.org), and Digital Advertising Alliance (optout.aboutads.info).',
      '- **Do Not Track**: Our platform respects the Do Not Track (DNT) signal sent by your browser. When we detect a DNT signal, we disable non-essential analytics and marketing cookies.',
      'Please note that disabling essential cookies will prevent our platform from functioning correctly. Disabling analytics or functional cookies may degrade certain features or limit our ability to improve the Service based on usage data.',
    ],
  },
  {
    id: 'third-party-cookies',
    title: 'Third-Party Cookies',
    content: [
      'Some cookies on our platform are set by third-party services that we use to operate and improve the Service. These third parties have their own privacy and cookie policies, which we encourage you to review:',
      '- **Stripe** (stripe.com): Payment processing and fraud prevention. Stripe may set cookies to securely process your payment information and detect fraudulent transactions.',
      '- **Google Analytics** (analytics.google.com): Website analytics and usage reporting. Google Analytics uses cookies to collect anonymized information about how visitors use our platform.',
      '- **PostHog** (posthog.com): Product analytics and session recording. PostHog helps us understand user behavior to improve features and identify issues.',
      '- **Vercel** (vercel.com): Hosting and performance optimization. Vercel may set cookies related to platform delivery, edge caching, and performance monitoring.',
      'We do not control the cookies set by these third-party services. For information about how they handle your data, please refer to their respective privacy policies.',
    ],
  },
  {
    id: 'updates',
    title: 'Updates to This Policy',
    content: [
      'We may update this Cookies Policy from time to time to reflect changes in the cookies we use, changes in technology, or changes in applicable laws and regulations.',
      'When we make material changes to this policy, we will update the "Last Updated" date at the top of this page and may provide additional notice through our platform.',
      'We encourage you to review this Cookies Policy periodically to stay informed about how we use cookies and related technologies.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: [
      'If you have any questions about our use of cookies or this Cookies Policy, please contact us:',
      '- **Email**: support@havenstudy.com',
      '- **Mail**: Haven Institute, Attn: Privacy Team, San Francisco, CA, United States',
    ],
  },
];

export default function CookiesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Cookies Policy', url: '/cookies' },
        ])}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            Legal
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Cookies{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            This policy explains how Haven Institute uses cookies and similar
            technologies on our NCLEX preparation platform.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: February 2026
          </p>
        </section>

        {/* What Are Cookies */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div id="what-are-cookies">
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">1.</span>
              What Are Cookies
            </h2>
            <div className="space-y-3">
              {sections[0].content.map((paragraph, pIndex) => (
                <p
                  key={pIndex}
                  className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Types of Cookies We Use */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div id="types-we-use">
            <h2 className="text-2xl font-bold mb-6">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">2.</span>
              Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              {cookieTypes.map((type) => (
                <Card key={type.name} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{type.name}</h3>
                      <Badge variant={type.canDisable ? 'outline' : 'secondary'}>
                        {type.canDisable ? 'Optional' : 'Required'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {type.description}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 font-medium text-foreground">Cookie</th>
                            <th className="text-left py-2 pr-4 font-medium text-foreground">Purpose</th>
                            <th className="text-left py-2 font-medium text-foreground">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {type.examples.map((example) => (
                            <tr key={example.cookie} className="border-b border-border/50 last:border-0">
                              <td className="py-2 pr-4 text-muted-foreground font-mono text-xs">
                                {example.cookie}
                              </td>
                              <td className="py-2 pr-4 text-muted-foreground">{example.purpose}</td>
                              <td className="py-2 text-muted-foreground whitespace-nowrap">{example.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Remaining Sections */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="space-y-12">
            {sections.slice(1).map((section, index) => (
              <div key={section.id} id={section.id}>
                <h2 className="text-2xl font-bold mb-4">
                  <span className="text-indigo-600 dark:text-indigo-400 mr-2">
                    {index + 3}.
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
