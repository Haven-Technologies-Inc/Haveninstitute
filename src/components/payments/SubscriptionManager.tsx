import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Crown, 
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Loader2,
  Star
} from 'lucide-react';
import { SubscriptionPlans } from './SubscriptionPlans';
import { PaymentMethods } from './PaymentMethods';
import { BillingHistory } from './BillingHistory';
import { useAuth } from '../auth/AuthContext';
import { 
  useCurrentSubscription, 
  useCancelSubscription, 
  useReactivateSubscription,
  useCreateCheckout,
  useGetBillingPortalUrl
} from '../../services/hooks/useSubscription';
import type { PlanType, BillingPeriod } from '../../services/api/subscriptionApi';

interface SubscriptionManagerProps {
  onBack: () => void;
}

export function SubscriptionManager({ onBack }: SubscriptionManagerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Real subscription data from API
  const { data: subscription, isLoading: loadingSubscription, refetch } = useCurrentSubscription();
  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();
  const checkoutMutation = useCreateCheckout();
  const billingPortalMutation = useGetBillingPortalUrl();

  // Derived values from subscription
  const currentPlan = subscription?.planType?.toLowerCase() || 'free';
  const billingCycle = subscription?.billingPeriod || 'monthly';
  const subscriptionStatus = subscription?.status || 'active';
  const nextBillingDate = subscription?.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';
  const amount = subscription?.amount || 0;

  const handleSelectPlan = async (planId: string, period: BillingPeriod = 'monthly') => {
    if (planId === currentPlan) return;
    
    setIsProcessing(true);
    try {
      const successUrl = `${window.location.origin}/app/subscription?success=true`;
      const cancelUrl = `${window.location.origin}/app/subscription?canceled=true`;
      
      const result = await checkoutMutation.mutateAsync({
        planType: planId.charAt(0).toUpperCase() + planId.slice(1) as PlanType,
        billingPeriod: period,
        successUrl,
        cancelUrl
      });
      
      // Redirect to Stripe checkout
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

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await cancelMutation.mutateAsync(false); // Cancel at period end
      refetch();
      alert('Subscription cancelled. You will retain access until the end of your billing period.');
    } catch (error: any) {
      console.error('Cancel error:', error);
      alert(error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsProcessing(true);
    try {
      await reactivateMutation.mutateAsync();
      refetch();
      alert('Subscription reactivated successfully!');
    } catch (error: any) {
      console.error('Reactivate error:', error);
      alert(error.message || 'Failed to reactivate subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageBilling = async () => {
    setIsProcessing(true);
    try {
      const returnUrl = window.location.href;
      const url = await billingPortalMutation.mutateAsync(returnUrl);
      window.location.href = url;
    } catch (error: any) {
      console.error('Billing portal error:', error);
      alert(error.message || 'Failed to open billing portal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanIcon = () => {
    switch (currentPlan) {
      case 'premium': return Crown;
      case 'pro': return Zap;
      default: return Star;
    }
  };

  const PlanIcon = getPlanIcon();

  // Loading state
  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl mb-1 dark:text-white">Subscription & Billing</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your subscription, payment methods, and billing</p>
            </div>
            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap justify-center gap-1 sm:grid sm:grid-cols-4 mb-6 sm:mb-8 h-auto p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Change Plan</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Current Subscription Card */}
            <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                      <Crown className="size-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl capitalize">{currentPlan} Plan</CardTitle>
                      <CardDescription>Your current subscription</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${
                    subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                    subscriptionStatus === 'canceled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {subscriptionStatus === 'active' && <CheckCircle2 className="size-3 mr-1" />}
                    {subscriptionStatus === 'past_due' && <AlertCircle className="size-3 mr-1" />}
                    {subscriptionStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Billing Cycle</p>
                    <p className="text-xl text-gray-900 capitalize">{billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Next Billing Date</p>
                    <p className="text-xl text-gray-900">{nextBillingDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Amount</p>
                    <p className="text-xl text-gray-900">${amount.toFixed(2)}/{billingCycle === 'yearly' ? 'year' : 'month'}</p>
                  </div>
                </div>

                {subscription?.cancelAtPeriodEnd && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-5 text-yellow-600" />
                      <span className="text-yellow-800">Your subscription will end on {nextBillingDate}</span>
                    </div>
                    <Button size="sm" onClick={handleReactivateSubscription} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="size-4 animate-spin" /> : 'Reactivate'}
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 pt-6 border-t">
                  <Button onClick={() => setActiveTab('plans')} disabled={isProcessing}>
                    <Zap className="size-4 mr-2" />
                    Change Plan
                  </Button>
                  <Button variant="outline" onClick={handleManageBilling} disabled={isProcessing}>
                    <CreditCard className="size-4 mr-2" />
                    {isProcessing ? <Loader2 className="size-4 animate-spin ml-2" /> : 'Manage Billing'}
                  </Button>
                  {subscriptionStatus === 'active' && !subscription?.cancelAtPeriodEnd && currentPlan !== 'free' && (
                    <Button 
                      variant="ghost" 
                      onClick={handleCancelSubscription} 
                      className="text-red-600 hover:text-red-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="size-4 animate-spin" /> : 'Cancel Subscription'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features Included */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Your Pro Features</CardTitle>
                <CardDescription>Everything included in your current plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Unlimited practice questions',
                    'All flashcard decks',
                    'Advanced progress tracking',
                    'CAT testing (5 tests/month)',
                    'AI-powered analytics',
                    'Study planner with reminders',
                    'Group study sessions',
                    'Priority email support',
                    'Ad-free experience'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600">Member Since</p>
                    <Calendar className="size-5 text-blue-600" />
                  </div>
                  <p className="text-2xl text-gray-900">Jan 2024</p>
                  <p className="text-gray-600 text-sm mt-1">11 months</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600">Questions Answered</p>
                    <CheckCircle2 className="size-5 text-green-600" />
                  </div>
                  <p className="text-2xl text-gray-900">2,547</p>
                  <p className="text-gray-600 text-sm mt-1">This month: 234</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600">CAT Tests Taken</p>
                    <Zap className="size-5 text-purple-600" />
                  </div>
                  <p className="text-2xl text-gray-900">12</p>
                  <p className="text-gray-600 text-sm mt-1">5 remaining this month</p>
                </CardContent>
              </Card>
            </div>

            {/* Upgrade Prompt */}
            {currentPlan === 'pro' && (
              <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl text-gray-900 mb-2">Upgrade to Premium</h3>
                      <p className="text-gray-700 mb-4">
                        Get unlimited CAT testing, 1-on-1 tutor sessions, and personalized AI study plans.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">Unlimited CAT Tests</Badge>
                        <Badge variant="outline">1-on-1 Tutoring</Badge>
                        <Badge variant="outline">AI Study Plans</Badge>
                        <Badge variant="outline">Money-back Guarantee</Badge>
                      </div>
                      <Button onClick={() => setActiveTab('plans')} className="bg-gradient-to-r from-purple-600 to-blue-600">
                        Upgrade Now
                        <ArrowRight className="size-4 ml-2" />
                      </Button>
                    </div>
                    <Crown className="size-16 text-purple-300 flex-shrink-0 ml-4" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <SubscriptionPlans onSelectPlan={handleSelectPlan} currentPlan={currentPlan} />
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <PaymentMethods />
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing">
            <BillingHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
