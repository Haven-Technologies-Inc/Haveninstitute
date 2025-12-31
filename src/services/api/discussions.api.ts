/**
 * Discussions API Service
 * RESTful API client for the Discussions feature
 */

import api from '../api';
import type {
  DiscussionPost,
  DiscussionComment,
  DiscussionCategory,
  DiscussionBookmark,
  DiscussionTag,
  DiscussionAnalytics,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  SearchFilters,
  SearchResult,
  PaginatedResponse,
  SortOption,
  ReactionType
} from '../../types/discussions';

const BASE_URL = '/discussions';

// ============= CATEGORIES =============

export const discussionCategoriesApi = {
  getAll: async (): Promise<DiscussionCategory[]> => {
    const response = await api.get(`${BASE_URL}/categories`);
    return response.data;
  },

  getById: async (id: string): Promise<DiscussionCategory> => {
    const response = await api.get(`${BASE_URL}/categories/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<DiscussionCategory> => {
    const response = await api.get(`${BASE_URL}/categories/slug/${slug}`);
    return response.data;
  }
};

// ============= POSTS =============

export interface GetPostsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  type?: string;
  status?: string;
  sort?: SortOption;
  search?: string;
  tags?: string[];
  authorId?: string;
}

export const discussionPostsApi = {
  getAll: async (params: GetPostsParams = {}): Promise<PaginatedResponse<DiscussionPost>> => {
    const response = await api.get(`${BASE_URL}/posts`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<DiscussionPost> => {
    const response = await api.get(`${BASE_URL}/posts/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<DiscussionPost> => {
    const response = await api.get(`${BASE_URL}/posts/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreatePostInput): Promise<DiscussionPost> => {
    const response = await api.post(`${BASE_URL}/posts`, data);
    return response.data;
  },

  update: async (id: string, data: UpdatePostInput): Promise<DiscussionPost> => {
    const response = await api.put(`${BASE_URL}/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/posts/${id}`);
  },

  // Engagement
  incrementView: async (id: string): Promise<void> => {
    await api.post(`${BASE_URL}/posts/${id}/view`);
  },

  toggleReaction: async (id: string, type: ReactionType): Promise<{ added: boolean; count: number }> => {
    const response = await api.post(`${BASE_URL}/posts/${id}/reactions`, { type });
    return response.data;
  },

  // Moderation
  pin: async (id: string, isPinned: boolean): Promise<DiscussionPost> => {
    const response = await api.put(`${BASE_URL}/posts/${id}/pin`, { isPinned });
    return response.data;
  },

  lock: async (id: string, isLocked: boolean): Promise<DiscussionPost> => {
    const response = await api.put(`${BASE_URL}/posts/${id}/lock`, { isLocked });
    return response.data;
  },

  markResolved: async (id: string): Promise<DiscussionPost> => {
    const response = await api.put(`${BASE_URL}/posts/${id}/resolve`);
    return response.data;
  },

  // Related
  getRelated: async (id: string, limit?: number): Promise<DiscussionPost[]> => {
    const response = await api.get(`${BASE_URL}/posts/${id}/related`, { params: { limit } });
    return response.data;
  }
};

// ============= COMMENTS =============

export const discussionCommentsApi = {
  getByPostId: async (postId: string): Promise<DiscussionComment[]> => {
    const response = await api.get(`${BASE_URL}/posts/${postId}/comments`);
    return response.data;
  },

  create: async (data: CreateCommentInput): Promise<DiscussionComment> => {
    const response = await api.post(`${BASE_URL}/comments`, data);
    return response.data;
  },

  update: async (id: string, content: string): Promise<DiscussionComment> => {
    const response = await api.put(`${BASE_URL}/comments/${id}`, { content });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/comments/${id}`);
  },

  toggleReaction: async (id: string, type: ReactionType): Promise<{ added: boolean; count: number }> => {
    const response = await api.post(`${BASE_URL}/comments/${id}/reactions`, { type });
    return response.data;
  },

  acceptAnswer: async (id: string): Promise<DiscussionComment> => {
    const response = await api.put(`${BASE_URL}/comments/${id}/accept`);
    return response.data;
  }
};

// ============= BOOKMARKS =============

export const discussionBookmarksApi = {
  getAll: async (): Promise<DiscussionBookmark[]> => {
    const response = await api.get(`${BASE_URL}/bookmarks`);
    return response.data;
  },

  toggle: async (postId: string): Promise<{ bookmarked: boolean }> => {
    const response = await api.post(`${BASE_URL}/bookmarks`, { postId });
    return response.data;
  },

  addNote: async (postId: string, notes: string): Promise<DiscussionBookmark> => {
    const response = await api.put(`${BASE_URL}/bookmarks/${postId}/notes`, { notes });
    return response.data;
  }
};

// ============= TAGS =============

export const discussionTagsApi = {
  getTrending: async (limit?: number): Promise<DiscussionTag[]> => {
    const response = await api.get(`${BASE_URL}/tags/trending`, { params: { limit } });
    return response.data;
  },

  search: async (query: string): Promise<DiscussionTag[]> => {
    const response = await api.get(`${BASE_URL}/tags/search`, { params: { q: query } });
    return response.data;
  },

  getByCategory: async (categoryId: string): Promise<DiscussionTag[]> => {
    const response = await api.get(`${BASE_URL}/tags/category/${categoryId}`);
    return response.data;
  }
};

// ============= SEARCH =============

export const discussionSearchApi = {
  search: async (filters: SearchFilters, page = 1, limit = 20): Promise<SearchResult> => {
    const response = await api.post(`${BASE_URL}/search`, { ...filters, page, limit });
    return response.data;
  },

  suggest: async (query: string): Promise<{ posts: DiscussionPost[]; tags: DiscussionTag[] }> => {
    const response = await api.get(`${BASE_URL}/search/suggest`, { params: { q: query } });
    return response.data;
  }
};

// ============= ANALYTICS =============

export const discussionAnalyticsApi = {
  getOverview: async (): Promise<DiscussionAnalytics> => {
    const response = await api.get(`${BASE_URL}/analytics`);
    return response.data;
  },

  trackEvent: async (event: string, data: Record<string, unknown>): Promise<void> => {
    await api.post(`${BASE_URL}/analytics/events`, { event, data });
  }
};

// ============= USER ACTIVITY =============

export const discussionUserApi = {
  getMyPosts: async (page = 1, limit = 20): Promise<PaginatedResponse<DiscussionPost>> => {
    const response = await api.get(`${BASE_URL}/me/posts`, { params: { page, limit } });
    return response.data;
  },

  getMyComments: async (page = 1, limit = 20): Promise<PaginatedResponse<DiscussionComment>> => {
    const response = await api.get(`${BASE_URL}/me/comments`, { params: { page, limit } });
    return response.data;
  },

  getMyBookmarks: async (): Promise<DiscussionBookmark[]> => {
    const response = await api.get(`${BASE_URL}/me/bookmarks`);
    return response.data;
  }
};

// ============= COMBINED EXPORT =============

export const discussionsApi = {
  categories: discussionCategoriesApi,
  posts: discussionPostsApi,
  comments: discussionCommentsApi,
  bookmarks: discussionBookmarksApi,
  tags: discussionTagsApi,
  search: discussionSearchApi,
  analytics: discussionAnalyticsApi,
  user: discussionUserApi
};

export default discussionsApi;
