import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { notificationService } from '../services/notification.service';
import { ResponseHandler } from '../utils/response';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { type, isRead, page = '1', limit = '20' } = req.query;

    const result = await notificationService.getUserNotifications(
      userId,
      {
        type: type as any,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      },
      parseInt(page as string),
      parseInt(limit as string)
    );

    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get('/unread-count', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const count = await notificationService.getUnreadCount(userId);
    ResponseHandler.success(res, { count });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const success = await notificationService.markAsRead(id, userId);
    if (!success) {
      ResponseHandler.error(res, 'NOT_FOUND', 'Notification not found', 404);
      return;
    }

    ResponseHandler.success(res, { message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const count = await notificationService.markAllAsRead(userId);
    ResponseHandler.success(res, { message: `${count} notifications marked as read` });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const success = await notificationService.deleteNotification(id, userId);
    if (!success) {
      ResponseHandler.error(res, 'NOT_FOUND', 'Notification not found', 404);
      return;
    }

    ResponseHandler.success(res, { message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
