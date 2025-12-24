/**
 * Subscription Service
 * 
 * Manages subscriptions, payments, and Stripe integration
 */

import { Op } from 'sequelize';
import { stripe, stripeConfig } from '../config/stripe';
import { User } from '../models/User';
import { 
  Subscription, 
  PaymentTransaction, 
  PlanType, 
  BillingPeriod,
  PLAN_FEATURES,
  PLAN_PRICING 
} from '../models/Subscription';

export interface CreateSubscriptionInput {
  userId: string;
  planType: PlanType;
  billingPeriod: BillingPeriod;
  paymentMethodId?: string;
}

export interface SubscriptionSummary {
  id: string;
  planType: PlanType;
  status: string;
  billingPeriod: BillingPeriod;
  amount: number;
  currency: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  features: typeof PLAN_FEATURES[PlanType];
  daysRemaining: number;
}

export class SubscriptionService {
  /**
   * Get user's current subscription
   */
  async getSubscription(userId: string): Promise<SubscriptionSummary | null> {
    const subscription = await Subscription.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      // Return free tier info
      return {
        id: '',
        planType: 'Free',
        status: 'active',
        billingPeriod: 'monthly',
        amount: 0,
        currency: 'USD',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        features: PLAN_FEATURES.Free,
        daysRemaining: -1
      };
    }

