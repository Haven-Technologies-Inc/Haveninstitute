import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../server';
import { asyncHandler, APIError } from '../middleware/errorHandler';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// ============================================================================
// STRIPE WEBHOOK ENDPOINT
// ============================================================================

// NOTE: This endpoint should use raw body parser, not JSON parser
// Configure this in server.ts with express.raw() for this specific route
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      throw new APIError('Missing stripe-signature header', 400);
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new APIError('Invalid signature', 400);
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Handle the event
    try {
      switch (event.type) {
        // Subscription events
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event);
          break;

        // Invoice events
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event);
          break;

        case 'invoice.finalized':
          await handleInvoiceFinalized(event);
          break;

        // Checkout events
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event);
          break;

        case 'checkout.session.expired':
          await handleCheckoutExpired(event);
          break;

        // Payment intent events
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing webhook event ${event.type}:`, error);
      // Don't throw error to Stripe - acknowledge receipt
    }

    res.json({ received: true });
  })
);

// ============================================================================
// WEBHOOK HANDLERS
// ============================================================================

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer: ${customerId}`);
    return;
  }

  // Determine plan from price ID
  const plan = getPlanFromPriceId(priceId);

  // Create or update subscription record
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      plan,
      status: subscription.status.toUpperCase(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      plan,
      status: subscription.status.toUpperCase(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription created for user ${user.id}: ${plan}`);
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: subscription.status.toUpperCase(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    },
  });

  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  });

  console.log(`Subscription deleted: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  const customerId = invoice.customer as string;
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer: ${customerId}`);
    return;
  }

  // Record payment
  // You could create a payments table to track all payments
  console.log(`Payment succeeded for user ${user.id}: ${invoice.amount_paid / 100}`);
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  const customerId = invoice.customer as string;
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer: ${customerId}`);
    return;
  }

  // Update subscription status
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAST_DUE' },
    });
  }

  console.log(`Payment failed for user ${user.id}`);
  // TODO: Send email notification
}

async function handleInvoiceFinalized(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log(`Invoice finalized: ${invoice.id}`);
  // You could send the invoice to the user via email
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  const customerId = session.customer as string;
  const userId = session.metadata?.userId;

  if (userId) {
    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });

    console.log(`Checkout completed for user ${userId}`);
  }
}

async function handleCheckoutExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  console.log(`Checkout session expired: ${session.id}`);
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log(`Payment intent succeeded: ${paymentIntent.id}`);
}

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log(`Payment intent failed: ${paymentIntent.id}`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPlanFromPriceId(priceId: string): string {
  // Map Stripe price IDs to your plan names
  // You should configure this based on your actual Stripe price IDs
  const pricePlanMap: Record<string, string> = {
    'price_monthly_basic': 'BASIC',
    'price_monthly_premium': 'PREMIUM',
    'price_yearly_basic': 'BASIC',
    'price_yearly_premium': 'PREMIUM',
  };

  return pricePlanMap[priceId] || 'BASIC';
}

// ============================================================================
// CREATE CHECKOUT SESSION (for frontend to call)
// ============================================================================

router.post('/create-checkout-session', asyncHandler(async (req: Request, res: Response) => {
  const { userId, priceId, successUrl, cancelUrl } = req.body;

  if (!userId || !priceId) {
    throw new APIError('userId and priceId are required', 400);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/canceled`,
    metadata: {
      userId,
    },
  });

  res.json({ sessionId: session.id, url: session.url });
}));

// ============================================================================
// CREATE CUSTOMER PORTAL SESSION (for subscription management)
// ============================================================================

router.post('/create-portal-session', asyncHandler(async (req: Request, res: Response) => {
  const { customerId, returnUrl } = req.body;

  if (!customerId) {
    throw new APIError('customerId is required', 400);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || process.env.FRONTEND_URL,
  });

  res.json({ url: session.url });
}));

export default router;

// Need to add this import at the top
import express from 'express';
