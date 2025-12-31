/**
 * Discussions React Query Hooks
 * TanStack Query hooks for the Discussions feature
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { discussionsApi, type GetPostsParams } from '../api/discussions.api';
import type {
  DiscussionPost,
  DiscussionComment,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  SearchFilters,
  ReactionType
} from '../../types/discussions';

// ============= QUERY KEYS =============

export const discussionKeys = {
  all: ['discussions'] as const,
  categories: () => [...discussionKeys.all, 'categories'] as const,
  posts: () => [...discussionKeys.all, 'posts'] as const,
  postsList: (params: GetPostsParams) => [...discussionKeys.posts(), 'list', params] as const,
  postDetail: (id: string) => [...discussionKeys.posts(), 'detail', id] as const,
  postBySlug: (slug: string) => [...discussionKeys.posts(), 'slug', slug] as const,
  comments: (postId: string) => [...discussionKeys.all, 'comments', postId] as const,
  bookmarks: () => [...discussionKeys.all, 'bookmarks'] as const,
  tags: () => [...discussionKeys.all, 'tags'] as const,
  trendingTags: () => [...discussionKeys.tags(), 'trending'] as const,
  search: (filters: SearchFilters) => [...discussionKeys.all, 'search', filters] as const,
  analytics: () => [...discussionKeys.all, 'analytics'] as const,
  myPosts: () => [...discussionKeys.all, 'my-posts'] as const,
  myComments: () => [...discussionKeys.all, 'my-comments'] as const,
};

// ============= CATEGORIES =============

export function useDiscussionCategories() {
  return useQuery({
    queryKey: discussionKeys.categories(),
    queryFn: () => discussionsApi.categories.getAll(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// ============= POSTS =============

export function useDiscussionPosts(params: GetPostsParams = {}) {
  return useQuery({
    queryKey: discussionKeys.postsList(params),
    queryFn: () => discussionsApi.posts.getAll(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useInfiniteDiscussionPosts(params: Omit<GetPostsParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: discussionKeys.postsList({ ...params, page: 0 }),
    queryFn: ({ pageParam = 1 }) => discussionsApi.posts.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60,
  });
}

export function useDiscussionPost(id: string) {
  return useQuery({
    queryKey: discussionKeys.postDetail(id),
    queryFn: () => discussionsApi.posts.getById(id),
    enabled: !!id,
  });
}

export function useDiscussionPostBySlug(slug: string) {
  return useQuery({
    queryKey: discussionKeys.postBySlug(slug),
    queryFn: () => discussionsApi.posts.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePostInput) => discussionsApi.posts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.posts() });
      queryClient.invalidateQueries({ queryKey: discussionKeys.categories() });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostInput }) => 
      discussionsApi.posts.update(id, data),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(discussionKeys.postDetail(updatedPost.id), updatedPost);
      queryClient.invalidateQueries({ queryKey: discussionKeys.posts() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => discussionsApi.posts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.posts() });
    },
  });
}

export function useTogglePostReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: ReactionType }) =>
      discussionsApi.posts.toggleReaction(postId, type),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.postDetail(postId) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.posts() });
    },
  });
}

export function useIncrementPostView() {
  return useMutation({
    mutationFn: (postId: string) => discussionsApi.posts.incrementView(postId),
  });
}

// ============= COMMENTS =============

export function useDiscussionComments(postId: string) {
  return useQuery({
    queryKey: discussionKeys.comments(postId),
    queryFn: () => discussionsApi.comments.getByPostId(postId),
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCommentInput) => discussionsApi.comments.create(data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.postDetail(postId) });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, content, postId }: { id: string; content: string; postId: string }) =>
      discussionsApi.comments.update(id, content),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.comments(postId) });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, postId }: { id: string; postId: string }) =>
      discussionsApi.comments.delete(id),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.postDetail(postId) });
    },
  });
}

export function useToggleCommentReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, type, postId }: { commentId: string; type: ReactionType; postId: string }) =>
      discussionsApi.comments.toggleReaction(commentId, type),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.comments(postId) });
    },
  });
}

export function useAcceptAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) =>
      discussionsApi.comments.acceptAnswer(commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.postDetail(postId) });
    },
  });
}

// ============= BOOKMARKS =============

export function useDiscussionBookmarks() {
  return useQuery({
    queryKey: discussionKeys.bookmarks(),
    queryFn: () => discussionsApi.bookmarks.getAll(),
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => discussionsApi.bookmarks.toggle(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.bookmarks() });
    },
  });
}

// ============= TAGS =============

export function useTrendingTags(limit?: number) {
  return useQuery({
    queryKey: [...discussionKeys.trendingTags(), limit],
    queryFn: () => discussionsApi.tags.getTrending(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useSearchTags(query: string) {
  return useQuery({
    queryKey: [...discussionKeys.tags(), 'search', query],
    queryFn: () => discussionsApi.tags.search(query),
    enabled: query.length >= 2,
  });
}

// ============= SEARCH =============

export function useDiscussionSearch(filters: SearchFilters, enabled = true) {
  return useQuery({
    queryKey: discussionKeys.search(filters),
    queryFn: () => discussionsApi.search.search(filters),
    enabled: enabled && Object.keys(filters).length > 0,
  });
}

// ============= ANALYTICS =============

export function useDiscussionAnalytics() {
  return useQuery({
    queryKey: discussionKeys.analytics(),
    queryFn: () => discussionsApi.analytics.getOverview(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============= USER ACTIVITY =============

export function useMyDiscussionPosts(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...discussionKeys.myPosts(), page, limit],
    queryFn: () => discussionsApi.user.getMyPosts(page, limit),
  });
}

export function useMyDiscussionComments(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...discussionKeys.myComments(), page, limit],
    queryFn: () => discussionsApi.user.getMyComments(page, limit),
  });
}
