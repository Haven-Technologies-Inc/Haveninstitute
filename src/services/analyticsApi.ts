// ============================================================================
// ANALYTICS API SERVICE
// ============================================================================
// Comprehensive analytics for student performance tracking

import { supabase } from '../lib/supabase';
import type { UserPerformanceMetrics } from '../lib/types';
import { flashcardProgressApi } from './flashcardProgressApi';
import { bookProgressApi } from './bookProgressApi';
import { quizSessionApi } from './quizSessionApi';

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardStats {
  overview: {
    totalStudyTime: number; // minutes
    studyStreak: number; // days
    questionsAnswered: number;
    accuracy: number; // percentage
    rank?: number; // user's rank among peers
  };
  quizzes: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    recentScores: number[];
  };
  flashcards: {
    totalCards: number;
    masteredCards: number;
    dueCards: number;
    accuracy: number;
  };
  reading: {
    booksStarted: number;
    booksCompleted: number;
    totalTimeSpent: number;
    currentStreak: number;
  };
  categoryPerformance: {
    category: string;
    questionsAnswered: number;
    accuracy: number;
    timeSpent: number;
  }[];
  recentActivity: {
    date: string;
    type: 'quiz' | 'flashcard' | 'reading' | 'practice';
    description: string;
    score?: number;
  }[];
  goals: {
    targetExamDate?: Date;
    dailyGoal: number; // questions per day
    progress: number; // percentage
  };
}

export interface CategoryAnalytics {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTimePerQuestion: number;
  difficultyBreakdown: {
    easy: { total: number; correct: number; accuracy: number };
    medium: { total: number; correct: number; accuracy: number };
    hard: { total: number; correct: number; accuracy: number };
  };
  trend: 'improving' | 'stable' | 'declining';
  weakTopics: string[];
  strongTopics: string[];
}

