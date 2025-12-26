/**
 * Study Groups Hooks - React Query hooks for study group features
 * New implementation with clean interface
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyGroupApi, StudyGroup, CreateGroupInput, SearchGroupsParams } from '../api/studyGroup.api';

// Query keys
export const studyGroupKeys = {
  all: ['studyGroups'] as const,
  myGroups: () => [...studyGroupKeys.all, 'my-groups'] as const,
  recommended: () => [...studyGroupKeys.all, 'recommended'] as const,
  search: (params?: SearchGroupsParams) => [...studyGroupKeys.all, 'search', params] as const,
  group: (id: string) => [...studyGroupKeys.all, 'group', id] as const,
  messages: (groupId: string) => [...studyGroupKeys.all, 'messages', groupId] as const,
  invitations: (groupId: string) => [...studyGroupKeys.all, 'invitations', groupId] as const,
};

// Get user's groups
export function useMyGroups() {
  return useQuery({
    queryKey: studyGroupKeys.myGroups(),
    queryFn: studyGroupApi.getMyGroups,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get recommended groups
export function useRecommendedGroups(limit?: number) {
  return useQuery({
    queryKey: studyGroupKeys.recommended(),
    queryFn: () => studyGroupApi.getRecommendedGroups(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Search groups
export function useSearchGroups(params?: SearchGroupsParams) {
  return useQuery({
    queryKey: studyGroupKeys.search(params),
    queryFn: () => studyGroupApi.searchGroups(params),
    enabled: !!params?.query && params.query.length >= 2,
    staleTime: 1000 * 60 * 2,
  });
}

// Get single group
export function useStudyGroup(groupId: string) {
  return useQuery({
    queryKey: studyGroupKeys.group(groupId),
    queryFn: () => studyGroupApi.getGroup(groupId),
    enabled: !!groupId,
  });
}

// Get group messages
export function useGroupMessages(groupId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: studyGroupKeys.messages(groupId),
    queryFn: () => studyGroupApi.getMessages(groupId, page, limit),
    enabled: !!groupId,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

// Get group invitations
export function useGroupInvitations(groupId: string) {
  return useQuery({
    queryKey: studyGroupKeys.invitations(groupId),
    queryFn: () => studyGroupApi.getInvitations(groupId),
    enabled: !!groupId,
  });
}

// Create group mutation
export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateGroupInput) => studyGroupApi.createGroup(input),
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.myGroups() });
      queryClient.setQueryData(studyGroupKeys.group(newGroup.id), newGroup);
    },
  });
}

// Update group mutation
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: string; input: Partial<CreateGroupInput> }) =>
      studyGroupApi.updateGroup(groupId, input),
    onSuccess: (updatedGroup, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.myGroups() });
    },
  });
}

// Delete group mutation
export function useDeleteGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupId: string) => studyGroupApi.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.myGroups() });
    },
  });
}

// Join group mutation
export function useJoinGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupId: string) => studyGroupApi.joinGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.myGroups() });
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.recommended() });
    },
  });
}

// Leave group mutation
export function useLeaveGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupId: string) => studyGroupApi.leaveGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.myGroups() });
    },
  });
}

// Remove member mutation
export function useRemoveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      studyGroupApi.removeMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.group(groupId) });
    },
  });
}

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, content, messageType }: { groupId: string; content: string; messageType?: 'text' | 'image' | 'resource_link' }) =>
      studyGroupApi.sendMessage(groupId, content, messageType),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.messages(groupId) });
    },
  });
}

// Create invitation mutation
export function useCreateInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) =>
      studyGroupApi.createInvitation(groupId, email),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.invitations(groupId) });
    },
  });
}

// Accept invitation mutation
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => studyGroupApi.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.myGroups() });
    },
  });
}
