// Website Content Management API
// Manages all content for the NurseHaven landing page

export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  videoUrl?: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'core' | 'ai' | 'study' | 'support';
  order: number;
  enabled: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  date: string;
  verified: boolean;
  order: number;
  enabled: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  order: number;
  enabled: boolean;
  stripePriceId?: string;
}

export interface Statistic {
  id: string;
  label: string;
  value: string;
  icon: string;
  order: number;
  enabled: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  enabled: boolean;
}

export interface FooterSection {
  id: string;
  companyName: string;
  tagline: string;
  copyrightText: string;
  socialLinks: {
    platform: string;
    url: string;
    enabled: boolean;
  }[];
  quickLinks: {
    label: string;
    url: string;
    enabled: boolean;
  }[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface CallToAction {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
  enabled: boolean;
}

export interface WebsiteContent {
  hero: HeroSection;
  features: Feature[];
  testimonials: Testimonial[];
  pricing: PricingPlan[];
  statistics: Statistic[];
  faqs: FAQ[];
  footer: FooterSection;
  cta: CallToAction;
  lastUpdated: string;
  updatedBy: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= MOCK DATA =============

const MOCK_WEBSITE_CONTENT: WebsiteContent = {
  hero: {
    id: 'hero-1',
    title: 'Your Safe Haven for NCLEX Success',
    subtitle: 'Master the NCLEX-RN/PN with AI-powered adaptive testing, personalized study plans, and comprehensive practice questions.',
    ctaText: 'Start Free Trial',
    ctaLink: '/signup',
    secondaryCtaText: 'Watch Demo',
    secondaryCtaLink: '/demo',
    backgroundImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop'
  },
  features: [
    {
      id: 'feat-1',
      icon: 'Brain',
      title: 'AI-Powered Adaptive Learning',
      description: 'Our intelligent system adapts to your learning style and focuses on areas that need improvement.',
      category: 'ai',
      order: 1,
      enabled: true
    },
    {
      id: 'feat-2',
      icon: 'Target',
      title: 'Computer Adaptive Testing (CAT)',
      description: 'Experience real NCLEX-style adaptive testing that mirrors the actual exam format.',
      category: 'core',
      order: 2,
      enabled: true
    },
    {
      id: 'feat-3',
      icon: 'BookOpen',
      title: 'Comprehensive Study Materials',
      description: 'Access 5 complete NCLEX study books with interactive features and AI study tools.',
      category: 'study',
      order: 3,
      enabled: true
    },
    {
      id: 'feat-4',
      icon: 'BarChart',
      title: 'Advanced Analytics',
      description: 'Track your progress with detailed analytics and performance insights.',
      category: 'ai',
      order: 4,
      enabled: true
    },
    {
      id: 'feat-5',
      icon: 'Users',
      title: 'Community Forum',
      description: 'Connect with fellow nursing students and share study strategies.',
      category: 'support',
      order: 5,
      enabled: true
    },
    {
      id: 'feat-6',
      icon: 'MessageSquare',
      title: '24/7 AI Chat Support',
      description: 'Get instant answers to your questions with our AI-powered chat assistant.',
      category: 'ai',
      order: 6,
      enabled: true
    }
  ],
  testimonials: [
    {
      id: 'test-1',
      name: 'Sarah Johnson',
      role: 'RN, Passed NCLEX First Try',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      content: 'NurseHaven was instrumental in my NCLEX success! The adaptive testing felt just like the real exam, and the AI-powered study plans kept me focused on my weak areas.',
      rating: 5,
      date: '2024-01-15',
      verified: true,
      order: 1,
      enabled: true
    },
    {
      id: 'test-2',
      name: 'Michael Chen',
      role: 'PN, NCLEX-PN Certified',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      content: 'The comprehensive study materials and practice questions were exactly what I needed. I felt confident walking into my NCLEX exam thanks to NurseHaven.',
      rating: 5,
      date: '2024-01-10',
      verified: true,
      order: 2,
      enabled: true
    },
    {
      id: 'test-3',
      name: 'Emily Rodriguez',
      role: 'RN, Critical Care',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      content: 'The AI analytics helped me identify my weak areas quickly. The personalized study plan made my preparation efficient and effective. Highly recommend!',
      rating: 5,
      date: '2024-01-05',
      verified: true,
      order: 3,
      enabled: true
    }
  ],
  pricing: [
    {
      id: 'price-1',
      name: 'Free',
      price: 0,
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        '50 practice questions',
        'Basic analytics',
        'Community forum access',
        'Limited AI chat support'
      ],
      highlighted: false,
      ctaText: 'Get Started',
      order: 1,
      enabled: true
    },
    {
      id: 'price-2',
      name: 'Pro',
      price: 29.99,
      interval: 'month',
      description: 'Most popular choice',
      features: [
        '1,000+ practice questions',
        'Full CAT testing system',
        'Advanced analytics',
        'Unlimited AI chat support',
        'Study books access',
        'Progress tracking'
      ],
      highlighted: true,
      ctaText: 'Start Pro Trial',
      order: 2,
      enabled: true,
      stripePriceId: 'price_pro_monthly'
    },
    {
      id: 'price-3',
      name: 'Premium',
      price: 49.99,
      interval: 'month',
      description: 'Complete NCLEX mastery',
      features: [
        'Everything in Pro',
        '3,000+ practice questions',
        'Personalized study plans',
        '1-on-1 tutor sessions',
        'Priority support',
        'Exam readiness guarantee',
        'All study materials'
      ],
      highlighted: false,
      ctaText: 'Go Premium',
      order: 3,
      enabled: true,
      stripePriceId: 'price_premium_monthly'
    }
  ],
  statistics: [
    {
      id: 'stat-1',
      label: 'Pass Rate',
      value: '98.5%',
      icon: 'TrendingUp',
      order: 1,
      enabled: true
    },
    {
      id: 'stat-2',
      label: 'Students',
      value: '50,000+',
      icon: 'Users',
      order: 2,
      enabled: true
    },
    {
      id: 'stat-3',
      label: 'Practice Questions',
      value: '10,000+',
      icon: 'FileText',
      order: 3,
      enabled: true
    },
    {
      id: 'stat-4',
      label: 'Success Stories',
      value: '45,000+',
      icon: 'Award',
      order: 4,
      enabled: true
    }
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'What is NurseHaven?',
      answer: 'NurseHaven is an AI-powered NCLEX preparation platform designed to help nursing students pass their NCLEX-RN/PN exams on the first try. We offer adaptive testing, personalized study plans, and comprehensive study materials.',
      category: 'general',
      order: 1,
      enabled: true
    },
    {
      id: 'faq-2',
      question: 'How does the Computer Adaptive Testing (CAT) work?',
      answer: 'Our CAT system mimics the actual NCLEX exam format by adjusting question difficulty based on your performance. If you answer correctly, questions become harder; if you answer incorrectly, they become easier. This helps accurately assess your competency level.',
      category: 'features',
      order: 2,
      enabled: true
    },
    {
      id: 'faq-3',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! You can cancel your subscription at any time from your account settings. There are no cancellation fees, and you\'ll continue to have access until the end of your billing period.',
      category: 'billing',
      order: 3,
      enabled: true
    },
    {
      id: 'faq-4',
      question: 'Is there a money-back guarantee?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with NurseHaven within the first 30 days, contact our support team for a full refund.',
      category: 'billing',
      order: 4,
      enabled: true
    }
  ],
  footer: {
    id: 'footer-1',
    companyName: 'NurseHaven',
    tagline: 'Your Safe Haven for NCLEX Success',
    copyrightText: '© 2024 NurseHaven. All rights reserved.',
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/nursehaven', enabled: true },
      { platform: 'twitter', url: 'https://twitter.com/nursehaven', enabled: true },
      { platform: 'instagram', url: 'https://instagram.com/nursehaven', enabled: true },
      { platform: 'linkedin', url: 'https://linkedin.com/company/nursehaven', enabled: true }
    ],
    quickLinks: [
      { label: 'About Us', url: '/about', enabled: true },
      { label: 'Features', url: '/features', enabled: true },
      { label: 'Pricing', url: '/pricing', enabled: true },
      { label: 'Blog', url: '/blog', enabled: true },
      { label: 'Contact', url: '/contact', enabled: true },
      { label: 'Privacy Policy', url: '/privacy', enabled: true },
      { label: 'Terms of Service', url: '/terms', enabled: true }
    ],
    contactInfo: {
      email: 'support@nursehaven.com',
      phone: '1-800-NURSE-HAVEN',
      address: '123 Healthcare Ave, Medical District, CA 90210'
    }
  },
  cta: {
    id: 'cta-1',
    title: 'Ready to Pass Your NCLEX?',
    subtitle: 'Join thousands of successful nursing students who trusted NurseHaven for their exam preparation.',
    buttonText: 'Start Your Free Trial',
    buttonLink: '/signup',
    backgroundImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&h=600&fit=crop',
    enabled: true
  },
  lastUpdated: new Date().toISOString(),
  updatedBy: 'admin'
};

