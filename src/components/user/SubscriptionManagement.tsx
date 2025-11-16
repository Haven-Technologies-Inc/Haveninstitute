import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import {
  Check,
  Crown,
  Star,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Shield,
  Zap,
  BookOpen,
  Users,
  MessageSquare,
  Award,
  Loader2
} from 'lucide-react';
import {
  SUBSCRIPTION_PLANS,
  createCheckoutSession,
  getActiveSubscription,
  cancelSubscription,
  reactivateSubscription,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getInvoices,
  downloadInvoicePDF,
  validatePromoCode,
  type Subscription,
  type PaymentMethod,
  type Invoice
} from '../../services/stripeApi';
import { toast } from 'sonner@2.0.3';

export function SubscriptionManagement() {
  // State
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Dialogs
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [addPaymentDialog, setAddPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // Forms
  const [promoCode, setPromoCode] = useState('');
  const [promoValid, setPromoValid] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState<any>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sub, methods, inv] = await Promise.all([
        getActiveSubscription('user_1'),
        getPaymentMethods('user_1'),
        getInvoices('user_1')
      ]);
      
      setSubscription(sub);
      setPaymentMethods(methods);
      setInvoices(inv);
    } catch (error) {
      toast.error('Failed to load subscription data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan: any) => {
    setSelectedPlan(plan);
    setUpgradeDialog(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    try {
      const session = await createCheckoutSession(
        selectedPlan.id,
        'user_1',
        window.location.origin + '/dashboard?success=true',
        window.location.origin + '/dashboard?canceled=true'
      );
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      await cancelSubscription(subscription.id, true);
      toast.success('Subscription will be canceled at the end of the billing period');
      setCancelDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    
    try {
      await reactivateSubscription(subscription.id);
      toast.success('Subscription reactivated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      await addPaymentMethod('user_1', {
        type: 'card',
        cardNumber: cardDetails.number,
        expiryMonth: parseInt(cardDetails.expiry.split('/')[0]),
        expiryYear: parseInt('20' + cardDetails.expiry.split('/')[1]),
        cvc: cardDetails.cvc
      });
      
      toast.success('Payment method added successfully');
      setAddPaymentDialog(false);
      setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to add payment method');
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      await deletePaymentMethod(methodId);
      toast.success('Payment method removed');
      loadData();
    } catch (error) {
      toast.error('Failed to remove payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      await setDefaultPaymentMethod('user_1', methodId);
      toast.success('Default payment method updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update default payment method');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const url = await downloadInvoicePDF(invoiceId);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleValidatePromoCode = async () => {
    try {
      const result = await validatePromoCode(promoCode);
      if (result.valid && result.discount) {
        setPromoValid(true);
        setPromoDiscount(result.discount);
        toast.success('Promo code applied!');
      } else {
        setPromoValid(false);
        setPromoDiscount(null);
        toast.error('Invalid promo code');
      }
    } catch (error) {
      toast.error('Failed to validate promo code');
    }
  };

  const calculateDiscountedPrice = (price: number) => {
    if (!promoValid || !promoDiscount) return price;
    
    if (promoDiscount.type === 'percentage') {
      return price * (1 - promoDiscount.value / 100);
    } else {
      return Math.max(0, price - promoDiscount.value);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {subscription ? (
        <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="dark:text-white">Current Subscription</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Your active subscription plan
                </CardDescription>
              </div>
              <Badge className={
                subscription.plan.name === 'Premium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                subscription.plan.name === 'Pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }>
                {subscription.plan.name === 'Premium' && <Crown className="size-3 mr-1" />}
                {subscription.plan.name === 'Pro' && <Star className="size-3 mr-1" />}
                {subscription.plan.displayName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Cost</p>
                <p className="text-2xl dark:text-white">${subscription.plan.price}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Renewal Date</p>
                <p className="text-lg dark:text-white">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <Badge className={
                  subscription.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  subscription.status === 'past_due' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }>
                  {subscription.status}
                </Badge>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-800 dark:text-red-200 font-semibold">
                      Subscription Scheduled for Cancellation
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                      You can reactivate it anytime before then.
                    </p>
                    <Button 
                      onClick={handleReactivateSubscription}
                      size="sm"
                      className="mt-3 bg-red-600 hover:bg-red-700"
                    >
                      Reactivate Subscription
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {subscription.plan.name !== 'Premium' && (
                <Button 
                  onClick={() => handleUpgrade(SUBSCRIPTION_PLANS.find(p => p.name === 'Premium'))}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Crown className="size-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
              {!subscription.cancelAtPeriodEnd && (
                <Button 
                  onClick={() => setCancelDialog(true)}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Subscription Plans */
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl dark:text-white mb-2">Choose Your Plan</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select the perfect plan for your NCLEX preparation journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${
                  plan.recommended 
                    ? 'border-blue-500 border-2 shadow-lg dark:border-blue-600' 
                    : 'border-2 dark:border-gray-700'
                } dark:bg-gray-800`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl dark:text-white">{plan.displayName}</CardTitle>
                    {plan.name === 'Premium' && <Crown className="size-6 text-yellow-500" />}
                    {plan.name === 'Pro' && <Star className="size-6 text-blue-500" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl dark:text-white">
                      ${promoValid ? calculateDiscountedPrice(plan.price).toFixed(2) : plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                  </div>
                  {promoValid && plan.price > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Save ${(plan.price - calculateDiscountedPrice(plan.price)).toFixed(2)} with promo code!
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleUpgrade(plan)}
                    className={
                      plan.recommended 
                        ? 'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : plan.name === 'Premium'
                        ? 'w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                        : 'w-full'
                    }
                    variant={plan.name === 'Free' ? 'outline' : 'default'}
                    disabled={plan.name === 'Free'}
                  >
                    {plan.name === 'Free' ? 'Current Plan' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Promo Code */}
          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                    Have a promo code?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter code..."
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Button onClick={handleValidatePromoCode}>
                      Apply
                    </Button>
                  </div>
                </div>
                {promoValid && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 font-semibold flex items-center gap-2">
                      <Check className="size-5" />
                      Promo Applied!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      {promoDiscount.type === 'percentage' 
                        ? `${promoDiscount.value}% off` 
                        : `$${promoDiscount.value} off`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Methods */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="dark:text-white">Payment Methods</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Manage your payment methods
              </CardDescription>
            </div>
            <Button onClick={() => setAddPaymentDialog(true)} size="sm">
              <Plus className="size-4 mr-2" />
              Add Card
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CreditCard className="size-12 mx-auto mb-4" />
              <p>No payment methods added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-8 text-gray-400" />
                    <div>
                      <p className="dark:text-white">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button 
                        onClick={() => handleSetDefaultPaymentMethod(method.id)}
                        size="sm"
                        variant="outline"
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Billing History</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Your recent invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="size-12 mx-auto mb-4" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400">Invoice</th>
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 dark:text-white">{invoice.number}</td>
                      <td className="py-3 dark:text-white">{formatDate(invoice.dueDate)}</td>
                      <td className="py-3 dark:text-white">${invoice.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <Badge className={
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button 
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          size="sm"
                          variant="ghost"
                        >
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialog} onOpenChange={setUpgradeDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Subscribe to {selectedPlan?.displayName}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Confirm your subscription details
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                  <span className="dark:text-white font-semibold">{selectedPlan.displayName}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="dark:text-white font-semibold">
                    ${promoValid ? calculateDiscountedPrice(selectedPlan.price).toFixed(2) : selectedPlan.price}/{selectedPlan.interval}
                  </span>
                </div>
                {promoValid && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      -${(selectedPlan.price - calculateDiscountedPrice(selectedPlan.price)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <ul className="space-y-2">
                {selectedPlan.features.slice(0, 5).map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-green-600" />
                    <span className="dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialog(false)}>Cancel</Button>
            <Button onClick={handleSubscribe} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Continue to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Cancel Subscription</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                You'll lose access to all premium features at the end of your current billing period.
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your subscription will remain active until {subscription && formatDate(subscription.currentPeriodEnd)}.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>Keep Subscription</Button>
            <Button onClick={handleCancelSubscription} variant="destructive">
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={addPaymentDialog} onOpenChange={setAddPaymentDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add Payment Method</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Add a new credit or debit card
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Card Number</label>
              <Input
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Expiry Date</label>
                <Input
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">CVC</label>
                <Input
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                  placeholder="123"
                  maxLength={4}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Cardholder Name</label>
              <Input
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                placeholder="John Doe"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <Shield className="size-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPaymentMethod}>
              <Plus className="size-4 mr-2" />
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
