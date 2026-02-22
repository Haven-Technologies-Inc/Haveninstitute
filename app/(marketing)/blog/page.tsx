import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema } from '@/lib/seo';
import { ArrowRight, Clock, User } from 'lucide-react';

export const metadata = createMetadata({
  title: 'NCLEX Study Tips & Nursing Exam Blog - Haven Institute',
  description:
    'Expert NCLEX study tips, preparation strategies, nursing career advice, and test anxiety management. Read the Haven Institute blog for proven strategies to pass the NCLEX on your first attempt.',
  path: '/blog',
  keywords: [
    'NCLEX study tips',
    'nursing exam blog',
    'NCLEX preparation guide',
    'how to pass NCLEX',
    'NCLEX study schedule',
    'NCLEX pharmacology tips',
    'nursing career advice',
    'NCLEX test anxiety',
    'NCLEX study strategies',
    'NCLEX first attempt tips',
  ],
});

const categories = [
  'Study Tips',
  'NCLEX Strategies',
  'Nursing Career',
  'Test Anxiety',
  'Clinical Knowledge',
];

const blogPosts = [
  {
    title: 'How to Pass the NCLEX on Your First Attempt: A Complete Guide',
    excerpt:
      'Discover the proven strategies and study techniques that helped over 50,000 nursing students pass the NCLEX-RN and NCLEX-PN on their very first attempt. From creating effective study plans to mastering critical thinking, this comprehensive guide covers everything you need to know.',
    category: 'NCLEX Strategies',
    date: 'February 15, 2026',
    author: 'Dr. Sarah Chen',
    readTime: '12 min read',
    slug: 'how-to-pass-nclex-first-attempt',
  },
  {
    title: 'NCLEX Study Schedule: The Ultimate 30-Day Plan',
    excerpt:
      'A detailed, day-by-day 30-day NCLEX study schedule designed by nursing educators. Learn how to structure your study sessions, balance content review with practice questions, and build confidence in the weeks leading up to your exam date.',
    category: 'Study Tips',
    date: 'February 10, 2026',
    author: 'Dr. Amanda Williams',
    readTime: '15 min read',
    slug: 'nclex-study-schedule-30-day-plan',
  },
  {
    title: 'Top 10 NCLEX Pharmacology Tips Every Nursing Student Needs',
    excerpt:
      'Pharmacology is one of the most challenging NCLEX content areas. Master drug classifications, mechanism of action, side effects, and nursing implications with these expert-backed study strategies and memory aids.',
    category: 'Clinical Knowledge',
    date: 'February 5, 2026',
    author: 'Dr. Lisa Nguyen',
    readTime: '10 min read',
    slug: 'nclex-pharmacology-tips',
  },
  {
    title: 'NCLEX Test Anxiety: 8 Evidence-Based Strategies to Stay Calm',
    excerpt:
      'Test anxiety affects nearly half of all nursing students taking the NCLEX. Learn cognitive behavioral techniques, breathing exercises, and preparation strategies that can reduce anxiety and improve your exam performance.',
    category: 'Test Anxiety',
    date: 'January 28, 2026',
    author: 'Rachel Johnson',
    readTime: '8 min read',
    slug: 'nclex-test-anxiety-strategies',
  },
  {
    title: 'Understanding NCLEX-RN Question Types: A Comprehensive Breakdown',
    excerpt:
      'From multiple choice to Select All That Apply (SATA), drag-and-drop to Next Generation NCLEX items, learn how to approach every question type you will encounter on the NCLEX-RN exam with confidence.',
    category: 'NCLEX Strategies',
    date: 'January 22, 2026',
    author: 'Dr. Sarah Chen',
    readTime: '11 min read',
    slug: 'nclex-rn-question-types-guide',
  },
  {
    title: 'NCLEX Clinical Judgment: Mastering the New NGN Item Types',
    excerpt:
      'The Next Generation NCLEX (NGN) introduced new question formats focused on clinical judgment. Learn the NCSBN Clinical Judgment Measurement Model and how to approach case studies, bow-tie items, and trend analysis questions.',
    category: 'NCLEX Strategies',
    date: 'January 15, 2026',
    author: 'Dr. Amanda Williams',
    readTime: '14 min read',
    slug: 'nclex-clinical-judgment-ngn-guide',
  },
  {
    title: 'From New Grad to Nurse: What to Expect in Your First Year',
    excerpt:
      'Passing the NCLEX is just the beginning. Explore what to expect during your first year as a licensed nurse, including residency programs, common challenges, and tips from experienced nurses who have been through it.',
    category: 'Nursing Career',
    date: 'January 8, 2026',
    author: 'Rachel Johnson',
    readTime: '9 min read',
    slug: 'new-grad-nurse-first-year-guide',
  },
  {
    title: 'NCLEX Lab Values: The Complete Study Guide',
    excerpt:
      'Laboratory values are heavily tested on the NCLEX. This comprehensive guide covers critical lab values, normal ranges, nursing implications, and the clinical reasoning behind why abnormal results matter for patient safety.',
    category: 'Clinical Knowledge',
    date: 'January 2, 2026',
    author: 'Dr. Lisa Nguyen',
    readTime: '13 min read',
    slug: 'nclex-lab-values-study-guide',
  },
  {
    title: 'How AI Adaptive Learning is Revolutionizing NCLEX Preparation',
    excerpt:
      'Traditional NCLEX prep treats every student the same. Learn how AI-powered adaptive learning analyzes your individual performance to create a personalized study experience that targets your weak areas and reinforces your strengths.',
    category: 'Study Tips',
    date: 'December 20, 2025',
    author: 'Michael Torres',
    readTime: '7 min read',
    slug: 'ai-adaptive-learning-nclex-prep',
  },
  {
    title: 'NCLEX Prioritization Questions: Frameworks That Actually Work',
    excerpt:
      'Prioritization and delegation questions are among the most challenging on the NCLEX. Master the ABC framework, Maslow hierarchy, nursing process, and other decision-making frameworks with practical examples and practice scenarios.',
    category: 'NCLEX Strategies',
    date: 'December 14, 2025',
    author: 'Dr. Sarah Chen',
    readTime: '10 min read',
    slug: 'nclex-prioritization-questions-guide',
  },
  {
    title: 'The Best Nursing Specialties for New Graduates in 2026',
    excerpt:
      'Explore the highest-demand nursing specialties for new graduates, including salary ranges, growth outlook, educational requirements, and what day-to-day practice looks like in each specialty.',
    category: 'Nursing Career',
    date: 'December 8, 2025',
    author: 'Rachel Johnson',
    readTime: '11 min read',
    slug: 'best-nursing-specialties-new-grads-2026',
  },
  {
    title: 'Spaced Repetition for NCLEX: The Science Behind Smart Flashcards',
    excerpt:
      'Spaced repetition is one of the most effective study techniques backed by cognitive science. Learn how this evidence-based method works, why it is superior to cramming, and how to use smart flashcards to maximize retention for the NCLEX.',
    category: 'Study Tips',
    date: 'December 1, 2025',
    author: 'Dr. Lisa Nguyen',
    readTime: '8 min read',
    slug: 'spaced-repetition-nclex-smart-flashcards',
  },
];

