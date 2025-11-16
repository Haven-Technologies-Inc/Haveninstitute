import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Bookstore } from './Bookstore';
import { 
  GraduationCap, 
  CheckCircle2, 
  Brain, 
  TrendingUp, 
  Users,
  Star,
  ArrowRight,
  Play,
  BookOpen,
  Sparkles,
  Quote,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

// Hero image slider data with diverse nurses in different hospital departments
const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1723649379227-498e2ebf25c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRpdmVyc2UlMjBudXJzZXMlMjBob3NwaXRhbCUyMHRlYW0lMjBzbWlsaW5nfGVufDF8fHx8MTc2MzI2Njc0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Happy diverse team of nurses smiling and celebrating success together',
    department: 'Emergency Department'
  },
  {
    url: 'https://images.unsplash.com/photo-1640876777012-bdb00a6323e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMG9wZXJhdGluZyUyMHJvb20lMjBzdXJnaWNhbCUyMHRlYW0lMjBzdWNjZXNzfGVufDF8fHx8MTc2MzI2Njc0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Professional surgical nurses in operating room demonstrating excellence and teamwork',
    department: 'Operating Room'
  },
  {
    url: 'https://images.unsplash.com/photo-1587347236627-4474f8dddec9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZXMlMjBJQ1UlMjBjYXJpbmclMjBwYXRpZW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2MzI2Njc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Dedicated ICU nurses providing expert care with advanced medical technology',
    department: 'Intensive Care Unit'
  },
  {
    url: 'https://images.unsplash.com/photo-1723031840495-57a7154b191b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWRpYXRyaWMlMjBudXJzZSUyMGNoaWxkcmVuJTIwaG9zcGl0YWwlMjBjaGVlcmZ1bHxlbnwxfHx8fDE3NjMyNjY3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Cheerful pediatric nurse bringing joy and comfort to young patients',
    department: 'Pediatrics'
  },
  {
    url: 'https://images.unsplash.com/photo-1659353888818-0e41520d086a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjZXNzZnVsJTIwbnVyc2UlMjBtZWRpY2FsJTIwcHJvZmVzc2lvbmFsJTIwY29uZmlkZW50fGVufDF8fHx8MTc2MzI2Njc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Confident and successful nurse displaying professionalism and compassionate care',
    department: 'Medical-Surgical'
  }
];

