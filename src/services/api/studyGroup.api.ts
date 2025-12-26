/**
 * Study Group API - Frontend API client for study groups
 * New implementation with clean interface
 */

import api from '../api';

// Types
export interface StudyGroupMember {
  id: string;
  userId: string;
  role: 'creator' | 'admin' | 'member';
  joinedAt: string;
  user?: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface StudyGroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  messageType: 'text' | 'image' | 'resource_link';
  createdAt: string;
  user?: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface StudyGroupInvitation {
  id: string;
  groupId: string;
  inviterId: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
  inviter?: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  maxMembers: number;
  isPublic: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
  members?: StudyGroupMember[];
  creator?: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  maxMembers?: number;
  isPublic?: boolean;
  category?: string;
}

export interface SearchGroupsParams {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

// API Functions
export const studyGroupApi = {
  // Create a new group
  createGroup: async (input: CreateGroupInput): Promise<StudyGroup> => {
    const response = await api.post('/study-groups', input);
    return response.data.data;
  },

  // Get a single group by ID
  getGroup: async (groupId: string): Promise<StudyGroup> => {
    const response = await api.get(`/study-groups/${groupId}`);
    return response.data.data;
  },

  // Get current user's groups
  getMyGroups: async (): Promise<StudyGroup[]> => {
    const response = await api.get('/study-groups/my-groups');
    return response.data.data;
  },

  // Search public groups
  searchGroups: async (params?: SearchGroupsParams): Promise<{ groups: StudyGroup[]; total: number }> => {
    const response = await api.get('/study-groups/search', { params });
    return response.data.data;
  },

  // Get recommended groups
  getRecommendedGroups: async (limit?: number): Promise<StudyGroup[]> => {
    const response = await api.get('/study-groups/recommended', { params: { limit } });
    return response.data.data;
  },

  // Update a group
  updateGroup: async (groupId: string, input: Partial<CreateGroupInput>): Promise<StudyGroup> => {
    const response = await api.put(`/study-groups/${groupId}`, input);
    return response.data.data;
  },

  // Delete a group
  deleteGroup: async (groupId: string): Promise<void> => {
    await api.delete(`/study-groups/${groupId}`);
  },

  // Join a group
  joinGroup: async (groupId: string): Promise<StudyGroupMember> => {
    const response = await api.post(`/study-groups/${groupId}/join`);
    return response.data.data;
  },

  // Leave a group
  leaveGroup: async (groupId: string): Promise<void> => {
    await api.post(`/study-groups/${groupId}/leave`);
  },

  // Remove a member
  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await api.delete(`/study-groups/${groupId}/members/${userId}`);
  },

  // Get group messages
  getMessages: async (groupId: string, page = 1, limit = 50): Promise<{ messages: StudyGroupMessage[]; total: number }> => {
    const response = await api.get(`/study-groups/${groupId}/messages`, { params: { page, limit } });
    return response.data.data;
  },

  // Send a message
  sendMessage: async (groupId: string, content: string, messageType: 'text' | 'image' | 'resource_link' = 'text'): Promise<StudyGroupMessage> => {
    const response = await api.post(`/study-groups/${groupId}/messages`, { content, messageType });
    return response.data.data;
  },

  // Get group invitations
  getInvitations: async (groupId: string): Promise<StudyGroupInvitation[]> => {
    const response = await api.get(`/study-groups/${groupId}/invitations`);
    return response.data.data;
  },

  // Create an invitation
  createInvitation: async (groupId: string, email: string): Promise<StudyGroupInvitation> => {
    const response = await api.post(`/study-groups/${groupId}/invitations`, { email });
    return response.data.data;
  },

  // Accept an invitation
  acceptInvitation: async (token: string): Promise<StudyGroupMember> => {
    const response = await api.post(`/study-groups/invitations/${token}/accept`);
    return response.data.data;
  }
};

export default studyGroupApi;
