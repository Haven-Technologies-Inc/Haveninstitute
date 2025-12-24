// SMTP Configuration Type
export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

// Email Types
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  from: EmailRecipient;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

// Zoho Mail SMTP Configuration
// Default configuration - can be updated via admin settings
let SMTP_CONFIG: SMTPConfig = {
  host: 'smtp.zeptomail.com',
  port: 465,
  secure: true, // Use SSL/TLS
  username: 'emailapikey',
  password: '',
  fromEmail: 'info@havenstudy.com',
  fromName: 'Haven Institute'
};

// Initialize SMTP config from localStorage on load
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('smtp_config');
  if (saved) {
    try {
      SMTP_CONFIG = JSON.parse(saved);
    } catch (error) {
      console.error('Failed to parse saved SMTP config:', error);
    }
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('haven_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// Update SMTP Configuration
export async function updateSMTPConfig(config: Partial<SMTPConfig>): Promise<{ success: boolean; message: string }> {
  SMTP_CONFIG = { ...SMTP_CONFIG, ...config };
  
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('smtp_config', JSON.stringify(SMTP_CONFIG));
  }

  // Try to save to backend
  try {
    const response = await fetch(`${API_BASE_URL}/admin/email/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config)
    });

    const data = await response.json();
    
    if (data.success) {
      return { success: true, message: data.data?.message || 'Configuration saved successfully' };
    } else {
      // Still saved locally, just couldn't sync to backend
      return { success: true, message: 'Configuration saved locally. Backend sync requires admin login.' };
    }
  } catch (error) {
    // Still saved locally
    return { success: true, message: 'Configuration saved locally.' };
  }
}

// Get current SMTP Configuration
export function getSMTPConfig(): SMTPConfig {
  return SMTP_CONFIG;
}

// Fetch SMTP config from backend
export async function fetchSMTPConfig(): Promise<SMTPConfig | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/email/config`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      SMTP_CONFIG = {
        ...SMTP_CONFIG,
        host: data.data.host,
        port: data.data.port,
        username: data.data.username,
        fromEmail: data.data.fromEmail,
        fromName: data.data.fromName
      };
      return SMTP_CONFIG;
    }
  } catch (error) {
    console.log('Could not fetch SMTP config from backend, using local config');
  }
  return SMTP_CONFIG;
}

// Test SMTP Connection - calls real backend API
export async function testSMTPConnection(config?: SMTPConfig): Promise<{
  success: boolean;
  message: string;
}> {
  const testConfig = config || SMTP_CONFIG;
  
  try {
    console.log('Testing SMTP connection:', {
      host: testConfig.host,
      port: testConfig.port,
      username: testConfig.username
    });

    // Call backend API to test connection
    const response = await fetch(`${API_BASE_URL}/admin/email/test-connection`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testConfig)
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: data.data?.message || 'Successfully connected to SMTP server'
      };
    } else {
      return {
        success: false,
        message: data.error?.message || 'Failed to connect. Please check your SMTP credentials.'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
}

// Email Templates
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to NurseHaven - Your Safe Haven for NCLEX Success!',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to NurseHaven!</h1>
          <p style="color: white; margin: 10px 0 0; font-size: 18px;">Your Safe Haven for NCLEX Success</p>
        </div>
        <div style="padding: 40px 20px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi {{name}},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We're thrilled to have you join our community of nursing students and NCLEX exam takers! 
            You've taken an important step toward achieving your nursing career goals.
          </p>
          <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 10px; color: #1f2937;">What's Next?</h3>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
              <li>Complete your profile setup</li>
              <li>Take your first practice quiz</li>
              <li>Explore our comprehensive study materials</li>
              <li>Join study groups and connect with peers</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Get Started Now
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Need help? Reply to this email or visit our <a href="{{supportUrl}}" style="color: #667eea;">Help Center</a>.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">© 2024 NurseHaven. All rights reserved.</p>
          <p style="margin: 10px 0 0;">
            <a href="{{unsubscribeUrl}}" style="color: #9ca3af;">Unsubscribe</a> | 
            <a href="{{privacyUrl}}" style="color: #9ca3af;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `,
    variables: ['name', 'dashboardUrl', 'supportUrl', 'unsubscribeUrl', 'privacyUrl']
  },
  
  subscriptionConfirmation: {
    id: 'subscriptionConfirmation',
    name: 'Subscription Confirmation',
    subject: 'Your {{planName}} Subscription is Active! 🎉',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Activated!</h1>
        </div>
        <div style="padding: 40px 20px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi {{name}},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for subscribing to the <strong>{{planName}}</strong> plan! Your subscription is now active.
          </p>
          <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #1f2937;">Subscription Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280;">Plan:</td>
                <td style="padding: 10px 0; color: #1f2937; font-weight: bold; text-align: right;">{{planName}}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280;">Amount:</td>
                <td style="padding: 10px 0; color: #1f2937; font-weight: bold; text-align: right;">{{currency}}{{amount}}/{{interval}}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280;">Next billing date:</td>
                <td style="padding: 10px 0; color: #1f2937; font-weight: bold; text-align: right;">{{nextBillingDate}}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{billingUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Billing Details
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">© 2024 NurseHaven. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'planName', 'amount', 'currency', 'interval', 'nextBillingDate', 'billingUrl']
  },
  
  paymentFailed: {
    id: 'paymentFailed',
    name: 'Payment Failed',
    subject: 'Action Required: Payment Failed for Your Subscription',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Payment Failed</h1>
        </div>
        <div style="padding: 40px 20px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi {{name}},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We were unable to process your payment for the {{planName}} subscription. 
            Please update your payment method to continue enjoying all the benefits.
          </p>
          <div style="margin: 30px 0; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #991b1b; font-weight: bold;">Your subscription will be canceled if payment is not received within 7 days.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{updatePaymentUrl}}" style="display: inline-block; padding: 15px 40px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Update Payment Method
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">© 2024 NurseHaven. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'planName', 'updatePaymentUrl']
  },
  
  passwordReset: {
    id: 'passwordReset',
    name: 'Password Reset',
    subject: 'Reset Your NurseHaven Password',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="padding: 40px 20px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Hi {{name}},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">© 2024 NurseHaven. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'resetUrl']
  },
  
  adminNotification: {
    id: 'adminNotification',
    name: 'Admin Notification',
    subject: 'NurseHaven Admin: {{subject}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; padding: 30px 20px;">
          <h2 style="color: white; margin: 0;">Admin Notification</h2>
        </div>
        <div style="padding: 30px 20px; background: #f9fafb;">
          <h3 style="color: #1f2937; margin-top: 0;">{{subject}}</h3>
          <div style="color: #374151; line-height: 1.6;">
            {{content}}
          </div>
          <div style="margin-top: 30px; padding: 15px; background: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>Time:</strong> {{timestamp}}
            </p>
          </div>
        </div>
      </div>
    `,
    variables: ['subject', 'content', 'timestamp']
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= EMAIL SENDING =============

export async function sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
  await delay(500); // Simulate API call
  
  try {
    console.log('Sending email via Zoho Mail:', {
      to: options.to,
      subject: options.subject,
      from: options.from
    });
    
    // In production, make actual API call to Zoho Mail
    // const response = await fetch(`${ZOHO_CONFIG.apiUrl}/accounts/${ZOHO_CONFIG.accountId}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${ZOHO_CONFIG.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     fromAddress: options.from.email,
    //     toAddress: options.to.map(r => r.email).join(','),
    //     ccAddress: options.cc?.map(r => r.email).join(','),
    //     bccAddress: options.bcc?.map(r => r.email).join(','),
    //     subject: options.subject,
    //     content: options.htmlBody || options.textBody,
    //     mailFormat: options.htmlBody ? 'html' : 'plaintext'
    //   })
    // });
    
    // Simulate successful send (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Failed to send email'
      };
    }
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendTemplateEmail(
  templateId: string,
  to: EmailRecipient[],
  variables: Record<string, string>
): Promise<EmailResponse> {
  const template = EMAIL_TEMPLATES[templateId];
  
  if (!template) {
    return {
      success: false,
      error: `Template '${templateId}' not found`
    };
  }
  
  // Replace variables in subject and body
  let subject = template.subject;
  let body = template.body;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    body = body.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return sendEmail({
    from: {
      email: SMTP_CONFIG.fromEmail,
      name: SMTP_CONFIG.fromName
    },
    to,
    subject,
    htmlBody: body
  });
}

