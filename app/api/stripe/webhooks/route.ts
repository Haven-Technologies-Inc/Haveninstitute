import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-01-28.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

// ---------------------------------------------------------------------------
// POST /api/stripe/webhooks
// Stripe webhook handler.
//
// Events handled:
// - checkout.session.completed
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`Webhook processing error for ${event.type}:`, error);
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Helpers for extracting data from new Stripe API structures
// ---------------------------------------------------------------------------

function getSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails) return null;
  return typeof subDetails.subscription === 'string'
    ? subDetails.subscription
    : subDetails.subscription?.id ?? null;
}

function getItemPeriod(sub: Stripe.Subscription): {
  start: Date;
  end: Date;
} {
  const item = sub.items.data[0];
  if (item) {
    return {
      start: new Date(item.current_period_start * 1000),
      end: new Date(item.current_period_end * 1000),
    };
  }
  // Fallback to billing_cycle_anchor
  return {
    start: new Date(sub.billing_cycle_anchor * 1000),
    end: new Date(sub.billing_cycle_anchor * 1000),
  };
}

// ---------------------------------------------------------------------------
// checkout.session.completed
// Look up plan from Stripe priceId -> SubscriptionPlan to determine tier.
// Create subscription record and upgrade user.
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  checkoutSession: Stripe.Checkout.Session
) {
  const userId = checkoutSession.metadata?.userId;
  if (!userId || !checkoutSession.subscription) return;

  const subId =
    typeof checkoutSession.subscription === 'string'
      ? checkoutSession.subscription
      : checkoutSession.subscription.id;

  // Retrieve full subscription from Stripe
  const sub = await stripe.subscriptions.retrieve(subId);
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return;

  // Look up plan from DB using Stripe price ID
  const plan = await prisma.subscriptionPlan.findFirst({
    where: {
      OR: [
        { stripeMonthlyPriceId: priceId },
        { stripeYearlyPriceId: priceId },
      ],
    },
  });

  const tier =
    plan?.tier ??
    (checkoutSession.metadata?.tier as 'Pro' | 'Premium') ??
    'Pro';
  const billingPeriod: 'month' | 'year' =
    sub.items.data[0]?.price.recurring?.interval === 'year' ? 'year' : 'month';
  const period = getItemPeriod(sub);

  // Update user's subscription tier
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: tier },
  });

  const customerId =
    typeof checkoutSession.customer === 'string'
      ? checkoutSession.customer
      : checkoutSession.customer?.id ?? null;

  // Create subscription record
  await prisma.subscription.create({
    data: {
      userId,
      planType: tier,
      status: 'active',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subId,
      stripePriceId: priceId,
      billingPeriod,
      amount: sub.items.data[0]?.price.unit_amount
        ? sub.items.data[0].price.unit_amount / 100
        : null,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      ...(sub.trial_start && {
        trialStart: new Date(sub.trial_start * 1000),
      }),
      ...(sub.trial_end && { trialEnd: new Date(sub.trial_end * 1000) }),
    },
  });

  // Send subscription activated notification
  await sendNotification({
    userId,
    type: 'subscription',
    title: `Welcome to ${plan?.name ?? tier}!`,
    message: `Your ${plan?.name ?? tier} subscription is now active. Enjoy all your premium features!`,
    actionUrl: '/dashboard',
    sendEmail: true,
  });
}

