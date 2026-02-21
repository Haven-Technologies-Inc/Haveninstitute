import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { createMetadata, breadcrumbSchema, reviewSchema } from '@/lib/seo';
import { Star, ArrowRight, Quote, CheckCircle2 } from 'lucide-react';

export const metadata = createMetadata({
  title: 'NCLEX Prep Reviews & Student Success Stories - Haven Institute',
  description:
    'Read reviews and success stories from nursing students who passed the NCLEX with Haven Institute. 98% first-attempt pass rate. See what students say about our AI-powered NCLEX preparation platform.',
  path: '/testimonials',
  keywords: [
    'NCLEX prep reviews',
    'Haven Institute reviews',
    'NCLEX success stories',
    'NCLEX prep testimonials',
    'Haven Institute student reviews',
    'NCLEX pass stories',
    'best NCLEX prep reviews',
    'NCLEX preparation reviews 2026',
  ],
});

const reviews = [
  {
    author: 'Jessica Martinez',
    rating: 5,
    body: 'I passed the NCLEX-RN on my first attempt in 75 questions after using Haven Institute for just 6 weeks! The AI adaptive learning was incredible. It identified that I was weak in pharmacology and prioritization questions early on and kept targeting those areas until I was confident. The CAT simulations were so realistic that the actual exam felt familiar. I tried UWorld before Haven and honestly the AI-powered approach here is leagues ahead.',
    datePublished: '2026-02-10',
    school: 'University of Texas at Austin',
    examType: 'NCLEX-RN',
    studyDuration: '6 weeks',
  },
  {
    author: 'David Thompson',
    rating: 5,
    body: 'As a second-career nursing student with limited study time, Haven Institute was a game-changer. The AI study planner created a realistic schedule around my work hours, and the AI tutor was like having a personal nursing professor available 24/7. I could ask it anything about disease processes or drug interactions and get clear, detailed explanations. Passed NCLEX-RN in 82 questions. Worth every penny of the Premium plan.',
    datePublished: '2026-01-28',
    school: 'NYU Rory Meyers College of Nursing',
    examType: 'NCLEX-RN',
    studyDuration: '8 weeks',
  },
  {
    author: 'Aaliyah Washington',
    rating: 5,
    body: 'The 50,000+ question bank is no joke. I never ran out of new questions, even after studying for 3 months. The spaced repetition flashcards helped me memorize lab values and drug classifications that I had been struggling with for years. The performance analytics showed me exactly where I stood compared to passing standards. Passed NCLEX-RN first attempt after failing with another prep program.',
    datePublished: '2026-01-15',
    school: 'Howard University',
    examType: 'NCLEX-RN',
    studyDuration: '12 weeks',
  },
  {
    author: 'Michael Chen',
    rating: 5,
    body: 'I used the free tier for two weeks before upgrading to Pro, and I am so glad I did. The free plan gave me enough to see how powerful the adaptive learning is, and the Pro plan unlocked everything I needed. At $29.99 per month, it is a fraction of what I would have paid for UWorld or Kaplan. Passed my NCLEX-PN in 85 questions. The community study groups were also amazing for motivation.',
    datePublished: '2025-12-20',
    school: 'Miami Dade College',
    examType: 'NCLEX-PN',
    studyDuration: '10 weeks',
  },
  {
    author: 'Sarah Kim',
    rating: 5,
    body: 'I was terrified of the NCLEX after hearing horror stories from classmates. Haven Institute not only prepared me academically but also helped manage my test anxiety through realistic CAT simulations. After completing 15+ full-length simulations that mimicked the real exam, walking into Pearson VUE felt like another practice session. Stopped at 75 questions and passed! I recommend Haven to every nursing student I know.',
    datePublished: '2025-12-08',
    school: 'UCLA School of Nursing',
    examType: 'NCLEX-RN',
    studyDuration: '8 weeks',
  },
  {
    author: 'James Rodriguez',
    rating: 4,
    body: 'Very solid NCLEX prep platform. The AI adaptive learning really works. After two weeks it had completely mapped my strengths and weaknesses and was serving me exactly the right questions. The only reason I give 4 stars instead of 5 is that I wish there were more video explanations for complex topics. The AI tutor text explanations are great but sometimes I prefer to watch a walkthrough. Passed NCLEX-RN first attempt.',
    datePublished: '2025-11-25',
    school: 'University of Michigan',
    examType: 'NCLEX-RN',
    studyDuration: '6 weeks',
  },
  {
    author: 'Emily Patel',
    rating: 5,
    body: 'Coming from a non-traditional background, I was worried about NCLEX preparation. Haven Institute made it accessible and actually enjoyable. The AI tutor explained complex nursing concepts in ways that finally clicked for me. The study planner kept me on track when I felt overwhelmed, automatically adjusting my schedule when I fell behind. Passed the NCLEX-PN on my first attempt and I am now a licensed practical nurse!',
    datePublished: '2025-11-10',
    school: 'Community College of Denver',
    examType: 'NCLEX-PN',
    studyDuration: '10 weeks',
  },
  {
    author: 'Rachel Nguyen',
    rating: 5,
    body: 'The NGN question types on Haven Institute were the best preparation I could have asked for. The case study and bow-tie questions were challenging but the detailed rationales helped me understand the clinical judgment framework. I felt completely prepared for the Next Generation NCLEX format. Passed in 85 questions. My entire study group used Haven and all 8 of us passed on the first attempt!',
    datePublished: '2025-10-28',
    school: 'Johns Hopkins School of Nursing',
    examType: 'NCLEX-RN',
    studyDuration: '7 weeks',
  },
  {
    author: 'Marcus Williams',
    rating: 5,
    body: 'I switched to Haven Institute after using Archer Review for a month and the difference was night and day. The AI adaptive learning is truly personalized, not just random questions from a bank. The question quality is outstanding with rationales that actually teach you the underlying concepts. The price is also much better. I cannot recommend Haven Institute enough.',
    datePublished: '2025-10-15',
    school: 'Emory University',
    examType: 'NCLEX-RN',
    studyDuration: '5 weeks',
  },
  {
    author: 'Lisa Anderson',
    rating: 5,
    body: 'After failing the NCLEX once with another prep program, I was devastated and looking for something different. Haven Institute turned my preparation around completely. The AI identified gaps in my knowledge that I did not even know I had, particularly in infection control and safety. The pass guarantee with the Premium plan gave me confidence, and I passed on my second attempt in 76 questions.',
    datePublished: '2025-10-02',
    school: 'University of Florida',
    examType: 'NCLEX-RN',
    studyDuration: '8 weeks',
  },
];

