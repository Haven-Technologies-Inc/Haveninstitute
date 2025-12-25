import { Router, Request, Response } from 'express';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/authenticate';
import { ResponseHandler } from '../utils/response';
import emailService from '../services/email.service';
import { adminService } from '../services/admin.service';
import { revenueService } from '../services/revenue.service';
import { logger } from '../utils/logger';

const router = Router();

// Test SMTP Connection with provided config
router.post('/email/test-connection', authenticate, authorizeRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { host, port, username, password, secure } = req.body;
    
    // If config provided, test with that config
    if (host && username && password) {
      const nodemailer = require('nodemailer');
      const testTransporter = nodemailer.createTransport({
        host: host,
        port: port || 465,
        secure: secure !== false,
        auth: {
          user: username,
          pass: password
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000
      });

      await testTransporter.verify();
      logger.info('SMTP connection test successful with provided config');
      
      return ResponseHandler.success(res, {
        success: true,
        message: 'Successfully connected to SMTP server'
      });
    }
    
    // Otherwise use default email service
    const isConnected = await emailService.verifyConnection();
    
    if (isConnected) {
      ResponseHandler.success(res, {
        success: true,
        message: 'Successfully connected to SMTP server'
      });
    } else {
      ResponseHandler.error(res, 'EMAIL_CONNECTION_FAILED', 'Failed to connect to SMTP server', 500);
    }
  } catch (error: any) {
    logger.error('SMTP connection test failed:', error);
    ResponseHandler.error(res, 'EMAIL_CONNECTION_FAILED', error.message || 'Connection test failed', 500);
  }
});

