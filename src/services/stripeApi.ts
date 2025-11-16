// Stripe Payment Integration Service
// Mock implementation - In production, replace with actual Stripe API calls

export interface SubscriptionPlan {
  id: string;
  name: 'Free' | 'Pro' | 'Premium';
  displayName: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  recommended?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  paymentMethod?: PaymentMethod;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
}

export interface Invoice {
  id: string;
  number: string;
  userId: string;
  amount: number;
  amountPaid: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: string;
  paidAt?: string;
  description: string;
  pdf?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
}

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    displayName: 'Free Plan',
    price: 0,
    interval: 'month',
    stripePriceId: 'price_free',
    features: [
      '50 practice questions',
      '20 flashcards',
      'Basic analytics',
      'Community forum access',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro Plan',
    price: 29.99,
    interval: 'month',
    stripePriceId: 'price_pro_monthly',
    features: [
      'Unlimited practice questions',
      'Unlimited flashcards',
      'Advanced analytics',
      'CAT testing',
      'AI-powered insights',
      'Priority support',
      'Study planner'
    ],
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium',
    displayName: 'Premium Plan',
    price: 49.99,
    interval: 'month',
    stripePriceId: 'price_premium_monthly',
    features: [
      'Everything in Pro',
      'NCLEX Simulator',
      'Live tutoring sessions',
      'Personalized study plans',
      'Guaranteed pass program',
      'Complete book library',
      '1-on-1 mentorship',
      '24/7 priority support'
    ]
  }
];

// Mock data
let mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    userId: 'user_1',
    plan: SUBSCRIPTION_PLANS[2],
    status: 'active',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false
  }
];

let mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  }
];

let mockInvoices: Invoice[] = [
  {
    id: 'in_1',
    number: 'INV-2024-001',
    userId: 'user_1',
    amount: 49.99,
    amountPaid: 49.99,
    status: 'paid',
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Premium Plan - Monthly Subscription',
    pdf: 'https://invoice.stripe.com/mock'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= CHECKOUT ENDPOINTS =============

export async function createCheckoutSession(
  planId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession> {
  await delay(500);
  
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) throw new Error('Plan not found');
  
  // In production, create actual Stripe checkout session
  const session: CheckoutSession = {
    id: `cs_${Date.now()}`,
    url: `https://checkout.stripe.com/mock?session_id=cs_${Date.now()}`,
    status: 'open'
  };
  
  console.log('Creating checkout session for:', { planId, userId, plan: plan.name });
  
  return session;
}

export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<{ url: string }> {
  await delay(300);
  
  // In production, create actual Stripe billing portal session
  return {
    url: `https://billing.stripe.com/mock?user=${userId}`
  };
}

// ============= SUBSCRIPTION ENDPOINTS =============

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  await delay(200);
  
  const subscription = mockSubscriptions.find(
    s => s.userId === userId && s.status === 'active'
  );
  
  return subscription || null;
}

export async function getAllSubscriptions(userId: string): Promise<Subscription[]> {
  await delay(300);
  
  return mockSubscriptions.filter(s => s.userId === userId);
}

export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethodId: string
): Promise<Subscription> {
  await delay(500);
  
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) throw new Error('Plan not found');
  
  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    userId,
    plan,
    status: 'active',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    paymentMethod: mockPaymentMethods.find(pm => pm.id === paymentMethodId)
  };
  
  mockSubscriptions.push(subscription);
  return subscription;
}

export async function updateSubscription(
  subscriptionId: string,
  newPlanId: string
): Promise<Subscription> {
  await delay(500);
  
  const index = mockSubscriptions.findIndex(s => s.id === subscriptionId);
  if (index === -1) throw new Error('Subscription not found');
  
  const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === newPlanId);
  if (!newPlan) throw new Error('Plan not found');
  
  mockSubscriptions[index].plan = newPlan;
  
  return mockSubscriptions[index];
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Subscription> {
  await delay(400);
  
  const index = mockSubscriptions.findIndex(s => s.id === subscriptionId);
  if (index === -1) throw new Error('Subscription not found');
  
  if (cancelAtPeriodEnd) {
    mockSubscriptions[index].cancelAtPeriodEnd = true;
  } else {
    mockSubscriptions[index].status = 'canceled';
  }
  
  return mockSubscriptions[index];
}

export async function reactivateSubscription(subscriptionId: string): Promise<Subscription> {
  await delay(400);
  
  const index = mockSubscriptions.findIndex(s => s.id === subscriptionId);
  if (index === -1) throw new Error('Subscription not found');
  
  mockSubscriptions[index].cancelAtPeriodEnd = false;
  mockSubscriptions[index].status = 'active';
  
  return mockSubscriptions[index];
}

// ============= PAYMENT METHOD ENDPOINTS =============

export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  await delay(300);
  return mockPaymentMethods;
}