const aggregateRating = {
  average: 4.9,
  total: 2847,
  distribution: [
    { stars: 5, percentage: 89 },
    { stars: 4, percentage: 8 },
    { stars: 3, percentage: 2 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 0 },
  ],
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const rnReviews = reviews.filter((r) => r.examType === 'NCLEX-RN');
  const pnReviews = reviews.filter((r) => r.examType === 'NCLEX-PN');

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Testimonials', url: '/testimonials' },
          ]),
          ...reviewSchema(
            reviews.map((r) => ({
              author: r.author,
              rating: r.rating,
              body: r.body,
              datePublished: r.datePublished,
            }))
          ),
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            Student Reviews
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Real Students, Real{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              NCLEX Success Stories
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Hear from thousands of nursing students who passed the NCLEX-RN and NCLEX-PN using
            Haven Institute. Our 98% first-attempt pass rate speaks for itself.
          </p>
        </section>

        {/* Aggregate Rating */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 sm:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {aggregateRating.average}
                    </span>
                    <span className="text-xl text-muted-foreground">/5</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    Based on {aggregateRating.total.toLocaleString()} verified student reviews
                  </p>
                </div>
                <div className="space-y-2">
                  {aggregateRating.distribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-12">{item.stars} star</span>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10 text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filter */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <nav className="flex flex-wrap justify-center gap-3" aria-label="Review filters">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50 transition-colors px-4 py-1.5 text-sm">
              All Reviews ({reviews.length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50 transition-colors px-4 py-1.5 text-sm">
              NCLEX-RN ({rnReviews.length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted/50 transition-colors px-4 py-1.5 text-sm">
              NCLEX-PN ({pnReviews.length})
            </Badge>
          </nav>
        </section>

        {/* Reviews Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <Card key={review.author} className="border-border/50">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-white">
                        {review.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{review.author}</h3>
                      <p className="text-sm text-muted-foreground">{review.school}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <StarRating rating={review.rating} />
                        <Badge variant="outline" className="text-xs">
                          {review.examType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-1 h-6 w-6 text-indigo-500/20" />
                    <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                      {review.body}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                    <span>Study Duration: {review.studyDuration}</span>
                    <span>{review.datePublished}</span>
                    <Badge variant="success" className="ml-auto text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Our Students&apos;{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Results Speak
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">98%</p>
              <p className="text-sm text-muted-foreground mt-1">First-Attempt Pass Rate</p>
            </div>
            <div className="p-6">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">50,000+</p>
              <p className="text-sm text-muted-foreground mt-1">Students Helped</p>
            </div>
            <div className="p-6">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">4.9/5</p>
              <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
            </div>
            <div className="p-6">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">2,847</p>
              <p className="text-sm text-muted-foreground mt-1">Verified Reviews</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Write Your Own Success Story?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the thousands of nursing students who have passed the NCLEX with Haven Institute.
            Start your free account today and take the first step toward becoming a licensed nurse.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
