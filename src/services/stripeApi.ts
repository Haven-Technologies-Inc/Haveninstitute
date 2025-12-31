/**
 * Stripe Payment Integration Service
 * Production-ready implementation using backend API calls
 */

import api from './api';

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

// Subscription Plans - these should match your Stripe dashboard
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
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
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
    stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
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

// ============= CHECKOUT ENDPOINTS =============

export async function createCheckoutSession(
  planId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession> {
  const response = await api.post('/stripe/checkout-session', {
    planId,
    successUrl,
    cancelUrl
  });
  return response.data.data;
}

export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const response = await api.post('/stripe/billing-portal', {
    returnUrl
  });
  return response.data.data;
}

// ============= SUBSCRIPTION ENDPOINTS =============

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  try {
    const response = await api.get('/stripe/subscription');
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getAllSubscriptions(userId: string): Promise<Subscription[]> {
  const response = await api.get('/stripe/subscriptions');
  return response.data.data || [];
}

export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethodId: string
): Promise<Subscription> {
  const response = await api.post('/stripe/subscription', {
    planId,
    paymentMethodId
  });
  return response.data.data;
}

export async function updateSubscription(
  subscriptionId: string,
  newPlanId: string
): Promise<Subscription> {
  const response = await api.put(`/stripe/subscription/${subscriptionId}`, {
    planId: newPlanId
  });
  return response.data.data;
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Subscription> {
  const response = await api.post(`/stripe/subscription/${subscriptionId}/cancel`, {
    cancelAtPeriodEnd
  });
  return response.data.data;
}

export async function reactivateSubscription(subscriptionId: string): Promise<Subscription> {
  const response = await api.post(`/stripe/subscription/${subscriptionId}/reactivate`);
  return response.data.data;
}

// ============= PAYMENT METHOD ENDPOINTS =============

export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const response = await api.get('/stripe/payment-methods');
  return response.data.data || [];
}

export async function addPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<PaymentMethod> {
  const response = await api.post('/stripe/payment-methods', {
    paymentMethodId
  });
  return response.data.data;
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
  await api.delete(`/stripe/payment-methods/${paymentMethodId}`);
  return true;
}

export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<PaymentMethod> {
  const response = await api.put(`/stripe/payment-methods/${paymentMethodId}/default`);
  return response.data.data;
}

// ============= INVOICE ENDPOINTS =============

export async function getInvoices(userId: string): Promise<Invoice[]> {
  const response = await api.get('/stripe/invoices');
  return response.data.data || [];
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  try {
    const response = await api.get(`/stripe/invoices/${invoiceId}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function downloadInvoicePDF(invoiceId: string): Promise<string> {
  const response = await api.get(`/stripe/invoices/${invoiceId}/pdf`);
  return response.data.data.url;
}

export async function getUpcomingInvoice(userId: string): Promise<Invoice | null> {
  try {
    const response = await api.get('/stripe/invoices/upcoming');
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// ============= PAYMENT INTENT ENDPOINTS =============

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  userId: string
): Promise<PaymentIntent> {
  const response = await api.post('/stripe/payment-intent', {
    amount: Math.round(amount * 100), // Convert to cents
    currency
  });
  return response.data.data;
}

export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<PaymentIntent> {
  const response = await api.post(`/stripe/payment-intent/${paymentIntentId}/confirm`, {
    paymentMethodId
  });
  return response.data.data;
}

// ============= PROMO CODES =============

export async function validatePromoCode(code: string): Promise<{
  valid: boolean;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
}> {
  try {
    const response = await api.post('/stripe/promo-code/validate', { code });
    return response.data.data;
  } catch (error: any) {
    return { valid: false };
  }
}

export async function applyPromoCode(
  subscriptionId: string,
  promoCode: string
): Promise<Subscription> {
  const response = await api.post(`/stripe/subscription/${subscriptionId}/promo`, {
    promoCode
  });
  return response.data.data;
}

// ============= STRIPE ELEMENTS SETUP =============

export function getStripePublishableKey(): string {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('Stripe publishable key is not configured');
  }
  return key;
}