// ============= BULK EMAIL =============

export async function sendBulkEmail(
  to: EmailRecipient[],
  subject: string,
  htmlBody: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  await delay(1000);
  
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  };
  
  // Send to recipients in batches
  const batchSize = 50;
  for (let i = 0; i < to.length; i += batchSize) {
    const batch = to.slice(i, i + batchSize);
    
    const response = await sendEmail({
      from: {
        email: SMTP_CONFIG.fromEmail,
        name: SMTP_CONFIG.fromName
      },
      to: batch,
      subject,
      htmlBody
    });
    
    if (response.success) {
      results.sent += batch.length;
    } else {
      results.failed += batch.length;
      results.errors.push(response.error || 'Unknown error');
    }
  }
  
  return results;
}

// ============= AUTOMATED EMAILS =============

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<EmailResponse> {
  return sendTemplateEmail('welcome', [{ email: userEmail, name: userName }], {
    name: userName,
    dashboardUrl: 'https://nursehaven.com/dashboard',
    supportUrl: 'https://nursehaven.com/support',
    unsubscribeUrl: 'https://nursehaven.com/unsubscribe',
    privacyUrl: 'https://nursehaven.com/privacy'
  });
}

export async function sendSubscriptionConfirmationEmail(
  userEmail: string,
  userName: string,
  planName: string,
  amount: number,
  interval: string,
  nextBillingDate: string
): Promise<EmailResponse> {
  return sendTemplateEmail('subscriptionConfirmation', [{ email: userEmail, name: userName }], {
    name: userName,
    planName,
    amount: amount.toFixed(2),
    currency: '$',
    interval,
    nextBillingDate,
    billingUrl: 'https://nursehaven.com/billing'
  });
}

