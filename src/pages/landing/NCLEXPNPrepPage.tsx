import { Link } from 'react-router-dom';
import { SEOHead, courseSchema, faqSchema, breadcrumbSchema } from '../../components/seo';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  CheckCircle, 
  Brain, 
  Target, 
  BookOpen, 
  Award, 
  ArrowRight,
  Star,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';

const faqs = [
  {
    question: 'What is the NCLEX-PN exam?',
    answer: 'The NCLEX-PN (National Council Licensure Examination for Practical Nurses) is the licensing exam for Licensed Practical Nurses (LPNs) and Licensed Vocational Nurses (LVNs). It uses Computer Adaptive Testing (CAT) with 85-150 questions and a 5-hour time limit.'
  },
  {
    question: 'How is NCLEX-PN different from NCLEX-RN?',
    answer: 'NCLEX-PN focuses on practical/vocational nursing scope of practice, while NCLEX-RN covers registered nursing responsibilities. NCLEX-PN has 85-150 questions (vs 75-145 for RN) and covers similar content areas but at a different complexity level appropriate for LPN/LVN practice.'
  },
  {
    question: 'What is the passing score for NCLEX-PN?',
    answer: 'NCLEX-PN uses a pass/fail system based on the CAT algorithm, not a numerical score. The exam determines if your ability level is above or below the passing standard with 95% confidence. Haven Institute\'s CAT simulations help you understand exactly where you stand.'
  },
  {
    question: 'How long should I study for NCLEX-PN?',
    answer: 'Most LPN/LVN graduates need 3-6 weeks of dedicated NCLEX-PN preparation. Haven Institute creates personalized study plans based on your nursing program performance and diagnostic assessment results.'
  },
  {
    question: 'Does Haven Institute cover all NCLEX-PN content areas?',
    answer: 'Yes! Haven Institute covers all four NCLEX-PN Client Needs categories: Safe and Effective Care Environment, Health Promotion and Maintenance, Psychosocial Integrity, and Physiological Integrity, with questions specifically designed for LPN/LVN scope of practice.'
  }
];

export default function NCLEXPNPrepPage() {
  const structuredData = [
    courseSchema(
      'NCLEX-PN Complete Prep Course',
      'Comprehensive NCLEX-PN preparation for LPN/LVN students with AI-powered adaptive learning, 8,000+ practice questions, CAT simulation exams, and personalized study plans.',
      '39'
    ),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'NCLEX-PN Prep', url: '/nclex-pn' }
    ])
  ];

  return (
    <>
      <SEOHead
        title="NCLEX-PN Prep Course - Pass Your LPN/LVN Exam First Time"
        description="Pass your NCLEX-PN exam on the first attempt with Haven Institute's AI-powered prep course for LPN/LVN students. 8,000+ practice questions, CAT simulations, AI tutor, and personalized study plans. 97% pass rate."
        keywords={[
          'NCLEX-PN prep',
          'NCLEX-PN study guide',
          'NCLEX-PN practice questions',
          'LPN exam prep',
          'LVN exam prep',
          'practical nursing exam',
          'NCLEX-PN review course',
          'pass NCLEX-PN first time',
          'NCLEX-PN 2026',
          'licensed practical nurse exam',
          'vocational nursing exam'
        ]}
        canonical="/nclex-pn"
        ogType="course"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="size-4" />
              97% First-Time Pass Rate for LPN/LVN Students
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              NCLEX-PN Prep for <span className="text-green-600">Future LPNs & LVNs</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Join thousands of practical nursing students who passed their NCLEX-PN on the first attempt. 
              AI-powered prep designed specifically for LPN/LVN scope of practice.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700">
                <Link to="/register">Start Free Today <ArrowRight className="ml-2 size-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-500" />
                <span>8,000+ LPN Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-500" />
                <span>AI-Powered Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-500" />
                <span>CAT Simulations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-500" />
                <span>LPN/LVN Focused</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              NCLEX-PN Prep Designed for Practical Nursing Success
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Brain className="size-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">LPN-Specific Content</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Questions and content tailored specifically to LPN/LVN scope of practice, 
                    focusing on what practical nurses need to know.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Target className="size-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">CAT Simulation Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Experience the real NCLEX-PN format with our 85-150 question CAT simulations 
                    that mirror the actual exam experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <BookOpen className="size-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">8,000+ Practice Questions</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Comprehensive question bank covering all NCLEX-PN categories with detailed 
                    rationales written for practical nursing practice.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Zap className="size-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">AI Tutor 24/7</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get instant help understanding nursing concepts, medication calculations, 
                    and clinical scenarios anytime you need it.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <TrendingUp className="size-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Progress Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor your improvement across all NCLEX-PN content areas with 
                    detailed analytics and readiness predictions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Clock className="size-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Flexible Study Plans</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Custom study schedules that work around your life, whether you're 
                    working or have family commitments.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 bg-green-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Success Stories from LPN/LVN Students
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    "As a mom working part-time, I needed flexible study options. Haven Institute's 
                    app let me study during lunch breaks and after the kids went to bed. Passed in 85 questions!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                      AR
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white">Amanda R., LPN</p>
                      <p className="text-sm text-gray-500">Texas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    "The LPN-specific content was exactly what I needed. Other prep courses mixed 
                    RN and PN content, but Haven Institute focuses on what LPNs actually need to know."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      DW
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white">David W., LVN</p>
                      <p className="text-sm text-gray-500">California</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    "I was nervous about the CAT format, but Haven's simulations prepared me perfectly. 
                    When I sat for my real exam, I knew exactly what to expect. Now I'm a licensed LPN!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      KM
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white">Kim M., LPN</p>
                      <p className="text-sm text-gray-500">Florida</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              NCLEX-PN Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-green-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Your NCLEX-PN Journey Today
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of successful LPN/LVN students. Your nursing career starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-green-600 hover:bg-gray-100">
                <Link to="/register">Start Free Today</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-white text-white hover:bg-green-700">
                <Link to="/pricing">View Pricing Plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
