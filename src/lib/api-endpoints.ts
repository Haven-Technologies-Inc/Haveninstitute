// API Endpoints for NurseHaven Platform
// This file contains all API endpoint implementations

import { supabase } from './supabase';

// ============================================================================
// SUBSCRIPTION ENDPOINTS
// ============================================================================

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  amount: number;
  interval: 'monthly' | 'yearly';
  paymentMethod?: {
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
  };
}

export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  date: Date;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  invoiceUrl?: string;
  description: string;
}

export const subscriptionEndpoints = {
  // Get current subscription
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      
      return data ? {
        id: data.id,
        userId: data.user_id,
        plan: data.plan,
        status: data.status,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        autoRenew: data.auto_renew,
        amount: data.amount,
        interval: data.interval,
        paymentMethod: data.payment_method
      } : null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Return mock data for development
      return {
        id: 'sub_' + Date.now(),
        userId,
        plan: 'pro',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        amount: 29.99,
        interval: 'monthly',
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'Visa'
        }
      };
    }
  },

  // Create new subscription
  async createSubscription(userId: string, plan: 'pro' | 'premium', interval: 'monthly' | 'yearly'): Promise<Subscription> {
    const amount = plan === 'pro' 
      ? (interval === 'monthly' ? 29.99 : 299.99)
      : (interval === 'monthly' ? 49.99 : 499.99);

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + (interval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
          auto_renew: true,
          amount,
          interval
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        plan: data.plan,
        status: data.status,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        autoRenew: data.auto_renew,
        amount: data.amount,
        interval: data.interval
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      // Return mock data
      return {
        id: 'sub_' + Date.now(),
        userId,
        plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + (interval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
        autoRenew: true,
        amount,
        interval
      };
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan: updates.plan,
          auto_renew: updates.autoRenew,
          status: updates.status
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        plan: data.plan,
        status: data.status,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        autoRenew: data.auto_renew,
        amount: data.amount,
        interval: data.interval
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', auto_renew: false })
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Get payment history
  async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(payment => ({
        id: payment.id,
        subscriptionId: payment.subscription_id,
        amount: payment.amount,
        date: new Date(payment.date),
        status: payment.status,
        invoiceUrl: payment.invoice_url,
        description: payment.description
      }));
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Return mock data
      return [
        {
          id: 'pmt_1',
          subscriptionId: 'sub_123',
          amount: 29.99,
          date: new Date(),
          status: 'success',
          description: 'Pro Monthly Subscription'
        },
        {
          id: 'pmt_2',
          subscriptionId: 'sub_123',
          amount: 29.99,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'success',
          description: 'Pro Monthly Subscription'
        }
      ];
    }
  },

  // Upgrade/Downgrade subscription
  async changeSubscriptionPlan(subscriptionId: string, newPlan: 'pro' | 'premium'): Promise<Subscription> {
    return this.updateSubscription(subscriptionId, { plan: newPlan });
  }
};

// ============================================================================
// STUDY GROUP ENDPOINTS
// ============================================================================

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  maxMembers: number;
  createdBy: string;
  createdAt: Date;
  avatar: string;
  isPrivate: boolean;
  tags: string[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
  studyStreak: number;
  contributionScore: number;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  attachmentUrl?: string;
}

export interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number;
  hostId: string;
  hostName: string;
  attendees: string[];
  meetingLink?: string;
  status: 'scheduled' | 'ongoing' | 'completed';
}

