/**
 * Subscription Feature Gating Middleware
 * 
 * Restricts access to features based on user's subscription plan
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { ResponseHandler, errorCodes } from '../utils/response';
import { PLAN_FEATURES, PlanType, PlanFeatures } from '../models/Subscription';

type FeatureKey = keyof PlanFeatures;

/**
 * Check if user has access to a specific feature
 */
export function requireFeature(feature: FeatureKey) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userPlan = (req.userSubscription as PlanType) || 'Free';
      const planFeatures = PLAN_FEATURES[userPlan];

      if (!planFeatures) {
        return ResponseHandler.error(
          res,
          errorCodes.AUTH_FORBIDDEN,
          'Invalid subscription plan',
          403
        );
      }

      const featureValue = planFeatures[feature];

      // Boolean features
      if (typeof featureValue === 'boolean' && !featureValue) {
        return ResponseHandler.error(
          res,
          errorCodes.SUBSCRIPTION_REQUIRED,
          `This feature requires a ${getRequiredPlan(feature)} subscription or higher`,
          403,
          { requiredFeature: feature, currentPlan: userPlan }
        );
      }

      // Numeric features (0 means disabled)
      if (typeof featureValue === 'number' && featureValue === 0) {
        return ResponseHandler.error(
          res,
          errorCodes.SUBSCRIPTION_REQUIRED,
          `This feature requires a ${getRequiredPlan(feature)} subscription or higher`,
          403,
          { requiredFeature: feature, currentPlan: userPlan }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check daily usage limits
 */
export function checkDailyLimit(feature: 'maxQuestionsPerDay' | 'maxCATTests' | 'aiTutorMessagesPerDay') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userPlan = (req.userSubscription as PlanType) || 'Free';
      const planFeatures = PLAN_FEATURES[userPlan];
      const limit = planFeatures[feature];

      // -1 means unlimited
      if (limit === -1) {
        return next();
      }

      // TODO: Implement daily usage tracking
      // For now, just pass through - actual tracking should be implemented
      // with Redis or database counters

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Require minimum subscription tier
 */
export function requirePlan(minPlan: PlanType) {
  const planOrder: PlanType[] = ['Free', 'Pro', 'Premium'];

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userPlan = (req.userSubscription as PlanType) || 'Free';
      const userPlanIndex = planOrder.indexOf(userPlan);
      const minPlanIndex = planOrder.indexOf(minPlan);

      if (userPlanIndex < minPlanIndex) {
        return ResponseHandler.error(
          res,
          errorCodes.SUBSCRIPTION_REQUIRED,
          `This feature requires a ${minPlan} subscription or higher`,
          403,
          { requiredPlan: minPlan, currentPlan: userPlan }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Get the minimum plan required for a feature
 */
function getRequiredPlan(feature: FeatureKey): PlanType {
  // Check which plan first enables this feature
  if (PLAN_FEATURES.Free[feature]) return 'Free';
  if (PLAN_FEATURES.Pro[feature]) return 'Pro';
  return 'Premium';
}

export default {
  requireFeature,
  checkDailyLimit,
  requirePlan
};
