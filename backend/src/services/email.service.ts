import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isEnabled: boolean;
  private fromEmail: string;
  private fromName: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.isEnabled = process.env.ENABLE_EMAIL === 'true';
    this.fromEmail = process.env.ZOHO_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'info@havenstudy.com';
    this.fromName = process.env.ZOHO_FROM_NAME || process.env.SMTP_FROM_NAME || 'Haven Institute';
    
    if (this.isEnabled) {
      this.initializeTransporter();
    } else {
      logger.info('Email service disabled (ENABLE_EMAIL=false)');
    }
  }

  private initializeTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'zeptomail';

    if (emailProvider === 'zeptomail' || emailProvider === 'zoho') {
      // ZeptoMail (Zoho Transactional Email) SMTP Configuration
      // Production settings for smtp.zeptomail.com
      this.transporter = nodemailer.createTransport({
        host: process.env.ZOHO_SMTP_HOST || 'smtp.zeptomail.com',
        port: Number(process.env.ZOHO_SMTP_PORT) || 465,
        secure: true, // SSL/TLS required on port 465
        auth: {
          user: process.env.ZOHO_SMTP_USER || 'emailapikey',
          pass: process.env.ZOHO_SMTP_PASSWORD || ''
        },
        tls: {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2'
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 30000 // 30 seconds for sending
      });

      logger.info(`Email service initialized with ZeptoMail (${process.env.ZOHO_SMTP_HOST || 'smtp.zeptomail.com'}:${process.env.ZOHO_SMTP_PORT || 465})`);
    } else {
      // Generic SMTP Configuration (fallback)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || ''
        },
        tls: {
          rejectUnauthorized: true
        }
      });
      
      logger.info('Email service initialized with generic SMTP');
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email transporter not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('✅ Email service connection verified successfully');
      return true;
    } catch (error: any) {
      logger.error('❌ Email service connection failed:', error.message);
      return false;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled || !this.transporter) {
      logger.info(`[DEV MODE] Email would be sent to ${options.to}: ${options.subject}`);
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Email content preview: ${options.text?.substring(0, 200) || 'HTML email'}`);
      }
      return true; // Return success in dev mode
    }

    // Production: Send with retry logic
    return this.sendWithRetry(options);
  }

  private async sendWithRetry(options: EmailOptions): Promise<boolean> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const info = await this.transporter!.sendMail({
          from: `"${this.fromName}" <${this.fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || this.htmlToPlainText(options.html)
        });

        logger.info(`✅ Email sent successfully to ${options.to} (messageId: ${info.messageId})`);
        return true;
      } catch (error: any) {
        lastError = error;
        logger.warn(`Email send attempt ${attempt}/${this.retryAttempts} failed: ${error.message}`);

        // Don't retry on permanent failures
        if (this.isPermanentFailure(error)) {
          logger.error(`❌ Permanent email failure, not retrying: ${error.message}`);
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.retryAttempts) {
          const waitTime = this.retryDelay * Math.pow(2, attempt - 1);
          logger.info(`Waiting ${waitTime}ms before retry...`);
          await this.delay(waitTime);
        }
      }
    }

    logger.error(`❌ Failed to send email after ${this.retryAttempts} attempts:`, lastError?.message);
    return false;
  }

  private isPermanentFailure(error: any): boolean {
    // List of error codes that indicate permanent failures (no point retrying)
    const permanentCodes = [
      'EAUTH',           // Authentication failed
      'EENVELOPE',       // Invalid envelope (bad addresses)
      'EMESSAGE',        // Invalid message
      '550',             // Mailbox not found
      '551',             // User not local
      '552',             // Message too large
      '553',             // Mailbox name not allowed
      '554'              // Transaction failed
    ];

    const errorCode = error.code || error.responseCode?.toString() || '';
    return permanentCodes.some(code => errorCode.includes(code));
  }

  private htmlToPlainText(html: string): string {
    // Simple HTML to text conversion for plain text fallback
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async sendVerificationEmail(email: string, token: string, fullName: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Haven Institute!</h1>
          </div>
          <div class="content">
            <p>Hello ${fullName},</p>
            <p>Thank you for registering with Haven Institute. Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Haven Institute. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your Haven Institute account',
      html,
      text: `Hello ${fullName}, Please verify your email by visiting: ${verificationUrl}`
    });
  }

  async sendPasswordResetEmail(email: string, token: string, fullName: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${fullName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you're concerned.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Haven Institute. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your Haven Institute password',
      html,
      text: `Hello ${fullName}, Reset your password by visiting: ${resetUrl}. This link expires in 1 hour.`
    });
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { display: flex; align-items: center; margin: 15px 0; }
          .feature-icon { font-size: 24px; margin-right: 15px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Haven Institute!</h1>
          </div>
          <div class="content">
            <p>Hello ${fullName},</p>
            <p>Your email has been verified and your account is now active! We're excited to have you join our community of nursing students preparing for the NCLEX.</p>
            
            <h3>Here's what you can do now:</h3>
            <div class="feature">
              <span class="feature-icon">📚</span>
              <span>Access our comprehensive question bank</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🧠</span>
              <span>Take adaptive CAT tests that simulate the real NCLEX</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Track your progress with detailed analytics</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🤖</span>
              <span>Get AI-powered study recommendations</span>
            </div>
            
            <p style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Haven Institute. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Haven Institute - Your account is ready!',
      html,
      text: `Welcome ${fullName}! Your Haven Institute account is now active. Start your NCLEX prep journey at ${dashboardUrl}`
    });
  }
}

export default new EmailService();
