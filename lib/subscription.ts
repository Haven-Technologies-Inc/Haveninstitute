import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthError } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// Feature access map per subscription tier
// ---------------------------------------------------------------------------

export type SubscriptionTierName = 'Free' | 'Pro' | 'Premium';

export interface TierFeatures {
  questionsPerMonth: number;
  catSimulations: number;
  aiTutorMessages: number;
  flashcardDecks: number;
  studyGroups: number;
  advancedAnalytics: boolean;
  customStudyPlans: boolean;
  contentDownloads: boolean;
}

const TIER_FEATURES: Record<SubscriptionTierName, TierFeatures> = {
  Free: {
    questionsPerMonth: 50,
    catSimulations: 0,
    aiTutorMessages: 10,
    flashcardDecks: 3,
    studyGroups: 1,
    advancedAnalytics: false,
    customStudyPlans: false,
    contentDownloads: false,
  },
  Pro: {
    questionsPerMonth: -1, // unlimited
    catSimulations: -1,
    aiTutorMessages: -1,
    flashcardDecks: -1,
    studyGroups: 5,
    advancedAnalytics: true,
    customStudyPlans: true,
    contentDownloads: false,
  },
  Premium: {
    questionsPerMonth: -1,
    catSimulations: -1,
    aiTutorMessages: -1,
    flashcardDecks: -1,
    studyGroups: -1,
    advancedAnalytics: true,
    customStudyPlans: true,
    contentDownloads: true,
  },
};

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<SubscriptionTierName, number> = {
  Free: 0,
  Pro: 1,
  Premium: 2,
};

/**
 * Check if a tier has access to a specific feature.
 * For boolean features, returns true/false.
 * For numeric features, returns true if the limit is non-zero (or unlimited).
 */
export function canAccess(tier: string, feature: string): boolean {
  const normalizedTier = normalizeTier(tier);
  const features = TIER_FEATURES[normalizedTier];
  if (!features) return false;

  const value = features[feature as keyof TierFeatures];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0; // -1 = unlimited, >0 = has access
  return false;
}

/**
 * Get the numeric limit for a feature in a given tier.
 * Returns -1 for unlimited, 0 for no access, or the numeric limit.
 */
export function getLimit(tier: string, feature: string): number {
  const normalizedTier = normalizeTier(tier);
  const features = TIER_FEATURES[normalizedTier];
  if (!features) return 0;

  const value = features[feature as keyof TierFeatures];
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? -1 : 0;
  return 0;
}

/**
 * Check if a user's current usage is within the limit for a feature.
 * Returns whether access is allowed, the limit, and remaining usage.
 */
export function checkUsageLimit(
  tier: string,
  feature: string,
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const limit = getLimit(tier, feature);

  // Unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }

  // No access
  if (limit === 0) {
    return { allowed: false, limit: 0, remaining: 0 };
  }

  const remaining = Math.max(0, limit - currentUsage);
  return {
    allowed: currentUsage < limit,
    limit,
    remaining,
  };
}

/**
 * Middleware helper that enforces a minimum subscription tier.
 * Throws AuthError(403) if the user's tier is below the required minimum.
 * Returns the session on success.
 */
export async function requireSubscription(minTier: 'Pro' | 'Premium') {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AuthError('Unauthorized', 401);
  }

  const userTier = normalizeTier(session.user.subscriptionTier ?? 'Free');
  const minLevel = TIER_HIERARCHY[minTier];
  const userLevel = TIER_HIERARCHY[userTier];

  if (userLevel < minLevel) {
    throw new AuthError(
      `This feature requires a ${minTier} subscription or higher`,
      403
    );
  }

  return session;
}

/**
 * Get all features for a given tier.
 */
export function getTierFeatures(tier: string): TierFeatures {
  return TIER_FEATURES[normalizeTier(tier)];
}

/**
 * Check if tierA is at least as high as tierB.
 */
export function isTierAtLeast(
  tierA: string,
  tierB: SubscriptionTierName
): boolean {
  return TIER_HIERARCHY[normalizeTier(tierA)] >= TIER_HIERARCHY[tierB];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeTier(tier: string): SubscriptionTierName {
  const normalized = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  if (normalized in TIER_FEATURES) return normalized as SubscriptionTierName;
  return 'Free';
}