// Send Test Email
router.post('/email/send-test', authenticate, authorizeRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return ResponseHandler.error(res, 'VAL_MISSING_FIELD', 'Recipient email is required', 400);
    }

    const success = await emailService.sendEmail({
      to,
      subject: 'Test Email from Haven Institute',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Haven Institute</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937;">Test Email Successful!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              This is a test email from Haven Institute. If you received this, your SMTP configuration is working correctly.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Sent at: ${new Date().toISOString()}
            </p>
          </div>
        </div>
      `
    });

    if (success) {
      ResponseHandler.success(res, {
        success: true,
        message: `Test email sent to ${to}`
      });
    } else {
      ResponseHandler.error(res, 'EMAIL_SEND_FAILED', 'Failed to send test email', 500);
    }
  } catch (error: any) {
    logger.error('Test email send failed:', error);
    ResponseHandler.error(res, 'EMAIL_SEND_FAILED', error.message || 'Failed to send test email', 500);
  }
});

// Save SMTP Configuration (stores in environment - for admin UI only)
router.post('/email/config', authenticate, authorizeRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { host, port, username, fromEmail, fromName } = req.body;
    
    // Note: In production, this should update environment variables or a secure config store
    // For now, we just validate and return success
    // The actual config is managed via .env file
    
    if (!host || !port || !username || !fromEmail) {
      return ResponseHandler.error(res, 'VAL_MISSING_FIELD', 'Missing required SMTP configuration fields', 400);
    }

    logger.info('SMTP config update requested (config managed via .env file)', {
      host,
      port,
      username,
      fromEmail,
      fromName
    });

    ResponseHandler.success(res, {
      success: true,
      message: 'SMTP configuration validated. Update .env file to apply changes.',
      config: {
        host,
        port,
        username,
        fromEmail,
        fromName
      }
    });
  } catch (error: any) {
    logger.error('SMTP config update failed:', error);
    ResponseHandler.error(res, 'CONFIG_UPDATE_FAILED', error.message || 'Failed to update configuration', 500);
  }
});

// Get current SMTP configuration (without password)
router.get('/email/config', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    ResponseHandler.success(res, {
      host: process.env.ZOHO_SMTP_HOST || 'smtp.zeptomail.com',
      port: Number(process.env.ZOHO_SMTP_PORT) || 465,
      username: process.env.ZOHO_SMTP_USER || 'emailapikey',
      fromEmail: process.env.ZOHO_FROM_EMAIL || 'info@havenstudy.com',
      fromName: process.env.ZOHO_FROM_NAME || 'Haven Institute',
      enabled: process.env.ENABLE_EMAIL === 'true'
    });
  } catch (error: any) {
    logger.error('Failed to get SMTP config:', error);
    ResponseHandler.error(res, 'CONFIG_FETCH_FAILED', error.message || 'Failed to get configuration', 500);
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with filtering and pagination
router.get('/users', authenticate, authorizeRole(['admin', 'moderator']), async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, subscriptionTier, isActive, emailVerified, page = '1', limit = '20' } = req.query;

    const result = await adminService.getUsers(
      {
        search: search as string,
        role: role as string,
        subscriptionTier: subscriptionTier as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        emailVerified: emailVerified === 'true' ? true : emailVerified === 'false' ? false : undefined
      },
      parseInt(page as string),
      parseInt(limit as string)
    );

    ResponseHandler.success(res, result);
  } catch (error: any) {
    logger.error('Failed to get users:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch users', 500);
  }
});

// Get user statistics
router.get('/users/stats', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await adminService.getUserStats();
    ResponseHandler.success(res, stats);
  } catch (error: any) {
    logger.error('Failed to get user stats:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch stats', 500);
  }
});

// Get single user
router.get('/users/:id', authenticate, authorizeRole(['admin', 'moderator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);

    if (!user) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'User not found', 404);
    }

    ResponseHandler.success(res, user);
  } catch (error: any) {
    logger.error('Failed to get user:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch user', 500);
  }
});

// Create new user
router.post('/users', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { email, fullName, role, password, sendInvite, subscriptionTier } = req.body;

    if (!email || !fullName) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Email and full name are required', 400);
    }

    const result = await adminService.createUser({
      email,
      fullName,
      role: role || 'student',
      password,
      sendInvite: sendInvite !== false,
      subscriptionTier
    });

    ResponseHandler.success(res, {
      user: result.user,
      tempPassword: result.tempPassword,
      message: result.tempPassword 
        ? 'User created successfully. Invite email sent.' 
        : 'User created with provided password.'
    }, 201);
  } catch (error: any) {
    logger.error('Failed to create user:', error);
    ResponseHandler.error(res, 'CREATE_ERROR', error.message || 'Failed to create user', 400);
  }
});

// Update user
router.put('/users/:id', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, fullName, role, subscriptionTier, isActive, emailVerified } = req.body;

    const user = await adminService.updateUser(id, {
      email,
      fullName,
      role,
      subscriptionTier,
      isActive,
      emailVerified
    });

    ResponseHandler.success(res, { user, message: 'User updated successfully' });
  } catch (error: any) {
    logger.error('Failed to update user:', error);
    ResponseHandler.error(res, 'UPDATE_ERROR', error.message || 'Failed to update user', 400);
  }
});

// Delete user
router.delete('/users/:id', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.userId) {
      return ResponseHandler.error(res, 'FORBIDDEN', 'Cannot delete your own account', 403);
    }

    await adminService.deleteUser(id);
    ResponseHandler.success(res, { message: 'User deleted successfully' });
  } catch (error: any) {
    logger.error('Failed to delete user:', error);
    ResponseHandler.error(res, 'DELETE_ERROR', error.message || 'Failed to delete user', 400);
  }
});

// Reset user password
router.post('/users/:id/reset-password', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sendEmail = true } = req.body;

    const newPassword = await adminService.resetUserPassword(id, sendEmail);

    ResponseHandler.success(res, {
      message: sendEmail ? 'Password reset and email sent' : 'Password reset successfully',
      tempPassword: newPassword
    });
  } catch (error: any) {
    logger.error('Failed to reset password:', error);
    ResponseHandler.error(res, 'RESET_ERROR', error.message || 'Failed to reset password', 400);
  }
});

// Toggle user active status
router.post('/users/:id/toggle-status', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent self-deactivation
    if (id === req.userId) {
      return ResponseHandler.error(res, 'FORBIDDEN', 'Cannot change your own status', 403);
    }

    const user = await adminService.toggleUserStatus(id);
    ResponseHandler.success(res, {
      user,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error: any) {
    logger.error('Failed to toggle user status:', error);
    ResponseHandler.error(res, 'UPDATE_ERROR', error.message || 'Failed to update status', 400);
  }
});

// Resend invite email
router.post('/users/:id/resend-invite', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.resendInvite(id);
    ResponseHandler.success(res, { message: 'Invite email resent successfully' });
  } catch (error: any) {
    logger.error('Failed to resend invite:', error);
    ResponseHandler.error(res, 'EMAIL_ERROR', error.message || 'Failed to resend invite', 400);
  }
});

// ==================== REVENUE & BILLING ====================

// Get revenue metrics
router.get('/revenue/metrics', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await revenueService.getRevenueMetrics();
    ResponseHandler.success(res, metrics);
  } catch (error: any) {
    logger.error('Failed to get revenue metrics:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch metrics', 500);
  }
});

// Get subscription metrics
router.get('/revenue/subscriptions', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await revenueService.getSubscriptionMetrics();
    ResponseHandler.success(res, metrics);
  } catch (error: any) {
    logger.error('Failed to get subscription metrics:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch metrics', 500);
  }
});

// Get customer metrics
router.get('/revenue/customers', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await revenueService.getCustomerMetrics();
    ResponseHandler.success(res, metrics);
  } catch (error: any) {
    logger.error('Failed to get customer metrics:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch metrics', 500);
  }
});

// Get revenue chart data
router.get('/revenue/chart', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const chartData = await revenueService.getRevenueChartData(period as any);
    ResponseHandler.success(res, chartData);
  } catch (error: any) {
    logger.error('Failed to get chart data:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch chart data', 500);
  }
});

// Get revenue forecast
router.get('/revenue/forecast', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { months = '6' } = req.query;
    const forecast = await revenueService.getRevenueForecast(parseInt(months as string));
    ResponseHandler.success(res, forecast);
  } catch (error: any) {
    logger.error('Failed to get forecast:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch forecast', 500);
  }
});

// Get all transactions
router.get('/revenue/transactions', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, status, type, dateFrom, dateTo, userId, minAmount, maxAmount, subscriptionPlan } = req.query;
    
    const transactions = await revenueService.getTransactions({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
      type: type as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      userId: userId as string,
      minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
      subscriptionPlan: subscriptionPlan as string
    });
    
    ResponseHandler.success(res, transactions);
  } catch (error: any) {
    logger.error('Failed to get transactions:', error);
    ResponseHandler.error(res, 'FETCH_ERROR', error.message || 'Failed to fetch transactions', 500);
  }
});

// Process refund
router.post('/revenue/refund', authenticate, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId, amount, reason } = req.body;
    
    if (!transactionId || !amount) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Transaction ID and amount are required', 400);
    }
    
    await revenueService.processRefund(transactionId, amount, reason || 'Admin initiated refund');
    ResponseHandler.success(res, { message: 'Refund processed successfully' });
  } catch (error: any) {
    logger.error('Failed to process refund:', error);
    ResponseHandler.error(res, 'REFUND_ERROR', error.message || 'Failed to process refund', 400);
  }
});

export default router;