export const groupEndpoints = {
  // Get all groups
  async getAllGroups(): Promise<StudyGroup[]> {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('is_private', false);

      if (error) throw error;

      return data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        category: group.category,
        memberCount: group.member_count,
        maxMembers: group.max_members,
        createdBy: group.created_by,
        createdAt: new Date(group.created_at),
        avatar: group.avatar,
        isPrivate: group.is_private,
        tags: group.tags || []
      }));
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  },

  // Get user's groups
  async getUserGroups(userId: string): Promise<StudyGroup[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (error) throw error;

      const groupIds = data.map(m => m.group_id);
      
      const { data: groups, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .in('id', groupIds);

      if (groupError) throw groupError;

      return groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        category: group.category,
        memberCount: group.member_count,
        maxMembers: group.max_members,
        createdBy: group.created_by,
        createdAt: new Date(group.created_at),
        avatar: group.avatar,
        isPrivate: group.is_private,
        tags: group.tags || []
      }));
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  },

  // Create group
  async createGroup(userId: string, groupData: Partial<StudyGroup>): Promise<StudyGroup> {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .insert({
          name: groupData.name,
          description: groupData.description,
          category: groupData.category,
          created_by: userId,
          avatar: groupData.avatar || '📚',
          is_private: groupData.isPrivate || false,
          tags: groupData.tags || [],
          member_count: 1,
          max_members: groupData.maxMembers || 20
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: userId,
          role: 'owner'
        });

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        memberCount: data.member_count,
        maxMembers: data.max_members,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        avatar: data.avatar,
        isPrivate: data.is_private,
        tags: data.tags
      };
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Join group
  async joinGroup(userId: string, groupId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      // Increment member count
      await supabase.rpc('increment_group_members', { group_id: groupId });
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  },

  // Leave group
  async leaveGroup(userId: string, groupId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      // Decrement member count
      await supabase.rpc('decrement_group_members', { group_id: groupId });
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  },

  // Get group members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*, users(name, avatar)')
        .eq('group_id', groupId);

      if (error) throw error;

      return data.map(member => ({
        id: member.id,
        groupId: member.group_id,
        userId: member.user_id,
        name: member.users?.name || 'Unknown',
        role: member.role,
        joinedAt: new Date(member.joined_at),
        studyStreak: member.study_streak || 0,
        contributionScore: member.contribution_score || 0
      }));
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  },

  // Send message
  async sendMessage(groupId: string, userId: string, userName: string, content: string): Promise<GroupMessage> {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_id: userId,
          sender_name: userName,
          content,
          type: 'text'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        groupId: data.group_id,
        senderId: data.sender_id,
        senderName: data.sender_name,
        content: data.content,
        timestamp: new Date(data.timestamp),
        type: data.type
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get group messages
  async getGroupMessages(groupId: string, limit: number = 50): Promise<GroupMessage[]> {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(msg => ({
        id: msg.id,
        groupId: msg.group_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        type: msg.type,
        attachmentUrl: msg.attachment_url
      })).reverse();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Schedule study session
  async scheduleSession(sessionData: Partial<StudySession>): Promise<StudySession> {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          group_id: sessionData.groupId,
          title: sessionData.title,
          description: sessionData.description,
          scheduled_at: sessionData.scheduledAt?.toISOString(),
          duration: sessionData.duration,
          host_id: sessionData.hostId,
          host_name: sessionData.hostName,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        groupId: data.group_id,
        title: data.title,
        description: data.description,
        scheduledAt: new Date(data.scheduled_at),
        duration: data.duration,
        hostId: data.host_id,
        hostName: data.host_name,
        attendees: [],
        status: data.status
      };
    } catch (error) {
      console.error('Error scheduling session:', error);
      throw error;
    }
  },

  // Get group sessions
  async getGroupSessions(groupId: string): Promise<StudySession[]> {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('group_id', groupId)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      return data.map(session => ({
        id: session.id,
        groupId: session.group_id,
        title: session.title,
        description: session.description,
        scheduledAt: new Date(session.scheduled_at),
        duration: session.duration,
        hostId: session.host_id,
        hostName: session.host_name,
        attendees: session.attendees || [],
        meetingLink: session.meeting_link,
        status: session.status
      }));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }
};

// ============================================================================
// MY BOOKS ENDPOINTS
// ============================================================================

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  totalChapters: number;
  totalPages: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentChapter: number;
  currentPage: number;
  progress: number;
  lastRead: Date;
  timeSpent: number;
}

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

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  page: number;
  title: string;
  createdAt: Date;
}

