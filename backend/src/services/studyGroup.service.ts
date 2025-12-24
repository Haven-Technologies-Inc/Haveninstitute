/**
 * Study Group Service - Business logic for study group features
 */

import { Op } from 'sequelize';
import { StudyGroup, StudyGroupMember, StudyGroupMessage, StudySession } from '../models/StudyGroup';
import { User } from '../models/User';

interface CreateGroupInput {
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'invite_only';
  focusAreas?: string[];
  tags?: string[];
  maxMembers?: number;
  settings?: StudyGroup['settings'];
}

interface UpdateGroupInput extends Partial<CreateGroupInput> {
  avatarUrl?: string;
  coverImageUrl?: string;
  isActive?: boolean;
}

interface CreateSessionInput {
  groupId: string;
  title: string;
  description?: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  topics?: string[];
  resources?: StudySession['resources'];
  meetingLink?: string;
}

interface SendMessageInput {
  groupId: string;
  content: string;
  type?: StudyGroupMessage['type'];
  metadata?: StudyGroupMessage['metadata'];
}

export class StudyGroupService {
  /**
   * Create a new study group
   */
  async createGroup(userId: string, input: CreateGroupInput): Promise<StudyGroup> {
    const group = await StudyGroup.create({
      ...input,
      ownerId: userId,
      memberCount: 1,
      settings: {
        allowMemberInvites: true,
        requireApproval: input.visibility === 'private',
        allowPolls: true,
        allowResources: true,
        ...input.settings
      },
      stats: {
        totalMessages: 0,
        totalSessions: 0,
        totalStudyHours: 0,
        averageSessionAttendance: 0,
        weeklyActiveMembers: 1
      }
    });

    // Add owner as member
    await StudyGroupMember.create({
      groupId: group.id,
      userId,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      lastActiveAt: new Date()
    });

    return group;
  }