export async function addPaymentMethod(
  userId: string,
  paymentMethodData: {
    type: 'card' | 'bank_account';
    cardNumber?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvc?: string;
  }
): Promise<PaymentMethod> {
  await delay(500);
  
  const newPaymentMethod: PaymentMethod = {
    id: `pm_${Date.now()}`,
    type: paymentMethodData.type,
    brand: paymentMethodData.type === 'card' ? 'Visa' : undefined,
    last4: paymentMethodData.cardNumber?.slice(-4) || '0000',
    expiryMonth: paymentMethodData.expiryMonth,
    expiryYear: paymentMethodData.expiryYear,
    isDefault: mockPaymentMethods.length === 0
  };
  
  mockPaymentMethods.push(newPaymentMethod);
  return newPaymentMethod;
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
  await delay(300);
  
  const index = mockPaymentMethods.findIndex(pm => pm.id === paymentMethodId);
  if (index === -1) throw new Error('Payment method not found');
  
  mockPaymentMethods.splice(index, 1);
  return true;
}

export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<PaymentMethod> {
  await delay(300);
  
  // Remove default from all
  mockPaymentMethods.forEach(pm => pm.isDefault = false);
  
  const method = mockPaymentMethods.find(pm => pm.id === paymentMethodId);
  if (!method) throw new Error('Payment method not found');
  
  method.isDefault = true;
  return method;
}

// ============= INVOICE ENDPOINTS =============

export async function getInvoices(userId: string): Promise<Invoice[]> {
  await delay(300);
  return mockInvoices.filter(inv => inv.userId === userId);
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  await delay(200);
  return mockInvoices.find(inv => inv.id === invoiceId) || null;
}

export async function downloadInvoicePDF(invoiceId: string): Promise<string> {
  await delay(500);
  
  const invoice = mockInvoices.find(inv => inv.id === invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  
  return invoice.pdf || 'https://invoice.stripe.com/mock';
}

export async function getUpcomingInvoice(userId: string): Promise<Invoice | null> {
  await delay(300);
  
  const subscription = mockSubscriptions.find(
    s => s.userId === userId && s.status === 'active'
  );
  
  if (!subscription) return null;
  
  return {
    id: 'in_upcoming',
    number: 'UPCOMING',
    userId,
    amount: subscription.plan.price,
    amountPaid: 0,
    status: 'draft',
    dueDate: subscription.currentPeriodEnd,
    description: `${subscription.plan.displayName} - Next billing period`
  };
}

// ============= PAYMENT INTENT ENDPOINTS =============

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  userId: string
): Promise<PaymentIntent> {
  await delay(400);
  
  const paymentIntent: PaymentIntent = {
    id: `pi_${Date.now()}`,
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    status: 'requires_payment_method',
    clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
  };
  
  return paymentIntent;
}

export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<PaymentIntent> {
  await delay(800);
  
  // Simulate payment processing
  const success = Math.random() > 0.1; // 90% success rate
  
  return {
    id: paymentIntentId,
    amount: 4999, // Example amount
    currency: 'usd',
    status: success ? 'succeeded' : 'requires_action',
    clientSecret: `${paymentIntentId}_secret`
  };
}

// ============= REFUND ENDPOINTS =============

export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<{ id: string; amount: number; status: string }> {
  await delay(500);
  
  console.log('Creating refund:', { paymentIntentId, amount, reason });
  
  return {
    id: `re_${Date.now()}`,
    amount: amount || 4999,
    status: 'succeeded'
  };
}

// ============= WEBHOOK HANDLING =============

export async function handleStripeWebhook(
  event: {
    type: string;
    data: any;
  }
): Promise<void> {
  await delay(100);
  
  console.log('Handling Stripe webhook:', event.type);
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update subscription in database
      break;
    case 'customer.subscription.deleted':
      // Mark subscription as canceled
      break;
    case 'invoice.paid':
      // Record successful payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    case 'payment_intent.succeeded':
      // Confirm payment success
      break;
    default:
      console.log('Unhandled webhook event:', event.type);
  }
}

// ============= PROMO CODES =============

export async function validatePromoCode(code: string): Promise<{
  valid: boolean;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
}> {
  await delay(300);
  
  const promoCodes: Record<string, any> = {
    'NCLEX2024': { valid: true, discount: { type: 'percentage', value: 20 } },
    'SAVE50': { valid: true, discount: { type: 'fixed', value: 50 } },
    'STUDENT15': { valid: true, discount: { type: 'percentage', value: 15 } }
  };
  
  const promo = promoCodes[code.toUpperCase()];
  
  if (promo) {
    return promo;
  }
  
  return { valid: false };
}

export async function applyPromoCode(
  subscriptionId: string,
  promoCode: string
): Promise<Subscription> {
  await delay(400);
  
  const index = mockSubscriptions.findIndex(s => s.id === subscriptionId);
  if (index === -1) throw new Error('Subscription not found');
  
  console.log('Applied promo code:', promoCode, 'to subscription:', subscriptionId);
  
  return mockSubscriptions[index];
}