    return {
      id: subscription.id,
      planType: subscription.planType,
      status: subscription.status,
      billingPeriod: subscription.billingPeriod,
      amount: Number(subscription.amount),
      currency: subscription.currency,
      currentPeriodStart: subscription.currentPeriodStart || null,
      currentPeriodEnd: subscription.currentPeriodEnd || null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      features: PLAN_FEATURES[subscription.planType],
      daysRemaining: subscription.daysRemaining
    };
  }

  /**
   * Get available plans
   */
  async getPlans() {
    return [
      {
        id: 'Free',
        name: 'Free',
        description: 'Get started with basic features',
        pricing: PLAN_PRICING.Free,
        features: PLAN_FEATURES.Free,
        popular: false
      },
      {
        id: 'Pro',
        name: 'Pro',
        description: 'Perfect for serious NCLEX preparation',
        pricing: PLAN_PRICING.Pro,
        features: PLAN_FEATURES.Pro,
        popular: true
      },
      {
        id: 'Premium',
        name: 'Premium',
        description: 'Complete access with priority support',
        pricing: PLAN_PRICING.Premium,
        features: PLAN_FEATURES.Premium,
        popular: false
      }
    ];
  }

  /**
   * Create checkout session for new subscription
   */
  async createCheckoutSession(
    userId: string,
    planType: PlanType,
    billingPeriod: BillingPeriod,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (planType === 'Free') {
      throw new Error('Cannot create checkout for free plan');
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const existingSub = await Subscription.findOne({ where: { userId } });

    if (existingSub?.stripeCustomerId) {
      stripeCustomerId = existingSub.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId }
      });
      stripeCustomerId = customer.id;
    }

    // Get price ID
    const priceKey = `${planType.toLowerCase()}${billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}` as keyof typeof stripeConfig.priceIds;
    const priceId = stripeConfig.priceIds[priceKey];

    if (!priceId) {
      throw new Error(`Price ID not configured for ${planType} ${billingPeriod}`);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planType,
        billingPeriod
      },
      subscription_data: {
        metadata: {
          userId,
          planType
        }
      },
      allow_promotion_codes: true
    });

    return {
      sessionId: session.id,
      url: session.url!
    };
  }

  /**
   * Handle successful checkout
   */
  async handleCheckoutComplete(sessionId: string): Promise<Subscription> {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType as PlanType;
    const billingPeriod = session.metadata?.billingPeriod as BillingPeriod;

    if (!userId || !planType) {
      throw new Error('Invalid checkout session metadata');
    }

    const stripeSubscription = session.subscription as any;
    const stripeCustomer = session.customer as any;

    // Create or update subscription
    const [subscription] = await Subscription.upsert({
      userId,
      planType,
      status: 'active',
      billingPeriod,
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      amount: PLAN_PRICING[planType][billingPeriod],
      currency: 'USD',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    });

    // Update user's subscription tier
    await User.update(
      { subscriptionTier: planType },
      { where: { id: userId } }
    );

    // Record payment transaction
    await PaymentTransaction.create({
      userId,
      subscriptionId: subscription.id,
      stripePaymentIntentId: session.payment_intent as string,
      amount: PLAN_PRICING[planType][billingPeriod],
      currency: 'USD',
      status: 'succeeded',
      paymentMethod: 'card',
      description: `${planType} subscription - ${billingPeriod}`
    });

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, cancelImmediately = false): Promise<Subscription> {
    const subscription = await Subscription.findOne({
      where: { userId, status: { [Op.in]: ['active', 'trialing'] } }
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (subscription.stripeSubscriptionId) {
      if (cancelImmediately) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        
        await subscription.update({
          status: 'canceled',
          canceledAt: new Date(),
          endedAt: new Date()
        });

        // Revert to free tier
        await User.update(
          { subscriptionTier: 'Free' },
          { where: { id: userId } }
        );
      } else {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });

        await subscription.update({
          cancelAtPeriodEnd: true,
          canceledAt: new Date()
        });
      }
    } else {
      await subscription.update({
        status: 'canceled',
        canceledAt: new Date(),
        endedAt: new Date()
      });

      await User.update(
        { subscriptionTier: 'Free' },
        { where: { id: userId } }
      );
    }

    return subscription;
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<Subscription> {
    const subscription = await Subscription.findOne({
      where: { userId, cancelAtPeriodEnd: true }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No subscription to reactivate');
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    await subscription.update({
      cancelAtPeriodEnd: false,
      canceledAt: null
    });

    return subscription;
  }

  /**
   * Change subscription plan
   */
  async changePlan(
    userId: string,
    newPlanType: PlanType,
    newBillingPeriod: BillingPeriod
  ): Promise<{ subscription: Subscription; prorationAmount?: number }> {
    const subscription = await Subscription.findOne({
      where: { userId, status: { [Op.in]: ['active', 'trialing'] } }
    });

    if (!subscription) {
      throw new Error('No active subscription to change');
    }

    if (newPlanType === 'Free') {
      // Downgrade to free = cancel subscription
      await this.cancelSubscription(userId, false);
      return { subscription };
    }

    if (!subscription.stripeSubscriptionId) {
      throw new Error('Cannot change plan without Stripe subscription');
    }

    const priceKey = `${newPlanType.toLowerCase()}${newBillingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}` as keyof typeof stripeConfig.priceIds;
    const newPriceId = stripeConfig.priceIds[priceKey];

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    // Update subscription with proration
    const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations'
    });

    // Update local subscription
    await subscription.update({
      planType: newPlanType,
      billingPeriod: newBillingPeriod,
      stripePriceId: newPriceId,
      amount: PLAN_PRICING[newPlanType][newBillingPeriod],
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000)
    });

    // Update user tier
    await User.update(
      { subscriptionTier: newPlanType },
      { where: { id: userId } }
    );

    return { subscription };
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string, limit = 20): Promise<PaymentTransaction[]> {
    return PaymentTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Get billing portal URL
   */
  async getBillingPortalUrl(userId: string, returnUrl: string): Promise<string> {
    const subscription = await Subscription.findOne({ where: { userId } });

    if (!subscription?.stripeCustomerId) {
      throw new Error('No billing information found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl
    });

    return session.url;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }

  private async handleSubscriptionUpdated(stripeSubscription: any) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (!subscription) return;

    const status = stripeSubscription.status === 'active' ? 'active' :
                   stripeSubscription.status === 'past_due' ? 'past_due' :
                   stripeSubscription.status === 'canceled' ? 'canceled' : 'active';

    await subscription.update({
      status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
    });
  }

  private async handleSubscriptionDeleted(stripeSubscription: any) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (!subscription) return;

    await subscription.update({
      status: 'canceled',
      endedAt: new Date()
    });

    await User.update(
      { subscriptionTier: 'Free' },
      { where: { id: subscription.userId } }
    );
  }

  private async handleInvoicePaid(invoice: any) {
    const subscription = await Subscription.findOne({
      where: { stripeCustomerId: invoice.customer }
    });

    if (!subscription) return;

    await PaymentTransaction.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: invoice.payment_intent,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'succeeded',
      paymentMethod: 'card',
      description: 'Subscription payment',
      receiptUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf
    });
  }

  private async handlePaymentFailed(invoice: any) {
    const subscription = await Subscription.findOne({
      where: { stripeCustomerId: invoice.customer }
    });

    if (!subscription) return;

    await subscription.update({ status: 'past_due' });

    await PaymentTransaction.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'failed',
      description: 'Failed subscription payment',
      failureMessage: invoice.last_payment_error?.message
    });
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get all subscriptions (admin)
   */
  async getAllSubscriptions(options: {
    status?: string;
    planType?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ subscriptions: Subscription[]; total: number }> {
    const { status, planType, page = 1, limit = 20 } = options;
    
    const where: any = {};
    if (status) where.status = status;
    if (planType) where.planType = planType;

    const { rows, count } = await Subscription.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'email', 'fullName'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return { subscriptions: rows, total: count };
  }

  /**
   * Get subscription stats (admin)
   */
  async getSubscriptionStats() {
    const total = await Subscription.count();
    const active = await Subscription.count({ where: { status: 'active' } });
    const canceled = await Subscription.count({ where: { status: 'canceled' } });
    const pastDue = await Subscription.count({ where: { status: 'past_due' } });

    const byPlan = await Subscription.findAll({
      attributes: [
        'planType',
        [Subscription.sequelize!.fn('COUNT', '*'), 'count']
      ],
      where: { status: 'active' },
      group: ['planType']
    });

    const revenue = await PaymentTransaction.sum('amount', {
      where: { status: 'succeeded' }
    });

    const monthlyRevenue = await PaymentTransaction.sum('amount', {
      where: {
        status: 'succeeded',
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(1))
        }
      }
    });

    return {
      total,
      active,
      canceled,
      pastDue,
      byPlan: byPlan.map(p => ({ plan: p.planType, count: (p as any).getDataValue('count') })),
      totalRevenue: revenue || 0,
      monthlyRevenue: monthlyRevenue || 0
    };
  }

  /**
   * Manually update subscription (admin)
   */
  async adminUpdateSubscription(
    subscriptionId: string,
    updates: {
      planType?: PlanType;
      status?: string;
      currentPeriodEnd?: Date;
    }
  ): Promise<Subscription> {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) throw new Error('Subscription not found');

    await subscription.update(updates);

    if (updates.planType) {
      await User.update(
        { subscriptionTier: updates.planType },
        { where: { id: subscription.userId } }
      );
    }

    return subscription;
  }

  /**
   * Grant free subscription (admin)
   */
  async grantSubscription(
    userId: string,
    planType: PlanType,
    durationDays: number
  ): Promise<Subscription> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const [subscription] = await Subscription.upsert({
      userId,
      planType,
      status: 'active',
      billingPeriod: 'monthly',
      amount: 0,
      currency: 'USD',
      currentPeriodStart: new Date(),
      currentPeriodEnd: endDate,
      metadata: { grantedByAdmin: true, grantedAt: new Date().toISOString() }
    });

    await User.update(
      { subscriptionTier: planType },
      { where: { id: userId } }
    );

    return subscription;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