// Store content in localStorage
let websiteContent: WebsiteContent = MOCK_WEBSITE_CONTENT;

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('website_content');
  if (saved) {
    try {
      websiteContent = JSON.parse(saved);
    } catch (error) {
      console.error('Failed to parse saved website content:', error);
    }
  }
}

const saveToStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('website_content', JSON.stringify(websiteContent));
  }
};

// ============= HERO SECTION =============

export async function getHeroSection(): Promise<HeroSection> {
  await delay(200);
  return websiteContent.hero;
}

export async function updateHeroSection(data: Partial<HeroSection>): Promise<HeroSection> {
  await delay(300);
  websiteContent.hero = { ...websiteContent.hero, ...data };
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return websiteContent.hero;
}

// ============= FEATURES =============

export async function getAllFeatures(): Promise<Feature[]> {
  await delay(200);
  return websiteContent.features.sort((a, b) => a.order - b.order);
}

export async function getFeatureById(id: string): Promise<Feature | null> {
  await delay(200);
  return websiteContent.features.find(f => f.id === id) || null;
}

export async function createFeature(data: Omit<Feature, 'id'>): Promise<Feature> {
  await delay(300);
  const feature: Feature = {
    id: `feat-${Date.now()}`,
    ...data
  };
  websiteContent.features.push(feature);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return feature;
}

