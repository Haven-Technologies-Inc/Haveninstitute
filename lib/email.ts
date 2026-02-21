import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const APP_NAME = 'Haven Institute';
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://haveninstitute.com';
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@haveninstitute.com';

// Zeptomail SMTP transporter (lazy-initialized singleton)
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;

  const host = process.env.ZEPTOMAIL_HOST;
  const user = process.env.ZEPTOMAIL_USER;
  const pass = process.env.ZEPTOMAIL_PASSWORD;

  if (!host || !user || !pass) {
    console.warn('[Email] Zeptomail SMTP is not configured. Emails will be logged to console.');
    return null;
  }

  const port = parseInt(process.env.ZEPTOMAIL_PORT ?? '587', 10);

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return _transporter;
}

// ---------------------------------------------------------------------------
// Core email sender
// ---------------------------------------------------------------------------

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email] (dev) Would send to: ${to}`);
    console.log(`[Email] (dev) Subject: ${subject}`);
    console.log(`[Email] (dev) HTML length: ${html.length} chars`);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(`[Email] Sent to ${to}, messageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Shared HTML layout
// ---------------------------------------------------------------------------

function wrapInLayout(bodyContent: string, preheader: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME}</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  body { margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
  .wrapper { width: 100%; background-color: #f4f5f7; padding: 40px 0; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%); padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center; }
  .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
  .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0; }
  .body { background-color: #ffffff; padding: 40px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
  .body h2 { color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 16px; }
  .body p { color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 8px 0 16px; }
  .btn:hover { opacity: 0.9; }
  .info-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
  .warning-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  .footer { background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center; }
  .footer p { color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0 0 8px; }
  .footer a { color: #6366f1; text-decoration: none; }
  .preheader { display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .header, .body, .footer { padding-left: 24px !important; padding-right: 24px !important; }
  }
</style>
</head>
<body>
<div class="preheader">${preheader}</div>
<div class="wrapper">
<div class="container">
  <div class="header">
    <h1>${APP_NAME}</h1>
    <p>Your NCLEX Success Partner</p>
  </div>
  <div class="body">
    ${bodyContent}
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    <p>
      <a href="${APP_URL}/account/settings">Notification Settings</a> &middot;
      <a href="${APP_URL}/privacy">Privacy Policy</a> &middot;
      <a href="${APP_URL}/support">Support</a>
    </p>
    <p>You're receiving this because you have an account at ${APP_NAME}.</p>
  </div>
</div>
</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Verification email
// ---------------------------------------------------------------------------

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  const verificationUrl = `${APP_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const subject = `Verify your email address - ${APP_NAME}`;

  const html = wrapInLayout(
    `<h2>Verify Your Email Address</h2>
    <p>Hi there,</p>
    <p>Thanks for signing up for ${APP_NAME}! Please verify your email address to activate your account and start your NCLEX preparation journey.</p>
    <p>Click the button below to verify your email:</p>
    <p style="text-align:center;">
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    </p>
    <p style="font-size:13px; color:#9ca3af;">If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="font-size:13px; color:#6366f1; word-break:break-all;">${verificationUrl}</p>
    <hr class="divider" />
    <div class="info-box">
      <p style="color:#4b5563; font-size:13px; margin:0;">This verification link is valid for 24 hours. If you did not create an account with ${APP_NAME}, you can safely ignore this email.</p>
    </div>
    <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
    `Please verify your email address to get started with ${APP_NAME}.`
  );

  return sendEmail(email, subject, html);
}

// ---------------------------------------------------------------------------
// Password reset email
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;

  const subject = `Reset your password - ${APP_NAME}`;

  const html = wrapInLayout(
    `<h2>Reset Your Password</h2>
    <p>Hi there,</p>
    <p>We received a request to reset the password for your ${APP_NAME} account. Click the button below to create a new password:</p>
    <p style="text-align:center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>
    <p style="font-size:13px; color:#9ca3af;">If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="font-size:13px; color:#6366f1; word-break:break-all;">${resetUrl}</p>
    <hr class="divider" />
    <div class="warning-box">
      <p style="color:#dc2626; font-size:14px; margin:0;"><strong>This link will expire in 1 hour.</strong> If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
    <p style="color:#6b7280;">- The ${APP_NAME} Security Team</p>`,
    `Reset your ${APP_NAME} password. This link expires in 1 hour.`
  );

  return sendEmail(email, subject, html);
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const subject = `Welcome to ${APP_NAME}, ${name}!`;

  const html = wrapInLayout(
    `<h2>Welcome to ${APP_NAME}!</h2>
    <p>Hi ${name},</p>
    <p>We're thrilled to have you join our community of nursing students preparing for the NCLEX exam. You're taking an important step toward your nursing career!</p>
    <p>Here's what you can do to get started:</p>
    <ul style="color:#4b5563; font-size:15px; line-height:1.8;">
      <li>Take a practice quiz to see where you stand</li>
      <li>Set up your study plan and exam date</li>
      <li>Explore flashcard decks for quick review</li>
      <li>Join a study group to connect with peers</li>
    </ul>
    <p style="text-align:center;">
      <a href="${APP_URL}/dashboard" class="btn">Go to Dashboard</a>
    </p>
    <p>If you have any questions, our support team is here to help.</p>
    <p>Best of luck on your NCLEX journey!</p>
    <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
    `Welcome to ${APP_NAME}! Start your NCLEX prep journey today.`
  );

  return sendEmail(email, subject, html);
}
