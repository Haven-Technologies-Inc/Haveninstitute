'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared';
import { CreditCard, Check, Crown, Zap, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Zap,
    features: [
      '50 practice questions/month',
      'Basic analytics',
      'Community access',
      'Limited flashcards',
    ],
    color: 'text-zinc-500',
    bg: 'bg-zinc-500/10',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19.99',
    period: '/month',
    icon: Star,
    popular: true,
    features: [
      'Unlimited practice questions',
      'Full CAT simulations',
      'Advanced analytics',
      'AI Tutor access',
      'Spaced repetition flashcards',
      'Custom study plans',
    ],
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$39.99',
    period: '/month',
    icon: Crown,
    features: [
      'Everything in Pro',
      'NCLEX exam simulations',
      'Priority AI support',
      'Study group creation',
      'Content downloads',
      '1-on-1 tutor sessions',
      'Pass guarantee',
    ],
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

const billingHistory = [
  { id: 1, date: 'Feb 1, 2026', amount: '$19.99', status: 'Paid', invoice: '#INV-2026-02' },
  { id: 2, date: 'Jan 1, 2026', amount: '$19.99', status: 'Paid', invoice: '#INV-2026-01' },
  { id: 3, date: 'Dec 1, 2025', amount: '$19.99', status: 'Paid', invoice: '#INV-2025-12' },
];

export default function SubscriptionPage() {
  const [currentPlan] = useState('pro');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription"
        description="Manage your subscription plan and billing"
      />

      {/* Current Plan */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Pro Plan</h3>
                  <Badge>Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Next billing date: March 1, 2026 &middot; $19.99/month
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Compare Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative border-0 shadow-sm transition-shadow hover:shadow-md',
                plan.popular && 'ring-2 ring-primary shadow-md'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', plan.bg)}>
                  <plan.icon className={cn('h-5 w-5', plan.color)} />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.id === currentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                  disabled={plan.id === currentPlan}
                >
                  {plan.id === currentPlan ? 'Current Plan' : 'Switch Plan'}
                  {plan.id !== currentPlan && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Billing History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium text-muted-foreground p-4">Date</th>
                    <th className="text-left font-medium text-muted-foreground p-4">Invoice</th>
                    <th className="text-left font-medium text-muted-foreground p-4">Amount</th>
                    <th className="text-left font-medium text-muted-foreground p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-4">{item.date}</td>
                      <td className="p-4 text-muted-foreground">{item.invoice}</td>
                      <td className="p-4 font-medium">{item.amount}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-emerald-600 bg-emerald-500/10">
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel */}
      <div className="text-center pt-4">
        <Button variant="ghost" className="text-muted-foreground text-sm">
          Cancel subscription
        </Button>
      </div>
    </div>
  );
}
