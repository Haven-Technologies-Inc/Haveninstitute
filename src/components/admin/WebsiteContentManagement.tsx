import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Globe,
  Save,
  Eye,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Loader2,
  Star,
  DollarSign,
  MessageSquare,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import {
  getAllWebsiteContent,
  updateHeroSection,
  getAllFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  duplicateTestimonial,
  getAllPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  duplicatePricingPlan,
  getAllStatistics,
  updateStatistic,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  updateFooterSection,
  updateCTA,
  exportWebsiteContent,
  resetToDefaults,
  type WebsiteContent,
  type HeroSection,
  type Feature,
  type Testimonial,
  type PricingPlan,
  type Statistic,
  type FAQ,
  type FooterSection,
  type CallToAction
} from '../../services/websiteContentApi';
import { toast } from 'sonner@2.0.3';

export function WebsiteContentManagement() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await getAllWebsiteContent();
      setContent(data);
    } catch (error) {
      toast.error('Failed to load website content');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportWebsiteContent();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nursehaven-content-${Date.now()}.json`;
      a.click();
      toast.success('Content exported successfully');
    } catch (error) {
      toast.error('Failed to export content');
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all content to defaults? This cannot be undone.')) {
      return;
    }
    try {
      const data = await resetToDefaults();
      setContent(data);
      toast.success('Content reset to defaults');
    } catch (error) {
      toast.error('Failed to reset content');
    }
  };

  if (loading || !content) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 dark:text-white mb-2">Website Content Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage all content on the NurseHaven landing page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="size-4 mr-2" />
            Reset
          </Button>
          <Button>
            <Eye className="size-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Last Updated Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400" />
              <p className="text-blue-900 dark:text-blue-200">
                Last updated: {new Date(content.lastUpdated).toLocaleString()}
              </p>
            </div>
            <Badge className="bg-blue-600 text-white">
              Updated by: {content.updatedBy}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <HeroEditor hero={content.hero} onSave={loadContent} />
        </TabsContent>

        {/* Features */}
        <TabsContent value="features">
          <FeaturesEditor features={content.features} onSave={loadContent} />
        </TabsContent>

        {/* Testimonials */}
        <TabsContent value="testimonials">
          <TestimonialsEditor testimonials={content.testimonials} onSave={loadContent} />
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing">
          <PricingEditor plans={content.pricing} onSave={loadContent} />
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="stats">
          <StatisticsEditor stats={content.statistics} onSave={loadContent} />
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faqs">
          <FAQsEditor faqs={content.faqs} onSave={loadContent} />
        </TabsContent>

        {/* CTA */}
        <TabsContent value="cta">
          <CTAEditor cta={content.cta} onSave={loadContent} />
        </TabsContent>

        {/* Footer */}
        <TabsContent value="footer">
          <FooterEditor footer={content.footer} onSave={loadContent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Hero Editor Component
function HeroEditor({ hero, onSave }: { hero: HeroSection; onSave: () => void }) {
  const [formData, setFormData] = useState(hero);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHeroSection(formData);
      toast.success('Hero section updated');
      onSave();
    } catch (error) {
      toast.error('Failed to update hero section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Hero Section</CardTitle>
        <CardDescription className="dark:text-gray-400">Main banner at the top of the landing page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Your Safe Haven for NCLEX Success"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Subtitle</label>
          <Textarea
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            rows={3}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Primary CTA Text</label>
            <Input
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Primary CTA Link</label>
            <Input
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Secondary CTA Text</label>
            <Input
              value={formData.secondaryCtaText || ''}
              onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Secondary CTA Link</label>
            <Input
              value={formData.secondaryCtaLink || ''}
              onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Background Image URL</label>
          <Input
            value={formData.backgroundImage || ''}
            onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
            placeholder="https://..."
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Hero Section
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Features Editor Component
function FeaturesEditor({ features, onSave }: { features: Feature[]; onSave: () => void }) {
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feature?')) return;
    try {
      await deleteFeature(id);
      toast.success('Feature deleted');
      onSave();
    } catch (error) {
      toast.error('Failed to delete feature');
    }
  };

  const handleSave = async (data: Partial<Feature>) => {
    try {
      if (editingFeature) {
        await updateFeature(editingFeature.id, data);
        toast.success('Feature updated');
      } else {
        await createFeature(data as Omit<Feature, 'id'>);
        toast.success('Feature created');
      }
      setEditingFeature(null);
      setShowForm(false);
      onSave();
    } catch (error) {
      toast.error('Failed to save feature');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl text-gray-900 dark:text-white">Features ({features.length})</h3>
        <Button onClick={() => { setEditingFeature(null); setShowForm(true); }}>
          <Plus className="size-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {showForm && (
        <FeatureForm
          feature={editingFeature}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingFeature(null); }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <Card key={feature.id} className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditingFeature(feature); setShowForm(true); }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(feature.id)}>
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{feature.description}</p>
              <div className="flex items-center gap-2">
                <Badge>{feature.category}</Badge>
                <Badge variant="outline">Order: {feature.order}</Badge>
                {feature.enabled ? (
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FeatureForm({
  feature,
  onSave,
  onCancel
}: {
  feature: Feature | null;
  onSave: (data: Partial<Feature>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Feature>>(
    feature || {
      icon: 'Sparkles',
      title: '',
      description: '',
      category: 'core',
      order: 1,
      enabled: true
    }
  );

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Icon</label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="core">Core</option>
              <option value="ai">AI</option>
              <option value="study">Study</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Order</label>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="size-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)}>
            <Save className="size-4 mr-2" />
            Save Feature
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Testimonials Editor (simplified for space)
function TestimonialsEditor({ testimonials, onSave }: { testimonials: Testimonial[]; onSave: () => void }) {
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      toast.success('Testimonial deleted');
      onSave();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateTestimonial(id);
      toast.success('Testimonial duplicated');
      onSave();
    } catch (error) {
      toast.error('Failed to duplicate testimonial');
    }
  };

  const handleSave = async (data: Partial<Testimonial>) => {
    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, data);
        toast.success('Testimonial updated');
      } else {
        await createTestimonial(data as Omit<Testimonial, 'id'>);
        toast.success('Testimonial created');
      }
      setEditingTestimonial(null);
      setShowForm(false);
      onSave();
    } catch (error) {
      toast.error('Failed to save testimonial');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl text-gray-900 dark:text-white">Testimonials ({testimonials.length})</h3>
        <Button onClick={() => { setEditingTestimonial(null); setShowForm(true); }}>
          <Plus className="size-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {showForm && (
        <TestimonialForm
          testimonial={editingTestimonial}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTestimonial(null); }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((test) => (
          <Card key={test.id} className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <img src={test.avatar} alt={test.name} className="size-12 rounded-full" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{test.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{test.role}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditingTestimonial(test); setShowForm(true); }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(test.id)}
                  >
                    <Star className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(test.id)}>
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{test.content}</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {test.verified && <Badge className="bg-blue-100 text-blue-800">Verified</Badge>}
                {test.enabled ? (
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TestimonialForm({
  testimonial,
  onSave,
  onCancel
}: {
  testimonial: Testimonial | null;
  onSave: (data: Partial<Testimonial>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Testimonial>>(
    testimonial || {
      name: '',
      role: '',
      avatar: '',
      content: '',
      rating: 5,
      date: new Date().toISOString().split('T')[0],
      verified: false,
      order: 1,
      enabled: true
    }
  );

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Role/Title</label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="RN, Passed NCLEX"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Avatar URL</label>
          <Input
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            placeholder="https://..."
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Testimonial Content</label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={4}
            placeholder="Share your experience..."
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Rating</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Order</label>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.verified}
              onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
              className="size-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="size-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)}>
            <Save className="size-4 mr-2" />
            Save Testimonial
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Pricing Editor (simplified)
function PricingEditor({ plans, onSave }: { plans: PricingPlan[]; onSave: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl text-gray-900 dark:text-white">Pricing Plans ({plans.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`dark:bg-gray-800 dark:border-gray-700 ${plan.highlighted ? 'border-2 border-purple-600' : ''}`}>
            <CardContent className="pt-6">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
              <div className="flex items-baseline mb-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">/{plan.interval}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.highlighted && <Badge className="bg-purple-600 text-white">Most Popular</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Statistics Editor (simplified)
function StatisticsEditor({ stats, onSave }: { stats: Statistic[]; onSave: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl text-gray-900 dark:text-white">Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{stat.value}</div>
              <p className="text-gray-700 dark:text-gray-300">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// FAQs Editor (simplified)
function FAQsEditor({ faqs, onSave }: { faqs: FAQ[]; onSave: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl text-gray-900 dark:text-white">FAQs ({faqs.length})</h3>
        <Button>
          <Plus className="size-4 mr-2" />
          Add FAQ
        </Button>
      </div>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id} className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </div>
                <Badge>{faq.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// CTA Editor (simplified)
function CTAEditor({ cta, onSave }: { cta: CallToAction; onSave: () => void }) {
  const [formData, setFormData] = useState(cta);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCTA(formData);
      toast.success('CTA updated');
      onSave();
    } catch (error) {
      toast.error('Failed to update CTA');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Call to Action Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Subtitle</label>
          <Textarea
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            rows={2}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Button Text</label>
            <Input
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Button Link</label>
            <Input
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          Save CTA
        </Button>
      </CardContent>
    </Card>
  );
}

// Footer Editor (simplified)
function FooterEditor({ footer, onSave }: { footer: FooterSection; onSave: () => void }) {
  const [formData, setFormData] = useState(footer);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFooterSection(formData);
      toast.success('Footer updated');
      onSave();
    } catch (error) {
      toast.error('Failed to update footer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Footer Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Company Name</label>
            <Input
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Tagline</label>
            <Input
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Copyright Text</label>
          <Input
            value={formData.copyrightText}
            onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Email</label>
            <Input
              value={formData.contactInfo.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contactInfo: { ...formData.contactInfo, email: e.target.value }
                })
              }
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Phone</label>
            <Input
              value={formData.contactInfo.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contactInfo: { ...formData.contactInfo, phone: e.target.value }
                })
              }
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Address</label>
            <Input
              value={formData.contactInfo.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contactInfo: { ...formData.contactInfo, address: e.target.value }
                })
              }
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          Save Footer
        </Button>
      </CardContent>
    </Card>
  );
}