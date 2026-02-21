'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Layout,
  MessageSquareQuote,
  HelpCircle,
  Link2,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  RefreshCw,
  ImageIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeroData {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: string;
}

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FooterData {
  links: { label: string; url: string }[];
  socialMedia: { platform: string; url: string }[];
  copyrightText: string;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_HERO: HeroData = {
  title: 'Pass Your NCLEX on the First Try',
  subtitle:
    'Comprehensive exam prep with adaptive learning, AI tutoring, and thousands of practice questions.',
  ctaText: 'Start Free Trial',
  ctaLink: '/signup',
  backgroundImage: '',
};

const DEFAULT_STATS: StatItem[] = [
  { id: '1', label: 'Pass Rate', value: '94%', icon: 'TrendingUp' },
  { id: '2', label: 'Practice Questions', value: '10,000+', icon: 'FileQuestion' },
  { id: '3', label: 'Active Students', value: '25,000+', icon: 'Users' },
  { id: '4', label: 'Expert Instructors', value: '50+', icon: 'GraduationCap' },
];

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: '1',
    title: 'Adaptive Learning',
    description: 'AI-powered system that adapts to your strengths and weaknesses.',
    icon: 'Brain',
  },
  {
    id: '2',
    title: 'CAT Simulations',
    description: 'Full-length computer adaptive testing that mimics the real NCLEX.',
    icon: 'Monitor',
  },
  {
    id: '3',
    title: 'Study Plans',
    description: 'Personalized study schedules tailored to your exam date.',
    icon: 'Calendar',
  },
];

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'RN, BSN',
    text: 'Haven Institute helped me pass my NCLEX on the first attempt. The adaptive questions were incredibly similar to the real exam!',
    avatar: '',
    rating: 5,
  },
];

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: '1',
    question: 'How long do I have access to the materials?',
    answer:
      'Your access depends on your subscription plan. Pro subscribers get unlimited access during their subscription, and Premium subscribers retain access even after cancellation.',
  },
];

