// ============================================================================
// FLASHCARD PROGRESS API SERVICE
// ============================================================================
// Manage flashcard review progress with spaced repetition

import { supabase } from '../lib/supabase';
import type { FlashcardProgress, Flashcard } from '../lib/types';
import {
  calculateSM2,
  getInitialSM2Values,
  isCardDue,
  type RecallQuality
} from './spacedRepetition';

// ============================================================================
// CREATE / INITIALIZE
// ============================================================================

/**
 * Initialize progress for a flashcard
 */
export const initializeFlashcardProgress = async (
  userId: string,
  flashcardId: string
): Promise<FlashcardProgress> => {
  try {
    const sm2Values = getInitialSM2Values();

    const { data, error } = await supabase
      .from('flashcard_progress')
      .insert({
        user_id: userId,
        flashcard_id: flashcardId,
        status: 'new',
        attempts: 0,
        correct_count: 0,
        last_reviewed: new Date().toISOString(),
        next_review: sm2Values.nextReview.toISOString(),
        confidence: 0,
        ease_factor: sm2Values.easeFactor,
        interval: sm2Values.interval,
        repetitions: sm2Values.repetitions
      })
      .select()
      .single();

    if (error) throw error;

    return mapProgressFromDb(data);
  } catch (error) {
    console.error('Error initializing flashcard progress:', error);
    throw new Error('Failed to initialize flashcard progress');
  }
};

/**
 * Initialize progress for multiple flashcards
 */
export const initializeMultipleFlashcards = async (
  userId: string,
  flashcardIds: string[]
): Promise<FlashcardProgress[]> => {
  try {
    const sm2Values = getInitialSM2Values();
    const now = new Date().toISOString();

    const progressRecords = flashcardIds.map(flashcardId => ({
      user_id: userId,
      flashcard_id: flashcardId,
      status: 'new',
      attempts: 0,
      correct_count: 0,
      last_reviewed: now,
      next_review: sm2Values.nextReview.toISOString(),
      confidence: 0,
      ease_factor: sm2Values.easeFactor,
      interval: sm2Values.interval,
      repetitions: sm2Values.repetitions
    }));

    const { data, error } = await supabase
      .from('flashcard_progress')
      .insert(progressRecords)
      .select();

    if (error) throw error;

    return data.map(mapProgressFromDb);
  } catch (error) {
    console.error('Error initializing multiple flashcards:', error);
    throw new Error('Failed to initialize flashcards');
  }
};

// ============================================================================
// READ
// ============================================================================

/**
 * Get progress for a specific flashcard
 */
export const getFlashcardProgress = async (
  userId: string,
  flashcardId: string
): Promise<FlashcardProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('flashcard_id', flashcardId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No progress found
      throw error;
    }

    return data ? mapProgressFromDb(data) : null;
  } catch (error) {
    console.error('Error fetching flashcard progress:', error);
    return null;
  }
};

/**
 * Get all flashcard progress for a user
 */
export const getUserFlashcardProgress = async (
  userId: string,
  status?: 'new' | 'learning' | 'mastered'
): Promise<FlashcardProgress[]> => {
  try {
    let query = supabase
      .from('flashcard_progress')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('last_reviewed', { ascending: false });

    if (error) throw error;

    return data.map(mapProgressFromDb);
  } catch (error) {
    console.error('Error fetching user flashcard progress:', error);
    return [];
  }
};

/**
 * Get flashcards due for review
 */
export const getDueFlashcards = async (
  userId: string,
  limit?: number
): Promise<FlashcardProgress[]> => {
  try {
    let query = supabase
      .from('flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(mapProgressFromDb);
  } catch (error) {
    console.error('Error fetching due flashcards:', error);
    return [];
  }
};

/**
 * Get new flashcards (not yet reviewed)
 */
export const getNewFlashcards = async (
  userId: string,
  limit: number = 20
): Promise<FlashcardProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'new')
      .limit(limit);

    if (error) throw error;

    return data.map(mapProgressFromDb);
  } catch (error) {
    console.error('Error fetching new flashcards:', error);
    return [];
  }
};

/**
 * Get flashcards by category
 */
export const getFlashcardsByCategory = async (
  userId: string,
  category: string
): Promise<Array<FlashcardProgress & { flashcard: Flashcard }>> => {
  try {
    const { data, error } = await supabase
      .from('flashcard_progress')
      .select(`
        *,
        flashcard:flashcards(*)
      `)
      .eq('user_id', userId)
      .eq('flashcards.category', category);

    if (error) throw error;

    return data.map((item: any) => ({
      ...mapProgressFromDb(item),
      flashcard: item.flashcard
    }));
  } catch (error) {
    console.error('Error fetching flashcards by category:', error);
    return [];
  }
};

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Record a review of a flashcard
 */
