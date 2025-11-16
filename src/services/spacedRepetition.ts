// ============================================================================
// SPACED REPETITION SERVICE
// ============================================================================
// Implementation of the SM2 (SuperMemo 2) algorithm for flashcard review
// Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

import type { SM2Result, SpacedRepetitionCard } from '../lib/types';

/**
 * Quality of recall ratings (0-5):
 * 0 - Complete blackout
 * 1 - Incorrect response; correct one seemed easy to recall
 * 2 - Incorrect response; correct one seemed familiar
 * 3 - Correct response with serious difficulty
 * 4 - Correct response with hesitation
 * 5 - Perfect response
 */
export type RecallQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Calculate the next review interval using SM2 algorithm
 *
 * @param quality - Quality of recall (0-5)
 * @param repetitions - Number of consecutive correct repetitions
 * @param easeFactor - Current ease factor (minimum 1.3)
 * @param previousInterval - Previous interval in days
 * @returns SM2Result with updated values
 */
export const calculateSM2 = (
  quality: RecallQuality,
  repetitions: number,
  easeFactor: number,
  previousInterval: number
): SM2Result => {
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = 0;

  // Update ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Minimum ease factor is 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // If quality < 3, reset repetitions and interval
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1; // Review again tomorrow
  } else {
    // Increment repetitions
    newRepetitions = repetitions + 1;

    // Calculate new interval
    if (newRepetitions === 1) {
      newInterval = 1; // First correct answer: review tomorrow
    } else if (newRepetitions === 2) {
      newInterval = 6; // Second correct answer: review in 6 days
    } else {
      // Subsequent reviews: multiply previous interval by ease factor
      newInterval = Math.round(previousInterval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    nextReview
  };
};

/**
 * Get initial SM2 values for a new card
 */
export const getInitialSM2Values = (): Omit<SM2Result, 'nextReview'> & { nextReview: Date } => {
  const now = new Date();
  return {
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5, // Default ease factor
    nextReview: now // Review immediately
  };
};

/**
 * Determine if a card is due for review
 */
export const isCardDue = (nextReview: Date): boolean => {
  return new Date() >= nextReview;
};

/**
 * Get cards due for review from a list of cards
 */
export const getDueCards = (cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] => {
  return cards.filter(card => isCardDue(card.nextReview));
};

/**
 * Sort cards by next review date (earliest first)
 */
export const sortCardsByDueDate = (cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] => {
  return [...cards].sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
};

/**
 * Get statistics about a card collection
 */
export const getCardStats = (cards: SpacedRepetitionCard[]) => {
  const now = new Date();
  const dueCards = cards.filter(card => card.nextReview <= now);
  const newCards = cards.filter(card => card.repetitions === 0);
  const learningCards = cards.filter(card => card.repetitions > 0 && card.repetitions < 3);
  const matureCards = cards.filter(card => card.repetitions >= 3);

  return {
    total: cards.length,
    due: dueCards.length,
    new: newCards.length,
    learning: learningCards.length,
    mature: matureCards.length,
    averageEaseFactor: cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length || 2.5
  };
};

/**
 * Convert quality from percentage to SM2 quality scale
 * Useful for converting from other rating systems
 *
 * @param percentage - Confidence percentage (0-100)
 * @returns RecallQuality (0-5)
 */
export const percentageToQuality = (percentage: number): RecallQuality => {
  if (percentage >= 95) return 5; // Perfect
  if (percentage >= 80) return 4; // Good
  if (percentage >= 60) return 3; // Pass with difficulty
  if (percentage >= 40) return 2; // Fail but familiar
  if (percentage >= 20) return 1; // Fail but easy
  return 0; // Complete fail
};

/**
 * Get recommended daily review limit
 * Based on spaced repetition best practices
 */
export const getRecommendedDailyLimit = (
  totalCards: number,
  averageReviewTimeSeconds: number = 10
): {
  newCards: number;
  reviews: number;
  estimatedTimeMinutes: number;
} => {
  // Recommended: 20-30 new cards per day
  const newCards = Math.min(25, Math.ceil(totalCards * 0.1));

  // Reviews depend on retention and card maturity
  // Assume ~20% of total cards are due on any given day
  const reviews = Math.ceil(totalCards * 0.2);

  const totalReviews = newCards + reviews;
  const estimatedTimeMinutes = Math.ceil((totalReviews * averageReviewTimeSeconds) / 60);

  return {
    newCards,
    reviews,
    estimatedTimeMinutes
  };
};

/**
 * Leitner System implementation (alternative to SM2)
 * Simpler algorithm with fixed intervals using boxes/levels
 */
export const leitnerSystem = {
  /**
   * Box intervals in days
   * Box 1: Daily
   * Box 2: Every 2 days
   * Box 3: Every 4 days
   * Box 4: Every 8 days
   * Box 5: Every 16 days
   */
  boxIntervals: [1, 2, 4, 8, 16],

  /**
   * Move card to next box or back to box 1
   */
  moveCard: (currentBox: number, wasCorrect: boolean): { box: number; nextReview: Date } => {
    let newBox = wasCorrect
      ? Math.min(currentBox + 1, 4) // Move up, max box 5 (index 4)
      : 0; // Move back to box 1 (index 0)

    const interval = leitnerSystem.boxIntervals[newBox];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return { box: newBox, nextReview };
  },

  /**
   * Get cards due for review in the Leitner system
   */
  getDueCards: (cards: Array<{ box: number; lastReviewed: Date }>): number[] => {
    const now = new Date();
    return cards
      .map((card, index) => {
        const interval = leitnerSystem.boxIntervals[card.box];
        const nextReview = new Date(card.lastReviewed);
        nextReview.setDate(nextReview.getDate() + interval);
        return nextReview <= now ? index : -1;
      })
      .filter(index => index !== -1);
  }
};

/**
 * Anki-style review intervals (more aggressive than SM2)
 * Good for fast-paced learning
 */
export const ankiIntervals = {
  /**
   * Calculate next interval using Anki's algorithm
   */
  calculate: (
    quality: 'again' | 'hard' | 'good' | 'easy',
    currentInterval: number,
    easeFactor: number
  ): { interval: number; easeFactor: number } => {
    let newInterval = currentInterval;
    let newEaseFactor = easeFactor;

    switch (quality) {
      case 'again':
        newInterval = 1; // Review tomorrow
        newEaseFactor = Math.max(1.3, easeFactor - 0.2);
        break;
      case 'hard':
        newInterval = Math.round(currentInterval * 1.2);
        newEaseFactor = Math.max(1.3, easeFactor - 0.15);
        break;
      case 'good':
        newInterval = Math.round(currentInterval * easeFactor);
        break;
      case 'easy':
        newInterval = Math.round(currentInterval * easeFactor * 1.3);
        newEaseFactor = easeFactor + 0.15;
        break;
    }

    return {
      interval: Math.max(1, newInterval),
      easeFactor: Number(newEaseFactor.toFixed(2))
    };
  }
};

/**
 * Confidence-based scheduling
 * Adjusts intervals based on user-reported confidence
 */
export const confidenceScheduling = {
  /**
   * Calculate next review based on confidence level
   *
   * @param confidence - Confidence level (0-100)
   * @param currentInterval - Current interval in days
   * @returns Next interval in days
   */
  calculate: (confidence: number, currentInterval: number): number => {
    if (confidence >= 90) {
      // Very confident: longer interval
      return Math.round(currentInterval * 2.5);
    } else if (confidence >= 70) {
      // Confident: standard increase
      return Math.round(currentInterval * 2.0);
    } else if (confidence >= 50) {
      // Somewhat confident: small increase
      return Math.round(currentInterval * 1.3);
    } else if (confidence >= 30) {
      // Low confidence: review soon
      return Math.max(1, Math.round(currentInterval * 0.5));
    } else {
      // Very low confidence: review tomorrow
      return 1;
    }
  }
};

export default {
  calculateSM2,
  getInitialSM2Values,
  isCardDue,
  getDueCards,
  sortCardsByDueDate,
  getCardStats,
  percentageToQuality,
  getRecommendedDailyLimit,
  leitnerSystem,
  ankiIntervals,
  confidenceScheduling
};
