/**
 * Study Group Routes - API endpoints for study groups
 */

import { Router } from 'express';
import { studyGroupController } from '../controllers/studyGroup.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Group discovery and browsing
router.get('/', (req, res, next) => studyGroupController.searchGroups(req, res, next));
router.get('/my-groups', (req, res, next) => studyGroupController.getMyGroups(req, res, next));
router.get('/recommended', (req, res, next) => studyGroupController.getRecommendedGroups(req, res, next));

// Group CRUD
router.post('/', (req, res, next) => studyGroupController.createGroup(req, res, next));
router.get('/:id', (req, res, next) => studyGroupController.getGroup(req, res, next));
router.put('/:id', (req, res, next) => studyGroupController.updateGroup(req, res, next));
router.delete('/:id', (req, res, next) => studyGroupController.deleteGroup(req, res, next));

// Membership
router.post('/:id/join', (req, res, next) => studyGroupController.joinGroup(req, res, next));
router.post('/:id/leave', (req, res, next) => studyGroupController.leaveGroup(req, res, next));
router.post('/:id/invite', (req, res, next) => studyGroupController.inviteUser(req, res, next));
router.post('/:id/members/:memberId/approve', (req, res, next) => studyGroupController.approveMember(req, res, next));
router.delete('/:id/members/:memberId', (req, res, next) => studyGroupController.removeMember(req, res, next));

// Messages
router.get('/:id/messages', (req, res, next) => studyGroupController.getMessages(req, res, next));
router.post('/:id/messages', (req, res, next) => studyGroupController.sendMessage(req, res, next));

// Study Sessions
router.get('/:id/sessions', (req, res, next) => studyGroupController.getSessions(req, res, next));
router.post('/:id/sessions', (req, res, next) => studyGroupController.createSession(req, res, next));

export default router;