export function Hero({ onGetStarted }: HeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handlePrevImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleNextImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 md:p-2 rounded-xl shadow-lg">
                <GraduationCap className="size-6 md:size-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl">NurseHaven</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Your Safe Haven for NCLEX Success</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#bookstore" className="text-gray-600 hover:text-gray-900 transition-colors">Bookstore</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Success Stories</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <Button variant="outline" onClick={onGetStarted} className="hidden xl:flex">Sign In</Button>
              <Button onClick={onGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600">
                Get Started Free
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onGetStarted} 
                className="hidden sm:flex"
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
              <a 
                href="#features" 
                className="block text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#bookstore" 
                className="block text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bookstore
              </a>
              <a 
                href="#testimonials" 
                className="block text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Success Stories
              </a>
              <a 
                href="#pricing" 
                className="block text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Button 
                onClick={() => {
                  onGetStarted();
                  setMobileMenuOpen(false);
                }} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Get Started Free
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
              <Badge className="bg-blue-100 text-blue-800 px-3 md:px-4 py-1 text-xs md:text-sm inline-flex items-center">
                <Sparkles className="size-3 mr-2" />
                #1 AI-Powered NCLEX Prep Platform
              </Badge>
              
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                  Pass Your NCLEX on the{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    First Try
                  </span>
                </h1>
                
                <p className="text-base md:text-xl text-gray-600 leading-relaxed">
                  Join 10,000+ nursing students who passed NCLEX with NurseHaven's AI-powered 
                  adaptive testing, personalized study plans, and expert-curated content.
                </p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <CheckCircle2 className="size-4 md:size-5 text-green-600" />
                  </div>
                  <span className="text-sm md:text-base text-gray-700">98% Pass Rate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Brain className="size-4 md:size-5 text-blue-600" />
                  </div>
                  <span className="text-sm md:text-base text-gray-700">AI-Powered CAT Testing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <BookOpen className="size-4 md:size-5 text-purple-600" />
                  </div>
                  <span className="text-sm md:text-base text-gray-700">1000+ NCLEX Questions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <Users className="size-4 md:size-5 text-orange-600" />
                  </div>
                  <span className="text-sm md:text-base text-gray-700">Expert Tutors Available</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto"
                  onClick={onGetStarted}
                >
                  Start Free Trial
                  <ArrowRight className="size-4 md:size-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto"
                >
                  <Play className="size-4 md:size-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className="size-8 md:size-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs md:text-sm"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-3 md:size-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">
                    <strong>4.9/5</strong> from 10,000+ students
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Image Slider */}
            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                {/* Image */}
                <div className="relative aspect-[4/3] md:aspect-auto md:h-[500px] lg:h-[600px]">
                  {heroImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <ImageWithFallback
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                      {/* Department Label */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-sm md:text-base text-gray-900">{image.department}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-4 md:size-6 text-gray-800" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-4 md:size-6 text-gray-800" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`size-2 md:size-2.5 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-6 md:w-8' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Floating Stats Cards */}
                <div className="absolute top-4 md:top-8 -left-2 md:-left-4 bg-white p-3 md:p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="size-4 md:size-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xl md:text-2xl">98%</p>
                      <p className="text-xs md:text-sm text-gray-600">Pass Rate</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 md:bottom-8 -right-2 md:-right-4 bg-white p-3 md:p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                      <Users className="size-4 md:size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl md:text-2xl">10K+</p>
                      <p className="text-xs md:text-sm text-gray-600">Students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 size-16 md:size-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 size-20 md:size-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">
              Why Choose NurseHaven
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
              Everything You Need to Pass NCLEX
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and resources designed specifically for nursing students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered CAT Testing',
                description: 'Experience real NCLEX format with adaptive difficulty based on your performance',
                color: 'blue'
              },
              {
                icon: BookOpen,
                title: 'Comprehensive Question Bank',
                description: '1000+ NCLEX-style questions with detailed explanations and rationales',
                color: 'purple'
              },
              {
                icon: TrendingUp,
                title: 'Advanced Analytics',
                description: 'Track your progress with AI-driven insights and personalized recommendations',
                color: 'green'
              },
              {
                icon: Users,
                title: 'Expert Support',
                description: 'Access to experienced nurse educators and 1-on-1 tutoring sessions',
                color: 'orange'
              },
              {
                icon: Sparkles,
                title: 'Personalized Study Plans',
                description: 'AI-generated study schedules tailored to your learning pace and goals',
                color: 'pink'
              },
              {
                icon: CheckCircle2,
                title: '98% Pass Rate',
                description: 'Join thousands of successful graduates who passed on their first attempt',
                color: 'teal'
              }
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`p-3 bg-${feature.color}-100 rounded-xl w-fit mb-4`}>
                    <feature.icon className={`size-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bookstore Section */}
      <div id="bookstore">
        <Bookstore onGetStarted={onGetStarted} />
      </div>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="bg-green-100 text-green-800 mb-4">
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
              Trusted by Thousands of Nurses
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Read what our students have to say about their NCLEX success with NurseHaven
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: 'Sarah Johnson, RN',
                role: 'Passed NCLEX-RN on First Attempt',
                content: 'NurseHaven\'s CAT testing was incredibly realistic. It helped me build confidence and identify my weak areas. I passed on my first try!',
                rating: 5,
                image: 'SJ'
              },
              {
                name: 'Michael Chen, RN',
                role: 'Passed NCLEX-RN',
                content: 'The AI-powered study plan was exactly what I needed. It adapted to my schedule and learning pace. Highly recommend!',
                rating: 5,
                image: 'MC'
              },
              {
                name: 'Emily Rodriguez, RN',
                role: 'Passed NCLEX-RN on First Attempt',
                content: 'The question bank is comprehensive and the explanations are detailed. I felt fully prepared on exam day. Thank you NurseHaven!',
                rating: 5,
                image: 'ER'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="size-8 text-gray-300 mb-4" />
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
              Start Free, Upgrade Anytime
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your NCLEX preparation journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-2xl mb-2">Free</h3>
                <p className="text-gray-600 mb-6">Perfect for getting started</p>
                <p className="text-4xl mb-6">$0<span className="text-lg text-gray-600">/month</span></p>
                <Button className="w-full mb-6" variant="outline" onClick={onGetStarted}>
                  Get Started
                </Button>
                <ul className="space-y-3">
                  {['50 questions/month', 'Basic flashcards', 'Progress tracking', 'Community access'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-500 shadow-xl md:scale-105 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Most Popular
              </Badge>
              <CardContent className="p-6 md:p-8">
                <h3 className="text-2xl mb-2">Pro</h3>
                <p className="text-gray-600 mb-6">Everything you need to pass</p>
                <p className="text-4xl mb-6">$29.99<span className="text-lg text-gray-600">/month</span></p>
                <Button className="w-full mb-6 bg-gradient-to-r from-blue-600 to-purple-600" onClick={onGetStarted}>
                  Start Free Trial
                </Button>
                <ul className="space-y-3">
                  {['Unlimited questions', 'CAT testing (5/month)', 'AI analytics', 'Study planner', 'Priority support'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-2xl mb-2">Premium</h3>
                <p className="text-gray-600 mb-6">Ultimate NCLEX prep</p>
                <p className="text-4xl mb-6">$49.99<span className="text-lg text-gray-600">/month</span></p>
                <Button className="w-full mb-6" variant="outline" onClick={onGetStarted}>
                  Get Started
                </Button>
                <ul className="space-y-3">
                  {['Everything in Pro', 'Unlimited CAT tests', '1-on-1 tutoring', 'AI study plans', 'Money-back guarantee'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
            Ready to Pass Your NCLEX?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Join 10,000+ nursing students who achieved NCLEX success with NurseHaven
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-5 md:py-6"
              onClick={onGetStarted}
            >
              Start Free Trial
              <ArrowRight className="size-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-base md:text-lg px-6 md:px-8 py-5 md:py-6"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                  <GraduationCap className="size-6 text-white" />
                </div>
                <span className="text-white text-lg">NurseHaven</span>
              </div>
              <p className="text-gray-400">Your Safe Haven for NCLEX Success</p>
            </div>
            <div>
              <h4 className="text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CAT Testing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Study Plans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NurseHaven. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}