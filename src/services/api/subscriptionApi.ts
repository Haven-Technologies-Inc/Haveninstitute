import api from '../api';

// ==================== SUBSCRIPTION TYPES ====================

export type PlanType = 'Free' | 'Pro' | 'Premium';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due' | 'trialing';

export interface PlanFeatures {
  maxQuestionsPerDay: number;
  maxCATTests: number;
  maxFlashcardDecks: number;
  aiTutorAccess: boolean;
  aiTutorMessagesPerDay: number;
  studyPlanGeneration: boolean;
  progressAnalytics: boolean;
  advancedAnalytics: boolean;
  offlineAccess: boolean;
  prioritySupport: boolean;
  customStudyPlans: boolean;
  groupStudyFeatures: boolean;
  exportFeatures: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  pricing: {
    monthly: number;
    yearly: number;
  };
  features: PlanFeatures;
  popular: boolean;
}

export interface Subscription {
  id: string;
  planType: PlanType;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  amount: number;
  currency: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  features: PlanFeatures;
  daysRemaining: number;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod: string;
  description: string;
  receiptUrl?: string;
  invoicePdf?: string;
  createdAt: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

// ==================== SUBSCRIPTION API ====================

export const subscriptionApi = {
  // Get available plans
  async getPlans(): Promise<Plan[]> {
    const response = await api.get('/subscriptions/plans');
    return response.data.data;
  },

  // Get current subscription
  async getCurrentSubscription(): Promise<Subscription> {
    const response = await api.get('/subscriptions/current');
    return response.data.data;
  },

  // Create checkout session
  async createCheckoutSession(
    planType: PlanType,
    billingPeriod: BillingPeriod,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> {
    const response = await api.post('/subscriptions/checkout', {
      planType,
      billingPeriod,
      successUrl,
      cancelUrl
    });
    return response.data.data;
  },

  // Complete checkout
  async completeCheckout(sessionId: string): Promise<Subscription> {
    const response = await api.post('/subscriptions/checkout/complete', { sessionId });
    return response.data.data;
  },

  // Cancel subscription
  async cancelSubscription(immediately = false): Promise<Subscription> {
    const response = await api.post('/subscriptions/cancel', { immediately });
    return response.data.data;
  },

  // Reactivate subscription
  async reactivateSubscription(): Promise<Subscription> {
    const response = await api.post('/subscriptions/reactivate');
    return response.data.data;
  },

  // Change plan
  async changePlan(planType: PlanType, billingPeriod: BillingPeriod): Promise<{ subscription: Subscription }> {
    const response = await api.post('/subscriptions/change-plan', { planType, billingPeriod });
    return response.data.data;
  },

  // Get payment history
  async getPaymentHistory(limit = 20): Promise<PaymentTransaction[]> {
    const response = await api.get(`/subscriptions/payments?limit=${limit}`);
    return response.data.data;
  },

  // Get billing portal URL
  async getBillingPortalUrl(returnUrl: string): Promise<string> {
    const response = await api.get(`/subscriptions/billing-portal?returnUrl=${encodeURIComponent(returnUrl)}`);
    return response.data.data.url;
  }
};

// ==================== ADMIN API ====================

export const adminSubscriptionApi = {
  // Get all subscriptions
  async getAllSubscriptions(params?: {
    status?: string;
    planType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ subscriptions: any[]; total: number }> {
    const response = await api.get('/subscriptions/admin/all', { params });
    return response.data.data;
  },

  // Get subscription stats
  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    canceled: number;
    pastDue: number;
    byPlan: { plan: string; count: number }[];
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    const response = await api.get('/subscriptions/admin/stats');
    return response.data.data;
  },

  // Update subscription
  async updateSubscription(subscriptionId: string, updates: {
    planType?: PlanType;
    status?: string;
    currentPeriodEnd?: string;
  }): Promise<any> {
    const response = await api.put(`/subscriptions/admin/${subscriptionId}`, updates);
    return response.data.data;
  },

  // Grant subscription
  async grantSubscription(userId: string, planType: PlanType, durationDays: number): Promise<any> {
    const response = await api.post('/subscriptions/admin/grant', {
      userId,
      planType,
      durationDays
    });
    return response.data.data;
  }
};

export default subscriptionApi;