export interface PerformanceTrend {
  date: string;
  questionsAnswered: number;
  accuracy: number;
  averageScore: number;
  studyTime: number;
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStats = async (userId: string): Promise<DashboardStats | null> => {
  try {
    // Fetch data from all services in parallel
    const [
      quizStats,
      flashcardStats,
      readingStats,
      userSessions,
      questionUsage
    ] = await Promise.all([
      quizSessionApi.getUserSessionStats(userId),
      flashcardProgressApi.getStudyStats(userId),
      bookProgressApi.getReadingStats(userId),
      quizSessionApi.getUserSessions(userId, 'completed', undefined, 10),
      getQuestionUsageStats(userId)
    ]);

    // Calculate overview stats
    const totalStudyTime = (quizStats?.totalTimeSpent || 0) + (readingStats?.totalTimeSpent || 0);
    const questionsAnswered = quizStats?.totalQuestions || 0;
    const accuracy = questionUsage?.accuracy || 0;

    // Calculate study streak (simplified - based on quiz sessions)
    const studyStreak = await calculateStudyStreak(userId);

    // Recent scores for trend analysis
    const recentScores = userSessions
      .slice(0, 10)
      .map(s => s.finalPercentage || 0)
      .reverse();

    // Category performance
    const categoryPerformance = await getCategoryPerformance(userId);

    // Recent activity
    const recentActivity = await getRecentActivity(userId, 10);

    // User goals (from user profile or defaults)
    const userGoals = await getUserGoals(userId);

    return {
      overview: {
        totalStudyTime,
        studyStreak,
        questionsAnswered,
        accuracy,
        rank: undefined // TODO: Implement ranking system
      },
      quizzes: {
        totalAttempts: quizStats?.totalSessions || 0,
        averageScore: quizStats?.averageScore || 0,
        passRate: quizStats?.passRate || 0,
        recentScores
      },
      flashcards: {
        totalCards: flashcardStats?.totalCards || 0,
        masteredCards: flashcardStats?.masteredCards || 0,
        dueCards: flashcardStats?.dueCards || 0,
        accuracy: flashcardStats?.accuracy || 0
      },
      reading: {
        booksStarted: readingStats?.totalBooks || 0,
        booksCompleted: readingStats?.completedBooks || 0,
        totalTimeSpent: readingStats?.totalTimeSpent || 0,
        currentStreak: await bookProgressApi.getReadingStreak(userId)
      },
      categoryPerformance,
      recentActivity,
      goals: userGoals
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};

// ============================================================================
// CATEGORY ANALYTICS
// ============================================================================

/**
 * Get detailed analytics for a specific category
 */
export const getCategoryAnalytics = async (
  userId: string,
  category: string
): Promise<CategoryAnalytics | null> => {
  try {
    const { data, error } = await supabase
      .from('question_usage')
      .select(`
        *,
        question:questions(category, difficulty)
      `)
      .eq('user_id', userId)
      .eq('questions.category', category);

    if (error) throw error;

    const usageData = data as any[];

    const totalQuestions = usageData.length;
    const correctAnswers = usageData.filter(u => u.is_correct).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const totalTime = usageData.reduce((sum, u) => sum + (u.time_spent || 0), 0);
    const averageTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

    // Difficulty breakdown
    const difficultyBreakdown = {
      easy: { total: 0, correct: 0, accuracy: 0 },
      medium: { total: 0, correct: 0, accuracy: 0 },
      hard: { total: 0, correct: 0, accuracy: 0 }
    };

    usageData.forEach(usage => {
      const difficulty = usage.question?.difficulty || 'medium';
      if (difficultyBreakdown[difficulty as keyof typeof difficultyBreakdown]) {
        difficultyBreakdown[difficulty as keyof typeof difficultyBreakdown].total++;
        if (usage.is_correct) {
          difficultyBreakdown[difficulty as keyof typeof difficultyBreakdown].correct++;
        }
      }
    });

    // Calculate accuracy for each difficulty
    Object.keys(difficultyBreakdown).forEach(key => {
      const diff = difficultyBreakdown[key as keyof typeof difficultyBreakdown];
      diff.accuracy = diff.total > 0 ? (diff.correct / diff.total) * 100 : 0;
    });

    // Calculate trend (simplified)
    const trend = calculateTrend(usageData);

    return {
      category,
      totalQuestions,
      correctAnswers,
      accuracy,
      averageTimePerQuestion,
      difficultyBreakdown,
      trend,
      weakTopics: [], // TODO: Implement subcategory analysis
      strongTopics: []
    };
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    return null;
  }
};

/**
 * Get performance by category
 */
export const getCategoryPerformance = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('question_usage')
      .select(`
        *,
        question:questions(category)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const categoryMap = new Map<string, {
      total: number;
      correct: number;
      timeSpent: number;
    }>();

    data.forEach((usage: any) => {
      const category = usage.question?.category || 'Unknown';
      const existing = categoryMap.get(category) || { total: 0, correct: 0, timeSpent: 0 };

      existing.total++;
      if (usage.is_correct) existing.correct++;
      existing.timeSpent += usage.time_spent || 0;

      categoryMap.set(category, existing);
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      questionsAnswered: stats.total,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      timeSpent: stats.timeSpent
    })).sort((a, b) => b.questionsAnswered - a.questionsAnswered);
  } catch (error) {
    console.error('Error fetching category performance:', error);
    return [];
  }
};

// ============================================================================
// PERFORMANCE TRENDS
// ============================================================================

/**
 * Get performance trend over time
 */
export const getPerformanceTrend = async (
  userId: string,
  days: number = 30
): Promise<PerformanceTrend[]> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get quiz sessions
    const sessions = await quizSessionApi.getUserSessions(userId, 'completed');
    const recentSessions = sessions.filter(s =>
      new Date(s.completedAt || s.createdAt) >= startDate
    );

    // Group by date
    const trendMap = new Map<string, {
      questionsAnswered: number;
      correctAnswers: number;
      totalScore: number;
      sessionCount: number;
      studyTime: number;
    }>();

    recentSessions.forEach(session => {
      const date = new Date(session.completedAt || session.createdAt)
        .toISOString()
        .split('T')[0];

      const existing = trendMap.get(date) || {
        questionsAnswered: 0,
        correctAnswers: 0,
        totalScore: 0,
        sessionCount: 0,
        studyTime: 0
      };

      existing.questionsAnswered += session.totalQuestions;
      existing.correctAnswers += session.correctAnswers;
      existing.totalScore += session.finalPercentage || 0;
      existing.sessionCount++;
      existing.studyTime += session.timeElapsed;

      trendMap.set(date, existing);
    });

    // Convert to array and calculate averages
    const trends = Array.from(trendMap.entries()).map(([date, stats]) => ({
      date,
      questionsAnswered: stats.questionsAnswered,
      accuracy: stats.questionsAnswered > 0
        ? (stats.correctAnswers / stats.questionsAnswered) * 100
        : 0,
      averageScore: stats.sessionCount > 0
        ? stats.totalScore / stats.sessionCount
        : 0,
      studyTime: Math.round(stats.studyTime / 60) // Convert to minutes
    }));

    // Fill in missing dates with zero values
    const allDates: PerformanceTrend[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const existing = trends.find(t => t.date === dateStr);
      allDates.push(existing || {
        date: dateStr,
        questionsAnswered: 0,
        accuracy: 0,
        averageScore: 0,
        studyTime: 0
      });
    }

    return allDates;
  } catch (error) {
    console.error('Error fetching performance trend:', error);
    return [];
  }
};

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

/**
 * Get recent activity across all study types
 */
export const getRecentActivity = async (userId: string, limit: number = 20) => {
  try {
    const activity: {
      date: string;
      type: 'quiz' | 'flashcard' | 'reading' | 'practice';
      description: string;
      score?: number;
    }[] = [];

    // Get recent quiz sessions
    const quizSessions = await quizSessionApi.getUserSessions(userId, 'completed', undefined, limit);
    quizSessions.forEach(session => {
      activity.push({
        date: session.completedAt?.toISOString() || session.createdAt.toISOString(),
        type: session.sessionType === 'cat' ? 'practice' : 'quiz',
        description: `Completed ${session.sessionType} with ${session.totalQuestions} questions`,
        score: session.finalPercentage
      });
    });

    // Get recent reading progress
    const readingProgress = await bookProgressApi.getUserReadingProgress(userId);
    readingProgress.slice(0, limit).forEach(progress => {
      activity.push({
        date: progress.lastRead.toISOString(),
        type: 'reading',
        description: `Reading progress: ${progress.progress}% complete`,
        score: progress.progress
      });
    });

    // Sort by date (most recent first) and limit
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return activity.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate study streak
 */
const calculateStudyStreak = async (userId: string): Promise<number> => {
  try {
    const sessions = await quizSessionApi.getUserSessions(userId, 'completed');

    if (sessions.length === 0) return 0;

    // Sort sessions by completion date (most recent first)
    const sortedSessions = sessions.sort((a, b) =>
      new Date(b.completedAt || b.createdAt).getTime() -
      new Date(a.completedAt || a.createdAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completedAt || session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        if (daysDiff > streak) streak = daysDiff;
        currentDate = sessionDate;
        streak++;
      } else if (daysDiff > streak + 1) {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating study streak:', error);
    return 0;
  }
};

/**
 * Get question usage statistics
 */
const getQuestionUsageStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('question_usage')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const total = data.length;
    const correct = data.filter(u => u.is_correct).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return { total, correct, accuracy };
  } catch (error) {
    console.error('Error fetching question usage stats:', error);
    return { total: 0, correct: 0, accuracy: 0 };
  }
};

/**
 * Calculate performance trend
 */
const calculateTrend = (usageData: any[]): 'improving' | 'stable' | 'declining' => {
  if (usageData.length < 10) return 'stable';

  // Split data into two halves
  const midpoint = Math.floor(usageData.length / 2);
  const firstHalf = usageData.slice(0, midpoint);
  const secondHalf = usageData.slice(midpoint);

  const firstAccuracy = firstHalf.filter(u => u.is_correct).length / firstHalf.length;
  const secondAccuracy = secondHalf.filter(u => u.is_correct).length / secondHalf.length;

  const difference = secondAccuracy - firstAccuracy;

  if (difference > 0.05) return 'improving';
  if (difference < -0.05) return 'declining';
  return 'stable';
};

/**
 * Get user goals
 */
const getUserGoals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const preferences = data?.preferences || {};

    return {
      targetExamDate: preferences.targetExamDate
        ? new Date(preferences.targetExamDate)
        : undefined,
      dailyGoal: preferences.dailyGoal || 50,
      progress: 0 // TODO: Calculate based on questions answered today
    };
  } catch (error) {
    console.error('Error fetching user goals:', error);
    return {
      dailyGoal: 50,
      progress: 0
    };
  }
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const analyticsApi = {
  // Dashboard
  getDashboardStats,

  // Category Analytics
  getCategoryAnalytics,
  getCategoryPerformance,

  // Trends
  getPerformanceTrend,

  // Activity
  getRecentActivity
};

export default analyticsApi;
