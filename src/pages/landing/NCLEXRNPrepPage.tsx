import { Link } from 'react-router-dom';
import { SEOHead, courseSchema, faqSchema, breadcrumbSchema } from '../../components/seo';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  CheckCircle, 
  Brain, 
  Target, 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight,
  Star,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';

const faqs = [
  {
    question: 'What is the best way to prepare for the NCLEX-RN exam?',
    answer: 'The best way to prepare for NCLEX-RN is using adaptive learning technology that identifies your weak areas and creates personalized study plans. Haven Institute\'s AI-powered platform adapts to your learning style, provides 10,000+ practice questions with detailed rationales, and offers CAT simulation exams that mirror the actual test experience.'
  },
  {
    question: 'How long should I study for NCLEX-RN?',
    answer: 'Most nursing graduates need 4-8 weeks of dedicated NCLEX-RN preparation. However, this varies based on your nursing school performance and study habits. Haven Institute\'s diagnostic assessment helps determine your readiness and creates a customized study timeline.'
  },
  {
    question: 'What is the NCLEX-RN pass rate with Haven Institute?',
    answer: 'Haven Institute students achieve a 98% first-time NCLEX-RN pass rate, significantly higher than the national average of approximately 85%. Our AI-powered adaptive learning ensures you\'re fully prepared before exam day.'
  },
  {
    question: 'How is Haven Institute different from UWorld or Kaplan?',
    answer: 'Unlike traditional question banks, Haven Institute uses advanced AI to personalize your entire study experience. Our AI tutor provides instant explanations, our CAT simulations accurately predict your exam readiness, and our adaptive algorithms continuously optimize your study plan based on your performance.'
  },
  {
    question: 'Does Haven Institute cover Next Generation NCLEX (NGN)?',
    answer: 'Yes! Haven Institute is fully updated for the Next Generation NCLEX format, including all new question types like case studies, extended multiple response, cloze, matrix, and highlighting questions. Our question bank reflects the latest NCSBN Clinical Judgment Model.'
  }
];

