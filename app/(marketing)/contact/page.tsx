import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Clock, MapPin, Phone } from 'lucide-react';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Contact Us - Get Help with NCLEX Prep',
  description:
    'Contact Haven Institute for NCLEX prep support. Get help with your account, subscription, study plan, or technical issues. We respond within 24 hours.',
  path: '/contact',
  keywords: [
    'Haven Institute contact',
    'NCLEX prep support',
    'Haven Institute help',
    'NCLEX study help',
  ],
});

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get a response within 24 hours',
    detail: 'support@havenstudy.com',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    detail: 'Available Mon-Fri, 9am-6pm EST',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Premium plan subscribers',
    detail: '1-800-HAVEN-NCLEX',
  },
];

const faqs = [
  {
    q: 'How quickly will I get a response?',
    a: 'We respond to all email inquiries within 24 hours. Premium plan subscribers get priority support with responses within 4 hours during business hours.',
  },
  {
    q: 'I forgot my password. How do I reset it?',
    a: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a password reset link within minutes.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel anytime from your Account Settings page. Your access continues until the end of your current billing period.',
  },
  {
    q: 'I found a bug. How do I report it?',
    a: 'Email us at support@havenstudy.com with a description of the issue, your browser/device info, and any screenshots. We\'ll investigate and fix it promptly.',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' },
        ])}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/50 to-white dark:from-zinc-950 dark:to-zinc-900 pt-8 pb-12">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            <MessageSquare className="mr-1 h-3 w-3" /> Get in Touch
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Contact Haven Institute
          </h1>
          <p className="text-lg text-muted-foreground">
            Have questions about your NCLEX prep? Our support team is here to help you
            succeed.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <Card key={method.title} className="text-center border-0 shadow-sm">
                <CardContent className="pt-6 space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                    <method.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-semibold">{method.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                  <p className="text-sm font-medium text-primary">{method.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Send Us a Message</h2>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    placeholder="Your first name"
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    placeholder="Your last name"
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                  <option>Feature Request</option>
                  <option>Partnership Inquiry</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none"
                />
              </div>
              <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                Send Message
              </button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Common Support Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-muted/30 rounded-xl p-6 space-y-2">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="py-12 bg-muted/30 text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Support Hours</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
            <p>Saturday: 10:00 AM - 2:00 PM EST</p>
            <p>Sunday: Closed (email support only)</p>
          </div>
        </div>
      </section>
    </div>
  );
}
