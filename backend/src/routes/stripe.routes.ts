/**
 * Stripe Routes
 * 
 * API routes for Stripe payment integration
 * These routes map directly to the frontend stripeApi.ts service
 */

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { stripe } from '../config/stripe';
import { ResponseHandler } from '../utils/response';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

const router = Router();

// ==================== CHECKOUT ROUTES ====================

/**
 * @route   POST /api/v1/stripe/checkout-session
 * @desc    Create a checkout session for subscription
 * @access  Private
 */
router.post('/checkout-session', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;
    const userId = req.userId!;

    if (!planId || !successUrl || !cancelUrl) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Missing required fields', 400);
    }

    // Get price ID based on plan
    const priceId = getPriceIdForPlan(planId);
    if (!priceId) {
      return ResponseHandler.error(res, 'INVALID_PLAN', 'Invalid plan ID', 400);
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: { userId, planId }
    });

    ResponseHandler.success(res, {
      id: session.id,
      url: session.url,
      status: session.status || 'open'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/stripe/billing-portal
 * @desc    Create a billing portal session
 * @access  Private
 */
router.post('/billing-portal', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { returnUrl } = req.body;
    const userId = req.userId!;

    if (!returnUrl) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Return URL required', 400);
    }

    const customerId = await getStripeCustomerId(userId);
    if (!customerId) {
      return ResponseHandler.error(res, 'NO_CUSTOMER', 'No Stripe customer found', 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    ResponseHandler.success(res, { url: session.url });
  } catch (error) {
    next(error);
  }
});

// ==================== SUBSCRIPTION ROUTES ====================

/**
 * @route   GET /api/v1/stripe/subscription
 * @desc    Get active subscription for current user
 * @access  Private
 */
router.get('/subscription', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const rows = await sequelize.query<any>(
      `SELECT s.*, u.stripe_customer_id
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       WHERE s.user_id = ? AND s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    if (rows.length === 0) {
      return ResponseHandler.error(res, 'NO_SUBSCRIPTION', 'No active subscription', 404);
    }

    const sub = rows[0];
    ResponseHandler.success(res, formatSubscription(sub));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/stripe/subscriptions
 * @desc    Get all subscriptions for current user
 * @access  Private
 */
router.get('/subscriptions', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const rows = await sequelize.query<any>(
      `SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC`,
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    ResponseHandler.success(res, rows.map(formatSubscription));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/stripe/subscription
 * @desc    Create subscription with payment method
 * @access  Private
 */
router.post('/subscription', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planId, paymentMethodId } = req.body;
    const userId = req.userId!;

    if (!planId || !paymentMethodId) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Plan ID and payment method required', 400);
    }

    const priceId = getPriceIdForPlan(planId);
    if (!priceId) {
      return ResponseHandler.error(res, 'INVALID_PLAN', 'Invalid plan ID', 400);
    }

    // Get or create customer
    const customerId = await getOrCreateStripeCustomer(userId);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: { userId, planId }
    });

    // Save to database
    await sequelize.query(
      `INSERT INTO subscriptions (user_id, stripe_subscription_id, plan_type, status, current_period_start, current_period_end)
       VALUES (:userId, :subId, :planId, :status, :startDate, :endDate)
       ON DUPLICATE KEY UPDATE
         stripe_subscription_id = :subId, plan_type = :planId, status = :status, 
         current_period_start = :startDate, current_period_end = :endDate, updated_at = NOW()`,
      {
        replacements: {
          userId,
          subId: subscription.id,
          planId,
          status: subscription.status,
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: new Date(subscription.current_period_end * 1000)
        },
        type: QueryTypes.INSERT
      }
    );

    ResponseHandler.success(res, {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
    }, 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/stripe/subscription/:subscriptionId
 * @desc    Update subscription plan
 * @access  Private
 */
router.put('/subscription/:subscriptionId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params;
    const { planId } = req.body;

    if (!planId) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Plan ID required', 400);
    }

    const priceId = getPriceIdForPlan(planId);
    if (!priceId) {
      return ResponseHandler.error(res, 'INVALID_PLAN', 'Invalid plan ID', 400);
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update subscription
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId
      }],
      proration_behavior: 'create_prorations'
    });

    ResponseHandler.success(res, {
      id: updated.id,
      status: updated.status
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/stripe/subscription/:subscriptionId/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/subscription/:subscriptionId/cancel', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd } = req.body;

    let updated;
    if (cancelAtPeriodEnd) {
      updated = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    } else {
      updated = await stripe.subscriptions.cancel(subscriptionId);
    }

    // Update database
    await sequelize.query(
      `UPDATE subscriptions SET status = :status, cancel_at_period_end = :cancelAtPeriodEnd, updated_at = NOW()
       WHERE stripe_subscription_id = :subId`,
      {
        replacements: {
          status: updated.status,
          cancelAtPeriodEnd,
          subId: subscriptionId
        },
        type: QueryTypes.UPDATE
      }
    );

    ResponseHandler.success(res, {
      id: updated.id,
      status: updated.status,
      cancelAtPeriodEnd: updated.cancel_at_period_end
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/stripe/subscription/:subscriptionId/reactivate
 * @desc    Reactivate canceled subscription
 * @access  Private
 */
router.post('/subscription/:subscriptionId/reactivate', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params;

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    await sequelize.query(
      `UPDATE subscriptions SET status = 'active', cancel_at_period_end = false, updated_at = NOW()
       WHERE stripe_subscription_id = ?`,
      {
        replacements: [subscriptionId],
        type: QueryTypes.UPDATE
      }
    );

    ResponseHandler.success(res, {
      id: updated.id,
      status: updated.status
    });
  } catch (error) {
    next(error);
  }
});

// ==================== PAYMENT METHOD ROUTES ====================

/**
 * @route   GET /api/v1/stripe/payment-methods
 * @desc    Get payment methods for current user
 * @access  Private
 */
router.get('/payment-methods', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const customerId = await getStripeCustomerId(userId);

    if (!customerId) {
      return ResponseHandler.success(res, []);
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    const customer = await stripe.customers.retrieve(customerId) as any;
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    const methods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expiryMonth: pm.card?.exp_month,
      expiryYear: pm.card?.exp_year,
      isDefault: pm.id === defaultPaymentMethodId
    }));

    ResponseHandler.success(res, methods);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/stripe/payment-methods
 * @desc    Add payment method
 * @access  Private
 */
router.post('/payment-methods', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentMethodId } = req.body;
    const userId = req.userId!;

    if (!paymentMethodId) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Payment method ID required', 400);
    }

    const customerId = await getOrCreateStripeCustomer(userId);

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    ResponseHandler.success(res, {
      id: pm.id,
      type: pm.type,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expiryMonth: pm.card?.exp_month,
      expiryYear: pm.card?.exp_year,
      isDefault: false
    }, 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/stripe/payment-methods/:paymentMethodId
 * @desc    Delete payment method
 * @access  Private
 */
router.delete('/payment-methods/:paymentMethodId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentMethodId } = req.params;

    await stripe.paymentMethods.detach(paymentMethodId);

    ResponseHandler.success(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/stripe/payment-methods/:paymentMethodId/default
 * @desc    Set default payment method
 * @access  Private
 */
router.put('/payment-methods/:paymentMethodId/default', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentMethodId } = req.params;
    const userId = req.userId!;

    const customerId = await getStripeCustomerId(userId);
    if (!customerId) {
      return ResponseHandler.error(res, 'NO_CUSTOMER', 'No customer found', 404);
    }

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    ResponseHandler.success(res, {
      id: pm.id,
      type: pm.type,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      isDefault: true
    });
  } catch (error) {
    next(error);
  }
});

// ==================== INVOICE ROUTES ====================

/**
 * @route   GET /api/v1/stripe/invoices
 * @desc    Get invoices for current user
 * @access  Private
 */
router.get('/invoices', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const customerId = await getStripeCustomerId(userId);

    if (!customerId) {
      return ResponseHandler.success(res, []);
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 20
    });

    const formattedInvoices = invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amount: (inv.amount_due || 0) / 100,
      amountPaid: (inv.amount_paid || 0) / 100,
      status: inv.status,
      dueDate: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
      paidAt: inv.status_transitions?.paid_at ? new Date(inv.status_transitions.paid_at * 1000).toISOString() : null,
      description: inv.lines.data[0]?.description || 'Subscription',
      pdf: inv.invoice_pdf
    }));

    ResponseHandler.success(res, formattedInvoices);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/stripe/invoices/upcoming
 * @desc    Get upcoming invoice
 * @access  Private
 */
router.get('/invoices/upcoming', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const customerId = await getStripeCustomerId(userId);

    if (!customerId) {
      return ResponseHandler.error(res, 'NO_CUSTOMER', 'No customer found', 404);
    }

    try {
      const invoice = await stripe.invoices.retrieveUpcoming({ customer: customerId });

      ResponseHandler.success(res, {
        id: 'upcoming',
        number: 'UPCOMING',
        amount: (invoice.amount_due || 0) / 100,
        amountPaid: 0,
        status: 'draft',
        dueDate: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000).toISOString() : null,
        description: 'Upcoming subscription payment'
      });
    } catch (err: any) {
      if (err.code === 'invoice_upcoming_none') {
        return ResponseHandler.error(res, 'NO_UPCOMING', 'No upcoming invoice', 404);
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/stripe/invoices/:invoiceId/pdf
 * @desc    Get invoice PDF URL
 * @access  Private
 */
router.get('/invoices/:invoiceId/pdf', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice.invoice_pdf) {
      return ResponseHandler.error(res, 'NO_PDF', 'PDF not available', 404);
    }

    ResponseHandler.success(res, { url: invoice.invoice_pdf });
  } catch (error) {
    next(error);
  }
});

// ==================== PAYMENT INTENT ROUTES ====================

/**
 * @route   POST /api/v1/stripe/payment-intent
 * @desc    Create payment intent
 * @access  Private
 */
router.post('/payment-intent', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    const userId = req.userId!;

    if (!amount || amount <= 0) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Valid amount required', 400);
    }

    const customerId = await getOrCreateStripeCustomer(userId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      customer: customerId,
      metadata: { userId }
    });

    ResponseHandler.success(res, {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/stripe/payment-intent/:paymentIntentId/confirm
 * @desc    Confirm payment intent
 * @access  Private
 */
router.post('/payment-intent/:paymentIntentId/confirm', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.params;
    const { paymentMethodId } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId
    });

    ResponseHandler.success(res, {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
});

// ==================== PROMO CODE ROUTES ====================

/**
 * @route   POST /api/v1/stripe/promo-code/validate
 * @desc    Validate promo code
 * @access  Private
 */
router.post('/promo-code/validate', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;

    if (!code) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Promo code required', 400);
    }

    const promoCodes = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1
    });

    if (promoCodes.data.length === 0) {
      return ResponseHandler.success(res, { valid: false });
    }

    const promoCode = promoCodes.data[0];
    const coupon = promoCode.coupon;

    let discount: { type: 'percentage' | 'fixed'; value: number } | undefined;

    if (coupon.percent_off) {
      discount = { type: 'percentage', value: coupon.percent_off };
    } else if (coupon.amount_off) {
      discount = { type: 'fixed', value: coupon.amount_off / 100 };
    }

    ResponseHandler.success(res, {
      valid: true,
      discount,
      promoCodeId: promoCode.id
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/stripe/subscription/:subscriptionId/promo
 * @desc    Apply promo code to subscription
 * @access  Private
 */
router.post('/subscription/:subscriptionId/promo', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params;
    const { promoCode } = req.body;

    if (!promoCode) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Promo code required', 400);
    }

    // Find the promotion code
    const promoCodes = await stripe.promotionCodes.list({
      code: promoCode,
      active: true,
      limit: 1
    });

    if (promoCodes.data.length === 0) {
      return ResponseHandler.error(res, 'INVALID_CODE', 'Invalid promo code', 400);
    }

    // Apply to subscription
    const updated = await stripe.subscriptions.update(subscriptionId, {
      promotion_code: promoCodes.data[0].id
    });

    ResponseHandler.success(res, {
      id: updated.id,
      status: updated.status
    });
  } catch (error) {
    next(error);
  }
});

// ==================== HELPER FUNCTIONS ====================

function getPriceIdForPlan(planId: string): string | null {
  const prices: Record<string, string> = {
    'pro': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    'pro_yearly': process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    'premium': process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    'premium_yearly': process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || ''
  };
  return prices[planId] || null;
}

async function getStripeCustomerId(userId: string): Promise<string | null> {
  const rows = await sequelize.query<any>(
    'SELECT stripe_customer_id FROM users WHERE id = ?',
    {
      replacements: [userId],
      type: QueryTypes.SELECT
    }
  );
  return rows[0]?.stripe_customer_id || null;
}

async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  // Check if customer exists
  const rows = await sequelize.query<any>(
    'SELECT stripe_customer_id, email, full_name FROM users WHERE id = ?',
    {
      replacements: [userId],
      type: QueryTypes.SELECT
    }
  );

  if (rows[0]?.stripe_customer_id) {
    return rows[0].stripe_customer_id;
  }

  // Create new customer
  const user = rows[0];
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.full_name,
    metadata: { userId }
  });

  // Save customer ID
  await sequelize.query(
    'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
    {
      replacements: [customer.id, userId],
      type: QueryTypes.UPDATE
    }
  );

  return customer.id;
}

function formatSubscription(sub: any) {
  return {
    id: sub.id || sub.stripe_subscription_id,
    userId: sub.user_id,
    status: sub.status,
    planType: sub.plan_type,
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end || false
  };
}

export default router;