export async function updateFeature(id: string, data: Partial<Feature>): Promise<Feature> {
  await delay(300);
  const index = websiteContent.features.findIndex(f => f.id === id);
  if (index === -1) throw new Error('Feature not found');
  
  websiteContent.features[index] = { ...websiteContent.features[index], ...data };
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return websiteContent.features[index];
}

export async function deleteFeature(id: string): Promise<void> {
  await delay(300);
  websiteContent.features = websiteContent.features.filter(f => f.id !== id);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
}

export async function duplicateFeature(id: string): Promise<Feature> {
  await delay(300);
  const original = websiteContent.features.find(f => f.id === id);
  if (!original) throw new Error('Feature not found');
  
  const duplicate: Feature = {
    ...original,
    id: `feat-${Date.now()}`,
    title: `${original.title} (Copy)`,
    order: websiteContent.features.length + 1
  };
  
  websiteContent.features.push(duplicate);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return duplicate;
}

export async function reorderFeatures(featureIds: string[]): Promise<Feature[]> {
  await delay(300);
  
  const reordered = featureIds.map((id, index) => {
    const feature = websiteContent.features.find(f => f.id === id);
    if (feature) {
      return { ...feature, order: index + 1 };
    }
    return null;
  }).filter(Boolean) as Feature[];
  
  websiteContent.features = reordered;
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return reordered;
}

// ============= TESTIMONIALS =============

export async function getAllTestimonials(): Promise<Testimonial[]> {
  await delay(200);
  return websiteContent.testimonials.sort((a, b) => a.order - b.order);
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  await delay(200);
  return websiteContent.testimonials.find(t => t.id === id) || null;
}

