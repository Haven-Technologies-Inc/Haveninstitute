/**
 * Study Groups Hooks - React Query hooks for study group features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyGroupApi, StudyGroup, CreateGroupInput, CreateSessionInput } from '../api/studyGroup.api';

export const studyGroupKeys = {
  all: ['studyGroups'] as const,
  myGroups: () => [...studyGroupKeys.all, 'my-groups'] as const,
  recommended: () => [...studyGroupKeys.all, 'recommended'] as const,
  search: (query?: string) => [...studyGroupKeys.all, 'search', query] as const,
  group: (id: string) => [...studyGroupKeys.all, 'group', id] as const,
  messages: (groupId: string) => [...studyGroupKeys.all, 'messages', groupId] as const,
  sessions: (groupId: string) => [...studyGroupKeys.all, 'sessions', groupId] as const,
};

// Get user's groups
export function useMyGroups() {
  return useQuery({
    queryKey: studyGroupKeys.myGroups(),
    queryFn: studyGroupApi.getMyGroups,
    staleTime: 1000 * 60 * 5,
  });
}

// Get recommended groups
export function useRecommendedGroups(limit?: number) {
  return useQuery({
    queryKey: studyGroupKeys.recommended(),
    queryFn: () => studyGroupApi.getRecommendedGroups(limit),
    staleTime: 1000 * 60 * 10,
  });
}

// Search groups
export function useSearchGroups(params?: {
  query?: string;
  focusAreas?: string[];
  visibility?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: studyGroupKeys.search(params?.query),
    queryFn: () => studyGroupApi.searchGroups(params),
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
export function useGroupMessages(groupId: string, options?: { limit?: number }) {
  return useQuery({
    queryKey: studyGroupKeys.messages(groupId),
    queryFn: () => studyGroupApi.getMessages(groupId, options),
    enabled: !!groupId,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

// Get group sessions
export function useGroupSessions(groupId: string, options?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: studyGroupKeys.sessions(groupId),
    queryFn: () => studyGroupApi.getSessions(groupId, options),
    enabled: !!groupId,
  });
}

// Create group mutation
export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateGroupInput) => studyGroupApi.createGroup(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.myGroups() });
    },
  });
}

// Update group mutation
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: string; input: Partial<CreateGroupInput> }) =>
      studyGroupApi.updateGroup(groupId, input),
    onSuccess: (_, { groupId }) => {
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

// Invite user mutation
export function useInviteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) =>
      studyGroupApi.inviteUser(groupId, email),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.group(groupId) });
    },
  });
}

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, content, type }: { groupId: string; content: string; type?: string }) =>
      studyGroupApi.sendMessage(groupId, content, type),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.messages(groupId) });
    },
  });
}

// Create session mutation
export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: string; input: CreateSessionInput }) =>
      studyGroupApi.createSession(groupId, input),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.sessions(groupId) });
    },
  });
}