export const bookEndpoints = {
  // Get all books
  async getAllBooks(): Promise<Book[]> {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;

      return data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        coverImage: book.cover_image,
        category: book.category,
        totalChapters: book.total_chapters,
        totalPages: book.total_pages,
        difficulty: book.difficulty,
        tags: book.tags || []
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  },

  // Get book by ID
  async getBookById(bookId: string): Promise<Book | null> {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        author: data.author,
        description: data.description,
        coverImage: data.cover_image,
        category: data.category,
        totalChapters: data.total_chapters,
        totalPages: data.total_pages,
        difficulty: data.difficulty,
        tags: data.tags || []
      };
    } catch (error) {
      console.error('Error fetching book:', error);
      return null;
    }
  },

  // Get reading progress
  async getReadingProgress(userId: string, bookId: string): Promise<ReadingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error) throw error;

      return data ? {
        id: data.id,
        userId: data.user_id,
        bookId: data.book_id,
        currentChapter: data.current_chapter,
        currentPage: data.current_page,
        progress: data.progress,
        lastRead: new Date(data.last_read),
        timeSpent: data.time_spent
      } : null;
    } catch (error) {
      console.error('Error fetching reading progress:', error);
      return null;
    }
  },

  // Update reading progress
  async updateReadingProgress(userId: string, bookId: string, progress: Partial<ReadingProgress>): Promise<void> {
    try {
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: userId,
          book_id: bookId,
          current_chapter: progress.currentChapter,
          current_page: progress.currentPage,
          progress: progress.progress,
          last_read: new Date().toISOString(),
          time_spent: progress.timeSpent
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      throw error;
    }
  },

  // Get user's reading list
  async getUserReadingList(userId: string): Promise<(Book & { progress: ReadingProgress })[]> {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*, books(*)')
        .eq('user_id', userId)
        .order('last_read', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.books.id,
        title: item.books.title,
        author: item.books.author,
        description: item.books.description,
        coverImage: item.books.cover_image,
        category: item.books.category,
        totalChapters: item.books.total_chapters,
        totalPages: item.books.total_pages,
        difficulty: item.books.difficulty,
        tags: item.books.tags || [],
        progress: {
          id: item.id,
          userId: item.user_id,
          bookId: item.book_id,
          currentChapter: item.current_chapter,
          currentPage: item.current_page,
          progress: item.progress,
          lastRead: new Date(item.last_read),
          timeSpent: item.time_spent
        }
      }));
    } catch (error) {
      console.error('Error fetching reading list:', error);
      return [];
    }
  },

  // Add highlight
  async addHighlight(highlightData: Partial<Highlight>): Promise<Highlight> {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .insert({
          user_id: highlightData.userId,
          book_id: highlightData.bookId,
          chapter: highlightData.chapter,
          text: highlightData.text,
          color: highlightData.color || 'yellow',
          note: highlightData.note
        })
        .select()
        .single();

      if (error) throw error;

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
    } catch (error) {
      console.error('Error adding highlight:', error);
      throw error;
    }
  },

  // Get highlights
  async getHighlights(userId: string, bookId: string): Promise<Highlight[]> {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(highlight => ({
        id: highlight.id,
        userId: highlight.user_id,
        bookId: highlight.book_id,
        chapter: highlight.chapter,
        text: highlight.text,
        color: highlight.color,
        note: highlight.note,
        createdAt: new Date(highlight.created_at)
      }));
    } catch (error) {
      console.error('Error fetching highlights:', error);
      return [];
    }
  },

  // Delete highlight
  async deleteHighlight(highlightId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', highlightId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting highlight:', error);
      throw error;
    }
  },

  // Add bookmark
  async addBookmark(bookmarkData: Partial<Bookmark>): Promise<Bookmark> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: bookmarkData.userId,
          book_id: bookmarkData.bookId,
          chapter: bookmarkData.chapter,
          page: bookmarkData.page,
          title: bookmarkData.title
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        bookId: data.book_id,
        chapter: data.chapter,
        page: data.page,
        title: data.title,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  },

  // Get bookmarks
  async getBookmarks(userId: string, bookId: string): Promise<Bookmark[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(bookmark => ({
        id: bookmark.id,
        userId: bookmark.user_id,
        bookId: bookmark.book_id,
        chapter: bookmark.chapter,
        page: bookmark.page,
        title: bookmark.title,
        createdAt: new Date(bookmark.created_at)
      }));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  },

  // Delete bookmark
  async deleteBookmark(bookmarkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }
};

