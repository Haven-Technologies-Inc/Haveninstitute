import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema, faqSchema } from '@/lib/seo';
import {
  Mail,
  Clock,
  MessageSquare,
  Phone,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const metadata = createMetadata({
  title: 'Contact Haven Institute | NCLEX Prep Support & Help',
  description:
    'Contact Haven Institute for NCLEX prep support, technical help, billing questions, or partnership inquiries. Our support team is available Monday through Saturday to help you succeed.',
  path: '/contact',
  keywords: [
    'contact Haven Institute',
    'NCLEX prep support',
    'Haven Institute help',
    'Haven Institute email',
    'NCLEX prep customer service',
    'Haven study contact',
  ],
});

const contactFaqs = [
  {
    question: 'What are Haven Institute support hours?',
    answer:
      'Our support team is available Monday through Friday from 8:00 AM to 8:00 PM Eastern Time, and Saturday from 9:00 AM to 5:00 PM Eastern Time. Premium plan members have access to 24/7 priority support. For urgent technical issues outside regular hours, email urgent@havenstudy.com.',
  },
  {
    question: 'How quickly can I expect a response?',
    answer:
      'Free and Pro plan members typically receive a response within 24 hours during business days. Premium plan members receive priority support with responses within 4 hours. For urgent account or billing issues, we aim to respond within 2 hours during support hours.',
  },
  {
    question: 'Can I request a demo or group trial for my nursing school?',
    answer:
      'Yes, we offer demos and group trials for nursing schools and educational institutions. Contact our partnerships team at partnerships@havenstudy.com or fill out the contact form and select "Partnership/Institutional" as the category. We offer special group pricing for cohorts of 10 or more students.',
  },
  {
    question: 'How do I report a technical issue or bug?',
    answer:
      'To help us resolve technical issues quickly, please include the following in your message: a description of the issue, steps to reproduce it, your browser and device information, and any error messages or screenshots. Email support@havenstudy.com or use the contact form below with the "Technical Support" category.',
  },
  {
    question: 'How do I cancel my subscription or request a refund?',
    answer:
      'You can cancel your subscription at any time from your account settings page. For refund requests within our 14-day money-back guarantee period, contact support@havenstudy.com with your account email. Refunds are typically processed within 5-7 business days.',
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Contact', url: '/contact' },
          ]),
          faqSchema(contactFaqs),
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            Get in Touch
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Contact{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Haven Institute
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question about NCLEX preparation, your account, or our platform? Our dedicated
            support team is here to help you succeed.
          </p>
        </section>

        {/* Contact Info Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6">
                <Mail className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Email Us</h3>
                <a href="mailto:support@havenstudy.com" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  support@havenstudy.com
                </a>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Support Hours</h3>
                <p className="text-sm text-muted-foreground">Mon-Fri: 8AM - 8PM ET</p>
                <p className="text-sm text-muted-foreground">Sat: 9AM - 5PM ET</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6">
                <MessageSquare className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Available for Premium members 24/7</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground">1-800-HAVEN-NCLEX</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill out the form below and our support team will get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form action="mailto:support@havenstudy.com" method="POST" encType="text/plain" className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          placeholder="Jane"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-1.5">
                        Category
                      </label>
                      <select
                        id="category"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="">Select a category</option>
                        <option value="general">General Question</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing &amp; Subscription</option>
                        <option value="partnership">Partnership / Institutional</option>
                        <option value="feedback">Feedback &amp; Suggestions</option>
                        <option value="press">Press &amp; Media</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        placeholder="Brief description of your inquiry"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Provide details about your question or issue..."
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
                      />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto">
                      Send Message <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-indigo-500" />
                    Email Contacts
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">General Support</p>
                      <a href="mailto:support@havenstudy.com" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        support@havenstudy.com
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Billing Questions</p>
                      <a href="mailto:billing@havenstudy.com" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        billing@havenstudy.com
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Partnerships</p>
                      <a href="mailto:partnerships@havenstudy.com" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        partnerships@havenstudy.com
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Press &amp; Media</p>
                      <a href="mailto:press@havenstudy.com" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        press@havenstudy.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                    Social Media
                  </h3>
                  <div className="space-y-2">
                    <a href="https://twitter.com/haveninstitute" target="_blank" rel="noopener noreferrer" className="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                      Twitter / X: @haveninstitute
                    </a>
                    <a href="https://instagram.com/haveninstitute" target="_blank" rel="noopener noreferrer" className="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                      Instagram: @haveninstitute
                    </a>
                    <a href="https://linkedin.com/company/haveninstitute" target="_blank" rel="noopener noreferrer" className="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                      LinkedIn: Haven Institute
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-indigo-500" />
                    Looking for Quick Answers?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Many common questions are answered in our comprehensive FAQ section.
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/faq">Visit FAQ Page</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Support{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                FAQ
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            {contactFaqs.map((faq) => (
              <Card key={faq.question} className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
