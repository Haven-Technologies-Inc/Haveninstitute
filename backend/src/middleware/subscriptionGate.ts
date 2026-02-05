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
      const userId = req.userId;
      const userPlan = (req.userSubscription as PlanType) || 'Free';
      const planFeatures = PLAN_FEATURES[userPlan];
      const limit = planFeatures[feature];

      // -1 means unlimited
      if (limit === -1) {
        return next();
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Import sequelize for raw query
      const { sequelize } = await import('../config/database');
      const { QueryTypes } = await import('sequelize');

      // Feature to column mapping
      const columnMap: Record<string, string> = {
        'maxQuestionsPerDay': 'questions_attempted',
        'maxCATTests': 'cat_sessions',
        'aiTutorMessagesPerDay': 'ai_chat_messages'
      };

      const column = columnMap[feature];

      // Check current usage from daily_usage table
      const [usage] = await sequelize.query<{ current_usage: number }>(
        `SELECT ${column} as current_usage FROM daily_usage
         WHERE user_id = :userId AND usage_date = :today`,
        {
          replacements: { userId, today },
          type: QueryTypes.SELECT
        }
      );

      const currentUsage = usage?.current_usage || 0;

      if (currentUsage >= limit) {
        return ResponseHandler.error(
          res,
          errorCodes.RATE_LIMIT_EXCEEDED,
          `You have reached your daily limit of ${limit} for this feature. Upgrade your plan for more access.`,
          429,
          {
            feature,
            limit,
            currentUsage,
            currentPlan: userPlan,
            resetsAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
          }
        );
      }

      // Increment usage counter (upsert)
      await sequelize.query(
        `INSERT INTO daily_usage (id, user_id, usage_date, ${column})
         VALUES (UUID(), :userId, :today, 1)
         ON DUPLICATE KEY UPDATE ${column} = ${column} + 1`,
        {
          replacements: { userId, today },
          type: QueryTypes.INSERT
        }
      );

      next();
    } catch (error) {
      // If table doesn't exist or other DB error, allow request but log
      console.error('Daily usage tracking error:', error);
      next();
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