const categoryColors: Record<string, string> = {
  'Study Tips': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'NCLEX Strategies': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  'Nursing Career': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'Test Anxiety': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  'Clinical Knowledge': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
};

export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ])}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            Haven Institute Blog
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            NCLEX Study Tips &amp;{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Nursing Career Insights
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Expert guides, study strategies, and practical advice from nursing educators and
            NCLEX preparation specialists. Everything you need to pass the NCLEX and launch
            your nursing career.
          </p>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <nav className="flex flex-wrap justify-center gap-3" aria-label="Blog categories">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50 transition-colors px-4 py-1.5 text-sm">
              All Posts
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-muted/50 transition-colors px-4 py-1.5 text-sm"
              >
                {category}
              </Badge>
            ))}
          </nav>
        </section>

        {/* Featured Post */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 sm:p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-sm font-medium opacity-80 mb-2">Featured Article</p>
                  <p className="text-2xl sm:text-3xl font-bold">The Complete Guide to Passing NCLEX</p>
                </div>
              </div>
              <CardContent className="p-8 sm:p-12 flex flex-col justify-center">
                <Badge className={`w-fit mb-4 border ${categoryColors[blogPosts[0].category]}`}>
                  {blogPosts[0].category}
                </Badge>
                <h2 className="text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
                <p className="text-muted-foreground mb-4">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {blogPosts[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blogPosts[0].readTime}
                  </span>
                </div>
                <Button variant="outline" className="w-fit" asChild>
                  <Link href={`/blog/${blogPosts[0].slug}`}>
                    Read Article <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </div>
          </Card>
        </section>

        {/* Blog Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.slug} className="border-border/50 hover:shadow-lg transition-all duration-200 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`border ${categoryColors[post.category]}`}>
                      {post.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <CardDescription className="leading-relaxed flex-1">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/10">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Start Your NCLEX Journey?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join over 50,000 nursing students using Haven Institute to prepare for the NCLEX.
                Start with our free plan today and get access to practice questions, AI tutoring, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Start Studying Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SEO Internal Links */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-6">Explore More NCLEX Resources</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/features">Platform Features</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/nclex-rn">NCLEX-RN Prep</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/nclex-pn">NCLEX-PN Prep</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/compare">Compare Providers</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/faq">NCLEX FAQ</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/testimonials">Student Reviews</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
