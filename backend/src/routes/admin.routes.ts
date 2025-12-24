import { Router, Request, Response } from 'express';
import { authenticate, authorizeRole } from '../middleware/authenticate';
import { ResponseHandler } from '../utils/response';
import emailService from '../services/email.service';
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
router.get('/email/config', authenticate, authorizeRole(['admin']), async (req: Request, res: Response) => {
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

export default router;