// ============================================================================
// FLASHCARD ENDPOINTS
// ============================================================================

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface FlashcardSet {
  id: string;
  name: string;
  description: string;
  category: string;
  flashcardCount: number;
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface FlashcardProgress {
  id: string;
  userId: string;
  flashcardId: string;
  status: 'new' | 'learning' | 'mastered';
  attempts: number;
  correctCount: number;
  lastReviewed: Date;
  nextReview: Date;
  confidence: number;
}

export const flashcardEndpoints = {
  // Get all flashcards
  async getAllFlashcards(category?: string): Promise<Flashcard[]> {
    try {
      let query = supabase.from('flashcards').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(card => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        category: card.category,
        subcategory: card.subcategory,
        difficulty: card.difficulty,
        tags: card.tags || []
      }));
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      return [];
    }
  },

  // Get flashcard by ID
  async getFlashcardById(flashcardId: string): Promise<Flashcard | null> {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', flashcardId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        subcategory: data.subcategory,
        difficulty: data.difficulty,
        tags: data.tags || []
      };
    } catch (error) {
      console.error('Error fetching flashcard:', error);
      return null;
    }
  },

  // Create custom flashcard
  async createFlashcard(userId: string, flashcardData: Partial<Flashcard>): Promise<Flashcard> {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          question: flashcardData.question,
          answer: flashcardData.answer,
          category: flashcardData.category,
          subcategory: flashcardData.subcategory,
          difficulty: flashcardData.difficulty || 'medium',
          tags: flashcardData.tags || [],
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        subcategory: data.subcategory,
        difficulty: data.difficulty,
        tags: data.tags
      };
    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  },

  // Update flashcard
  async updateFlashcard(flashcardId: string, updates: Partial<Flashcard>): Promise<void> {
    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          question: updates.question,
          answer: updates.answer,
          category: updates.category,
          subcategory: updates.subcategory,
          difficulty: updates.difficulty,
          tags: updates.tags
        })
        .eq('id', flashcardId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating flashcard:', error);
      throw error;
    }
  },

  // Delete flashcard
  async deleteFlashcard(flashcardId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', flashcardId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  },

  // Get flashcard sets
  async getFlashcardSets(userId?: string): Promise<FlashcardSet[]> {
    try {
      let query = supabase
        .from('flashcard_sets')
        .select('*');

      if (userId) {
        query = query.or(`created_by.eq.${userId},is_public.eq.true`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(set => ({
        id: set.id,
        name: set.name,
        description: set.description,
        category: set.category,
        flashcardCount: set.flashcard_count,
        createdBy: set.created_by,
        isPublic: set.is_public,
        createdAt: new Date(set.created_at)
      }));
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      return [];
    }
  },

  // Create flashcard set
  async createFlashcardSet(userId: string, setData: Partial<FlashcardSet>): Promise<FlashcardSet> {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert({
          name: setData.name,
          description: setData.description,
          category: setData.category,
          created_by: userId,
          is_public: setData.isPublic || false,
          flashcard_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        flashcardCount: data.flashcard_count,
        createdBy: data.created_by,
        isPublic: data.is_public,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      throw error;
    }
  },

  // Get flashcard progress
  async getFlashcardProgress(userId: string, flashcardId: string): Promise<FlashcardProgress | null> {
    try {
      const { data, error } = await supabase
        .from('flashcard_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('flashcard_id', flashcardId)
        .single();

      if (error) throw error;

      return data ? {
        id: data.id,
        userId: data.user_id,
        flashcardId: data.flashcard_id,
        status: data.status,
        attempts: data.attempts,
        correctCount: data.correct_count,
        lastReviewed: new Date(data.last_reviewed),
        nextReview: new Date(data.next_review),
        confidence: data.confidence
      } : null;
    } catch (error) {
      console.error('Error fetching flashcard progress:', error);
      return null;
    }
  },

  // Update flashcard progress
  async updateFlashcardProgress(
    userId: string,
    flashcardId: string,
    correct: boolean
  ): Promise<void> {
    try {
      const existing = await this.getFlashcardProgress(userId, flashcardId);
      
      const attempts = (existing?.attempts || 0) + 1;
      const correctCount = (existing?.correctCount || 0) + (correct ? 1 : 0);
      const confidence = Math.round((correctCount / attempts) * 100);
      
      let status: 'new' | 'learning' | 'mastered' = 'learning';
      if (attempts === 1) status = 'new';
      if (confidence >= 80 && attempts >= 3) status = 'mastered';

      const nextReview = new Date();
      if (status === 'mastered') {
        nextReview.setDate(nextReview.getDate() + 7);
      } else if (status === 'learning') {
        nextReview.setDate(nextReview.getDate() + 1);
      }

      const { error } = await supabase
        .from('flashcard_progress')
        .upsert({
          user_id: userId,
          flashcard_id: flashcardId,
          status,
          attempts,
          correct_count: correctCount,
          last_reviewed: new Date().toISOString(),
          next_review: nextReview.toISOString(),
          confidence
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating flashcard progress:', error);
      throw error;
    }
  },

  // Get due flashcards for review
  async getDueFlashcards(userId: string): Promise<Flashcard[]> {
    try {
      const { data, error } = await supabase
        .from('flashcard_progress')
        .select('flashcard_id, flashcards(*)')
        .eq('user_id', userId)
        .lte('next_review', new Date().toISOString());

      if (error) throw error;

      return data.map(item => ({
        id: item.flashcards.id,
        question: item.flashcards.question,
        answer: item.flashcards.answer,
        category: item.flashcards.category,
        subcategory: item.flashcards.subcategory,
        difficulty: item.flashcards.difficulty,
        tags: item.flashcards.tags || []
      }));
    } catch (error) {
      console.error('Error fetching due flashcards:', error);
      return [];
    }
  }
};

// ============================================================================
// QUIZ ENDPOINTS
// ============================================================================

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit?: number;
  passingScore: number;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    correct: boolean;
  }[];
  completedAt: Date;
}

export interface QuizResult {
  id: string;
  userId: string;
  topic: string;
  score: number;
  total: number;
  percentage: number;
  date: Date;
  timeSpent?: number;
}

export const quizEndpoints = {
  // Get all quizzes
  async getAllQuizzes(category?: string): Promise<Quiz[]> {
    try {
      let query = supabase.from('quizzes').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        subcategory: quiz.subcategory,
        difficulty: quiz.difficulty,
        questionCount: quiz.question_count,
        timeLimit: quiz.time_limit,
        passingScore: quiz.passing_score,
        tags: quiz.tags || []
      }));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  },

  // Get quiz by ID
  async getQuizById(quizId: string): Promise<Quiz | null> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        difficulty: data.difficulty,
        questionCount: data.question_count,
        timeLimit: data.time_limit,
        passingScore: data.passing_score,
        tags: data.tags || []
      };
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
  },

  // Get quiz questions
  async getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      return data.map(q => ({
        id: q.id,
        quizId: q.quiz_id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty
      }));
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      return [];
    }
  },

  // Submit quiz attempt
  async submitQuizAttempt(attemptData: Partial<QuizAttempt>): Promise<QuizAttempt> {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: attemptData.userId,
          quiz_id: attemptData.quizId,
          score: attemptData.score,
          total_questions: attemptData.totalQuestions,
          percentage: attemptData.percentage,
          time_spent: attemptData.timeSpent,
          answers: attemptData.answers,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        quizId: data.quiz_id,
        score: data.score,
        totalQuestions: data.total_questions,
        percentage: data.percentage,
        timeSpent: data.time_spent,
        answers: data.answers,
        completedAt: new Date(data.completed_at)
      };
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  },

  // Get user's quiz attempts
  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return data.map(attempt => ({
        id: attempt.id,
        userId: attempt.user_id,
        quizId: attempt.quiz_id,
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        percentage: attempt.percentage,
        timeSpent: attempt.time_spent,
        answers: attempt.answers,
        completedAt: new Date(attempt.completed_at)
      }));
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      return [];
    }
  },

  // Get quiz results (formatted for progress tracking)
  async getQuizResults(userId: string): Promise<QuizResult[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, category)')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return data.map(attempt => ({
        id: attempt.id,
        userId: attempt.user_id,
        topic: attempt.quizzes?.title || 'Unknown',
        score: attempt.score,
        total: attempt.total_questions,
        percentage: attempt.percentage,
        date: new Date(attempt.completed_at),
        timeSpent: attempt.time_spent
      }));
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      return [];
    }
  },

  // Get quiz statistics
  async getQuizStatistics(userId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    totalTimeSpent: number;
    categoryBreakdown: Record<string, { attempts: number; avgScore: number }>;
  }> {
    try {
      const attempts = await this.getUserQuizAttempts(userId);
      
      const totalAttempts = attempts.length;
      const averageScore = totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
        : 0;
      const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

      const categoryBreakdown: Record<string, { attempts: number; avgScore: number }> = {};
      
      // This would need to join with quizzes table to get categories
      // For now, return basic stats
      
      return {
        totalAttempts,
        averageScore,
        totalTimeSpent,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      return {
        totalAttempts: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        categoryBreakdown: {}
      };
    }
  },

  // Create custom quiz
  async createQuiz(userId: string, quizData: Partial<Quiz>): Promise<Quiz> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          subcategory: quizData.subcategory,
          difficulty: quizData.difficulty || 'medium',
          question_count: quizData.questionCount || 0,
          time_limit: quizData.timeLimit,
          passing_score: quizData.passingScore || 70,
          tags: quizData.tags || [],
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        difficulty: data.difficulty,
        questionCount: data.question_count,
        timeLimit: data.time_limit,
        passingScore: data.passing_score,
        tags: data.tags
      };
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  // Add question to quiz
  async addQuestionToQuiz(quizId: string, questionData: Partial<QuizQuestion>): Promise<QuizQuestion> {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quizId,
          question: questionData.question,
          options: questionData.options,
          correct_answer: questionData.correctAnswer,
          explanation: questionData.explanation,
          category: questionData.category,
          difficulty: questionData.difficulty || 'medium'
        })
        .select()
        .single();

      if (error) throw error;

      // Update question count in quiz
      await supabase.rpc('increment_quiz_questions', { quiz_id: quizId });

      return {
        id: data.id,
        quizId: data.quiz_id,
        question: data.question,
        options: data.options,
        correctAnswer: data.correct_answer,
        explanation: data.explanation,
        category: data.category,
        difficulty: data.difficulty
      };
    } catch (error) {
      console.error('Error adding question to quiz:', error);
      throw error;
    }
  }
};