export async function sendPaymentFailedEmail(
  userEmail: string,
  userName: string,
  planName: string
): Promise<EmailResponse> {
  return sendTemplateEmail('paymentFailed', [{ email: userEmail, name: userName }], {
    name: userName,
    planName,
    updatePaymentUrl: 'https://nursehaven.com/billing/payment-methods'
  });
}

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string
): Promise<EmailResponse> {
  return sendTemplateEmail('passwordReset', [{ email: userEmail, name: userName }], {
    name: userName,
    resetUrl: `https://nursehaven.com/reset-password?token=${resetToken}`
  });
}

export async function sendAdminNotificationEmail(
  subject: string,
  content: string,
  adminEmails: string[]
): Promise<EmailResponse> {
  return sendTemplateEmail(
    'adminNotification',
    adminEmails.map(email => ({ email })),
    {
      subject,
      content,
      timestamp: new Date().toLocaleString()
    }
  );
}

// ============= EMAIL STATS =============

export async function getEmailStats(
  dateFrom?: string,
  dateTo?: string
): Promise<EmailStats> {
  await delay(300);
  
  // In production, fetch real stats from Zoho Mail API
  return {
    sent: 1250,
    delivered: 1230,
    opened: 890,
    clicked: 445,
    bounced: 15,
    failed: 5
  };
}

// ============= EMAIL VERIFICATION =============

export async function verifyEmailAddress(email: string): Promise<{
  valid: boolean;
  exists: boolean;
  disposable: boolean;
}> {
  await delay(200);
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(email);
  
  // Simulate email verification
  return {
    valid,
    exists: valid && Math.random() > 0.1,
    disposable: false
  };
}