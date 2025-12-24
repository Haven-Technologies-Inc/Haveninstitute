import { useState } from 'react';
import { 
  Check, 
  X, 
  Zap, 
  Crown, 
  Star,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  usePlans, 
  useCurrentSubscription, 
  useCreateCheckout,
  useCancelSubscription,
  useReactivateSubscription
} from '../../services/hooks/useSubscription';
import type { PlanType, BillingPeriod } from '../../services/api/subscriptionApi';

export function SubscriptionPlans() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: currentSubscription } = useCurrentSubscription();
  const createCheckout = useCreateCheckout();
  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();

  const handleSubscribe = async (planType: PlanType) => {
    if (planType === 'Free') return;

    try {
      const result = await createCheckout.mutateAsync({
        planType,
        billingPeriod,
        successUrl: `${window.location.origin}/app/settings?checkout=success`,
        cancelUrl: `${window.location.origin}/app/settings?checkout=canceled`
      });

      window.location.href = result.url;
    } catch (error) {
      console.error('Failed to create checkout:', error);
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      await cancelSubscription.mutateAsync(false);
    }
  };

  const handleReactivate = async () => {
    await reactivateSubscription.mutateAsync();
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'Pro': return <Zap className="w-6 h-6" />;
      case 'Premium': return <Crown className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getYearlySavings = (plan: any) => {
    const monthlyCost = plan.pricing.monthly * 12;
    const yearlyCost = plan.pricing.yearly;
    const savings = monthlyCost - yearlyCost;
    return savings > 0 ? Math.round(savings) : 0;
  };

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select the plan that best fits your NCLEX preparation needs. Upgrade anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full inline-flex">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-full transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white dark:bg-gray-700 shadow'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${
              billingPeriod === 'yearly'
                ? 'bg-white dark:bg-gray-700 shadow'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            <Badge className="bg-green-500 text-white">Save up to 17%</Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans?.map((plan) => {
          const isCurrentPlan = currentSubscription?.planType === plan.id;
          const price = billingPeriod === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly;
          const savings = getYearlySavings(plan);

          return (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.popular 
                  ? 'border-2 border-indigo-500 shadow-lg scale-105' 
                  : ''
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-indigo-600">Most Popular</Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  plan.id === 'Premium' 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                    : plan.id === 'Pro'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      ${price === 0 ? '0' : price.toFixed(2)}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-500">
                        /{billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {billingPeriod === 'yearly' && savings > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Save ${savings}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    {plan.features.maxQuestionsPerDay === -1 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="w-4 h-4 text-center text-xs font-bold text-indigo-600">
                        {plan.features.maxQuestionsPerDay}
                      </span>
                    )}
                    <span>
                      {plan.features.maxQuestionsPerDay === -1 
                        ? 'Unlimited questions/day' 
                        : `${plan.features.maxQuestionsPerDay} questions/day`}
                    </span>
                  </li>

                  <li className="flex items-center gap-2 text-sm">
                    {plan.features.maxCATTests === -1 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="w-4 h-4 text-center text-xs font-bold text-indigo-600">
                        {plan.features.maxCATTests}
                      </span>
                    )}
                    <span>
                      {plan.features.maxCATTests === -1 
                        ? 'Unlimited CAT tests' 
                        : `${plan.features.maxCATTests} CAT tests/month`}
                    </span>
                  </li>

                  <li className="flex items-center gap-2 text-sm">
                    {plan.features.aiTutorAccess ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={!plan.features.aiTutorAccess ? 'text-gray-400' : ''}>
                      AI Tutor Access
                    </span>
                  </li>

                  <li className="flex items-center gap-2 text-sm">
                    {plan.features.studyPlanGeneration ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={!plan.features.studyPlanGeneration ? 'text-gray-400' : ''}>
                      AI Study Plan Generation
                    </span>
                  </li>

                  <li className="flex items-center gap-2 text-sm">
                    {plan.features.advancedAnalytics ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={!plan.features.advancedAnalytics ? 'text-gray-400' : ''}>
                      Advanced Analytics
                    </span>
                  </li>

                  <li className="flex items-center gap-2 text-sm">
                    {plan.features.prioritySupport ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={!plan.features.prioritySupport ? 'text-gray-400' : ''}>
                      Priority Support
                    </span>
                  </li>
                </ul>

                {/* Action Button */}
                <div>
                  {isCurrentPlan ? (
                    currentSubscription?.cancelAtPeriodEnd ? (
                      <Button 
                        className="w-full"
                        onClick={handleReactivate}
                        disabled={reactivateSubscription.isPending}
                      >
                        Reactivate Plan
                      </Button>
                    ) : plan.id !== 'Free' ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleCancel}
                        disabled={cancelSubscription.isPending}
                      >
                        Cancel Plan
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    )
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
                          : ''
                      }`}
                      variant={plan.id === 'Free' ? 'outline' : 'default'}
                      onClick={() => handleSubscribe(plan.id as PlanType)}
                      disabled={createCheckout.isPending}
                    >
                      {plan.id === 'Free' 
                        ? 'Downgrade to Free' 
                        : currentSubscription?.planType !== 'Free'
                          ? 'Switch Plan'
                          : 'Get Started'
                      }
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
        <p>
          All plans include a 7-day free trial. Cancel anytime. 
          Questions? <a href="/support" className="text-indigo-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
