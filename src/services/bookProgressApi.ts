// ============================================================================
// BOOK PROGRESS API SERVICE
// ============================================================================
// Track reading progress, highlights, and bookmarks for books

import { supabase } from '../lib/supabase';
import type { Book, ReadingProgress } from '../lib/types';

// ============================================================================
// READING PROGRESS
// ============================================================================

/**
 * Get reading progress for a book
 */
export const getReadingProgress = async (
  userId: string,
  bookId: string
): Promise<ReadingProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No progress found
      throw error;
    }

    return data ? mapProgressFromDb(data) : null;
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return null;
  }
};

/**
 * Get all reading progress for a user
 */
export const getUserReadingProgress = async (
  userId: string
): Promise<ReadingProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_read', { ascending: false });

    if (error) throw error;

    return data.map(mapProgressFromDb);
  } catch (error) {
    console.error('Error fetching user reading progress:', error);
    return [];
  }
};

/**
 * Initialize reading progress for a book
 */
export const initializeReadingProgress = async (
  userId: string,
  bookId: string
): Promise<ReadingProgress> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .insert({
        user_id: userId,
        book_id: bookId,
        current_chapter: 1,
        current_page: 1,
        progress: 0,
        last_read: new Date().toISOString(),
        time_spent: 0
      })
      .select()
      .single();

    if (error) throw error;

    return mapProgressFromDb(data);
  } catch (error) {
    console.error('Error initializing reading progress:', error);
    throw new Error('Failed to initialize reading progress');
  }
};

/**
 * Update reading progress
 */
export const updateReadingProgress = async (
  userId: string,
  bookId: string,
  currentChapter: number,
  currentPage: number,
  progressPercentage: number,
  timeSpentMinutes?: number
): Promise<ReadingProgress | null> => {
  try {
    // Check if progress exists
    let progress = await getReadingProgress(userId, bookId);

    if (!progress) {
      // Initialize if doesn't exist
      progress = await initializeReadingProgress(userId, bookId);
    }

    const updateData: any = {
      current_chapter: currentChapter,
      current_page: currentPage,
      progress: progressPercentage,
      last_read: new Date().toISOString()
    };

    if (timeSpentMinutes !== undefined) {
      updateData.time_spent = (progress.timeSpent || 0) + timeSpentMinutes;
    }

    const { data, error } = await supabase
      .from('reading_progress')
      .update(updateData)
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .select()
      .single();

    if (error) throw error;

    return data ? mapProgressFromDb(data) : null;
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return null;
  }
};

/**
 * Mark book as completed
 */
export const markBookCompleted = async (
  userId: string,
  bookId: string
): Promise<ReadingProgress | null> => {
  try {
    const { data: book } = await supabase
      .from('books')
      .select('total_chapters, total_pages')
      .eq('id', bookId)
      .single();

    if (!book) throw new Error('Book not found');

    return await updateReadingProgress(
      userId,
      bookId,
      book.total_chapters,
      book.total_pages,
      100
    );
  } catch (error) {
    console.error('Error marking book as completed:', error);
    return null;
  }
};

/**
 * Get books in progress for a user
 */
export const getBooksInProgress = async (userId: string): Promise<Array<ReadingProgress & { book: Book }>> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select(`
        *,
        book:books(*)
      `)
      .eq('user_id', userId)
      .lt('progress', 100)
      .order('last_read', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      ...mapProgressFromDb(item),
      book: item.book
    }));
  } catch (error) {
    console.error('Error fetching books in progress:', error);
    return [];
  }
};

/**
 * Get completed books for a user
 */
export const getCompletedBooks = async (userId: string): Promise<Array<ReadingProgress & { book: Book }>> => {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select(`
        *,
        book:books(*)
      `)
      .eq('user_id', userId)
      .eq('progress', 100)
      .order('last_read', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      ...mapProgressFromDb(item),
      book: item.book
    }));
  } catch (error) {
    console.error('Error fetching completed books:', error);
    return [];
  }
};

// ============================================================================
// HIGHLIGHTS
// ============================================================================

export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  text: string;
  color: string;
  note?: string;
  createdAt: Date;
}

/**
 * Create a highlight
 */
export const createHighlight = async (
  userId: string,
  bookId: string,
  chapter: number,
  text: string,
  color: string = 'yellow',
  note?: string
): Promise<Highlight> => {
  try {
    const { data, error } = await supabase
      .from('highlights')
      .insert({
        user_id: userId,
        book_id: bookId,
        chapter,
        text,
        color,
        note
      })
      .select()
      .single();

    if (error) throw error;

    return mapHighlightFromDb(data);
  } catch (error) {
    console.error('Error creating highlight:', error);
    throw new Error('Failed to create highlight');
  }
};

/**
 * Get highlights for a book
 */
