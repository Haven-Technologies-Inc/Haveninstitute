/**
 * Study Group Controller - API endpoints for study groups
 * Handles HTTP requests and responses
 */

import { Request, Response, NextFunction } from 'express';
import { studyGroupService } from '../services/studyGroup.service';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
  userId?: string;
}

class StudyGroupController {
  /**
   * Create a new study group
   * POST /api/v1/study-groups
   */
  async createGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { name, description, maxMembers, isPublic, category } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Group name is required' });
      }

      const group = await studyGroupService.createGroup(userId, {
        name: name.trim(),
        description: description?.trim(),
        maxMembers,
        isPublic,
        category
      });

      res.status(201).json({ success: true, data: group });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get a single group by ID
   * GET /api/v1/study-groups/:groupId
   */
  async getGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const userId = req.userId;

      const group = await studyGroupService.getGroupById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }

      // Check if user can view (public or member)
      if (!group.isPublic && userId) {
        const isMember = await studyGroupService.isMember(groupId, userId);
        if (!isMember) {
          return res.status(403).json({ success: false, message: 'Not authorized to view this group' });
        }
      }

      res.json({ success: true, data: group });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get current user's groups
   * GET /api/v1/study-groups/my-groups
   */
  async getMyGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const groups = await studyGroupService.getUserGroups(userId);
      res.json({ success: true, data: groups });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Search public groups
   * GET /api/v1/study-groups/search
   */
  async searchGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query, category, limit, offset } = req.query;

      const result = await studyGroupService.searchGroups({
        query: query as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get recommended groups
   * GET /api/v1/study-groups/recommended
   */
  async getRecommendedGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const groups = await studyGroupService.getRecommendedGroups(userId, limit);

      res.json({ success: true, data: groups });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Update a group
   * PUT /api/v1/study-groups/:groupId
   */
  async updateGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId } = req.params;
      const updates = req.body;

      const group = await studyGroupService.updateGroup(groupId, userId, updates);
      res.json({ success: true, data: group });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Delete a group
   * DELETE /api/v1/study-groups/:groupId
   */
  async deleteGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId } = req.params;
      await studyGroupService.deleteGroup(groupId, userId);

      res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Join a group
   * POST /api/v1/study-groups/:groupId/join
   */
  async joinGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId } = req.params;
      const membership = await studyGroupService.joinGroup(groupId, userId);

      res.status(201).json({ success: true, data: membership });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Leave a group
   * POST /api/v1/study-groups/:groupId/leave
   */
  async leaveGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId } = req.params;
      await studyGroupService.leaveGroup(groupId, userId);

      res.json({ success: true, message: 'Left group successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Remove a member from group
   * DELETE /api/v1/study-groups/:groupId/members/:userId
   */
  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const requesterId = req.userId;
      if (!requesterId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId, userId: targetUserId } = req.params;
      await studyGroupService.removeMember(groupId, requesterId, targetUserId);

      res.json({ success: true, message: 'Member removed successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Send a message to group
   * POST /api/v1/study-groups/:groupId/messages
   */
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId } = req.params;
      const { content, messageType } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Message content is required' });
      }

      const message = await studyGroupService.sendMessage(groupId, userId, content.trim(), messageType);
      res.status(201).json({ success: true, data: message });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get group messages
   * GET /api/v1/study-groups/:groupId/messages
   */
  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const result = await studyGroupService.getMessages(groupId, userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Create an invitation
   * POST /api/v1/study-groups/:groupId/invitations
   */
  async createInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const invitation = await studyGroupService.createInvitation(groupId, userId, email);
      res.status(201).json({ success: true, data: invitation });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Accept an invitation
   * POST /api/v1/study-groups/invitations/:token/accept
   */
  async acceptInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { token } = req.params;
      const membership = await studyGroupService.acceptInvitation(token, userId);

      res.json({ success: true, data: membership });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get group invitations
   * GET /api/v1/study-groups/:groupId/invitations
   */
  async getInvitations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { groupId } = req.params;
      const invitations = await studyGroupService.getGroupInvitations(groupId, userId);

      res.json({ success: true, data: invitations });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const studyGroupController = new StudyGroupController();
export default studyGroupController;
