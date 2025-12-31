/**
 * NurseHaven Admin API Endpoints
 * 
 * Complete admin functionality for managing all platform features
 * Requires admin role authentication
 */

import { supabase, isSupabaseConfigured } from './supabase';

// Helper function to check if we should use mock data
// In production, NEVER use mock data - throw an error instead
const shouldUseMockData = (): boolean => {
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  
  if (isProduction && !isSupabaseConfigured()) {
    throw new Error('Database not configured. Please set up Supabase environment variables.');
  }
  
  return !isSupabaseConfigured();
};

// ============================================================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  createdAt: Date;
  lastActive: Date;
  totalStudyTime: number;
  quizzesCompleted: number;
  catTestsTaken: number;
}

export const adminUserEndpoints = {
  // Get all users with filtering
  async getAllUsers(filters?: {
    role?: 'user' | 'admin';
    subscriptionTier?: string;
    searchQuery?: string;
  }): Promise<AdminUser[]> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return [
        {
          id: '1',
          email: 'user1@example.com',
          fullName: 'John Doe',
          role: 'user',
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          createdAt: new Date(),
          lastActive: new Date(),
          totalStudyTime: 120,
          quizzesCompleted: 5,
          catTestsTaken: 2
        },
        {
          id: '2',
          email: 'user2@example.com',
          fullName: 'Jane Smith',
          role: 'admin',
          subscriptionTier: 'premium',
          subscriptionStatus: 'active',
          createdAt: new Date(),
          lastActive: new Date(),
          totalStudyTime: 300,
          quizzesCompleted: 10,
          catTestsTaken: 3
        }
      ];
    }

    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.subscriptionTier) {
        query = query.eq('subscription_tier', filters.subscriptionTier);
      }

      if (filters?.searchQuery) {
        query = query.or(`email.ilike.%${filters.searchQuery}%,full_name.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        subscriptionTier: user.subscription_tier,
        subscriptionStatus: user.subscription_status,
        createdAt: new Date(user.created_at),
        lastActive: user.last_active ? new Date(user.last_active) : new Date(user.created_at),
        totalStudyTime: user.total_study_time || 0,
        quizzesCompleted: user.quizzes_completed || 0,
        catTestsTaken: user.cat_tests_taken || 0
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<AdminUser | null> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return {
        id: '1',
        email: 'user1@example.com',
        fullName: 'John Doe',
        role: 'user',
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        createdAt: new Date(),
        lastActive: new Date(),
        totalStudyTime: 120,
        quizzesCompleted: 5,
        catTestsTaken: 2
      };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        subscriptionTier: data.subscription_tier,
        subscriptionStatus: data.subscription_status,
        createdAt: new Date(data.created_at),
        lastActive: data.last_active ? new Date(data.last_active) : new Date(data.created_at),
        totalStudyTime: data.total_study_time || 0,
        quizzesCompleted: data.quizzes_completed || 0,
        catTestsTaken: data.cat_tests_taken || 0
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Update user subscription
  async updateUserSubscription(userId: string, subscriptionData: {
    tier: 'free' | 'pro' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
  }): Promise<void> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          subscription_tier: subscriptionData.tier,
          subscription_status: subscriptionData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  // Suspend/Unsuspend user
  async toggleUserSuspension(userId: string, suspended: boolean): Promise<void> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          suspended: suspended,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling suspension:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get platform statistics
  async getPlatformStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    freeUsers: number;
    proUsers: number;
    premiumUsers: number;
    totalRevenue: number;
    newUsersThisMonth: number;
    activeSubscriptions: number;
  }> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return {
        totalUsers: 100,
        activeUsers: 80,
        freeUsers: 50,
        proUsers: 30,
        premiumUsers: 20,
        totalRevenue: 1500,
        newUsersThisMonth: 10,
        activeSubscriptions: 50
      };
    }

    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalUsers = users.length;
      const activeUsers = users.filter(u => {
        const lastActive = u.last_active ? new Date(u.last_active) : new Date(u.created_at);
        return lastActive > thirtyDaysAgo;
      }).length;

      const freeUsers = users.filter(u => u.subscription_tier === 'free').length;
      const proUsers = users.filter(u => u.subscription_tier === 'pro').length;
      const premiumUsers = users.filter(u => u.subscription_tier === 'premium').length;

      const newUsersThisMonth = users.filter(u => {
        return new Date(u.created_at) >= firstDayOfMonth;
      }).length;

      const activeSubscriptions = users.filter(u => 
        u.subscription_status === 'active' && u.subscription_tier !== 'free'
      ).length;

      // Calculate revenue
      const totalRevenue = users.reduce((sum, u) => {
        if (u.subscription_status === 'active') {
          if (u.subscription_tier === 'pro') return sum + 29.99;
          if (u.subscription_tier === 'premium') return sum + 49.99;
        }
        return sum;
      }, 0);

      return {
        totalUsers,
        activeUsers,
        freeUsers,
        proUsers,
        premiumUsers,
        totalRevenue,
        newUsersThisMonth,
        activeSubscriptions
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        freeUsers: 0,
        proUsers: 0,
        premiumUsers: 0,
        totalRevenue: 0,
        newUsersThisMonth: 0,
        activeSubscriptions: 0
      };
    }
  }
};

// ============================================================================
// ADMIN CONTENT MANAGEMENT ENDPOINTS
// ============================================================================

export const adminContentEndpoints = {
  // Get all study groups across platform
  async getAllStudyGroups(): Promise<any[]> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return [
        {
          id: '1',
          name: 'Study Group 1',
          created_at: new Date(),
          users: [
            { full_name: 'John Doe', email: 'user1@example.com' },
            { full_name: 'Jane Smith', email: 'user2@example.com' }
          ]
        },
        {
          id: '2',
          name: 'Study Group 2',
          created_at: new Date(),
          users: [
            { full_name: 'Alice Johnson', email: 'user3@example.com' }
          ]
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*, users!study_groups_created_by_fkey(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching study groups:', error);
      return [];
    }
  },

  // Delete study group
  async deleteStudyGroup(groupId: string): Promise<void> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return;
    }

    try {
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting study group:', error);
      throw error;
    }
  },

  // Get all flashcard sets
  async getAllFlashcardSets(): Promise<any[]> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return [
        {
          id: '1',
          title: 'Flashcard Set 1',
          created_at: new Date(),
          users: [
            { full_name: 'John Doe', email: 'user1@example.com' }
          ]
        },
        {
          id: '2',
          title: 'Flashcard Set 2',
          created_at: new Date(),
          users: [
            { full_name: 'Jane Smith', email: 'user2@example.com' }
          ]
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, users(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      return [];
    }
  },

  // Delete flashcard set
  async deleteFlashcardSet(setId: string): Promise<void> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return;
    }

    try {
      // Delete all flashcards in set first
      await supabase
        .from('flashcards')
        .delete()
        .eq('set_id', setId);

      // Delete the set
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      throw error;
    }
  },

  // Get all quizzes
  async getAllQuizzes(): Promise<any[]> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return [
        {
          id: '1',
          title: 'Quiz 1',
          created_at: new Date(),
          users: [
            { full_name: 'John Doe', email: 'user1@example.com' }
          ]
        },
        {
          id: '2',
          title: 'Quiz 2',
          created_at: new Date(),
          users: [
            { full_name: 'Jane Smith', email: 'user2@example.com' }
          ]
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, users(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  },

  // Delete quiz
  async deleteQuiz(quizId: string): Promise<void> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return;
    }

    try {
      // Delete all questions first
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);

      // Delete all attempts
      await supabase
        .from('quiz_attempts')
        .delete()
        .eq('quiz_id', quizId);

      // Delete the quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  // Get all books
  async getAllBooks(): Promise<any[]> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return [
        {
          id: '1',
          title: 'Book 1',
          author: 'Author 1',
          description: 'Description 1',
          cover_image: 'url1',
          category: 'Category 1',
          chapters: [
            { title: 'Chapter 1', content: 'Content 1' },
            { title: 'Chapter 2', content: 'Content 2' }
          ],
          created_at: new Date()
        },
        {
          id: '2',
          title: 'Book 2',
          author: 'Author 2',
          description: 'Description 2',
          cover_image: 'url2',
          category: 'Category 2',
          chapters: [
            { title: 'Chapter 1', content: 'Content 1' },
            { title: 'Chapter 2', content: 'Content 2' }
          ],
          created_at: new Date()
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  },

  // Create/Update book
  async upsertBook(bookData: {
    id?: string;
    title: string;
    author: string;
    description: string;
    coverImage: string;
    category: string;
    chapters: any[];
  }): Promise<any> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return {
        id: '1',
        title: 'Book 1',
        author: 'Author 1',
        description: 'Description 1',
        cover_image: 'url1',
        category: 'Category 1',
        chapters: [
          { title: 'Chapter 1', content: 'Content 1' },
          { title: 'Chapter 2', content: 'Content 2' }
        ],
        updated_at: new Date().toISOString()
      };
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .upsert({
          id: bookData.id,
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          cover_image: bookData.coverImage,
          category: bookData.category,
          chapters: bookData.chapters,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting book:', error);
      throw error;
    }
  },

  // Delete book
  async deleteBook(bookId: string): Promise<void> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return;
    }

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }
};

// ============================================================================
// ADMIN ANALYTICS ENDPOINTS
// ============================================================================

export const adminAnalyticsEndpoints = {
  // Get platform-wide quiz statistics
  async getQuizStatistics(): Promise<{
    totalAttempts: number;
    averageScore: number;
    categoryBreakdown: Record<string, { attempts: number; avgScore: number }>;
    recentAttempts: any[];
  }> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return {
        totalAttempts: 100,
        averageScore: 75,
        categoryBreakdown: {
          'Category 1': { attempts: 50, avgScore: 80 },
          'Category 2': { attempts: 50, avgScore: 70 }
        },
        recentAttempts: [
          {
            id: '1',
            user: 'John Doe',
            quiz: 'Quiz 1',
            score: '85%',
            timestamp: new Date()
          },
          {
            id: '2',
            user: 'Jane Smith',
            quiz: 'Quiz 2',
            score: '70%',
            timestamp: new Date()
          }
        ]
      };
    }

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*, users(full_name, email), quizzes(title, category)')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const totalAttempts = data.length;
      const averageScore = data.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts;

      // Category breakdown
      const categoryBreakdown: Record<string, { attempts: number; avgScore: number; totalScore: number }> = {};
      
      data.forEach(attempt => {
        const category = attempt.quizzes?.category || 'Unknown';
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { attempts: 0, avgScore: 0, totalScore: 0 };
        }
        categoryBreakdown[category].attempts++;
        categoryBreakdown[category].totalScore += attempt.percentage;
      });

      // Calculate averages
      Object.keys(categoryBreakdown).forEach(category => {
        const cat = categoryBreakdown[category];
        cat.avgScore = cat.totalScore / cat.attempts;
        delete (cat as any).totalScore;
      });

      const recentAttempts = data.slice(0, 20);

      return {
        totalAttempts,
        averageScore,
        categoryBreakdown,
        recentAttempts
      };
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      return {
        totalAttempts: 0,
        averageScore: 0,
        categoryBreakdown: {},
        recentAttempts: []
      };
    }
  },

  // Get flashcard usage statistics
  async getFlashcardStatistics(): Promise<{
    totalCards: number;
    totalReviews: number;
    averageRetention: number;
    topSets: any[];
  }> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return {
        totalCards: 100,
        totalReviews: 50,
        averageRetention: 80,
        topSets: [
          { setId: '1', reviewCount: 20 },
          { setId: '2', reviewCount: 15 }
        ]
      };
    }

    try {
      const { data: cards, error: cardsError } = await supabase
        .from('flashcards')
        .select('*');

      const { data: reviews, error: reviewsError } = await supabase
        .from('flashcard_reviews')
        .select('*, flashcards(set_id)');

      if (cardsError) throw cardsError;
      if (reviewsError) throw reviewsError;

      const totalCards = cards.length;
      const totalReviews = reviews.length;

      // Calculate retention
      const correctReviews = reviews.filter(r => r.quality >= 3).length;
      const averageRetention = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

      // Top sets by review count
      const setReviewCounts: Record<string, number> = {};
      reviews.forEach(r => {
        const setId = r.flashcards?.set_id;
        if (setId) {
          setReviewCounts[setId] = (setReviewCounts[setId] || 0) + 1;
        }
      });

      const topSets = Object.entries(setReviewCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([setId, count]) => ({ setId, reviewCount: count }));

      return {
        totalCards,
        totalReviews,
        averageRetention,
        topSets
      };
    } catch (error) {
      console.error('Error fetching flashcard statistics:', error);
      return {
        totalCards: 0,
        totalReviews: 0,
        averageRetention: 0,
        topSets: []
      };
    }
  },

  // Get study planner statistics
  async getStudyPlannerStatistics(): Promise<{
    totalSessions: number;
    completedSessions: number;
    totalStudyTime: number;
    totalGoals: number;
    completedGoals: number;
    totalTasks: number;
    completedTasks: number;
  }> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return {
        totalSessions: 50,
        completedSessions: 30,
        totalStudyTime: 1500,
        totalGoals: 20,
        completedGoals: 10,
        totalTasks: 100,
        completedTasks: 50
      };
    }

    try {
      const { data: sessions } = await supabase
        .from('planner_sessions')
        .select('*');

      const { data: goals } = await supabase
        .from('goals')
        .select('*');

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*');

      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.completed).length || 0;
      const totalStudyTime = sessions?.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0) || 0;

      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(g => g.current_progress >= g.target_progress).length || 0;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.completed).length || 0;

      return {
        totalSessions,
        completedSessions,
        totalStudyTime,
        totalGoals,
        completedGoals,
        totalTasks,
        completedTasks
      };
    } catch (error) {
      console.error('Error fetching study planner statistics:', error);
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalStudyTime: 0,
        totalGoals: 0,
        completedGoals: 0,
        totalTasks: 0,
        completedTasks: 0
      };
    }
  },

  // Get revenue analytics
  async getRevenueAnalytics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    revenueByTier: Record<string, number>;
    recentTransactions: any[];
    projectedRevenue: number;
  }> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return {
        totalRevenue: 1500,
        monthlyRevenue: 1500,
        revenueByTier: {
          pro: 1000,
          premium: 500
        },
        recentTransactions: [
          {
            id: '1',
            user: 'John Doe',
            tier: 'pro',
            amount: 29.99,
            timestamp: new Date()
          },
          {
            id: '2',
            user: 'Jane Smith',
            tier: 'premium',
            amount: 49.99,
            timestamp: new Date()
          }
        ],
        projectedRevenue: 18000
      };
    }

    try {
      const { data: users } = await supabase
        .from('users')
        .select('*');

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      const activeSubscriptions = users?.filter(u => u.subscription_status === 'active') || [];

      const totalRevenue = activeSubscriptions.reduce((sum, u) => {
        if (u.subscription_tier === 'pro') return sum + 29.99;
        if (u.subscription_tier === 'premium') return sum + 49.99;
        return sum;
      }, 0);

      const monthlyRevenue = totalRevenue; // Assuming monthly billing

      const revenueByTier = {
        pro: activeSubscriptions.filter(u => u.subscription_tier === 'pro').length * 29.99,
        premium: activeSubscriptions.filter(u => u.subscription_tier === 'premium').length * 49.99
      };

      const projectedRevenue = totalRevenue * 12; // Annual projection

      return {
        totalRevenue,
        monthlyRevenue,
        revenueByTier,
        recentTransactions: subscriptions?.slice(0, 20) || [],
        projectedRevenue
      };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        revenueByTier: {},
        recentTransactions: [],
        projectedRevenue: 0
      };
    }
  },

  // Get user activity timeline
  async getUserActivityTimeline(limit: number = 50): Promise<any[]> {
    if (shouldUseMockData()) {
      // Mock data for testing
      return [
        {
          type: 'quiz',
          user: 'John Doe',
          action: 'Completed quiz: Quiz 1',
          score: '85%',
          timestamp: new Date()
        },
        {
          type: 'session',
          user: 'Jane Smith',
          action: 'Completed study session: Session 1',
          duration: '60 min',
          timestamp: new Date()
        }
      ];
    }

    try {
      const activities: any[] = [];

      // Get recent quiz attempts
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('*, users(full_name), quizzes(title)')
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (quizAttempts) {
        activities.push(...quizAttempts.map(a => ({
          type: 'quiz',
          user: a.users?.full_name,
          action: `Completed quiz: ${a.quizzes?.title}`,
          score: `${a.percentage}%`,
          timestamp: new Date(a.completed_at)
        })));
      }

      // Get recent study sessions
      const { data: sessions } = await supabase
        .from('planner_sessions')
        .select('*, users(full_name)')
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (sessions) {
        activities.push(...sessions.map(s => ({
          type: 'session',
          user: s.users?.full_name,
          action: `Completed study session: ${s.title}`,
          duration: `${s.duration} min`,
          timestamp: new Date(s.updated_at)
        })));
      }

      // Sort by timestamp
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return activities.slice(0, limit);
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      return [];
    }
  }
};

// Export all admin endpoints
export const adminApi = {
  users: adminUserEndpoints,
  content: adminContentEndpoints,
  analytics: adminAnalyticsEndpoints
};

export default adminApi;