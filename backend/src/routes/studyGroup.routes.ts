/**
 * Study Group Routes - API endpoints for study groups
 */

import { Router } from 'express';
import { studyGroupController } from '../controllers/studyGroup.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Group CRUD
router.post('/', (req, res, next) => studyGroupController.createGroup(req, res, next));
router.get('/my-groups', (req, res, next) => studyGroupController.getMyGroups(req, res, next));
router.get('/search', (req, res, next) => studyGroupController.searchGroups(req, res, next));
router.get('/recommended', (req, res, next) => studyGroupController.getRecommendedGroups(req, res, next));
router.get('/:groupId', (req, res, next) => studyGroupController.getGroup(req, res, next));
router.put('/:groupId', (req, res, next) => studyGroupController.updateGroup(req, res, next));
router.delete('/:groupId', (req, res, next) => studyGroupController.deleteGroup(req, res, next));

// Membership
router.post('/:groupId/join', (req, res, next) => studyGroupController.joinGroup(req, res, next));
router.post('/:groupId/leave', (req, res, next) => studyGroupController.leaveGroup(req, res, next));
router.delete('/:groupId/members/:userId', (req, res, next) => studyGroupController.removeMember(req, res, next));

// Messages
router.get('/:groupId/messages', (req, res, next) => studyGroupController.getMessages(req, res, next));
router.post('/:groupId/messages', (req, res, next) => studyGroupController.sendMessage(req, res, next));

// Invitations
router.get('/:groupId/invitations', (req, res, next) => studyGroupController.getInvitations(req, res, next));
router.post('/:groupId/invitations', (req, res, next) => studyGroupController.createInvitation(req, res, next));
router.post('/invitations/:token/accept', (req, res, next) => studyGroupController.acceptInvitation(req, res, next));

export default router;
