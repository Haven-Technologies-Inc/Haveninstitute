/**
 * Forum Hooks - React Query hooks for discussion forum
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi, CreatePostInput, CreateCommentInput } from '../api/forum.api';

export const forumKeys = {
  all: ['forum'] as const,
  categories: () => [...forumKeys.all, 'categories'] as const,
  category: (slug: string) => [...forumKeys.all, 'category', slug] as const,
  posts: (params?: any) => [...forumKeys.all, 'posts', params] as const,
  post: (identifier: string) => [...forumKeys.all, 'post', identifier] as const,
  bookmarks: () => [...forumKeys.all, 'bookmarks'] as const,
  trendingTags: () => [...forumKeys.all, 'trending-tags'] as const,
  search: (query: string) => [...forumKeys.all, 'search', query] as const,
};

// Get categories
export function useForumCategories() {
  return useQuery({
    queryKey: forumKeys.categories(),
    queryFn: forumApi.getCategories,
    staleTime: 1000 * 60 * 10,
  });
}

// Get category by slug
export function useForumCategory(slug: string) {
  return useQuery({
    queryKey: forumKeys.category(slug),
    queryFn: () => forumApi.getCategory(slug),
    enabled: !!slug,
  });
}

// Get posts
export function useForumPosts(params?: {
  categoryId?: string;
  type?: string;
  status?: string;
  authorId?: string;
  search?: string;
  tags?: string;
  sortBy?: 'latest' | 'popular' | 'active';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: forumKeys.posts(params),
    queryFn: () => forumApi.getPosts(params),
    staleTime: 1000 * 60 * 2,
  });
}

// Get single post
export function useForumPost(identifier: string) {
  return useQuery({
    queryKey: forumKeys.post(identifier),
    queryFn: () => forumApi.getPost(identifier),
    enabled: !!identifier,
  });
}

// Get bookmarks
export function useForumBookmarks() {
  return useQuery({
    queryKey: forumKeys.bookmarks(),
    queryFn: forumApi.getBookmarks,
  });
}

// Get trending tags
export function useTrendingTags(limit?: number) {
  return useQuery({
    queryKey: forumKeys.trendingTags(),
    queryFn: () => forumApi.getTrendingTags(limit),
    staleTime: 1000 * 60 * 5,
  });
}

// Search posts
export function useForumSearch(query: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: forumKeys.search(query),
    queryFn: () => forumApi.search(query, params),
    enabled: !!query && query.length >= 2,
  });
}

// Create post
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => forumApi.createPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts() });
      queryClient.invalidateQueries({ queryKey: forumKeys.categories() });
    },
  });
}

// Update post
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, input }: { postId: string; input: any }) =>
      forumApi.updatePost(postId, input),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.posts() });
    },
  });
}

// Delete post
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => forumApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts() });
      queryClient.invalidateQueries({ queryKey: forumKeys.categories() });
    },
  });
}

// Create comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, input }: { postId: string; input: CreateCommentInput }) =>
      forumApi.createComment(postId, input),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
    },
  });
}

// Update comment
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      forumApi.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
}

// Delete comment
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => forumApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
}

// Accept answer
export function useAcceptAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      forumApi.acceptAnswer(postId, commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
    },
  });
}

// Toggle reaction
export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { type: 'like' | 'helpful' | 'insightful' | 'thanks'; postId?: string; commentId?: string }) =>
      forumApi.toggleReaction(params),
    onSuccess: (_, { postId }) => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      }
      queryClient.invalidateQueries({ queryKey: forumKeys.posts() });
    },
  });
}

// Toggle bookmark
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => forumApi.toggleBookmark(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.bookmarks() });
    },
  });
}
