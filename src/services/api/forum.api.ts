/**
 * Forum API - Frontend client for discussion forum
 */

import apiClient from './client';

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  postCount: number;
  isActive: boolean;
}

export interface ForumAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ForumPost {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  type: 'question' | 'discussion' | 'tip' | 'resource' | 'announcement';
  status: 'open' | 'closed' | 'resolved' | 'archived';
  tags: string[];
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isPinned: boolean;
  isLocked: boolean;
  acceptedAnswerId?: string;
  lastActivityAt: string;
  createdAt: string;
  author?: ForumAuthor;
  category?: ForumCategory;
  comments?: ForumComment[];
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  content: string;
  likeCount: number;
  isAccepted: boolean;
  isEdited: boolean;
  createdAt: string;
  author?: ForumAuthor;
}

export interface CreatePostInput {
  categoryId: string;
  title: string;
  content: string;
  type?: ForumPost['type'];
  tags?: string[];
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

// API Functions
export const forumApi = {
  // Categories
  getCategories: async (): Promise<ForumCategory[]> => {
    const response = await apiClient.get('/forum/categories');
    return response.data;
  },

  getCategory: async (slug: string): Promise<ForumCategory> => {
    const response = await apiClient.get(`/forum/categories/${slug}`);
    return response.data;
  },

  // Posts
  getPosts: async (params?: {
    categoryId?: string;
    type?: string;
    status?: string;
    authorId?: string;
    search?: string;
    tags?: string;
    sortBy?: 'latest' | 'popular' | 'active';
    limit?: number;
    offset?: number;
  }): Promise<{ posts: ForumPost[]; total: number }> => {
    const response = await apiClient.get('/forum/posts', { params });
    return response.data;
  },

  getPost: async (identifier: string): Promise<ForumPost> => {
    const response = await apiClient.get(`/forum/posts/${identifier}`);
    return response.data;
  },

  createPost: async (input: CreatePostInput): Promise<ForumPost> => {
    const response = await apiClient.post('/forum/posts', input);
    return response.data;
  },

  updatePost: async (postId: string, input: Partial<CreatePostInput & {
    status?: string;
    isPinned?: boolean;
    isLocked?: boolean;
  }>): Promise<ForumPost> => {
    const response = await apiClient.put(`/forum/posts/${postId}`, input);
    return response.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/forum/posts/${postId}`);
  },

  // Comments
  createComment: async (postId: string, input: CreateCommentInput): Promise<ForumComment> => {
    const response = await apiClient.post(`/forum/posts/${postId}/comments`, input);
    return response.data;
  },

  updateComment: async (commentId: string, content: string): Promise<ForumComment> => {
    const response = await apiClient.put(`/forum/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/forum/comments/${commentId}`);
  },

  // Accept answer
  acceptAnswer: async (postId: string, commentId: string): Promise<ForumPost> => {
    const response = await apiClient.post(`/forum/posts/${postId}/accept/${commentId}`);
    return response.data;
  },

  // Reactions
  toggleReaction: async (params: {
    type: 'like' | 'helpful' | 'insightful' | 'thanks';
    postId?: string;
    commentId?: string;
  }): Promise<{ added: boolean; count: number }> => {
    const response = await apiClient.post('/forum/reactions', params);
    return response.data;
  },

  // Bookmarks
  getBookmarks: async (): Promise<ForumPost[]> => {
    const response = await apiClient.get('/forum/bookmarks');
    return response.data;
  },

  toggleBookmark: async (postId: string): Promise<{ isBookmarked: boolean }> => {
    const response = await apiClient.post(`/forum/bookmarks/${postId}`);
    return response.data;
  },

  // Tags
  getTrendingTags: async (limit?: number): Promise<{ tag: string; count: number }[]> => {
    const response = await apiClient.get('/forum/tags/trending', { params: { limit } });
    return response.data;
  },

  // Search
  search: async (query: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ posts: ForumPost[]; total: number }> => {
    const response = await apiClient.get('/forum/search', { params: { q: query, ...params } });
    return response.data;
  }
};

export default forumApi;