// ============================================================================
// STUDY PLANNER ENDPOINTS
// ============================================================================

export interface PlannerSession {
  id: string;
  userId: string;
  title: string;
  category: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  completed: boolean;
  notes?: string;
  topics: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: Date;
  currentProgress: number;
  targetProgress: number;
  category: string;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    dueDate: Date;
  }[];
}

export const plannerEndpoints = {
  // ==================== SESSIONS ====================
  
  // Get all sessions for a user
  async getUserSessions(userId: string): Promise<PlannerSession[]> {
    try {
      const { data, error } = await supabase
        .from('planner_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;

      return data.map(session => ({
        id: session.id,
        userId: session.user_id,
        title: session.title,
        category: session.category,
        date: new Date(session.date + 'T' + session.start_time),
        startTime: session.start_time,
        endTime: session.end_time,
        duration: session.duration,
        completed: session.completed,
        notes: session.notes,
        topics: session.topics || [],
        priority: session.priority
      }));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  },

  // Create session
  async createSession(userId: string, sessionData: Partial<PlannerSession>): Promise<PlannerSession> {
    try {
      const dateStr = sessionData.date?.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('planner_sessions')
        .insert({
          user_id: userId,
          title: sessionData.title,
          category: sessionData.category,
          date: dateStr,
          start_time: sessionData.startTime,
          end_time: sessionData.endTime,
          duration: sessionData.duration,
          completed: sessionData.completed || false,
          notes: sessionData.notes,
          topics: sessionData.topics || [],
          priority: sessionData.priority || 'medium'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        category: data.category,
        date: new Date(data.date + 'T' + data.start_time),
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration,
        completed: data.completed,
        notes: data.notes,
        topics: data.topics,
        priority: data.priority
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update session
  async updateSession(sessionId: string, updates: Partial<PlannerSession>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.category) updateData.category = updates.category;
      if (updates.date) updateData.date = updates.date.toISOString().split('T')[0];
      if (updates.startTime) updateData.start_time = updates.startTime;
      if (updates.endTime) updateData.end_time = updates.endTime;
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.topics) updateData.topics = updates.topics;
      if (updates.priority) updateData.priority = updates.priority;

      const { error } = await supabase
        .from('planner_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('planner_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // ==================== TASKS ====================
  
  // Get all tasks for a user
  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      return data.map(task => ({
        id: task.id,
        userId: task.user_id,
        title: task.title,
        description: task.description,
        category: task.category,
        dueDate: new Date(task.due_date),
        completed: task.completed,
        priority: task.priority,
        estimatedTime: task.estimated_time
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  // Create task
  async createTask(userId: string, taskData: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          due_date: taskData.dueDate?.toISOString().split('T')[0],
          completed: taskData.completed || false,
          priority: taskData.priority || 'medium',
          estimated_time: taskData.estimatedTime
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        category: data.category,
        dueDate: new Date(data.due_date),
        completed: data.completed,
        priority: data.priority,
        estimatedTime: data.estimated_time
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString().split('T')[0];
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime;

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // ==================== GOALS ====================
  
  // Get all goals for a user
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('target_date', { ascending: true });

      if (error) throw error;

      return data.map(goal => ({
        id: goal.id,
        userId: goal.user_id,
        title: goal.title,
        description: goal.description,
        targetDate: new Date(goal.target_date),
        currentProgress: goal.current_progress,
        targetProgress: goal.target_progress,
        category: goal.category,
        milestones: goal.milestones || []
      }));
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  },

  // Create goal
  async createGoal(userId: string, goalData: Partial<Goal>): Promise<Goal> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: goalData.title,
          description: goalData.description,
          target_date: goalData.targetDate?.toISOString().split('T')[0],
          current_progress: goalData.currentProgress || 0,
          target_progress: goalData.targetProgress,
          category: goalData.category,
          milestones: goalData.milestones || []
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        targetDate: new Date(data.target_date),
        currentProgress: data.current_progress,
        targetProgress: data.target_progress,
        category: data.category,
        milestones: data.milestones
      };
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  // Update goal
  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.targetDate) updateData.target_date = updates.targetDate.toISOString().split('T')[0];
      if (updates.currentProgress !== undefined) updateData.current_progress = updates.currentProgress;
      if (updates.targetProgress !== undefined) updateData.target_progress = updates.targetProgress;
      if (updates.category) updateData.category = updates.category;
      if (updates.milestones) updateData.milestones = updates.milestones;

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', goalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  // Delete goal
  async deleteGoal(goalId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // Get study statistics
  async getStudyStatistics(userId: string): Promise<{
    totalMinutes: number;
    sessionsCompleted: number;
    currentStreak: number;
    longestStreak: number;
    averageSessionLength: number;
    categoryBreakdown: Record<string, number>;
  }> {
    try {
      const sessions = await this.getUserSessions(userId);
      const completedSessions = sessions.filter(s => s.completed);
      
      const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0);
      const sessionsCompleted = completedSessions.length;
      const averageSessionLength = sessionsCompleted > 0 
        ? Math.round(totalMinutes / sessionsCompleted) 
        : 0;

      // Calculate streak
      const sortedDates = completedSessions
        .map(s => s.date.toISOString().split('T')[0])
        .sort()
        .reverse();
      
      const uniqueDates = [...new Set(sortedDates)];
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const date = new Date(uniqueDates[i]);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
      
      // Calculate longest streak
      tempStreak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = new Date(uniqueDates[i]);
        const next = new Date(uniqueDates[i + 1]);
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);

      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      completedSessions.forEach(session => {
        categoryBreakdown[session.category] = (categoryBreakdown[session.category] || 0) + session.duration;
      });

      return {
        totalMinutes,
        sessionsCompleted,
        currentStreak,
        longestStreak,
        averageSessionLength,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalMinutes: 0,
        sessionsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageSessionLength: 0,
        categoryBreakdown: {}
      };
    }
  }
};

// Export all endpoints
export const api = {
  subscription: subscriptionEndpoints,
  groups: groupEndpoints,
  books: bookEndpoints,
  flashcards: flashcardEndpoints,
  quizzes: quizEndpoints,
  planner: plannerEndpoints
};

export default api;
