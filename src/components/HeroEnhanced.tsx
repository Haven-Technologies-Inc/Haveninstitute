import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Bookstore } from './Bookstore';
import { motion, AnimatePresence } from 'motion/react';
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
  ChevronRight,
  Award,
  Target,
  Zap,
  Heart,
  Shield,
  Clock,
  MessageCircle,
  BarChart3
} from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

// Single hero image of professional female nurses
const heroImage = {
  url: 'https://images.unsplash.com/photo-1736289162890-78f1ff4f8bd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBmZW1hbGUlMjBudXJzZXMlMjBzbWlsaW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2MzI4NDUyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
  alt: 'Professional female nurses with beautiful smiles',
  title: 'Your Journey to NCLEX Success',
  subtitle: 'Join thousands of successful nurses'
};

const stats = [
  { value: '10,000+', label: 'Students Passed', icon: Users },
  { value: '98%', label: 'Success Rate', icon: TrendingUp },
  { value: '1,000+', label: 'Questions', icon: Brain },
  { value: '24/7', label: 'Support', icon: MessageCircle }
];

export function HeroEnhanced({ onGetStarted }: HeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2 md:gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 md:p-2 rounded-xl shadow-lg">
                <GraduationCap className="size-6 md:size-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Haven Institute</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Excellence in NCLEX Preparation</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {['Features', 'Bookstore', 'Success Stories', 'Pricing'].map((item, index) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors relative group"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={onGetStarted} className="hidden xl:flex">
                  Sign In
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={onGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                  Get Started Free
                </Button>
              </motion.div>
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
              >
                {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="mt-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
                  {['Features', 'Bookstore', 'Success Stories', 'Pricing'].map((item) => (
                    <a 
                      key={item}
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      className="block text-gray-600 hover:text-gray-900 py-2 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </a>
                  ))}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-20 left-10 size-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 size-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x,
            y: -mousePosition.y,
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 md:px-4 py-1 text-xs md:text-sm inline-flex items-center border-0">
                  <Sparkles className="size-3 mr-2 animate-pulse" />
                  #1 AI-Powered NCLEX Prep Platform
                </Badge>
              </motion.div>
              
              <motion.div 
                className="space-y-4 md:space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                  Pass Your NCLEX on the{' '}
                  <motion.span 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block"
                    animate={{
                      backgroundPosition: ['0%', '100%', '0%'],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    First Try
                  </motion.span>
                </h1>
                
                <p className="text-base md:text-xl text-gray-600 leading-relaxed">
                  Join 10,000+ nursing students who passed NCLEX with NurseHaven's AI-powered 
                  adaptive testing, personalized study plans, and expert-curated content.
                </p>
              </motion.div>

              {/* Key Features with Animation */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { icon: CheckCircle2, text: '98% Pass Rate', color: 'green' },
                  { icon: Brain, text: 'AI-Powered CAT', color: 'blue' },
                  { icon: BookOpen, text: '1000+ Questions', color: 'purple' },
                  { icon: Users, text: 'Expert Support', color: 'orange' },
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-3 group cursor-pointer"
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.div 
                      className={`p-2 bg-${feature.color}-100 rounded-lg flex-shrink-0 group-hover:shadow-lg transition-shadow`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className={`size-4 md:size-5 text-${feature.color}-600`} />
                    </motion.div>
                    <span className="text-sm md:text-base text-gray-700 group-hover:text-gray-900">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 md:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-shadow"
                    onClick={onGetStarted}
                  >
                    Start Free Trial
                    <ArrowRight className="size-4 md:size-5 ml-2" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto border-2 hover:bg-gray-50"
                  >
                    <Play className="size-4 md:size-5 mr-2" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Social Proof with Animation */}
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div 
                      key={i} 
                      className="size-8 md:size-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs md:text-sm shadow-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                    >
                      {String.fromCharCode(64 + i)}
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.05 }}
                      >
                        <Star className="size-3 md:size-4 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">
                    <strong>4.9/5</strong> from 10,000+ students
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Single Hero Image */}
            <motion.div 
              className="relative order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative aspect-[4/3] md:h-[500px] lg:h-[650px]">
                  <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                  >
                    <ImageWithFallback
                      src={heroImage.url}
                      alt={heroImage.alt}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Image Title */}
                    <motion.div 
                      className="absolute bottom-6 left-6 right-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h3 className="text-2xl md:text-3xl text-white mb-1">
                        {heroImage.title}
                      </h3>
                      <p className="text-white/90 text-sm md:text-base">
                        {heroImage.subtitle}
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
                
                {/* Floating Stats Cards with Animation */}
                <motion.div 
                  className="absolute top-4 md:top-8 -left-2 md:-left-4 bg-white p-3 md:p-4 rounded-xl shadow-lg"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <motion.div 
                      className="p-1.5 md:p-2 bg-green-100 rounded-lg"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <TrendingUp className="size-4 md:size-5 text-green-600" />
                    </motion.div>
                    <div>
                      <motion.p 
                        className="text-xl md:text-2xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        98%
                      </motion.p>
                      <p className="text-xs md:text-sm text-gray-600">Pass Rate</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute bottom-20 md:bottom-24 -right-2 md:-right-4 bg-white p-3 md:p-4 rounded-xl shadow-lg"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <motion.div 
                      className="p-1.5 md:p-2 bg-blue-100 rounded-lg"
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Users className="size-4 md:size-5 text-blue-600" />
                    </motion.div>
                    <div>
                      <motion.p 
                        className="text-xl md:text-2xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        10K+
                      </motion.p>
                      <p className="text-xs md:text-sm text-gray-600">Students</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Animated Stats Bar */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className="flex justify-center mb-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  <stat.icon className="size-8 md:size-10" />
                </motion.div>
                <motion.p 
                  className="text-2xl md:text-4xl mb-1"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm md:text-base text-blue-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Stagger Animation */}
      <section id="features" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-blue-100 text-blue-800 mb-4 text-sm">
              Why Choose NurseHaven
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl mb-4">
              Everything You Need to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pass NCLEX</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and resources designed specifically for nursing students
            </p>
          </motion.div>

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
                icon: BarChart3,
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
                icon: Target,
                title: 'Personalized Study Plans',
                description: 'AI-generated study schedules tailored to your learning pace and goals',
                color: 'pink'
              },
              {
                icon: Award,
                title: '98% Pass Rate',
                description: 'Join thousands of successful graduates who passed on their first attempt',
                color: 'teal'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="border-2 hover:shadow-2xl transition-all duration-300 h-full group">
                  <CardContent className="p-6">
                    <motion.div 
                      className={`p-3 bg-${feature.color}-100 rounded-xl w-fit mb-4 group-hover:shadow-lg transition-shadow`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className={`size-6 text-${feature.color}-600`} />
                    </motion.div>
                    <h3 className="text-xl mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bookstore Section */}
      <div id="bookstore">
        <Bookstore onGetStarted={onGetStarted} />
      </div>

      {/* Testimonials Section with Carousel Effect */}
      <section id="success-stories" className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-green-100 text-green-800 mb-4">
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl mb-4">
              Trusted by Thousands of <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Nurses</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Read what our students have to say about their NCLEX success with NurseHaven
            </p>
          </motion.div>

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
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-2 hover:shadow-2xl transition-all duration-300 h-full bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, rotate: -180 }}
                          whileInView={{ opacity: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + i * 0.05 }}
                        >
                          <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <Quote className="size-8 text-blue-200 mb-4" />
                    <p className="text-gray-700 mb-6 italic leading-relaxed">\"{testimonial.content}\"</p>
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                        {testimonial.image}
                      </div>
                      <div>
                        <p className="text-gray-900">{testimonial.name}</p>
                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Hover Effects */}
      <section id="pricing" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-purple-100 text-purple-800 mb-4">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl mb-4">
              Start Free, Upgrade <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Anytime</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your NCLEX preparation journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              whileHover={{ y: -10 }}
            >
              <Card className="border-2 h-full">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-2xl mb-2">Free</h3>
                  <p className="text-gray-600 mb-6">Perfect for getting started</p>
                  <p className="text-4xl md:text-5xl mb-6">
                    $0<span className="text-lg text-gray-600">/month</span>
                  </p>
                  <Button className="w-full mb-6" variant="outline" onClick={onGetStarted}>
                    Get Started
                  </Button>
                  <ul className="space-y-3">
                    {['50 questions/month', 'Basic flashcards', 'Progress tracking', 'Community access'].map((feature, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -15, scale: 1.02 }}
            >
              <Card className="border-2 border-blue-500 shadow-2xl relative h-full bg-gradient-to-br from-blue-50 to-purple-50">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                  Most Popular
                </Badge>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-2xl mb-2">Pro</h3>
                  <p className="text-gray-600 mb-6">Everything you need to pass</p>
                  <p className="text-4xl md:text-5xl mb-6">
                    $29.99<span className="text-lg text-gray-600">/month</span>
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full mb-6 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg" onClick={onGetStarted}>
                      Start Free Trial
                    </Button>
                  </motion.div>
                  <ul className="space-y-3">
                    {['Unlimited questions', 'CAT testing (5/month)', 'AI analytics', 'Study planner', 'Priority support'].map((feature, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -10 }}
            >
              <Card className="border-2 h-full">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-2xl mb-2">Premium</h3>
                  <p className="text-gray-600 mb-6">Ultimate NCLEX prep</p>
                  <p className="text-4xl md:text-5xl mb-6">
                    $49.99<span className="text-lg text-gray-600">/month</span>
                  </p>
                  <Button className="w-full mb-6" variant="outline" onClick={onGetStarted}>
                    Get Started
                  </Button>
                  <ul className="space-y-3">
                    {['Everything in Pro', 'Unlimited CAT tests', '1-on-1 tutoring', 'AI study plans', 'Money-back guarantee'].map((feature, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section with Animation */}
      <motion.section 
        className="py-12 md:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl mb-6">
              Ready to Pass Your NCLEX?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 10,000+ nursing students who achieved their dreams with NurseHaven
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-2xl w-full sm:w-auto"
                  onClick={onGetStarted}
                >
                  Start Your Free Trial
                  <ArrowRight className="size-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 w-full sm:w-auto"
                >
                  Schedule a Demo
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-sm text-blue-100 mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <CheckCircle2 className="size-4 inline mr-2" />
              No credit card required · Start in 2 minutes · Cancel anytime
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                  <GraduationCap className="size-6 text-white" />
                </div>
                <span className="text-xl">Haven Institute</span>
              </div>
              <p className="text-gray-400 text-sm">
                Excellence in NCLEX Preparation
              </p>
            </div>
            
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Bookstore', 'AI Tools']
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact']
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security', 'Cookies']
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 Haven Institute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}