/**
 * Study Group Controller - API endpoints for study groups
 */

import { Request, Response, NextFunction } from 'express';
import { studyGroupService } from '../services/studyGroup.service';

interface AuthRequest extends Request {
  userId?: string;
}

export class StudyGroupController {
  /**
   * Create a new study group
   * POST /api/v1/groups
   */
  async createGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const group = await studyGroupService.createGroup(userId, req.body);
      res.status(201).json(group);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get a study group by ID
   * GET /api/v1/groups/:id
   */
  async getGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const group = await studyGroupService.getGroup(id, userId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      res.json(group);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update a study group
   * PUT /api/v1/groups/:id
   */
  async updateGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const group = await studyGroupService.updateGroup(id, userId, req.body);
      res.json(group);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete a study group
   * DELETE /api/v1/groups/:id
   */
  async deleteGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await studyGroupService.deleteGroup(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Search/browse groups
   * GET /api/v1/groups
   */
  async searchGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query, focusAreas, visibility, limit, offset } = req.query;

      const result = await studyGroupService.searchGroups({
        query: query as string,
        focusAreas: focusAreas ? (focusAreas as string).split(',') : undefined,
        visibility: visibility as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get user's groups
   * GET /api/v1/groups/my-groups
   */
  async getMyGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const groups = await studyGroupService.getUserGroups(userId);
      res.json(groups);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get recommended groups
   * GET /api/v1/groups/recommended
   */
  async getRecommendedGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const groups = await studyGroupService.getRecommendedGroups(userId, limit);
      res.json(groups);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Join a group
   * POST /api/v1/groups/:id/join
   */
  async joinGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const member = await studyGroupService.joinGroup(id, userId);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Leave a group
   * POST /api/v1/groups/:id/leave
   */
  async leaveGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await studyGroupService.leaveGroup(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Invite user to group
   * POST /api/v1/groups/:id/invite
   */
  async inviteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const member = await studyGroupService.inviteUser(id, userId, email);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Approve pending member
   * POST /api/v1/groups/:id/members/:memberId/approve
   */
  async approveMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const member = await studyGroupService.approveMember(id, userId, memberId);
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Remove member from group
   * DELETE /api/v1/groups/:id/members/:memberId
   */
  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params;
      const { ban } = req.query;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await studyGroupService.removeMember(id, userId, memberId, ban === 'true');
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Send message to group
   * POST /api/v1/groups/:id/messages
   */
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const message = await studyGroupService.sendMessage(userId, {
        groupId: id,
        ...req.body
      });
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get group messages
   * GET /api/v1/groups/:id/messages
   */
  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit, before, after } = req.query;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const messages = await studyGroupService.getMessages(id, userId, {
        limit: limit ? parseInt(limit as string) : undefined,
        before: before ? new Date(before as string) : undefined,
        after: after ? new Date(after as string) : undefined
      });
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Create study session for group
   * POST /api/v1/groups/:id/sessions
   */
  async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const session = await studyGroupService.createSession(userId, {
        groupId: id,
        ...req.body
      });
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get group sessions
   * GET /api/v1/groups/:id/sessions
   */
  async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, limit } = req.query;

      const sessions = await studyGroupService.getGroupSessions(id, {
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json(sessions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const studyGroupController = new StudyGroupController();
export default studyGroupController;
