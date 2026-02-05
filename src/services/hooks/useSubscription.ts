import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi, adminSubscriptionApi } from '../api/subscriptionApi';
import type { PlanType, BillingPeriod } from '../api/subscriptionApi';

// Query keys
export const subscriptionKeys = {
  all: ['subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  current: () => [...subscriptionKeys.all, 'current'] as const,
  payments: () => [...subscriptionKeys.all, 'payments'] as const,
  adminAll: (params?: any) => [...subscriptionKeys.all, 'admin', 'all', params] as const,
  adminStats: () => [...subscriptionKeys.all, 'admin', 'stats'] as const,
};

// ==================== USER SUBSCRIPTION HOOKS ====================

export function usePlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionApi.getPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: () => subscriptionApi.getCurrentSubscription(),
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: ({
      planType,
      billingPeriod,
      successUrl,
      cancelUrl,
    }: {
      planType: PlanType;
      billingPeriod: BillingPeriod;
      successUrl: string;
      cancelUrl: string;
    }) => subscriptionApi.createCheckoutSession(planType, billingPeriod, successUrl, cancelUrl),
  });
}

export function useCompleteCheckout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => subscriptionApi.completeCheckout(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (immediately: boolean = false) => subscriptionApi.cancelSubscription(immediately),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => subscriptionApi.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planType, billingPeriod }: { planType: PlanType; billingPeriod: BillingPeriod }) =>
      subscriptionApi.changePlan(planType, billingPeriod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });
}

export function usePaymentHistory(limit = 20) {
  return useQuery({
    queryKey: subscriptionKeys.payments(),
    queryFn: () => subscriptionApi.getPaymentHistory(limit),
  });
}

export function useGetBillingPortalUrl() {
  return useMutation({
    mutationFn: (returnUrl: string) => subscriptionApi.getBillingPortalUrl(returnUrl),
  });
}

// ==================== ADMIN HOOKS ====================

export function useAdminSubscriptions(params?: {
  status?: string;
  planType?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: subscriptionKeys.adminAll(params),
    queryFn: () => adminSubscriptionApi.getAllSubscriptions(params),
  });
}

export function useAdminSubscriptionStats() {
  return useQuery({
    queryKey: subscriptionKeys.adminStats(),
    queryFn: () => adminSubscriptionApi.getSubscriptionStats(),
  });
}

export function useAdminUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, updates }: { subscriptionId: string; updates: any }) =>
      adminSubscriptionApi.updateSubscription(subscriptionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useAdminGrantSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, planType, durationDays }: { 
      userId: string; 
      planType: PlanType; 
      durationDays: number 
    }) => adminSubscriptionApi.grantSubscription(userId, planType, durationDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}