export default function NCLEXRNPrepPage() {
  const structuredData = [
    courseSchema(
      'NCLEX-RN Complete Prep Course',
      'Comprehensive NCLEX-RN preparation with AI-powered adaptive learning, 10,000+ practice questions, CAT simulation exams, and personalized study plans. Achieve a 98% first-time pass rate.',
      '49'
    ),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'NCLEX-RN Prep', url: '/nclex-rn' }
    ])
  ];

  return (
    <>
      <SEOHead
        title="NCLEX-RN Prep Course - Pass Your RN Exam First Time"
        description="Pass your NCLEX-RN exam on the first attempt with Haven Institute's AI-powered prep course. 10,000+ practice questions, CAT simulations, AI tutor, and personalized study plans. 98% pass rate. Start free today!"
        keywords={[
          'NCLEX-RN prep',
          'NCLEX-RN study guide',
          'NCLEX-RN practice questions',
          'RN exam prep',
          'nursing board exam',
          'NCLEX-RN review course',
          'pass NCLEX-RN first time',
          'NCLEX-RN 2026',
          'registered nurse exam',
          'NCLEX-RN tips',
          'NCLEX-RN CAT exam',
          'next generation NCLEX-RN'
        ]}
        canonical="/nclex-rn"
        ogType="course"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="size-4" />
              98% First-Time Pass Rate
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              NCLEX-RN Prep That <span className="text-blue-600">Actually Works</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Join 50,000+ nursing students who passed their NCLEX-RN on the first attempt using Haven Institute's 
              AI-powered adaptive learning platform. Smarter prep, better results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
                <Link to="/register">Start Free Today <ArrowRight className="ml-2 size-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-500" />
                <span>10,000+ Questions</span>
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
                <span>NGN Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Everything You Need to Pass NCLEX-RN
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Brain className="size-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">AI-Powered Adaptive Learning</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our AI analyzes your performance in real-time, identifying weak areas and adjusting 
                    your study plan to maximize efficiency and retention.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Target className="size-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">CAT Simulation Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Experience the real NCLEX-RN format with our Computer Adaptive Testing simulations 
                    that accurately predict your exam readiness.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <BookOpen className="size-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">10,000+ Practice Questions</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Comprehensive question bank covering all NCLEX-RN categories with detailed 
                    rationales for correct and incorrect answers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Zap className="size-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">AI Tutor 24/7</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get instant explanations and personalized help from our AI tutor anytime. 
                    No more waiting for answers to your nursing questions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <TrendingUp className="size-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Performance Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track your progress with detailed analytics showing your strengths, 
                    weaknesses, and predicted NCLEX readiness score.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Clock className="size-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Personalized Study Plans</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Custom study schedules based on your exam date, available study time, 
                    and performance data to ensure you're ready on test day.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Why Students Choose Haven Institute Over Competitors
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              See how Haven Institute compares to UWorld, Kaplan, Archer, and other NCLEX prep courses
            </p>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="p-4 text-left text-gray-900 dark:text-white">Feature</th>
                    <th className="p-4 text-center text-blue-600 font-bold">Haven Institute</th>
                    <th className="p-4 text-center text-gray-600 dark:text-gray-400">UWorld</th>
                    <th className="p-4 text-center text-gray-600 dark:text-gray-400">Kaplan</th>
                    <th className="p-4 text-center text-gray-600 dark:text-gray-400">Archer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="p-4 text-gray-700 dark:text-gray-300">AI-Powered Adaptive Learning</td>
                    <td className="p-4 text-center"><CheckCircle className="size-6 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center text-gray-400">Limited</td>
                    <td className="p-4 text-center text-gray-400">Limited</td>
                    <td className="p-4 text-center text-gray-400">No</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="p-4 text-gray-700 dark:text-gray-300">24/7 AI Tutor</td>
                    <td className="p-4 text-center"><CheckCircle className="size-6 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center text-gray-400">No</td>
                    <td className="p-4 text-center text-gray-400">No</td>
                    <td className="p-4 text-center text-gray-400">No</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="p-4 text-gray-700 dark:text-gray-300">CAT Simulation Accuracy</td>
                    <td className="p-4 text-center text-green-600 font-bold">98%</td>
                    <td className="p-4 text-center text-gray-600">92%</td>
                    <td className="p-4 text-center text-gray-600">88%</td>
                    <td className="p-4 text-center text-gray-600">85%</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="p-4 text-gray-700 dark:text-gray-300">Personalized Study Plans</td>
                    <td className="p-4 text-center"><CheckCircle className="size-6 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center text-gray-400">Basic</td>
                    <td className="p-4 text-center"><CheckCircle className="size-6 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center text-gray-400">No</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="p-4 text-gray-700 dark:text-gray-300">Starting Price</td>
                    <td className="p-4 text-center text-green-600 font-bold">Free / $49/mo</td>
                    <td className="p-4 text-center text-gray-600">$79/mo</td>
                    <td className="p-4 text-center text-gray-600">$149/mo</td>
                    <td className="p-4 text-center text-gray-600">$59/mo</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-700 dark:text-gray-300">First-Time Pass Rate</td>
                    <td className="p-4 text-center text-green-600 font-bold">98%</td>
                    <td className="p-4 text-center text-gray-600">96%</td>
                    <td className="p-4 text-center text-gray-600">91%</td>
                    <td className="p-4 text-center text-gray-600">89%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 bg-blue-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              What Our NCLEX-RN Students Say
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
                    "I passed my NCLEX-RN in 75 questions after using Haven Institute for just 6 weeks! 
                    The AI tutor helped me understand complex pharmacology concepts that I struggled with in school."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      SM
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white">Sarah M., RN</p>
                      <p className="text-sm text-gray-500">New York, NY</p>
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
                    "After failing the NCLEX-RN with another prep course, I switched to Haven Institute. 
                    The adaptive learning really works - I passed on my second attempt!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                      MT
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white">Michael T., RN</p>
                      <p className="text-sm text-gray-500">Los Angeles, CA</p>
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
                    "The CAT simulations were exactly like the real exam. I felt so prepared on test day. 
                    Haven Institute is worth every penny - I'm now a registered nurse!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      JL
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white">Jennifer L., RN</p>
                      <p className="text-sm text-gray-500">Chicago, IL</p>
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
              Frequently Asked Questions About NCLEX-RN Prep
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
        <section className="py-20 px-4 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Pass Your NCLEX-RN?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 50,000+ nursing students who trusted Haven Institute. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100">
                <Link to="/register">Start Free Today</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-white text-white hover:bg-blue-700">
                <Link to="/pricing">View Pricing Plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