const DEFAULT_FOOTER: FooterData = {
  links: [
    { label: 'About Us', url: '/about' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms of Service', url: '/terms' },
    { label: 'Contact', url: '/contact' },
  ],
  socialMedia: [
    { platform: 'Twitter', url: 'https://twitter.com/haveninstitute' },
    { platform: 'Instagram', url: 'https://instagram.com/haveninstitute' },
    { platform: 'Facebook', url: 'https://facebook.com/haveninstitute' },
  ],
  copyrightText: '2026 Haven Institute. All rights reserved.',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// ---------------------------------------------------------------------------
// Section Wrapper Component
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  icon: Icon,
  description,
  saving,
  onSave,
  children,
  preview,
  showPreview,
  onTogglePreview,
}: {
  title: string;
  icon: React.ElementType;
  description: string;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
  preview?: React.ReactNode;
  showPreview?: boolean;
  onTogglePreview?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onTogglePreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePreview}
                className="h-8 text-xs"
              >
                {showPreview ? (
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Eye className="h-3.5 w-3.5 mr-1" />
                )}
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
            )}
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="h-8 text-xs"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              Save
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              {collapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-0 space-y-4">
          {showPreview && preview && (
            <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                Preview
              </p>
              {preview}
            </div>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Inline Text Area (since we don't have a textarea component)
// ---------------------------------------------------------------------------

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        className
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Main CMS Page
// ---------------------------------------------------------------------------

export default function AdminCMSPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Section data
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [features, setFeatures] = useState<FeatureItem[]>(DEFAULT_FEATURES);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [footer, setFooter] = useState<FooterData>(DEFAULT_FOOTER);

  // Preview toggles
  const [previewHero, setPreviewHero] = useState(false);
  const [previewStats, setPreviewStats] = useState(false);
  const [previewFeatures, setPreviewFeatures] = useState(false);
  const [previewTestimonials, setPreviewTestimonials] = useState(false);
  const [previewFaqs, setPreviewFaqs] = useState(false);

  // Load all CMS settings on mount
  useEffect(() => {
    async function loadCMS() {
      try {
        const res = await fetch('/api/admin/cms');
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          if (data.cms_hero) setHero({ ...DEFAULT_HERO, ...data.cms_hero });
          if (data.cms_stats) setStats(data.cms_stats);
          if (data.cms_features) setFeatures(data.cms_features);
          if (data.cms_testimonials) setTestimonials(data.cms_testimonials);
          if (data.cms_faqs) setFaqs(data.cms_faqs);
          if (data.cms_footer) setFooter({ ...DEFAULT_FOOTER, ...data.cms_footer });
        }
      } catch {
        toast.error('Failed to load CMS settings');
      } finally {
        setLoading(false);
      }
    }
    loadCMS();
  }, []);

  // Save a specific section
  const saveSection = useCallback(
    async (key: string, value: any) => {
      setSavingSection(key);
      try {
        const res = await fetch('/api/admin/cms', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success(`${key.replace('cms_', '').replace(/_/g, ' ')} saved successfully`);
        } else {
          toast.error(json.error || 'Failed to save');
        }
      } catch {
        toast.error('Failed to save settings');
      } finally {
        setSavingSection(null);
      }
    },
    []
  );

  // Reorder helpers
  const moveItem = <T extends { id: string }>(
    items: T[],
    index: number,
    direction: 'up' | 'down'
  ): T[] => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return items;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    return newItems;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 mt-1" />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layout className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Landing Page CMS
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your landing page content and sections
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('/', '_blank')}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          View Landing Page
        </Button>
      </div>

      {/* ================================================================= */}
      {/* 1. Hero Section                                                    */}
      {/* ================================================================= */}
      <SectionCard
        title="Hero Section"
        icon={Sparkles}
        description="Main banner at the top of the landing page"
        saving={savingSection === 'cms_hero'}
        onSave={() => saveSection('cms_hero', hero)}
        showPreview={previewHero}
        onTogglePreview={() => setPreviewHero(!previewHero)}
        preview={
          <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <h2 className="text-xl font-bold">{hero.title || 'Hero Title'}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {hero.subtitle || 'Hero subtitle...'}
            </p>
            <Button size="sm" className="mt-3">
              {hero.ctaText || 'CTA Button'}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Title</Label>
            <Input
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              placeholder="Hero title"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Subtitle</Label>
            <TextArea
              value={hero.subtitle}
              onChange={(val) => setHero({ ...hero, subtitle: val })}
              placeholder="Hero subtitle / description"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">CTA Text</Label>
              <Input
                value={hero.ctaText}
                onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                placeholder="Button text"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">CTA Link</Label>
              <Input
                value={hero.ctaLink}
                onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                placeholder="/signup"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Background Image URL</Label>
            <div className="flex gap-2">
              <Input
                value={hero.backgroundImage}
                onChange={(e) =>
                  setHero({ ...hero, backgroundImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button variant="outline" size="icon" className="shrink-0">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ================================================================= */}
      {/* 2. Stats Section                                                   */}
      {/* ================================================================= */}
      <SectionCard
        title="Stats Section"
        icon={BarChart3}
        description="Key metrics displayed on the landing page"
        saving={savingSection === 'cms_stats'}
        onSave={() => saveSection('cms_stats', stats)}
        showPreview={previewStats}
        onTogglePreview={() => setPreviewStats(!previewStats)}
        preview={
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center p-3 rounded-lg bg-background">
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setStats(moveItem(stats, index, 'up'))}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setStats(moveItem(stats, index, 'down'))}
                  disabled={index === stats.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 flex-1">
                <Input
                  value={stat.label}
                  onChange={(e) => {
                    const updated = [...stats];
                    updated[index] = { ...stat, label: e.target.value };
                    setStats(updated);
                  }}
                  placeholder="Label"
                  className="text-xs h-8"
                />
                <Input
                  value={stat.value}
                  onChange={(e) => {
                    const updated = [...stats];
                    updated[index] = { ...stat, value: e.target.value };
                    setStats(updated);
                  }}
                  placeholder="Value"
                  className="text-xs h-8"
                />
                <Input
                  value={stat.icon}
                  onChange={(e) => {
                    const updated = [...stats];
                    updated[index] = { ...stat, icon: e.target.value };
                    setStats(updated);
                  }}
                  placeholder="Icon name"
                  className="text-xs h-8"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStats(stats.filter((_, i) => i !== index))}
                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setStats([
                ...stats,
                { id: generateId(), label: '', value: '', icon: '' },
              ])
            }
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Stat
          </Button>
        </div>
      </SectionCard>

      {/* ================================================================= */}
      {/* 3. Features Section                                                */}
      {/* ================================================================= */}
      <SectionCard
        title="Features Section"
        icon={Layout}
        description="Feature cards showcasing your platform benefits"
        saving={savingSection === 'cms_features'}
        onSave={() => saveSection('cms_features', features)}
        showPreview={previewFeatures}
        onTogglePreview={() => setPreviewFeatures(!previewFeatures)}
        preview={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {features.map((f) => (
              <div key={f.id} className="p-3 rounded-lg bg-background border border-border/50">
                <Badge variant="secondary" className="text-[10px] mb-2">
                  {f.icon || 'Icon'}
                </Badge>
                <h4 className="font-semibold text-sm">{f.title || 'Feature Title'}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {f.description || 'Feature description...'}
                </p>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setFeatures(moveItem(features, index, 'up'))}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() =>
                        setFeatures(moveItem(features, index, 'down'))
                      }
                      disabled={index === features.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Feature {index + 1}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setFeatures(features.filter((_, i) => i !== index))
                  }
                  className="h-7 w-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={feature.title}
                  onChange={(e) => {
                    const updated = [...features];
                    updated[index] = { ...feature, title: e.target.value };
                    setFeatures(updated);
                  }}
                  placeholder="Title"
                  className="text-xs h-8"
                />
                <Input
                  value={feature.icon}
                  onChange={(e) => {
                    const updated = [...features];
                    updated[index] = { ...feature, icon: e.target.value };
                    setFeatures(updated);
                  }}
                  placeholder="Icon name (e.g., Brain)"
                  className="text-xs h-8"
                />
              </div>
              <TextArea
                value={feature.description}
                onChange={(val) => {
                  const updated = [...features];
                  updated[index] = { ...feature, description: val };
                  setFeatures(updated);
                }}
                placeholder="Feature description"
                rows={2}
                className="text-xs"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFeatures([
                ...features,
                { id: generateId(), title: '', description: '', icon: '' },
              ])
            }
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Feature
          </Button>
        </div>
      </SectionCard>

      {/* ================================================================= */}
      {/* 4. Testimonials Section                                            */}
      {/* ================================================================= */}
      <SectionCard
        title="Testimonials"
        icon={MessageSquareQuote}
        description="Student reviews and success stories"
        saving={savingSection === 'cms_testimonials'}
        onSave={() => saveSection('cms_testimonials', testimonials)}
        showPreview={previewTestimonials}
        onTogglePreview={() => setPreviewTestimonials(!previewTestimonials)}
        preview={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testimonials.map((t) => (
              <div key={t.id} className="p-3 rounded-lg bg-background border border-border/50">
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        'h-3 w-3',
                        s <= t.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs italic text-muted-foreground line-clamp-3">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
                    {t.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() =>
                        setTestimonials(moveItem(testimonials, index, 'up'))
                      }
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() =>
                        setTestimonials(moveItem(testimonials, index, 'down'))
                      }
                      disabled={index === testimonials.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Testimonial {index + 1}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setTestimonials(testimonials.filter((_, i) => i !== index))
                  }
                  className="h-7 w-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={testimonial.name}
                  onChange={(e) => {
                    const updated = [...testimonials];
                    updated[index] = { ...testimonial, name: e.target.value };
                    setTestimonials(updated);
                  }}
                  placeholder="Name"
                  className="text-xs h-8"
                />
                <Input
                  value={testimonial.role}
                  onChange={(e) => {
                    const updated = [...testimonials];
                    updated[index] = { ...testimonial, role: e.target.value };
                    setTestimonials(updated);
                  }}
                  placeholder="Role (e.g., RN, BSN)"
                  className="text-xs h-8"
                />
                <div className="flex items-center gap-1">
                  <Label className="text-[10px] shrink-0">Rating:</Label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          const updated = [...testimonials];
                          updated[index] = { ...testimonial, rating: s };
                          setTestimonials(updated);
                        }}
                        className="focus:outline-none"
                      >
                        <Star
                          className={cn(
                            'h-3.5 w-3.5',
                            s <= testimonial.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground/30'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <TextArea
                value={testimonial.text}
                onChange={(val) => {
                  const updated = [...testimonials];
                  updated[index] = { ...testimonial, text: val };
                  setTestimonials(updated);
                }}
                placeholder="Testimonial text"
                rows={2}
                className="text-xs"
              />
              <Input
                value={testimonial.avatar}
                onChange={(e) => {
                  const updated = [...testimonials];
                  updated[index] = { ...testimonial, avatar: e.target.value };
                  setTestimonials(updated);
                }}
                placeholder="Avatar URL (optional)"
                className="text-xs h-8"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setTestimonials([
                ...testimonials,
                {
                  id: generateId(),
                  name: '',
                  role: '',
                  text: '',
                  avatar: '',
                  rating: 5,
                },
              ])
            }
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Testimonial
          </Button>
        </div>
      </SectionCard>

      {/* ================================================================= */}
      {/* 5. FAQ Section                                                     */}
      {/* ================================================================= */}
      <SectionCard
        title="FAQ Section"
        icon={HelpCircle}
        description="Frequently asked questions"
        saving={savingSection === 'cms_faqs'}
        onSave={() => saveSection('cms_faqs', faqs)}
        showPreview={previewFaqs}
        onTogglePreview={() => setPreviewFaqs(!previewFaqs)}
        preview={
          <div className="space-y-2">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-3 rounded-lg bg-background border border-border/50">
                <p className="text-xs font-semibold">{faq.question || 'Question?'}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {faq.answer || 'Answer...'}
                </p>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setFaqs(moveItem(faqs, index, 'up'))}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setFaqs(moveItem(faqs, index, 'down'))}
                      disabled={index === faqs.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    FAQ {index + 1}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                  className="h-7 w-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input
                value={faq.question}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[index] = { ...faq, question: e.target.value };
                  setFaqs(updated);
                }}
                placeholder="Question"
                className="text-xs h-8"
              />
              <TextArea
                value={faq.answer}
                onChange={(val) => {
                  const updated = [...faqs];
                  updated[index] = { ...faq, answer: val };
                  setFaqs(updated);
                }}
                placeholder="Answer"
                rows={3}
                className="text-xs"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFaqs([
                ...faqs,
                { id: generateId(), question: '', answer: '' },
              ])
            }
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add FAQ
          </Button>
        </div>
      </SectionCard>

      {/* ================================================================= */}
      {/* 6. Footer Section                                                  */}
      {/* ================================================================= */}
      <SectionCard
        title="Footer"
        icon={Link2}
        description="Footer links, social media, and copyright"
        saving={savingSection === 'cms_footer'}
        onSave={() => saveSection('cms_footer', footer)}
      >
        <div className="space-y-4">
          {/* Footer Links */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Footer Links</Label>
            <div className="space-y-2">
              {footer.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...footer.links];
                      updated[index] = { ...link, label: e.target.value };
                      setFooter({ ...footer, links: updated });
                    }}
                    placeholder="Label"
                    className="text-xs h-8"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...footer.links];
                      updated[index] = { ...link, url: e.target.value };
                      setFooter({ ...footer, links: updated });
                    }}
                    placeholder="URL"
                    className="text-xs h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setFooter({
                        ...footer,
                        links: footer.links.filter((_, i) => i !== index),
                      })
                    }
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFooter({
                    ...footer,
                    links: [...footer.links, { label: '', url: '' }],
                  })
                }
                className="text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Link
              </Button>
            </div>
          </div>

          <Separator />

          {/* Social Media */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Social Media</Label>
            <div className="space-y-2">
              {footer.socialMedia.map((social, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={social.platform}
                    onChange={(e) => {
                      const updated = [...footer.socialMedia];
                      updated[index] = { ...social, platform: e.target.value };
                      setFooter({ ...footer, socialMedia: updated });
                    }}
                    placeholder="Platform (e.g., Twitter)"
                    className="text-xs h-8"
                  />
                  <Input
                    value={social.url}
                    onChange={(e) => {
                      const updated = [...footer.socialMedia];
                      updated[index] = { ...social, url: e.target.value };
                      setFooter({ ...footer, socialMedia: updated });
                    }}
                    placeholder="URL"
                    className="text-xs h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setFooter({
                        ...footer,
                        socialMedia: footer.socialMedia.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFooter({
                    ...footer,
                    socialMedia: [
                      ...footer.socialMedia,
                      { platform: '', url: '' },
                    ],
                  })
                }
                className="text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Social Media
              </Button>
            </div>
          </div>

          <Separator />

          {/* Copyright */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Copyright Text</Label>
            <Input
              value={footer.copyrightText}
              onChange={(e) =>
                setFooter({ ...footer, copyrightText: e.target.value })
              }
              placeholder="2026 Haven Institute. All rights reserved."
              className="text-xs"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