// ---------------------------------------------------------------------------
// customer.subscription.updated
// Handle plan changes, period renewals, and status changes.
// ---------------------------------------------------------------------------

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const stripeSubId = sub.id;
  const priceId = sub.items.data[0]?.price.id;

  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubId },
  });

  if (!existingSub) return;

  const userId = existingSub.userId;

  // Look up plan from the new price
  let newTier = existingSub.planType;
  if (priceId) {
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        OR: [
          { stripeMonthlyPriceId: priceId },
          { stripeYearlyPriceId: priceId },
        ],
      },
    });
    if (plan) {
      newTier = plan.tier;
    }
  }

  // Map Stripe status to our status
  const statusMap: Record<
    string,
    'active' | 'canceled' | 'past_due' | 'expired'
  > = {
    active: 'active',
    trialing: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'past_due',
    incomplete_expired: 'expired',
    paused: 'canceled',
  };

  const newStatus = statusMap[sub.status] ?? 'active';
  const billingPeriod: 'month' | 'year' =
    sub.items.data[0]?.price.recurring?.interval === 'year' ? 'year' : 'month';
  const period = getItemPeriod(sub);

  // Update subscription record
  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: {
      planType: newTier,
      status: newStatus,
      stripePriceId: priceId ?? existingSub.stripePriceId,
      billingPeriod,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      ...(sub.canceled_at && {
        canceledAt: new Date(sub.canceled_at * 1000),
      }),
    },
  });

  // Update user tier
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier:
        newStatus === 'active' ? newTier : existingSub.planType,
    },
  });

  // Notify user if plan changed
  if (newTier !== existingSub.planType) {
    await sendNotification({
      userId,
      type: 'subscription',
      title: `Plan changed to ${newTier}`,
      message: `Your subscription has been updated to the ${newTier} plan.`,
      actionUrl: '/account/subscription',
      sendEmail: true,
    });
  }

  // Notify if subscription set to cancel at period end
  if (sub.cancel_at_period_end && !existingSub.cancelAtPeriodEnd) {
    const endDate = period.end.toLocaleDateString('en-US', {
      dateStyle: 'long',
    });

    await sendNotification({
      userId,
      type: 'subscription',
      title: 'Subscription cancellation scheduled',
      message: `Your subscription will be canceled at the end of your current billing period (${endDate}). You'll continue to have access until then.`,
      actionUrl: '/account/subscription',
      sendEmail: true,
    });
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.deleted
// Downgrade user to Free tier.
// ---------------------------------------------------------------------------

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const stripeSubId = sub.id;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubId },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
      endedAt: new Date(),
    },
  });

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubId },
    select: { userId: true },
  });

  if (!subscription) return;

  await prisma.user.update({
    where: { id: subscription.userId },
    data: { subscriptionTier: 'Free' },
  });

  await sendNotification({
    userId: subscription.userId,
    type: 'subscription',
    title: 'Subscription ended',
    message:
      'Your subscription has ended and your account has been moved to the Free plan. Your data is preserved and you can resubscribe at any time.',
    actionUrl: '/account/subscription',
    sendEmail: true,
  });
}

// ---------------------------------------------------------------------------
// invoice.payment_succeeded
// Record successful payment.
// ---------------------------------------------------------------------------

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripeSubId = getSubscriptionId(invoice);
  if (!stripeSubId || !invoice.customer) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubId },
    select: { id: true, userId: true, planType: true },
  });

  if (!subscription) return;

  await prisma.paymentTransaction.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: (invoice.amount_paid ?? 0) / 100,
      currency: invoice.currency?.toUpperCase() ?? 'USD',
      status: 'succeeded',
      description: `Payment for ${subscription.planType} subscription`,
      receiptUrl: invoice.hosted_invoice_url ?? null,
      invoicePdf: invoice.invoice_pdf ?? null,
    },
  });

  const amountFormatted = ((invoice.amount_paid ?? 0) / 100).toFixed(2);

  await sendNotification({
    userId: subscription.userId,
    type: 'billing',
    title: 'Payment received',
    message: `We've received your payment of $${amountFormatted} for your ${subscription.planType} subscription.`,
    actionUrl: '/account/subscription',
    sendEmail: true,
  });
}

// ---------------------------------------------------------------------------
// invoice.payment_failed
// Record failed payment and notify user.
// ---------------------------------------------------------------------------

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeSubId = getSubscriptionId(invoice);
  if (!stripeSubId || !invoice.customer) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubId },
    select: { id: true, userId: true, planType: true },
  });

  if (!subscription) return;

  const failureMessage = 'Payment could not be processed';

  await prisma.paymentTransaction.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: (invoice.amount_due ?? 0) / 100,
      currency: invoice.currency?.toUpperCase() ?? 'USD',
      status: 'failed',
      description: `Failed payment for ${subscription.planType} subscription`,
      failureMessage,
    },
  });

  const amountFormatted = ((invoice.amount_due ?? 0) / 100).toFixed(2);

  await sendNotification({
    userId: subscription.userId,
    type: 'billing',
    title: 'Payment failed',
    message: `We were unable to process your payment of $${amountFormatted}. Please update your payment method to avoid service interruption.`,
    actionUrl: '/account/subscription',
    sendEmail: true,
    sendSms: true,
  });
}
