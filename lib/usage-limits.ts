import { prisma } from '@/lib/db';
import { getLimit, checkUsageLimit } from '@/lib/subscription';

// ---------------------------------------------------------------------------
// Feature-to-tier-limit mapping
// Maps DailyUsage field names to the corresponding TierFeatures limit keys
// ---------------------------------------------------------------------------

const FEATURE_TO_LIMIT_KEY: Record<string, string> = {
  questionsAttempted: 'questionsPerMonth',
  aiChatMessages: 'aiTutorMessages',
  flashcardsReviewed: 'flashcardDecks',
  catSessions: 'catSimulations',
};

// Features that are tracked on a monthly basis (summed across the month)
const MONTHLY_FEATURES = new Set(['questionsAttempted']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getStartOfMonth(): Date {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get or create today's DailyUsage record for a given user.
 */
async function getOrCreateTodayUsage(userId: string) {
  const today = getStartOfToday();

  return prisma.dailyUsage.upsert({
    where: {
      userId_usageDate: {
        userId,
        usageDate: today,
      },
    },
    update: {},
    create: {
      userId,
      usageDate: today,
    },
  });
}

/**
 * Get the current usage count for a feature.
 * For monthly features (e.g. questionsAttempted), sums across the current month.
 * For daily features, returns the count from today's record.
 */
async function getCurrentUsage(
  userId: string,
  feature: 'questionsAttempted' | 'aiChatMessages' | 'flashcardsReviewed' | 'catSessions'
): Promise<number> {
  if (MONTHLY_FEATURES.has(feature)) {
    const startOfMonth = getStartOfMonth();
    const result = await prisma.dailyUsage.aggregate({
      where: {
        userId,
        usageDate: { gte: startOfMonth },
      },
      _sum: {
        [feature]: true,
      } as any,
    });
    return (result._sum as any)?.[feature] ?? 0;
  }

  // Daily feature -- use today's record
  const todayRecord = await getOrCreateTodayUsage(userId);
  return todayRecord[feature];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type UsageFeature = 'questionsAttempted' | 'aiChatMessages' | 'flashcardsReviewed' | 'catSessions';

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

/**
 * Check whether a user can use a feature and, if allowed, increment the usage count.
 *
 * - Gets or creates today's DailyUsage record for the user.
 * - Checks the current usage against the tier limit.
 * - If within limits, atomically increments the count and returns { allowed: true, remaining, limit }.
 * - If over the limit, returns { allowed: false, remaining: 0, limit }.
 * - For unlimited features (limit === -1), always allows and increments.
 */
export async function checkAndIncrementUsage(
  userId: string,
  feature: UsageFeature,
  tier: string
): Promise<UsageCheckResult> {
  const limitKey = FEATURE_TO_LIMIT_KEY[feature];
  if (!limitKey) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  const featureLimit = getLimit(tier, limitKey);

  // Unlimited -- always allow
  if (featureLimit === -1) {
    // Still increment for tracking purposes
    const today = getStartOfToday();
    await prisma.dailyUsage.upsert({
      where: {
        userId_usageDate: { userId, usageDate: today },
      },
      update: {
        [feature]: { increment: 1 },
      },
      create: {
        userId,
        usageDate: today,
        [feature]: 1,
      },
    });
    return { allowed: true, remaining: -1, limit: -1 };
  }

  // No access at all
  if (featureLimit === 0) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  // Finite limit -- check current usage
  const currentUsage = await getCurrentUsage(userId, feature);
  const { allowed, remaining, limit } = checkUsageLimit(tier, limitKey, currentUsage);

  if (!allowed) {
    return { allowed: false, remaining: 0, limit };
  }

  // Increment the count
  const today = getStartOfToday();
  await prisma.dailyUsage.upsert({
    where: {
      userId_usageDate: { userId, usageDate: today },
    },
    update: {
      [feature]: { increment: 1 },
    },
    create: {
      userId,
      usageDate: today,
      [feature]: 1,
    },
  });

  return { allowed: true, remaining: remaining - 1, limit };
}

/**
 * Get a summary of current usage vs limits for all tracked features.
 */
export async function getUsageSummary(
  userId: string,
  tier: string
): Promise<
  Record<
    UsageFeature,
    { current: number; limit: number; remaining: number; period: 'daily' | 'monthly' }
  >
> {
  const features: UsageFeature[] = [
    'questionsAttempted',
    'aiChatMessages',
    'flashcardsReviewed',
    'catSessions',
  ];

  const summary: Record<string, { current: number; limit: number; remaining: number; period: 'daily' | 'monthly' }> = {};

  for (const feature of features) {
    const limitKey = FEATURE_TO_LIMIT_KEY[feature];
    const featureLimit = getLimit(tier, limitKey);
    const currentUsage = await getCurrentUsage(userId, feature);
    const period: 'daily' | 'monthly' = MONTHLY_FEATURES.has(feature) ? 'monthly' : 'daily';

    if (featureLimit === -1) {
      summary[feature] = {
        current: currentUsage,
        limit: -1,
        remaining: -1,
        period,
      };
    } else {
      const remaining = Math.max(0, featureLimit - currentUsage);
      summary[feature] = {
        current: currentUsage,
        limit: featureLimit,
        remaining,
        period,
      };
    }
  }

  return summary as Record<
    UsageFeature,
    { current: number; limit: number; remaining: number; period: 'daily' | 'monthly' }
  >;
}
