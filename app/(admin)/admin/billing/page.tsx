'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  Users,
  Plus,
  Edit,
  X,
  Check,
  Zap,
  Crown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tier: string;
  isActive: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  stripeProductId: string | null;
  stripeMonthlyPriceId: string | null;
  stripeYearlyPriceId: string | null;
  features: string[] | null;
  limits: Record<string, any> | null;
  trialDays: number;
  displayOrder: number;
  isPopular: boolean;
  badge: string | null;
}

interface StatsData {
  users: { total: number };
  subscriptions: { active: number; breakdown: { tier: string; count: number }[] };
  revenue: { monthly: number };
  monthlyRevenueData: { month: string; revenue: number }[];
}

const PIE_COLORS = ['#94a3b8', '#10b981', '#8b5cf6'];

const tierIcons: Record<string, typeof Zap> = {
  Free: Zap,
  Pro: Crown,
  Premium: Sparkles,
};

const tierGradients: Record<string, string> = {
  Free: 'from-gray-400 to-gray-600',
  Pro: 'from-emerald-500 to-teal-600',
  Premium: 'from-purple-500 to-pink-600',
};

function BillingSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export default function AdminBillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/Edit plan dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTier, setFormTier] = useState('Pro');
  const [formMonthlyPrice, setFormMonthlyPrice] = useState('');
  const [formYearlyPrice, setFormYearlyPrice] = useState('');
  const [formTrialDays, setFormTrialDays] = useState('0');
  const [formDisplayOrder, setFormDisplayOrder] = useState('0');
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  // Limits
  const [limitQuestions, setLimitQuestions] = useState('');
  const [limitCatSim, setLimitCatSim] = useState('');
  const [limitAiMessages, setLimitAiMessages] = useState('');
  const [limitFlashcardDecks, setLimitFlashcardDecks] = useState('');
  const [limitStudyGroups, setLimitStudyGroups] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansRes, statsRes] = await Promise.all([
        fetch('/api/admin/plans'),
        fetch('/api/admin/stats'),
      ]);

      if (!plansRes.ok) throw new Error('Failed to fetch plans');
      if (!statsRes.ok) throw new Error('Failed to fetch stats');

      const plansJson = await plansRes.json();
      const statsJson = await statsRes.json();

      setPlans(plansJson.data);
      setStats(statsJson.data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormTier('Pro');
    setFormMonthlyPrice('');
    setFormYearlyPrice('');
    setFormTrialDays('0');
    setFormDisplayOrder('0');
    setFormIsPopular(false);
    setFormFeatures([]);
    setNewFeature('');
    setLimitQuestions('');
    setLimitCatSim('');
    setLimitAiMessages('');
    setLimitFlashcardDecks('');
    setLimitStudyGroups('');
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormDescription(plan.description || '');
    setFormTier(plan.tier);
    setFormMonthlyPrice(String(Number(plan.monthlyPrice)));
    setFormYearlyPrice(String(Number(plan.yearlyPrice)));
    setFormTrialDays(String(plan.trialDays));
    setFormDisplayOrder(String(plan.displayOrder));
    setFormIsPopular(plan.isPopular);
    setFormFeatures(Array.isArray(plan.features) ? plan.features : []);
    const limits = plan.limits as Record<string, any> | null;
    setLimitQuestions(String(limits?.questionsPerMonth ?? ''));
    setLimitCatSim(String(limits?.catSimulations ?? ''));
    setLimitAiMessages(String(limits?.aiTutorMessages ?? ''));
    setLimitFlashcardDecks(String(limits?.flashcardDecks ?? ''));
    setLimitStudyGroups(String(limits?.studyGroups ?? ''));
    setDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!formName.trim()) {
      toast.error('Plan name is required');
      return;
    }

    try {
      setSaving(true);

      const limits: Record<string, number> = {};
      if (limitQuestions) limits.questionsPerMonth = parseInt(limitQuestions);
      if (limitCatSim) limits.catSimulations = parseInt(limitCatSim);
      if (limitAiMessages) limits.aiTutorMessages = parseInt(limitAiMessages);
      if (limitFlashcardDecks) limits.flashcardDecks = parseInt(limitFlashcardDecks);
      if (limitStudyGroups) limits.studyGroups = parseInt(limitStudyGroups);

      const payload = {
        name: formName,
        description: formDescription || null,
        tier: formTier,
        monthlyPrice: parseFloat(formMonthlyPrice) || 0,
        yearlyPrice: parseFloat(formYearlyPrice) || 0,
        features: formFeatures,
        limits,
        trialDays: parseInt(formTrialDays) || 0,
        displayOrder: parseInt(formDisplayOrder) || 0,
        isPopular: formIsPopular,
      };

      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : '/api/admin/plans';
      const method = editingPlan ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save plan');
      }

      toast.success(
        editingPlan
          ? 'Plan updated and synced to Stripe!'
          : 'Plan created and synced to Stripe!'
      );
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      if (!res.ok) throw new Error('Failed to update plan');

      toast.success(
        plan.isActive ? 'Plan deactivated' : 'Plan activated'
      );
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormFeatures((prev) => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) return <BillingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to Load Billing</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const breakdown = stats?.subscriptions.breakdown || [];
  const pieData = breakdown.map((b) => ({
    name: b.tier,
    value: b.count,
  }));

  const annualRevenue = (stats?.revenue.monthly || 0) * 12;
  const churnRate = stats && stats.subscriptions.active > 0
    ? ((stats.users.total - stats.subscriptions.active) / stats.users.total * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <PageHeader
        title="Billing & Plans"
        description="Manage subscription plans, revenue analytics, and Stripe integration."
      >
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
          onClick={openCreateDialog}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Monthly Revenue',
            value: `$${(stats?.revenue.monthly || 0).toLocaleString()}`,
            icon: DollarSign,
            iconColor: 'text-emerald-600',
          },
          {
            label: 'Annual Revenue (est.)',
            value: `$${annualRevenue.toLocaleString()}`,
            icon: TrendingUp,
            iconColor: 'text-blue-600',
          },
          {
            label: 'Active Subscribers',
            value: (stats?.subscriptions.active || 0).toLocaleString(),
            icon: CreditCard,
            iconColor: 'text-purple-600',
          },
          {
            label: 'Churn Rate (est.)',
            value: `${churnRate}%`,
            icon: RefreshCw,
            iconColor: 'text-amber-600',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Plans Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan, i) => {
            const TierIcon = tierIcons[plan.tier] || Zap;
            const features = Array.isArray(plan.features) ? plan.features : [];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={cn(
                    'border-0 shadow-sm relative overflow-hidden',
                    !plan.isActive && 'opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'h-2 bg-gradient-to-r',
                      tierGradients[plan.tier] || 'from-gray-400 to-gray-600'
                    )}
                  />
                  {plan.isPopular && (
                    <Badge className="absolute top-4 right-4 bg-amber-500 text-white text-[10px]">
                      Popular
                    </Badge>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
                          tierGradients[plan.tier]
                        )}
                      >
                        <TierIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <Badge
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {plan.tier}
                        </Badge>
                      </div>
                    </div>

                    {plan.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold">
                        ${Number(plan.monthlyPrice).toFixed(0)}
                      </span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                      {Number(plan.yearlyPrice) > 0 && (
                        <span className="text-xs text-muted-foreground">
                          (${Number(plan.yearlyPrice).toFixed(0)}/yr)
                        </span>
                      )}
                    </div>

                    {/* Stripe sync status */}
                    <div className="flex items-center gap-2 mb-3">
                      {plan.stripeProductId ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-emerald-500/10 text-emerald-600"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Stripe Synced
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-amber-500/10 text-amber-600"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Synced
                        </Badge>
                      )}
                      {!plan.isActive && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-red-500/10 text-red-600"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <ul className="space-y-1 mb-4">
                        {features.slice(0, 4).map((f, fi) => (
                          <li
                            key={fi}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                        {features.length > 4 && (
                          <li className="text-xs text-muted-foreground ml-5">
                            +{features.length - 4} more
                          </li>
                        )}
                      </ul>
                    )}

                    <Separator className="mb-3" />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(plan)}
                        className={cn(
                          'flex-1',
                          plan.isActive
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-emerald-600 hover:text-emerald-700'
                        )}
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Add plan placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plans.length * 0.05 }}
          >
            <Card
              className="border-0 shadow-sm border-dashed border-2 cursor-pointer hover:bg-muted/20 transition-colors h-full min-h-[200px] flex items-center justify-center"
              onClick={openCreateDialog}
            >
              <CardContent className="p-5 text-center">
                <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Add New Plan</p>
                <p className="text-xs text-muted-foreground">
                  Create and sync to Stripe
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
              <Badge
                variant="secondary"
                className="text-xs bg-emerald-500/10 text-emerald-600"
              >
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                12 Months
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyRevenueData || []}>
                  <defs>
                    <linearGradient id="billingRevGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      `$${Number(value).toLocaleString()}`,
                      'Revenue',
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#billingRevGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Subscription Distribution</CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {(stats?.users.total || 0).toLocaleString()} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: any) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        Number(value).toLocaleString(),
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription data</p>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {breakdown.map((b, i) => (
                <div key={b.tier} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span>
                    {b.tier}: {b.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Pro Plan"
                />
              </div>
              <div className="space-y-2">
                <Label>Tier *</Label>
                <Select value={formTier} onValueChange={setFormTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planDesc">Description</Label>
              <Input
                id="planDesc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief plan description"
              />
            </div>

            {/* Pricing */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  value={formMonthlyPrice}
                  onChange={(e) => setFormMonthlyPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  step="0.01"
                  value={formYearlyPrice}
                  onChange={(e) => setFormYearlyPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addFeature}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formFeatures.length > 0 && (
                <div className="space-y-1 mt-2">
                  {formFeatures.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg px-3 py-1.5"
                    >
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="flex-1">{f}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFeature(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Limits */}
            <div className="space-y-2">
              <Label>Usage Limits</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Questions/Month</Label>
                  <Input
                    type="number"
                    value={limitQuestions}
                    onChange={(e) => setLimitQuestions(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">CAT Simulations</Label>
                  <Input
                    type="number"
                    value={limitCatSim}
                    onChange={(e) => setLimitCatSim(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">AI Tutor Messages</Label>
                  <Input
                    type="number"
                    value={limitAiMessages}
                    onChange={(e) => setLimitAiMessages(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Flashcard Decks</Label>
                  <Input
                    type="number"
                    value={limitFlashcardDecks}
                    onChange={(e) => setLimitFlashcardDecks(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Study Groups</Label>
                  <Input
                    type="number"
                    value={limitStudyGroups}
                    onChange={(e) => setLimitStudyGroups(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </div>

            {/* Extra options */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trialDays">Trial Days</Label>
                <Input
                  id="trialDays"
                  type="number"
                  value={formTrialDays}
                  onChange={(e) => setFormTrialDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Mark as Popular</Label>
                <p className="text-xs text-muted-foreground">
                  Show a "Popular" badge on this plan
                </p>
              </div>
              <Switch
                checked={formIsPopular}
                onCheckedChange={setFormIsPopular}
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePlan}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
