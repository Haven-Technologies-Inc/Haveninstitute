'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/hooks';
import { PageHeader } from '@/components/shared/page-header';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Check,
  Crown,
  Zap,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tier: string;
  monthlyPrice: number | string;
  yearlyPrice: number | string;
  features: string[] | null;
  isPopular: boolean;
  badge: string | null;
  displayOrder: number;
}

interface BillingItem {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
  stripeInvoiceId: string | null;
  receiptUrl: string | null;
}

const planIcons: Record<string, typeof Zap> = {
  Free: Zap,
  Pro: Star,
  Premium: Crown,
};

const planColors: Record<string, { text: string; bg: string }> = {
  Free: { text: 'text-zinc-500', bg: 'bg-zinc-500/10' },
  Pro: { text: 'text-primary', bg: 'bg-primary/10' },
  Premium: { text: 'text-amber-500', bg: 'bg-amber-500/10' },
};

export default function SubscriptionPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('Free');
  const [billingHistory, setBillingHistory] = useState<BillingItem[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [switchingPlan, setSwitchingPlan] = useState<string | null>(null);
  const [managingBilling, setManagingBilling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Handle URL params for checkout redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === 'true') {
      toast.success('Subscription activated successfully! Welcome to your new plan.');
    }
    if (canceled === 'true') {
      toast.error('Checkout was canceled. No changes were made.');
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [plansRes, profileRes, billingRes] = await Promise.all([
        fetch('/api/admin/plans'),
        fetch('/api/account/profile'),
        fetch('/api/account/billing'),
      ]);

      if (!plansRes.ok) throw new Error('Failed to load plans');
      if (!profileRes.ok) throw new Error('Failed to load profile');

      const plansJson = await plansRes.json();
      const profileJson = await profileRes.json();

      const plansData = plansJson.data || plansJson;
      const profileData = profileJson.data || profileJson;

      setPlans(
        (Array.isArray(plansData) ? plansData : []).sort(
          (a: Plan, b: Plan) => a.displayOrder - b.displayOrder
        )
      );
      setCurrentTier(profileData.subscriptionTier || 'Free');

      if (billingRes.ok) {
        const billingJson = await billingRes.json();
        const billingData = billingJson.data || billingJson;
        setBillingHistory(Array.isArray(billingData) ? billingData : billingData?.payments || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSwitchPlan = async (plan: Plan) => {
    setSwitchingPlan(plan.id);
    try {
      const priceId = isYearly
        ? (plan as any).stripeYearlyPriceId
        : (plan as any).stripeMonthlyPriceId;

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId || plan.id,
          planId: plan.id,
          billingPeriod: isYearly ? 'year' : 'month',
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to start checkout');
      }

      const json = await res.json();
      const url = json.data?.url || json.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to switch plan');
    } finally {
      setSwitchingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to open billing portal');
      }

      const json = await res.json();
      const url = json.data?.url || json.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setManagingBilling(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to open cancellation portal');
      const json = await res.json();
      const url = json.data?.url || json.url;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
      setCancelDialogOpen(false);
    }
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Subscription" description="Manage your subscription plan and billing" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader title="Subscription" description="Manage your subscription plan and billing" />
        <EmptyState
          icon={AlertCircle}
          title="Failed to load subscription data"
          description={error}
        >
          <Button onClick={fetchData} variant="outline">Try Again</Button>
        </EmptyState>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.tier === currentTier);
  const PlanIcon = planIcons[currentTier] || Zap;
  const planColor = planColors[currentTier] || planColors.Free;

  return (
    <div className="space-y-8">
      <PageHeader title="Subscription" description="Manage your subscription plan and billing" />

      {/* Current Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', planColor.bg)}>
                  <PlanIcon className={cn('h-6 w-6', planColor.text)} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{currentTier} Plan</h3>
                    <Badge>Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentTier === 'Free'
                      ? 'Free forever'
                      : `${isYearly ? 'Yearly' : 'Monthly'} billing`}
                  </p>
                </div>
              </div>
              {currentTier !== 'Free' && (
                <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={managingBilling}>
                  {managingBilling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Manage Billing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-3">
        <Label className={cn('text-sm', !isYearly && 'font-semibold')}>Monthly</Label>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <Label className={cn('text-sm', isYearly && 'font-semibold')}>
          Yearly
          <Badge variant="secondary" className="ml-2 text-[10px]">
            Save 20%
          </Badge>
        </Label>
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Compare Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = planIcons[plan.tier] || Zap;
            const colors = planColors[plan.tier] || planColors.Free;
            const isCurrent = plan.tier === currentTier;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const features = Array.isArray(plan.features) ? plan.features : [];

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className={cn(
                    'relative border-0 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col',
                    plan.isPopular && 'ring-2 ring-primary shadow-md'
                  )}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', colors.bg)}>
                      <Icon className={cn('h-5 w-5', colors.text)} />
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {formatPrice(price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.tier === 'Free' ? '/forever' : isYearly ? '/year' : '/month'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <ul className="space-y-2 flex-1">
                      {features.map((feature: string) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? 'outline' : plan.isPopular ? 'default' : 'outline'}
                      disabled={isCurrent || switchingPlan === plan.id}
                      onClick={() => handleSwitchPlan(plan)}
                    >
                      {switchingPlan === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : (
                        <>
                          Switch Plan
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Billing History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        {billingHistory.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No billing history yet.
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium text-muted-foreground p-4">Date</th>
                      <th className="text-left font-medium text-muted-foreground p-4">Description</th>
                      <th className="text-left font-medium text-muted-foreground p-4">Amount</th>
                      <th className="text-left font-medium text-muted-foreground p-4">Status</th>
                      <th className="text-left font-medium text-muted-foreground p-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="p-4">{formatDate(item.createdAt)}</td>
                        <td className="p-4 text-muted-foreground">
                          {item.description || 'Subscription payment'}
                        </td>
                        <td className="p-4 font-medium">{formatPrice(item.amount)}</td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className={cn(
                              item.status === 'succeeded'
                                ? 'text-emerald-600 bg-emerald-500/10'
                                : item.status === 'failed'
                                ? 'text-red-600 bg-red-500/10'
                                : 'text-amber-600 bg-amber-500/10'
                            )}
                          >
                            {item.status === 'succeeded' ? 'Paid' : item.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {item.receiptUrl && (
                            <a
                              href={item.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                            >
                              View
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel */}
      {currentTier !== 'Free' && (
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            className="text-muted-foreground text-sm hover:text-destructive"
            onClick={() => setCancelDialogOpen(true)}
          >
            Cancel subscription
          </Button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your {currentTier} subscription? You will lose access to premium
              features at the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
