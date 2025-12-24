/**
 * Subscription Routes
 * 
 * API routes for subscription management and payments
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/authenticate';
import { subscriptionService } from '../services/subscription.service';
import { stripe, stripeConfig } from '../config/stripe';
import { ResponseHandler } from '../utils/response';

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/v1/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get('/plans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await subscriptionService.getPlans();
    ResponseHandler.success(res, plans);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/subscriptions/webhook
 * @desc    Handle Stripe webhooks
 * @access  Public (verified by Stripe signature)
 */
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!sig) {
      return ResponseHandler.error(res, 'WEBHOOK_ERROR', 'Missing signature', 400);
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        stripeConfig.webhookSecret
      );
    } catch (err: any) {
      return ResponseHandler.error(res, 'WEBHOOK_ERROR', `Webhook Error: ${err.message}`, 400);
    }

    await subscriptionService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// All routes below require authentication
router.use(authenticate);

// ==================== USER SUBSCRIPTION ROUTES ====================

/**
 * @route   GET /api/v1/subscriptions/current
 * @desc    Get current user subscription
 * @access  Private
 */
router.get('/current', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionService.getSubscription(req.userId!);
    ResponseHandler.success(res, subscription);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/subscriptions/checkout
 * @desc    Create checkout session for subscription
 * @access  Private
 */
router.post('/checkout', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planType, billingPeriod, successUrl, cancelUrl } = req.body;

    if (!planType || !billingPeriod || !successUrl || !cancelUrl) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Missing required fields', 400);
    }

    const result = await subscriptionService.createCheckoutSession(
      req.userId!,
      planType,
      billingPeriod,
      successUrl,
      cancelUrl
    );

    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/subscriptions/checkout/complete
 * @desc    Handle successful checkout completion
 * @access  Private
 */
router.post('/checkout/complete', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Session ID required', 400);
    }

    const subscription = await subscriptionService.handleCheckoutComplete(sessionId);
    ResponseHandler.success(res, subscription);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/subscriptions/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/cancel', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { immediately } = req.body;
    const subscription = await subscriptionService.cancelSubscription(req.userId!, immediately === true);
    ResponseHandler.success(res, subscription);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/subscriptions/reactivate
 * @desc    Reactivate canceled subscription
 * @access  Private
 */
router.post('/reactivate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionService.reactivateSubscription(req.userId!);
    ResponseHandler.success(res, subscription);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/subscriptions/change-plan
 * @desc    Change subscription plan
 * @access  Private
 */
router.post('/change-plan', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planType, billingPeriod } = req.body;

    if (!planType || !billingPeriod) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Plan type and billing period required', 400);
    }

    const result = await subscriptionService.changePlan(req.userId!, planType, billingPeriod);
    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/subscriptions/payments
 * @desc    Get payment history
 * @access  Private
 */
router.get('/payments', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const payments = await subscriptionService.getPaymentHistory(req.userId!, limit);
    ResponseHandler.success(res, payments);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/subscriptions/billing-portal
 * @desc    Get Stripe billing portal URL
 * @access  Private
 */
router.get('/billing-portal', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { returnUrl } = req.query;

    if (!returnUrl) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Return URL required', 400);
    }

    const url = await subscriptionService.getBillingPortalUrl(req.userId!, returnUrl as string);
    ResponseHandler.success(res, { url });
  } catch (error) {
    next(error);
  }
});

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/v1/subscriptions/admin/all
 * @desc    Get all subscriptions (admin)
 * @access  Admin
 */
router.get('/admin/all', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, planType, page, limit } = req.query;

    const result = await subscriptionService.getAllSubscriptions({
      status: status as string,
      planType: planType as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });

    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/subscriptions/admin/stats
 * @desc    Get subscription statistics (admin)
 * @access  Admin
 */
router.get('/admin/stats', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await subscriptionService.getSubscriptionStats();
    ResponseHandler.success(res, stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/subscriptions/admin/:subscriptionId
 * @desc    Update subscription (admin)
 * @access  Admin
 */
router.put('/admin/:subscriptionId', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionService.adminUpdateSubscription(
      req.params.subscriptionId,
      req.body
    );
    ResponseHandler.success(res, subscription);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/subscriptions/admin/grant
 * @desc    Grant free subscription to user (admin)
 * @access  Admin
 */
router.post('/admin/grant', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, planType, durationDays } = req.body;

    if (!userId || !planType || !durationDays) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Missing required fields', 400);
    }

    const subscription = await subscriptionService.grantSubscription(userId, planType, durationDays);
    ResponseHandler.success(res, subscription, 201);
  } catch (error) {
    next(error);
  }
});

export default router;