export const getBookHighlights = async (
  userId: string,
  bookId: string,
  chapter?: number
): Promise<Highlight[]> => {
  try {
    let query = supabase
      .from('highlights')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (chapter !== undefined) {
      query = query.eq('chapter', chapter);
    }

    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return data.map(mapHighlightFromDb);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return [];
  }
};

/**
 * Update a highlight
 */
export const updateHighlight = async (
  highlightId: string,
  userId: string,
  updates: { color?: string; note?: string }
): Promise<Highlight | null> => {
  try {
    const { data, error } = await supabase
      .from('highlights')
      .update(updates)
      .eq('id', highlightId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return data ? mapHighlightFromDb(data) : null;
  } catch (error) {
    console.error('Error updating highlight:', error);
    return null;
  }
};

/**
 * Delete a highlight
 */
export const deleteHighlight = async (
  highlightId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', highlightId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return false;
  }
};

// ============================================================================
// BOOKMARKS
// ============================================================================

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  page: number;
  title: string;
  createdAt: Date;
}

/**
 * Create a bookmark
 */
export const createBookmark = async (
  userId: string,
  bookId: string,
  chapter: number,
  page: number,
  title: string
): Promise<Bookmark> => {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        book_id: bookId,
        chapter,
        page,
        title
      })
      .select()
      .single();

    if (error) throw error;

    return mapBookmarkFromDb(data);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    throw new Error('Failed to create bookmark');
  }
};

/**
 * Get bookmarks for a book
 */
export const getBookBookmarks = async (
  userId: string,
  bookId: string
): Promise<Bookmark[]> => {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('chapter', { ascending: true });

    if (error) throw error;

    return data.map(mapBookmarkFromDb);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

/**
 * Delete a bookmark
 */
export const deleteBookmark = async (
  bookmarkId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return false;
  }
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get reading statistics for a user
 */
export const getReadingStats = async (userId: string) => {
  try {
    const allProgress = await getUserReadingProgress(userId);

    const totalBooks = allProgress.length;
    const completedBooks = allProgress.filter(p => p.progress === 100).length;
    const inProgressBooks = allProgress.filter(p => p.progress > 0 && p.progress < 100).length;
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageProgress = totalBooks > 0
      ? allProgress.reduce((sum, p) => sum + p.progress, 0) / totalBooks
      : 0;

    // Get recent reading activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReads = allProgress.filter(p =>
      new Date(p.lastRead) >= sevenDaysAgo
    ).length;

    return {
      totalBooks,
      completedBooks,
      inProgressBooks,
      totalTimeSpent,
      averageProgress: Math.round(averageProgress),
      completionRate: totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0,
      recentReads,
      averageTimePerBook: totalBooks > 0 ? Math.round(totalTimeSpent / totalBooks) : 0
    };
  } catch (error) {
    console.error('Error fetching reading stats:', error);
    return null;
  }
};

/**
 * Get reading streak (consecutive days of reading)
 */
export const getReadingStreak = async (userId: string): Promise<number> => {
  try {
    const allProgress = await getUserReadingProgress(userId);

    // Sort by last read date (most recent first)
    const sortedProgress = allProgress.sort((a, b) =>
      new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const progress of sortedProgress) {
      const readDate = new Date(progress.lastRead);
      readDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - readDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = readDate;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating reading streak:', error);
    return 0;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mapProgressFromDb = (data: any): ReadingProgress => {
  return {
    id: data.id,
    userId: data.user_id,
    bookId: data.book_id,
    currentChapter: data.current_chapter,
    currentPage: data.current_page,
    progress: data.progress,
    lastRead: new Date(data.last_read),
    timeSpent: data.time_spent
  };
};

const mapHighlightFromDb = (data: any): Highlight => {
  return {
    id: data.id,
    userId: data.user_id,
    bookId: data.book_id,
    chapter: data.chapter,
    text: data.text,
    color: data.color,
    note: data.note,
    createdAt: new Date(data.created_at)
  };
};

const mapBookmarkFromDb = (data: any): Bookmark => {
  return {
    id: data.id,
    userId: data.user_id,
    bookId: data.book_id,
    chapter: data.chapter,
    page: data.page,
    title: data.title,
    createdAt: new Date(data.created_at)
  };
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const bookProgressApi = {
  // Reading Progress
  getReadingProgress,
  getUserReadingProgress,
  initializeReadingProgress,
  updateReadingProgress,
  markBookCompleted,
  getBooksInProgress,
  getCompletedBooks,

  // Highlights
  createHighlight,
  getBookHighlights,
  updateHighlight,
  deleteHighlight,

  // Bookmarks
  createBookmark,
  getBookBookmarks,
  deleteBookmark,

  // Analytics
  getReadingStats,
  getReadingStreak
};

export default bookProgressApi;
