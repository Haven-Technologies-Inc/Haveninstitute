import { NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { getStripe } from '@/lib/stripe-client';
import {
  requireAuth,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// POST /api/stripe/checkout
// Create a Stripe Checkout session for a subscription plan.
//
// Body: { planId: string, billingPeriod: 'month' | 'year' }
//
// Looks up the SubscriptionPlan by planId, selects the correct Stripe price
// ID based on billingPeriod, and creates a Stripe Checkout session.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { planId, billingPeriod } = body;

    // --- Validation ---
    if (!planId) {
      return errorResponse('Plan ID is required');
    }

    if (!billingPeriod || !['month', 'year'].includes(billingPeriod)) {
      return errorResponse('Billing period must be "month" or "year"');
    }

    // --- Look up plan ---
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return errorResponse('Plan not found', 404);
    }

    if (!plan.isActive) {
      return errorResponse('This plan is no longer available');
    }

    // Select the correct Stripe price ID
    const stripePriceId =
      billingPeriod === 'month'
        ? plan.stripeMonthlyPriceId
        : plan.stripeYearlyPriceId;

    if (!stripePriceId) {
      return errorResponse(
        `No ${billingPeriod}ly pricing is available for this plan`
      );
    }

    // --- Get or create Stripe customer ---
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, fullName: true, stripeCustomerId: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // --- Build checkout session ---
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/account/subscription?success=true&plan=${plan.slug}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/account/subscription?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        planSlug: plan.slug,
        tier: plan.tier,
        billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: plan.id,
          tier: plan.tier,
        },
      },
    };

    // Add trial days if the plan has them
    if (plan.trialDays > 0) {
      checkoutParams.subscription_data!.trial_period_days = plan.trialDays;
    }

    const checkoutSession = await getStripe().checkout.sessions.create(
      checkoutParams
    );

    return successResponse({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
