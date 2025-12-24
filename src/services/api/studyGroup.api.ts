/**
 * Study Group API - Frontend client for study group features
 */

import apiClient from './client';

export interface StudyGroupMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'active' | 'invited' | 'pending' | 'banned';
  joinedAt: string;
  lastActiveAt: string;
  contributionPoints: number;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface StudyGroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  type: 'text' | 'question' | 'resource' | 'announcement' | 'poll';
  metadata?: {
    attachments?: { url: string; type: string; name: string }[];
    pollOptions?: { id: string; text: string; votes: number }[];
  };
  isPinned: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface StudySession {
  id: string;
  groupId: string;
  createdBy: string;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  topics: string[];
  meetingLink?: string;
  attendeeCount: number;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  ownerId: string;
  visibility: 'public' | 'private' | 'invite_only';
  focusAreas: string[];
  tags: string[];
  maxMembers: number;
  memberCount: number;
  averageAbility: number;
  isActive: boolean;
  settings?: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
    allowPolls: boolean;
    allowResources: boolean;
    weeklyGoal?: number;
  };
  stats?: {
    totalMessages: number;
    totalSessions: number;
    totalStudyHours: number;
    averageSessionAttendance: number;
    weeklyActiveMembers: number;
  };
  createdAt: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  members?: StudyGroupMember[];
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'invite_only';
  focusAreas?: string[];
  tags?: string[];
  maxMembers?: number;
}

export interface CreateSessionInput {
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
  topics?: string[];
  meetingLink?: string;
}

// API Functions
export const studyGroupApi = {
  // Search/browse groups
  searchGroups: async (params?: {
    query?: string;
    focusAreas?: string[];
    visibility?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ groups: StudyGroup[]; total: number }> => {
    const response = await apiClient.get('/groups', { params });
    return response.data;
  },

  // Get user's groups
  getMyGroups: async (): Promise<StudyGroup[]> => {
    const response = await apiClient.get('/groups/my-groups');
    return response.data;
  },

  // Get recommended groups
  getRecommendedGroups: async (limit?: number): Promise<StudyGroup[]> => {
    const response = await apiClient.get('/groups/recommended', { params: { limit } });
    return response.data;
  },

  // Create group
  createGroup: async (input: CreateGroupInput): Promise<StudyGroup> => {
    const response = await apiClient.post('/groups', input);
    return response.data;
  },

  // Get group by ID
  getGroup: async (groupId: string): Promise<StudyGroup> => {
    const response = await apiClient.get(`/groups/${groupId}`);
    return response.data;
  },

  // Update group
  updateGroup: async (groupId: string, input: Partial<CreateGroupInput>): Promise<StudyGroup> => {
    const response = await apiClient.put(`/groups/${groupId}`, input);
    return response.data;
  },

  // Delete group
  deleteGroup: async (groupId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}`);
  },

  // Join group
  joinGroup: async (groupId: string): Promise<StudyGroupMember> => {
    const response = await apiClient.post(`/groups/${groupId}/join`);
    return response.data;
  },

  // Leave group
  leaveGroup: async (groupId: string): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/leave`);
  },

  // Invite user
  inviteUser: async (groupId: string, email: string): Promise<StudyGroupMember> => {
    const response = await apiClient.post(`/groups/${groupId}/invite`, { email });
    return response.data;
  },

  // Approve member
  approveMember: async (groupId: string, memberId: string): Promise<StudyGroupMember> => {
    const response = await apiClient.post(`/groups/${groupId}/members/${memberId}/approve`);
    return response.data;
  },

  // Remove member
  removeMember: async (groupId: string, memberId: string, ban?: boolean): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/members/${memberId}`, { params: { ban } });
  },

  // Get messages
  getMessages: async (groupId: string, options?: {
    limit?: number;
    before?: string;
    after?: string;
  }): Promise<StudyGroupMessage[]> => {
    const response = await apiClient.get(`/groups/${groupId}/messages`, { params: options });
    return response.data;
  },

  // Send message
  sendMessage: async (groupId: string, content: string, type?: string): Promise<StudyGroupMessage> => {
    const response = await apiClient.post(`/groups/${groupId}/messages`, { content, type });
    return response.data;
  },

  // Get sessions
  getSessions: async (groupId: string, options?: {
    status?: string;
    limit?: number;
  }): Promise<StudySession[]> => {
    const response = await apiClient.get(`/groups/${groupId}/sessions`, { params: options });
    return response.data;
  },

  // Create session
  createSession: async (groupId: string, input: CreateSessionInput): Promise<StudySession> => {
    const response = await apiClient.post(`/groups/${groupId}/sessions`, input);
    return response.data;
  }
};

export default studyGroupApi;
