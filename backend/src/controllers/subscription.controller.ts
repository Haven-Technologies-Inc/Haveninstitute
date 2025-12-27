import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { SubscriptionService } from '../services/subscription.service';
import { ResponseHandler } from '../utils/response';
import { logger } from '../utils/logger';

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  // Get available plans
  static async getPlans(req: AuthRequest, res: Response) {
    try {
      const plans = await subscriptionService.getPlans();
      return ResponseHandler.success(res, plans);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get current subscription
  static async getCurrentSubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const subscription = await subscriptionService.getSubscription(userId);
      return ResponseHandler.success(res, subscription);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Create checkout session
  static async createCheckout(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { planType, billingPeriod, successUrl, cancelUrl } = req.body;

      if (!planType || !billingPeriod) {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Plan type and billing period required', 400);
      }

      // Use default URLs if not provided
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const finalSuccessUrl = successUrl || `${frontendUrl}/app/account/subscription?success=true`;
      const finalCancelUrl = cancelUrl || `${frontendUrl}/app/account/subscription?canceled=true`;

      const session = await subscriptionService.createCheckoutSession(
        userId, 
        planType, 
        billingPeriod,
        finalSuccessUrl,
        finalCancelUrl
      );
      return ResponseHandler.success(res, session);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Cancel subscription
  static async cancelSubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { cancelImmediately } = req.body;

      await subscriptionService.cancelSubscription(userId, cancelImmediately === true);
      return ResponseHandler.success(res, { message: 'Subscription cancelled' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const subscription = await subscriptionService.reactivateSubscription(userId);
      return ResponseHandler.success(res, subscription);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Change plan
  static async changePlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { newPlanType, newBillingPeriod } = req.body;

      if (!newPlanType) {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'New plan type required', 400);
      }

      const subscription = await subscriptionService.changePlan(userId, newPlanType, newBillingPeriod);
      return ResponseHandler.success(res, subscription);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get payment history
  static async getPaymentHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { page = '1', limit = '20' } = req.query;

      const history = await subscriptionService.getPaymentHistory(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );
      return ResponseHandler.success(res, history);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get billing portal URL
  static async getBillingPortal(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const url = await subscriptionService.createBillingPortalSession(userId);
      return ResponseHandler.success(res, { url });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Handle Stripe webhook
  static async handleWebhook(req: AuthRequest, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      await subscriptionService.handleWebhook(payload, signature);
      return res.status(200).send({ received: true });
    } catch (error: any) {
      logger.error('Webhook error:', error);
      return res.status(400).send({ error: error.message });
    }
  }

  // Admin: Get all subscriptions
  static async getAllSubscriptions(req: AuthRequest, res: Response) {
    try {
      const { status, planType, page = '1', limit = '20' } = req.query;

      const subscriptions = await subscriptionService.getAllSubscriptions({
        status: status as string,
        planType: planType as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
      return ResponseHandler.success(res, subscriptions);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Admin: Get subscription stats
  static async getSubscriptionStats(req: AuthRequest, res: Response) {
    try {
      const stats = await subscriptionService.getSubscriptionStats();
      return ResponseHandler.success(res, stats);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Admin: Update user subscription
  static async adminUpdateSubscription(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const subscription = await subscriptionService.adminUpdateSubscription(userId, updates);
      return ResponseHandler.success(res, subscription);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }
}