export async function createTestimonial(data: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  await delay(300);
  const testimonial: Testimonial = {
    id: `test-${Date.now()}`,
    ...data
  };
  websiteContent.testimonials.push(testimonial);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return testimonial;
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
  await delay(300);
  const index = websiteContent.testimonials.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Testimonial not found');
  
  websiteContent.testimonials[index] = { ...websiteContent.testimonials[index], ...data };
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return websiteContent.testimonials[index];
}

export async function deleteTestimonial(id: string): Promise<void> {
  await delay(300);
  websiteContent.testimonials = websiteContent.testimonials.filter(t => t.id !== id);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
}

export async function duplicateTestimonial(id: string): Promise<Testimonial> {
  await delay(300);
  const original = websiteContent.testimonials.find(t => t.id === id);
  if (!original) throw new Error('Testimonial not found');
  
  const duplicate: Testimonial = {
    ...original,
    id: `test-${Date.now()}`,
    name: `${original.name} (Copy)`,
    order: websiteContent.testimonials.length + 1
  };
  
  websiteContent.testimonials.push(duplicate);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return duplicate;
}

export async function reorderTestimonials(testimonialIds: string[]): Promise<Testimonial[]> {
  await delay(300);
  
  const reordered = testimonialIds.map((id, index) => {
    const testimonial = websiteContent.testimonials.find(t => t.id === id);
    if (testimonial) {
      return { ...testimonial, order: index + 1 };
    }
    return null;
  }).filter(Boolean) as Testimonial[];
  
  websiteContent.testimonials = reordered;
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return reordered;
}

// ============= PRICING PLANS =============

export async function getAllPricingPlans(): Promise<PricingPlan[]> {
  await delay(200);
  return websiteContent.pricing.sort((a, b) => a.order - b.order);
}

export async function getPricingPlanById(id: string): Promise<PricingPlan | null> {
  await delay(200);
  return websiteContent.pricing.find(p => p.id === id) || null;
}

export async function createPricingPlan(data: Omit<PricingPlan, 'id'>): Promise<PricingPlan> {
  await delay(300);
  const plan: PricingPlan = {
    id: `price-${Date.now()}`,
    ...data
  };
  websiteContent.pricing.push(plan);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return plan;
}

export async function updatePricingPlan(id: string, data: Partial<PricingPlan>): Promise<PricingPlan> {
  await delay(300);
  const index = websiteContent.pricing.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Pricing plan not found');
  
  websiteContent.pricing[index] = { ...websiteContent.pricing[index], ...data };
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return websiteContent.pricing[index];
}

export async function deletePricingPlan(id: string): Promise<void> {
  await delay(300);
  websiteContent.pricing = websiteContent.pricing.filter(p => p.id !== id);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
}

export async function duplicatePricingPlan(id: string): Promise<PricingPlan> {
  await delay(300);
  const original = websiteContent.pricing.find(p => p.id === id);
  if (!original) throw new Error('Pricing plan not found');
  
  const duplicate: PricingPlan = {
    ...original,
    id: `price-${Date.now()}`,
    name: `${original.name} (Copy)`,
    order: websiteContent.pricing.length + 1,
    highlighted: false
  };
  
  websiteContent.pricing.push(duplicate);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return duplicate;
}

export async function reorderPricingPlans(planIds: string[]): Promise<PricingPlan[]> {
  await delay(300);
  
  const reordered = planIds.map((id, index) => {
    const plan = websiteContent.pricing.find(p => p.id === id);
    if (plan) {
      return { ...plan, order: index + 1 };
    }
    return null;
  }).filter(Boolean) as PricingPlan[];
  
  websiteContent.pricing = reordered;
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return reordered;
}

// ============= STATISTICS =============

export async function getAllStatistics(): Promise<Statistic[]> {
  await delay(200);
  return websiteContent.statistics.sort((a, b) => a.order - b.order);
}