  /**
   * Get group by ID with members
   */
  async getGroup(groupId: string, userId?: string): Promise<StudyGroup | null> {
    const group = await StudyGroup.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: StudyGroupMember,
          as: 'members',
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }],
          where: { status: 'active' },
          required: false
        }
      ]
    });

    if (!group) return null;

    // Check visibility permissions
    if (group.visibility !== 'public' && userId) {
      const isMember = await this.isMember(groupId, userId);
      if (!isMember && group.ownerId !== userId) {
        // Return limited info for non-members
        const limitedGroup = group.toJSON();
        delete (limitedGroup as any).members;
        delete (limitedGroup as any).messages;
        return limitedGroup as StudyGroup;
      }
    }

    return group;
  }

  /**
   * Update a study group
   */
  async updateGroup(groupId: string, userId: string, input: UpdateGroupInput): Promise<StudyGroup> {
    const group = await StudyGroup.findByPk(groupId);
    if (!group) throw new Error('Group not found');

    const member = await StudyGroupMember.findOne({
      where: { groupId, userId }
    });

    if (!member || !['owner', 'admin'].includes(member.role)) {
      throw new Error('Not authorized to update this group');
    }

    await group.update(input);
    return group;
  }

  /**
   * Delete a study group
   */
  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await StudyGroup.findByPk(groupId);
    if (!group) throw new Error('Group not found');
    if (group.ownerId !== userId) throw new Error('Only the owner can delete a group');

    await StudyGroupMessage.destroy({ where: { groupId } });
    await StudySession.destroy({ where: { groupId } });
    await StudyGroupMember.destroy({ where: { groupId } });
    await group.destroy();
  }

  /**
   * Search/browse groups
   */
  async searchGroups(options: {
    query?: string;
    focusAreas?: string[];
    visibility?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ groups: StudyGroup[]; total: number }> {
    const where: any = { isActive: true };

    if (options.query) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${options.query}%` } },
        { description: { [Op.iLike]: `%${options.query}%` } }
      ];
    }

    if (options.focusAreas?.length) {
      where.focusAreas = { [Op.overlap]: options.focusAreas };
    }

    if (options.visibility) {
      where.visibility = options.visibility;
    } else {
      where.visibility = { [Op.in]: ['public', 'invite_only'] };
    }

    const { rows: groups, count: total } = await StudyGroup.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName']
      }],
      limit: options.limit || 20,
      offset: options.offset || 0,
      order: [['memberCount', 'DESC'], ['createdAt', 'DESC']]
    });

    return { groups, total };
  }

  /**
   * Get groups for a user
   */
  async getUserGroups(userId: string): Promise<StudyGroup[]> {
    const memberships = await StudyGroupMember.findAll({
      where: { userId, status: 'active' },
      include: [{
        model: StudyGroup,
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName']
        }]
      }]
    });

    return memberships.map(m => m.group);
  }

  /**
   * Join a group
   */
  async joinGroup(groupId: string, userId: string): Promise<StudyGroupMember> {
    const group = await StudyGroup.findByPk(groupId);
    if (!group) throw new Error('Group not found');
    if (!group.isActive) throw new Error('Group is not active');
    if (group.memberCount >= group.maxMembers) throw new Error('Group is full');

    const existingMember = await StudyGroupMember.findOne({
      where: { groupId, userId }
    });

    if (existingMember) {
      if (existingMember.status === 'banned') throw new Error('You are banned from this group');
      if (existingMember.status === 'active') throw new Error('Already a member');
      
      // Reactivate membership
      await existingMember.update({
        status: group.settings?.requireApproval ? 'pending' : 'active',
        joinedAt: new Date(),
        lastActiveAt: new Date()
      });
      
      if (!group.settings?.requireApproval) {
        await group.increment('memberCount');
      }
      
      return existingMember;
    }

    const member = await StudyGroupMember.create({
      groupId,
      userId,
      role: 'member',
      status: group.settings?.requireApproval ? 'pending' : 'active',
      joinedAt: new Date(),
      lastActiveAt: new Date()
    });

    if (!group.settings?.requireApproval) {
      await group.increment('memberCount');
    }

    return member;
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const group = await StudyGroup.findByPk(groupId);
    if (!group) throw new Error('Group not found');
    if (group.ownerId === userId) throw new Error('Owner cannot leave. Transfer ownership first.');

    const member = await StudyGroupMember.findOne({
      where: { groupId, userId, status: 'active' }
    });

    if (!member) throw new Error('Not a member of this group');

    await member.destroy();
    await group.decrement('memberCount');
  }

  /**
   * Invite user to group
   */
  async inviteUser(groupId: string, inviterId: string, inviteeEmail: string): Promise<StudyGroupMember> {
    const group = await StudyGroup.findByPk(groupId);
    if (!group) throw new Error('Group not found');

    const inviter = await StudyGroupMember.findOne({
      where: { groupId, userId: inviterId }
    });

    if (!inviter || !['owner', 'admin', 'moderator'].includes(inviter.role)) {
      if (!group.settings?.allowMemberInvites) {
        throw new Error('Not authorized to invite members');
      }
    }

    const invitee = await User.findOne({ where: { email: inviteeEmail } });
    if (!invitee) throw new Error('User not found');

    const existingMember = await StudyGroupMember.findOne({
      where: { groupId, userId: invitee.id }
    });

    if (existingMember) {
      if (existingMember.status === 'active') throw new Error('User is already a member');
      if (existingMember.status === 'invited') throw new Error('User already invited');
    }

    const member = await StudyGroupMember.create({
      groupId,
      userId: invitee.id,
      role: 'member',
      status: 'invited'
    });

    return member;
  }

  /**
   * Approve pending member
   */
  async approveMember(groupId: string, approverId: string, memberId: string): Promise<StudyGroupMember> {
    const approver = await StudyGroupMember.findOne({
      where: { groupId, userId: approverId }
    });

    if (!approver || !['owner', 'admin', 'moderator'].includes(approver.role)) {
      throw new Error('Not authorized to approve members');
    }

    const member = await StudyGroupMember.findOne({
      where: { groupId, userId: memberId, status: 'pending' }
    });

    if (!member) throw new Error('Pending member not found');

    await member.update({
      status: 'active',
      joinedAt: new Date(),
      lastActiveAt: new Date()
    });

    const group = await StudyGroup.findByPk(groupId);
    await group?.increment('memberCount');

    return member;
  }

  /**
   * Remove/ban member
   */
  async removeMember(groupId: string, removerId: string, memberId: string, ban: boolean = false): Promise<void> {
    const remover = await StudyGroupMember.findOne({
      where: { groupId, userId: removerId }
    });

    if (!remover || !['owner', 'admin'].includes(remover.role)) {
      throw new Error('Not authorized to remove members');
    }

    const member = await StudyGroupMember.findOne({
      where: { groupId, userId: memberId }
    });

    if (!member) throw new Error('Member not found');
    if (member.role === 'owner') throw new Error('Cannot remove the group owner');

    if (ban) {
      await member.update({ status: 'banned' });
    } else {
      await member.destroy();
    }

    const group = await StudyGroup.findByPk(groupId);
    await group?.decrement('memberCount');
  }

  /**
   * Check if user is member
   */
  async isMember(groupId: string, userId: string): Promise<boolean> {
    const member = await StudyGroupMember.findOne({
      where: { groupId, userId, status: 'active' }
    });
    return !!member;
  }

  /**
   * Send message to group
   */
  async sendMessage(userId: string, input: SendMessageInput): Promise<StudyGroupMessage> {
    const isMember = await this.isMember(input.groupId, userId);
    if (!isMember) throw new Error('Must be a member to send messages');

    const message = await StudyGroupMessage.create({
      ...input,
      senderId: userId
    });

    // Update member last active
    await StudyGroupMember.update(
      { lastActiveAt: new Date() },
      { where: { groupId: input.groupId, userId } }
    );

    // Update group stats
    await StudyGroup.increment('stats.totalMessages', {
      where: { id: input.groupId }
    });

    return message;
  }

  /**
   * Get group messages
   */
  async getMessages(groupId: string, userId: string, options: {
    limit?: number;
    before?: Date;
    after?: Date;
  } = {}): Promise<StudyGroupMessage[]> {
    const isMember = await this.isMember(groupId, userId);
    if (!isMember) throw new Error('Must be a member to view messages');

    const where: any = { groupId };
    
    if (options.before) {
      where.createdAt = { [Op.lt]: options.before };
    }
    if (options.after) {
      where.createdAt = { ...where.createdAt, [Op.gt]: options.after };
    }

    return StudyGroupMessage.findAll({
      where,
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit: options.limit || 50
    });
  }

  /**
   * Create study session
   */
  async createSession(userId: string, input: CreateSessionInput): Promise<StudySession> {
    const member = await StudyGroupMember.findOne({
      where: { groupId: input.groupId, userId }
    });

    if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
      throw new Error('Not authorized to create sessions');
    }

    const session = await StudySession.create({
      ...input,
      createdBy: userId
    });

    return session;
  }

  /**
   * Get upcoming sessions for a group
   */
  async getGroupSessions(groupId: string, options: {
    status?: string;
    limit?: number;
  } = {}): Promise<StudySession[]> {
    const where: any = { groupId };
    
    if (options.status) {
      where.status = options.status;
    } else {
      where.scheduledStart = { [Op.gte]: new Date() };
    }

    return StudySession.findAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['scheduledStart', 'ASC']],
      limit: options.limit || 10
    });
  }

  /**
   * Get recommended groups for user
   */
  async getRecommendedGroups(userId: string, limit: number = 5): Promise<StudyGroup[]> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Get user's current groups to exclude
    const userGroupIds = (await StudyGroupMember.findAll({
      where: { userId, status: 'active' },
      attributes: ['groupId']
    })).map(m => m.groupId);

    // Find groups matching user's interests/ability
    const groups = await StudyGroup.findAll({
      where: {
        id: { [Op.notIn]: userGroupIds },
        isActive: true,
        visibility: { [Op.in]: ['public', 'invite_only'] },
        memberCount: { [Op.lt]: { [Op.col]: 'maxMembers' } }
      },
      order: [
        ['memberCount', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit
    });

    return groups;
  }
}

export const studyGroupService = new StudyGroupService();
export default studyGroupService;
