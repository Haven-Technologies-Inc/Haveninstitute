import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Check, 
  X, 
  Crown, 
  Zap,
  Star,
  TrendingUp,
  Shield,
  Users,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useCreateCheckout } from '../../services/hooks/useSubscription';
import type { PlanType, BillingPeriod } from '../../services/api/subscriptionApi';

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  period: 'month' | 'year';
  description: string;
  icon: any;
  color: string;
  popular?: boolean;
  features: {
    text: string;
    included: boolean;
  }[];
  cta: string;
}

interface SubscriptionPlansProps {
  onSelectPlan?: (planId: string, billingPeriod: BillingPeriod) => void;
  currentPlan?: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    period: 'month',
    description: 'Perfect for trying out NurseHaven',
    icon: Star,
    color: 'gray',
    features: [
      { text: '50 practice questions per month', included: true },
      { text: 'Basic flashcards', included: true },
      { text: 'Progress tracking', included: true },
      { text: 'Community forum access', included: true },
      { text: 'CAT testing', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Study planner', included: false },
      { text: 'Group study sessions', included: false },
      { text: 'Priority support', included: false }
    ],
    cta: 'Current Plan'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    yearlyPrice: 287.90,
    period: 'month',
    description: 'Everything you need to pass NCLEX',
    icon: Zap,
    color: 'blue',
    popular: true,
    features: [
      { text: 'Unlimited practice questions', included: true },
      { text: 'All flashcard decks', included: true },
      { text: 'Advanced progress tracking', included: true },
      { text: 'CAT testing (5 tests/month)', included: true },
      { text: 'AI-powered analytics', included: true },
      { text: 'Study planner with reminders', included: true },
      { text: 'Group study sessions', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Ad-free experience', included: true }
    ],
    cta: 'Upgrade to Pro'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.99,
    yearlyPrice: 479.90,
    period: 'month',
    description: 'Ultimate NCLEX preparation package',
    icon: Crown,
    color: 'purple',
    features: [
      { text: 'Everything in Pro, plus:', included: true },
      { text: 'Unlimited CAT testing', included: true },
      { text: '1-on-1 tutor sessions (2/month)', included: true },
      { text: 'Personalized study plan by AI', included: true },
      { text: 'NCLEX prediction algorithm', included: true },
      { text: 'Exclusive webinars & workshops', included: true },
      { text: 'Priority chat support', included: true },
      { text: 'Downloadable study guides', included: true },
      { text: 'Money-back guarantee', included: true }
    ],
    cta: 'Go Premium'
  }
];

export function SubscriptionPlans({ onSelectPlan, currentPlan = 'free' }: SubscriptionPlansProps) {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [isProcessing, setIsProcessing] = useState(false);
  const checkoutMutation = useCreateCheckout();

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan || planId === 'free') return;
    
    // If external handler provided, use it
    if (onSelectPlan) {
      onSelectPlan(planId, billingPeriod === 'month' ? 'monthly' : 'yearly');
      return;
    }
    
    // Otherwise handle checkout directly
    setIsProcessing(true);
    try {
      const successUrl = `${window.location.origin}/app/subscription?success=true`;
      const cancelUrl = `${window.location.origin}/app/subscription?canceled=true`;
      
      const result = await checkoutMutation.mutateAsync({
        planType: planId.charAt(0).toUpperCase() + planId.slice(1) as PlanType,
        billingPeriod: billingPeriod === 'month' ? 'monthly' : 'yearly',
        successUrl,
        cancelUrl
      });
      
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-4xl mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 text-lg mb-6">
          Select the perfect plan for your NCLEX preparation journey. Upgrade, downgrade, or cancel anytime.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-lg">
          <button
            className={`px-6 py-2 rounded-md transition-all ${
              billingPeriod === 'month' ? 'bg-white shadow-md' : 'text-gray-600'
            }`}
            onClick={() => setBillingPeriod('month')}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-md transition-all ${
              billingPeriod === 'year' ? 'bg-white shadow-md' : 'text-gray-600'
            }`}
            onClick={() => setBillingPeriod('year')}
          >
            Yearly
            <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto md:items-stretch">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const yearlyPrice = plan.price * 12 * 0.8; // 20% discount

          return (
            <Card 
              key={plan.id}
              className={`relative border-2 transition-all hover:shadow-xl flex flex-col h-full ${
                plan.popular ? 'border-blue-500 shadow-lg md:scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                    <Sparkles className="size-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className={`mx-auto p-4 rounded-2xl bg-${plan.color}-100 w-fit mb-4`}>
                  <Icon className={`size-8 text-${plan.color}-600`} />
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl">${billingPeriod === 'month' ? plan.price : Math.round(yearlyPrice)}</span>
                    <span className="text-gray-600 ml-2">/{billingPeriod === 'month' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingPeriod === 'year' && plan.price > 0 && (
                    <p className="text-green-600 text-sm mt-2">
                      Save ${Math.round(plan.price * 12 * 0.2)}/year
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="size-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''
                  }`}
                  variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan || isProcessing || plan.id === 'free'}
                >
                  {isProcessing ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  {isCurrentPlan ? 'Current Plan' : plan.id === 'free' ? 'Free Plan' : plan.cta}
                </Button>

                {isCurrentPlan && (
                  <p className="text-center text-sm text-gray-600">
                    You're on this plan
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
        <div className="flex items-center gap-3 text-center md:text-left justify-center md:justify-start">
          <Shield className="size-8 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-gray-900">Secure Payment</p>
            <p className="text-gray-600 text-sm">256-bit SSL encryption</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-center md:text-left justify-center md:justify-start">
          <TrendingUp className="size-8 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-gray-900">Cancel Anytime</p>
            <p className="text-gray-600 text-sm">No long-term commitment</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-center md:text-left justify-center md:justify-start">
          <Users className="size-8 text-purple-600 flex-shrink-0" />
          <div>
            <p className="text-gray-900">10K+ Students</p>
            <p className="text-gray-600 text-sm">Trust NurseHaven</p>
          </div>
        </div>
      </div>

      {/* FAQ or Additional Info */}
      <div className="max-w-3xl mx-auto text-center pt-8 border-t">
        <p className="text-gray-600 mb-4">
          All plans include access to our community forum, mobile app, and regular content updates.
        </p>
        <p className="text-gray-600">
          Need help choosing? <a href="#" className="text-blue-600 hover:underline">Contact our team</a> or 
          <a href="#" className="text-blue-600 hover:underline ml-1">view detailed comparison</a>
        </p>
      </div>
    </div>
  );
}
