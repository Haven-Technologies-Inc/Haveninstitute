/**
 * Study Group Service - Business logic for study groups
 * Handles CRUD operations, membership, messaging, and invitations
 */

import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { StudyGroup, GroupMember, GroupMessage, GroupInvitation } from '../models/StudyGroup';
import { User } from '../models/User';

// Types
interface CreateGroupInput {
  name: string;
  description?: string;
  maxMembers?: number;
  isPublic?: boolean;
  category?: string;
}

interface SearchGroupsInput {
  query?: string;
  category?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

class StudyGroupService {
  // ============================================
  // GROUP CRUD OPERATIONS
  // ============================================

  /**
   * Create a new study group
   */
  async createGroup(userId: string, input: CreateGroupInput): Promise<StudyGroup> {
    // Create the group
    const group = await StudyGroup.create({
      name: input.name,
      description: input.description,
      createdBy: userId,
      maxMembers: input.maxMembers || 6,
      isPublic: input.isPublic !== false,
      category: input.category
    });

    // Auto-add creator as a member with 'creator' role
    await GroupMember.create({
      groupId: group.id,
      userId: userId,
      role: 'creator',
      joinedAt: new Date()
    });

    return this.getGroupById(group.id);
  }

  /**
   * Get group by ID with members
   */
  async getGroupById(groupId: string): Promise<StudyGroup | null> {
    return StudyGroup.findByPk(groupId, {
      include: [
        {
          model: GroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'fullName', 'avatarUrl']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'fullName', 'avatarUrl']
        }
      ]
    });
  }

  /**
   * Get all groups for a user
   */
  async getUserGroups(userId: string): Promise<StudyGroup[]> {
    const memberships = await GroupMember.findAll({
      where: { userId },
      include: [
        {
          model: StudyGroup,
          as: 'group',
          include: [
            {
              model: GroupMember,
              as: 'members',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'email', 'fullName', 'avatarUrl']
                }
              ]
            }
          ]
        }
      ]
    });

    return memberships.map(m => m.group!).filter(g => g !== null);
  }

  /**
   * Search public groups
   */
  async searchGroups(input: SearchGroupsInput): Promise<{ groups: StudyGroup[]; total: number }> {
    const where: any = { isPublic: true };

    if (input.query) {
      where[Op.or] = [
        { name: { [Op.like]: `%${input.query}%` } },
        { description: { [Op.like]: `%${input.query}%` } }
      ];
    }

    if (input.category) {
      where.category = input.category;
    }

    const { rows: groups, count: total } = await StudyGroup.findAndCountAll({
      where,
      limit: input.limit || 20,
      offset: input.offset || 0,
      include: [
        {
          model: GroupMember,
          as: 'members',
          attributes: ['id', 'userId', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return { groups, total };
  }

  /**
   * Update group details
   */
  async updateGroup(groupId: string, userId: string, updates: Partial<CreateGroupInput>): Promise<StudyGroup> {
    const group = await StudyGroup.findByPk(groupId);
    if (!group) throw new Error('Group not found');

    // Check if user is creator or admin
    const membership = await GroupMember.findOne({
      where: { groupId, userId, role: ['creator', 'admin'] }
    });
    if (!membership) throw new Error('Not authorized to update this group');

    await group.update(updates);
    return this.getGroupById(groupId) as Promise<StudyGroup>;
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await StudyGroup.findByPk(groupId);
    if (!group) throw new Error('Group not found');

    // Only creator can delete
    if (group.createdBy !== userId) {
      throw new Error('Only the group creator can delete the group');
    }

    await group.destroy();
  }

  // ============================================
  // MEMBERSHIP OPERATIONS
  // ============================================

  /**
   * Join a public group
   */
  async joinGroup(groupId: string, userId: string): Promise<GroupMember> {
    const group = await StudyGroup.findByPk(groupId, {
      include: [{ model: GroupMember, as: 'members' }]
    });

    if (!group) throw new Error('Group not found');
    if (!group.isPublic) throw new Error('This is a private group. You need an invitation to join.');

    // Check if already a member
    const existingMembership = await GroupMember.findOne({
      where: { groupId, userId }
    });
    if (existingMembership) throw new Error('Already a member of this group');

    // Check max members
    const memberCount = group.members?.length || 0;
    if (memberCount >= group.maxMembers) {
      throw new Error('Group is full');
    }

    return GroupMember.create({
      groupId,
      userId,
      role: 'member',
      joinedAt: new Date()
    });
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const membership = await GroupMember.findOne({
      where: { groupId, userId }
    });

    if (!membership) throw new Error('Not a member of this group');

    // Creator cannot leave, must delete or transfer ownership
    if (membership.role === 'creator') {
      throw new Error('Group creator cannot leave. Transfer ownership or delete the group.');
    }

    await membership.destroy();
  }

  /**
   * Remove a member from group
   */
  async removeMember(groupId: string, requesterId: string, targetUserId: string): Promise<void> {
    // Check if requester is admin or creator
    const requesterMembership = await GroupMember.findOne({
      where: { groupId, userId: requesterId, role: ['creator', 'admin'] }
    });
    if (!requesterMembership) throw new Error('Not authorized to remove members');

    const targetMembership = await GroupMember.findOne({
      where: { groupId, userId: targetUserId }
    });
    if (!targetMembership) throw new Error('User is not a member');

    // Cannot remove creator
    if (targetMembership.role === 'creator') {
      throw new Error('Cannot remove the group creator');
    }

    await targetMembership.destroy();
  }

  /**
   * Check if user is a member
   */
  async isMember(groupId: string, userId: string): Promise<boolean> {
    const membership = await GroupMember.findOne({
      where: { groupId, userId }
    });
    return !!membership;
  }

  // ============================================
  // MESSAGING OPERATIONS
  // ============================================

  /**
   * Send a message to group
   */
  async sendMessage(groupId: string, userId: string, content: string, messageType: 'text' | 'image' | 'resource_link' = 'text'): Promise<GroupMessage> {
    // Verify membership
    const isMember = await this.isMember(groupId, userId);
    if (!isMember) throw new Error('Not a member of this group');

    const message = await GroupMessage.create({
      groupId,
      userId,
      content,
      messageType,
      createdAt: new Date()
    });

    // Return with user info
    return GroupMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'fullName', 'avatarUrl']
        }
      ]
    }) as Promise<GroupMessage>;
  }

  /**
   * Get group messages with pagination
   */
  async getMessages(groupId: string, userId: string, page = 1, limit = 50): Promise<{ messages: GroupMessage[]; total: number }> {
    // Verify membership
    const isMember = await this.isMember(groupId, userId);
    if (!isMember) throw new Error('Not a member of this group');

    const offset = (page - 1) * limit;

    const { rows: messages, count: total } = await GroupMessage.findAndCountAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'fullName', 'avatarUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return { messages: messages.reverse(), total };
  }

  // ============================================
  // INVITATION OPERATIONS
  // ============================================

  /**
   * Create an invitation
   */
  async createInvitation(groupId: string, inviterId: string, email: string): Promise<GroupInvitation> {
    // Verify inviter is member
    const membership = await GroupMember.findOne({
      where: { groupId, userId: inviterId }
    });
    if (!membership) throw new Error('Not a member of this group');

    // Check if invitation already exists
    const existingInvite = await GroupInvitation.findOne({
      where: { groupId, email, status: 'pending' }
    });
    if (existingInvite) throw new Error('Invitation already sent to this email');

    // Generate unique token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    return GroupInvitation.create({
      groupId,
      inviterId,
      email,
      token,
      status: 'pending',
      expiresAt,
      createdAt: new Date()
    });
  }

  /**
   * Accept an invitation by token
   */
  async acceptInvitation(token: string, userId: string): Promise<GroupMember> {
    const invitation = await GroupInvitation.findOne({
      where: { token, status: 'pending' }
    });

    if (!invitation) throw new Error('Invalid or expired invitation');

    // Check if expired
    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      await invitation.update({ status: 'expired' });
      throw new Error('Invitation has expired');
    }

    // Check if already a member
    const existingMembership = await GroupMember.findOne({
      where: { groupId: invitation.groupId, userId }
    });
    if (existingMembership) {
      await invitation.update({ status: 'accepted' });
      throw new Error('Already a member of this group');
    }

    // Check group capacity
    const group = await StudyGroup.findByPk(invitation.groupId, {
      include: [{ model: GroupMember, as: 'members' }]
    });
    if (group && group.members && group.members.length >= group.maxMembers) {
      throw new Error('Group is full');
    }

    // Accept invitation and create membership
    await invitation.update({ status: 'accepted' });

    return GroupMember.create({
      groupId: invitation.groupId,
      userId,
      role: 'member',
      joinedAt: new Date()
    });
  }

  /**
   * Get pending invitations for a group
   */
  async getGroupInvitations(groupId: string, userId: string): Promise<GroupInvitation[]> {
    // Verify user is admin or creator
    const membership = await GroupMember.findOne({
      where: { groupId, userId, role: ['creator', 'admin'] }
    });
    if (!membership) throw new Error('Not authorized to view invitations');

    return GroupInvitation.findAll({
      where: { groupId, status: 'pending' },
      include: [
        {
          model: User,
          as: 'inviter',
          attributes: ['id', 'email', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get recommended groups for a user
   */
  async getRecommendedGroups(userId: string, limit = 6): Promise<StudyGroup[]> {
    // Get groups user is already in
    const userMemberships = await GroupMember.findAll({
      where: { userId },
      attributes: ['groupId']
    });
    const userGroupIds = userMemberships.map(m => m.groupId);

    // Find public groups user is not in, sorted by member count
    const groups = await StudyGroup.findAll({
      where: {
        isPublic: true,
        id: { [Op.notIn]: userGroupIds.length > 0 ? userGroupIds : [''] }
      },
      include: [
        {
          model: GroupMember,
          as: 'members',
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });

    return groups;
  }
}

export const studyGroupService = new StudyGroupService();
export default studyGroupService;
