// ============================================================================
// STRIPE WEBHOOK HANDLER
// ============================================================================
// Handle Stripe webhook events for payment processing
// This file can be used with Supabase Edge Functions or a separate backend

import { supabase } from '../lib/supabase';
import type {
  StripeWebhookEvent,
  StripeSubscription,
  StripeInvoice,
  Subscription
} from '../lib/types';

// ============================================================================
// WEBHOOK EVENT HANDLERS
// ============================================================================

/**
 * Main webhook handler - routes events to appropriate handlers
 */
export const handleStripeWebhook = async (event: StripeWebhookEvent): Promise<void> => {
  // Webhook event handled: ${event.type}

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

      // Payment events
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

      // Customer events
      case 'customer.created':
        await handleCustomerCreated(event);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(event);
        break;
      case 'customer.deleted':
        await handleCustomerDeleted(event);
        break;

      default:
        // Unhandled event type: ${event.type}
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    throw error;
  }
};

// ============================================================================
// SUBSCRIPTION EVENT HANDLERS
// ============================================================================

/**
 * Handle subscription.created event
 */
const handleSubscriptionCreated = async (event: StripeWebhookEvent): Promise<void> => {
  const subscription = event.data.object as StripeSubscription;
  const userId = await getUserIdFromCustomer(subscription.customer);

  if (!userId) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  const plan = await getPlanFromPriceId(subscription.items.data[0].price.id);
  const interval = subscription.items.data[0].price.recurring.interval === 'month' ? 'monthly' : 'yearly';
  const amount = subscription.items.data[0].price.unit_amount / 100;

  try {
    await supabase.from('subscriptions').insert({
      user_id: userId,
      plan,
      status: mapStripeStatus(subscription.status),
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      auto_renew: !subscription.cancel_at_period_end,
      amount,
      interval
    });

    // Update user's subscription plan
    await supabase
      .from('users')
      .update({ subscription_plan: plan })
      .eq('id', userId);

    // Subscription created for user
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Handle subscription.updated event
 */
const handleSubscriptionUpdated = async (event: StripeWebhookEvent): Promise<void> => {
  const subscription = event.data.object as StripeSubscription;
  const userId = await getUserIdFromCustomer(subscription.customer);

  if (!userId) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  const plan = await getPlanFromPriceId(subscription.items.data[0].price.id);
  const status = mapStripeStatus(subscription.status);

  try {
    await supabase
      .from('subscriptions')
      .update({
        plan,
        status,
        end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        auto_renew: !subscription.cancel_at_period_end
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Update user's subscription plan
    await supabase
      .from('users')
      .update({ subscription_plan: plan })
      .eq('id', userId);

    // Subscription updated for user
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

/**
 * Handle subscription.deleted event
 */
const handleSubscriptionDeleted = async (event: StripeWebhookEvent): Promise<void> => {
  const subscription = event.data.object as StripeSubscription;
  const userId = await getUserIdFromCustomer(subscription.customer);

  if (!userId) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  try {
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Downgrade user to free plan
    await supabase
      .from('users')
      .update({ subscription_plan: 'free' })
      .eq('id', userId);

    // Subscription cancelled for user
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// ============================================================================
// INVOICE EVENT HANDLERS
// ============================================================================

/**
 * Handle invoice.payment_succeeded event
 */
const handleInvoicePaymentSucceeded = async (event: StripeWebhookEvent): Promise<void> => {
  const invoice = event.data.object as StripeInvoice;
  const userId = await getUserIdFromCustomer(invoice.customer);

  if (!userId) {
    console.error('User not found for customer:', invoice.customer);
    return;
  }

  try {
    // Get subscription ID from database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    // Record payment in history
    await supabase.from('payment_history').insert({
      user_id: userId,
      subscription_id: subscription?.id,
      amount: invoice.amount_paid / 100,
      status: 'success',
      invoice_url: invoice.hosted_invoice_url,
      description: 'Subscription payment'
    });

    // Payment succeeded
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

/**
 * Handle invoice.payment_failed event
 */
const handleInvoicePaymentFailed = async (event: StripeWebhookEvent): Promise<void> => {
  const invoice = event.data.object as StripeInvoice;
  const userId = await getUserIdFromCustomer(invoice.customer);

  if (!userId) {
    console.error('User not found for customer:', invoice.customer);
    return;
  }

  try {
    // Get subscription ID from database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    // Record failed payment
    await supabase.from('payment_history').insert({
      user_id: userId,
      subscription_id: subscription?.id,
      amount: invoice.amount_paid / 100,
      status: 'failed',
      invoice_url: invoice.hosted_invoice_url,
      description: 'Failed subscription payment'
    });

    // Update subscription status to past_due
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Payment failed for user - send email notification
    try {
      // Get user email
      const { data: userData } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (userData?.email) {
        // Trigger email notification via Edge Function or backend
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'payment_failed',
            to: userData.email,
            data: {
              userName: userData.full_name,
              amount: invoice.amount_due / 100,
              invoiceUrl: invoice.hosted_invoice_url,
              failureReason: 'Your payment method was declined'
            }
          }
        });
      }
    } catch (emailError) {
      console.error('Failed to send payment failure email:', emailError);
      // Don't throw - email failure shouldn't break webhook
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
};

/**
 * Handle invoice.finalized event
 */
const handleInvoiceFinalized = async (event: StripeWebhookEvent): Promise<void> => {
  const invoice = event.data.object as StripeInvoice;
  // Invoice finalized
  // Additional logic can be added here if needed
};

// ============================================================================
// CHECKOUT EVENT HANDLERS
// ============================================================================

/**
 * Handle checkout.session.completed event
 */
const handleCheckoutCompleted = async (event: StripeWebhookEvent): Promise<void> => {
  const session = event.data.object as any;
  // Checkout completed

  // The subscription will be created via subscription.created event
  // This event can be used for additional processing like sending welcome emails
};

/**
 * Handle checkout.session.expired event
 */
const handleCheckoutExpired = async (event: StripeWebhookEvent): Promise<void> => {
  const session = event.data.object as any;
  // Checkout expired
};

// ============================================================================
// PAYMENT INTENT EVENT HANDLERS
// ============================================================================

/**
 * Handle payment_intent.succeeded event
 */
const handlePaymentIntentSucceeded = async (event: StripeWebhookEvent): Promise<void> => {
  const paymentIntent = event.data.object as any;
  // Payment intent succeeded
};

/**
 * Handle payment_intent.payment_failed event
 */
const handlePaymentIntentFailed = async (event: StripeWebhookEvent): Promise<void> => {
  const paymentIntent = event.data.object as any;
  // Payment intent failed
};

// ============================================================================
// CUSTOMER EVENT HANDLERS
// ============================================================================

/**
 * Handle customer.created event
 */
const handleCustomerCreated = async (event: StripeWebhookEvent): Promise<void> => {
  const customer = event.data.object as any;
  // Customer created
};

/**
 * Handle customer.updated event
 */
const handleCustomerUpdated = async (event: StripeWebhookEvent): Promise<void> => {
  const customer = event.data.object as any;
  // Customer updated
};

/**
 * Handle customer.deleted event
 */
const handleCustomerDeleted = async (event: StripeWebhookEvent): Promise<void> => {
  const customer = event.data.object as any;
  // Customer deleted
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user ID from Stripe customer ID
 */
const getUserIdFromCustomer = async (customerId: string): Promise<string | null> => {
  try {
    // Option 1: Check users table for stripe_customer_id
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (userData?.id) {
      return userData.id;
    }

    // Option 2: Fallback to stripe_customers mapping table
    const { data: mappingData } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .single();

    return mappingData?.user_id || null;
  } catch (error) {
    console.error('Error looking up user from customer:', error);
    return null;
  }
};

/**
 * Map Stripe subscription status to our status
 */
const mapStripeStatus = (
  stripeStatus: string
): 'active' | 'cancelled' | 'expired' | 'past_due' => {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled';
    case 'incomplete':
    default:
      return 'expired';
  }
};

/**
 * Get plan name from Stripe price ID
 */
const getPlanFromPriceId = async (priceId: string): Promise<'free' | 'pro' | 'premium'> => {
  // Map Stripe price IDs to plan names
  // These should match the price IDs from your Stripe dashboard
  const priceMapping: Record<string, 'pro' | 'premium'> = {
    'price_pro_monthly': 'pro',
    'price_pro_yearly': 'pro',
    'price_premium_monthly': 'premium',
    'price_premium_yearly': 'premium'
  };

  return priceMapping[priceId] || 'free';
};

/**
 * Verify Stripe webhook signature
 * This should be called before processing any webhook
 */
export const verifyStripeSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  // In production, use Stripe's webhook signature verification
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // try {
  //   const event = stripe.webhooks.constructEvent(payload, signature, secret);
  //   return true;
  // } catch (err) {
  //   return false;
  // }

  // Placeholder implementation
  return true;
};

// ============================================================================
// WEBHOOK ENDPOINT EXAMPLE (for Supabase Edge Function)
// ============================================================================

/**
 * Example webhook endpoint handler for Supabase Edge Functions
 *
 * Create this file at: supabase/functions/stripe-webhook/index.ts
 *
 * import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
 * import { handleStripeWebhook } from './stripeWebhook.ts'
 *
 * serve(async (req) => {
 *   const signature = req.headers.get('stripe-signature')
 *   const body = await req.text()
 *
 *   // Verify signature
 *   if (!verifyStripeSignature(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET'))) {
 *     return new Response('Invalid signature', { status: 400 })
 *   }
 *
 *   const event = JSON.parse(body)
 *   await handleStripeWebhook(event)
 *
 *   return new Response(JSON.stringify({ received: true }), {
 *     headers: { 'Content-Type': 'application/json' }
 *   })
 * })
 */

export default handleStripeWebhook;