export async function updateStatistic(id: string, data: Partial<Statistic>): Promise<Statistic> {
  await delay(300);
  const index = websiteContent.statistics.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Statistic not found');
  
  websiteContent.statistics[index] = { ...websiteContent.statistics[index], ...data };
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return websiteContent.statistics[index];
}

// ============= FAQs =============

export async function getAllFAQs(): Promise<FAQ[]> {
  await delay(200);
  return websiteContent.faqs.sort((a, b) => a.order - b.order);
}

export async function getFAQById(id: string): Promise<FAQ | null> {
  await delay(200);
  return websiteContent.faqs.find(f => f.id === id) || null;
}

export async function createFAQ(data: Omit<FAQ, 'id'>): Promise<FAQ> {
  await delay(300);
  const faq: FAQ = {
    id: `faq-${Date.now()}`,
    ...data
  };
  websiteContent.faqs.push(faq);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return faq;
}

export async function updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ> {
  await delay(300);
  const index = websiteContent.faqs.findIndex(f => f.id === id);
  if (index === -1) throw new Error('FAQ not found');
  
  websiteContent.faqs[index] = { ...websiteContent.faqs[index], ...data };
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return websiteContent.faqs[index];
}

export async function deleteFAQ(id: string): Promise<void> {
  await delay(300);
  websiteContent.faqs = websiteContent.faqs.filter(f => f.id !== id);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
}

export async function duplicateFAQ(id: string): Promise<FAQ> {
  await delay(300);
  const original = websiteContent.faqs.find(f => f.id === id);
  if (!original) throw new Error('FAQ not found');
  
  const duplicate: FAQ = {
    ...original,
    id: `faq-${Date.now()}`,
    question: `${original.question} (Copy)`,
    order: websiteContent.faqs.length + 1
  };
  
  websiteContent.faqs.push(duplicate);
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return duplicate;
}

export async function reorderFAQs(faqIds: string[]): Promise<FAQ[]> {
  await delay(300);
  
  const reordered = faqIds.map((id, index) => {
    const faq = websiteContent.faqs.find(f => f.id === id);
    if (faq) {
      return { ...faq, order: index + 1 };
    }
    return null;
  }).filter(Boolean) as FAQ[];
  
  websiteContent.faqs = reordered;
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return reordered;
}

// ============= FOOTER =============

export async function getFooterSection(): Promise<FooterSection> {
  await delay(200);
  return websiteContent.footer;
}

export async function updateFooterSection(data: Partial<FooterSection>): Promise<FooterSection> {
  await delay(300);
  websiteContent.footer = { ...websiteContent.footer, ...data };
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return websiteContent.footer;
}

// ============= CALL TO ACTION =============

export async function getCTA(): Promise<CallToAction> {
  await delay(200);
  return websiteContent.cta;
}

export async function updateCTA(data: Partial<CallToAction>): Promise<CallToAction> {
  await delay(300);
  websiteContent.cta = { ...websiteContent.cta, ...data };
  websiteContent.lastUpdated = new Date().toISOString();
  saveToStorage();
  return websiteContent.cta;
}

// ============= BULK OPERATIONS =============

export async function getAllWebsiteContent(): Promise<WebsiteContent> {
  await delay(300);
  return websiteContent;
}

export async function exportWebsiteContent(): Promise<string> {
  await delay(500);
  return JSON.stringify(websiteContent, null, 2);
}

export async function importWebsiteContent(jsonData: string): Promise<WebsiteContent> {
  await delay(500);
  try {
    const imported = JSON.parse(jsonData);
    websiteContent = { ...imported, lastUpdated: new Date().toISOString() };
    saveToStorage();
    return websiteContent;
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

export async function resetToDefaults(): Promise<WebsiteContent> {
  await delay(300);
  websiteContent = { ...MOCK_WEBSITE_CONTENT, lastUpdated: new Date().toISOString() };
  saveToStorage();
  return websiteContent;
}

// ============= PREVIEW =============

export async function generatePreview(): Promise<string> {
  await delay(500);
  return `https://nursehaven.com/preview/${Date.now()}`;
}