export const recordReview = async (
  userId: string,
  flashcardId: string,
  quality: RecallQuality,
  timeSpent?: number
): Promise<FlashcardProgress | null> => {
  try {
    // Get current progress
    let progress = await getFlashcardProgress(userId, flashcardId);

    // If no progress exists, initialize it
    if (!progress) {
      progress = await initializeFlashcardProgress(userId, flashcardId);
    }

    // Calculate new SM2 values
    const sm2Result = calculateSM2(
      quality,
      progress.repetitions || 0,
      progress.easeFactor || 2.5,
      progress.interval || 0
    );

    // Determine new status
    let newStatus: 'new' | 'learning' | 'mastered' = 'learning';
    if (sm2Result.repetitions >= 3 && quality >= 4) {
      newStatus = 'mastered';
    } else if (sm2Result.repetitions === 0) {
      newStatus = 'learning';
    }

    // Update progress
    const isCorrect = quality >= 3;
    const newAttempts = progress.attempts + 1;
    const newCorrectCount = progress.correctCount + (isCorrect ? 1 : 0);
    const newConfidence = Math.round((newCorrectCount / newAttempts) * 100);

    const { data, error } = await supabase
      .from('flashcard_progress')
      .update({
        status: newStatus,
        attempts: newAttempts,
        correct_count: newCorrectCount,
        last_reviewed: new Date().toISOString(),
        next_review: sm2Result.nextReview.toISOString(),
        confidence: newConfidence,
        ease_factor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions
      })
      .eq('user_id', userId)
      .eq('flashcard_id', flashcardId)
      .select()
      .single();

    if (error) throw error;

    return data ? mapProgressFromDb(data) : null;
  } catch (error) {
    console.error('Error recording review:', error);
    return null;
  }
};

/**
 * Reset progress for a flashcard
 */
export const resetFlashcardProgress = async (
  userId: string,
  flashcardId: string
): Promise<FlashcardProgress | null> => {
  try {
    const sm2Values = getInitialSM2Values();

    const { data, error } = await supabase
      .from('flashcard_progress')
      .update({
        status: 'new',
        attempts: 0,
        correct_count: 0,
        last_reviewed: new Date().toISOString(),
        next_review: sm2Values.nextReview.toISOString(),
        confidence: 0,
        ease_factor: sm2Values.easeFactor,
        interval: sm2Values.interval,
        repetitions: sm2Values.repetitions
      })
      .eq('user_id', userId)
      .eq('flashcard_id', flashcardId)
      .select()
      .single();

    if (error) throw error;

    return data ? mapProgressFromDb(data) : null;
  } catch (error) {
    console.error('Error resetting flashcard progress:', error);
    return null;
  }
};

/**
 * Mark flashcard as mastered
 */
export const markAsMastered = async (
  userId: string,
  flashcardId: string
): Promise<FlashcardProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('flashcard_progress')
      .update({
        status: 'mastered',
        confidence: 100
      })
      .eq('user_id', userId)
      .eq('flashcard_id', flashcardId)
      .select()
      .single();

    if (error) throw error;

    return data ? mapProgressFromDb(data) : null;
  } catch (error) {
    console.error('Error marking flashcard as mastered:', error);
    return null;
  }
};

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete progress for a flashcard
 */
export const deleteFlashcardProgress = async (
  userId: string,
  flashcardId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('flashcard_progress')
      .delete()
      .eq('user_id', userId)
      .eq('flashcard_id', flashcardId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting flashcard progress:', error);
    return false;
  }
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get study statistics for a user
 */
export const getStudyStats = async (userId: string) => {
  try {
    const allProgress = await getUserFlashcardProgress(userId);

    const totalCards = allProgress.length;
    const newCards = allProgress.filter(p => p.status === 'new').length;
    const learningCards = allProgress.filter(p => p.status === 'learning').length;
    const masteredCards = allProgress.filter(p => p.status === 'mastered').length;
    const dueCards = allProgress.filter(p => isCardDue(p.nextReview)).length;

    const averageConfidence = totalCards > 0
      ? allProgress.reduce((sum, p) => sum + p.confidence, 0) / totalCards
      : 0;

    const totalAttempts = allProgress.reduce((sum, p) => sum + p.attempts, 0);
    const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctCount, 0);
    const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

    return {
      totalCards,
      newCards,
      learningCards,
      masteredCards,
      dueCards,
      averageConfidence: Math.round(averageConfidence),
      totalAttempts,
      totalCorrect,
      accuracy: Math.round(accuracy),
      masteryRate: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching study stats:', error);
    return null;
  }
};

/**
 * Get review forecast (how many cards due in next N days)
 */
export const getReviewForecast = async (
  userId: string,
  days: number = 7
): Promise<{ date: string; count: number }[]> => {
  try {
    const allProgress = await getUserFlashcardProgress(userId);
    const forecast: { date: string; count: number }[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(23, 59, 59, 999); // End of day

      const count = allProgress.filter(p => {
        const reviewDate = new Date(p.nextReview);
        return reviewDate <= date && reviewDate > new Date(date.getTime() - 24 * 60 * 60 * 1000);
      }).length;

      forecast.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    return forecast;
  } catch (error) {
    console.error('Error generating review forecast:', error);
    return [];
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map database flashcard progress to FlashcardProgress type
 */
const mapProgressFromDb = (data: any): FlashcardProgress => {
  return {
    id: data.id,
    userId: data.user_id,
    flashcardId: data.flashcard_id,
    status: data.status,
    attempts: data.attempts,
    correctCount: data.correct_count,
    lastReviewed: new Date(data.last_reviewed),
    nextReview: new Date(data.next_review),
    confidence: data.confidence,
    easeFactor: data.ease_factor,
    interval: data.interval,
    repetitions: data.repetitions
  };
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const flashcardProgressApi = {
  // Initialize
  initializeFlashcardProgress,
  initializeMultipleFlashcards,

  // Read
  getFlashcardProgress,
  getUserFlashcardProgress,
  getDueFlashcards,
  getNewFlashcards,
  getFlashcardsByCategory,

  // Update
  recordReview,
  resetFlashcardProgress,
  markAsMastered,

  // Delete
  deleteFlashcardProgress,

  // Analytics
  getStudyStats,
  getReviewForecast
};

export default flashcardProgressApi;
