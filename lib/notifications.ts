import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const APP_NAME = 'Haven Institute';
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://haveninstitute.com';

// Twilio
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? '';

// Zeptomail SMTP
const emailTransporter =
  process.env.ZEPTOMAIL_HOST && process.env.ZEPTOMAIL_USER
    ? nodemailer.createTransport({
        host: process.env.ZEPTOMAIL_HOST,
        port: parseInt(process.env.ZEPTOMAIL_PORT ?? '587', 10),
        secure: parseInt(process.env.ZEPTOMAIL_PORT ?? '587', 10) === 465,
        auth: {
          user: process.env.ZEPTOMAIL_USER,
          pass: process.env.ZEPTOMAIL_PASSWORD,
        },
      })
    : null;

const EMAIL_FROM = process.env.EMAIL_FROM ?? `noreply@haveninstitute.com`;

// ---------------------------------------------------------------------------
// Main notification dispatcher
// ---------------------------------------------------------------------------

export async function sendNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  sendEmail?: boolean;
  sendSms?: boolean;
}): Promise<void> {
  const { userId, type, title, message, actionUrl, sendEmail, sendSms } =
    params;

  // 1. Create in-app notification in the database
  await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      notificationType: type,
      actionUrl,
      isEmailSent: false,
      isPushSent: false,
    },
  });

  // 2. Fetch user settings to check notification preferences
  const userWithSettings = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      fullName: true,
      phoneNumber: true,
      userSettings: {
        select: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
          achievementAlerts: true,
          weeklyDigest: true,
          communityUpdates: true,
        },
      },
    },
  });

  if (!userWithSettings) return;

  const settings = userWithSettings.userSettings;

  // 3. Send email if requested and user has email notifications enabled
  if (sendEmail && settings?.emailNotifications) {
    const template = renderEmailTemplate(type, {
      userName: userWithSettings.fullName,
      message,
      actionUrl: actionUrl ?? '',
    });

    await dispatchEmail({
      to: userWithSettings.email,
      subject: template.subject || title,
      html: template.html,
    });
  }

  // 4. Send SMS if requested and user has SMS notifications enabled
  if (sendSms && settings?.smsNotifications && userWithSettings.phoneNumber) {
    const smsTemplate = SMS_TEMPLATES[type];
    const smsBody = smsTemplate
      ? smsTemplate({ userName: userWithSettings.fullName, message, title })
      : `${APP_NAME}: ${title} - ${message}`;

    await dispatchSms({
      to: userWithSettings.phoneNumber,
      body: smsBody,
    });
  }
}

// ---------------------------------------------------------------------------
// Email dispatch via Zeptomail SMTP
// ---------------------------------------------------------------------------

async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (emailTransporter) {
    try {
      await emailTransporter.sendMail({
        from: `"${APP_NAME}" <${EMAIL_FROM}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      console.log(`[Email] Sent to ${params.to}: ${params.subject}`);
    } catch (error) {
      console.error('[Email] Failed to dispatch email:', error);
    }
  } else {
    console.log('[Email] Transporter not configured. Would send to:', params.to);
    console.log('[Email] Subject:', params.subject);
  }
}

// ---------------------------------------------------------------------------
// SMS dispatch via Twilio
// ---------------------------------------------------------------------------

async function dispatchSms(params: {
  to: string;
  body: string;
}): Promise<void> {
  if (twilioClient && TWILIO_PHONE_NUMBER) {
    try {
      const result = await twilioClient.messages.create({
        body: params.body,
        from: TWILIO_PHONE_NUMBER,
        to: params.to,
      });
      console.log(`[SMS] Sent to ${params.to}, SID: ${result.sid}`);
    } catch (error) {
      console.error('[SMS] Failed to dispatch SMS:', error);
    }
  } else {
    console.log('[SMS] Twilio not configured. Would send to:', params.to);
    console.log('[SMS] Body:', params.body);
  }
}

// ---------------------------------------------------------------------------
// Email template renderer
// ---------------------------------------------------------------------------

export function renderEmailTemplate(
  templateSlug: string,
  variables: Record<string, string>
): { subject: string; html: string; text: string } {
  const template = EMAIL_TEMPLATES[templateSlug];
  if (!template) {
    return {
      subject: 'Notification from Haven Institute',
      html: wrapInLayout(
        `<p>You have a new notification.</p>`,
        variables.userName ?? 'Student'
      ),
      text: 'You have a new notification from Haven Institute.',
    };
  }

  return template(variables);
}

// ---------------------------------------------------------------------------
// Shared email layout wrapper
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
  .stat-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
  .stat-box .label { color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
  .stat-box .value { color: #111827; font-size: 24px; font-weight: 700; margin: 4px 0 0; }
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
// SMS Templates
// ---------------------------------------------------------------------------

type SmsTemplateFunction = (vars: Record<string, string>) => string;

const SMS_TEMPLATES: Record<string, SmsTemplateFunction> = {
  sms_verification: (vars) =>
    `${APP_NAME}: Your verification code is ${vars.code ?? '------'}. This code expires in 10 minutes. Do not share this code with anyone.`,

  sms_welcome: (vars) =>
    `Welcome to ${APP_NAME}, ${vars.userName ?? 'there'}! Your NCLEX prep journey starts now. Log in at ${APP_URL}/dashboard to get started.`,

  login_alert: (vars) =>
    `${APP_NAME} Security: New login detected on your account${vars.device ? ` from ${vars.device}` : ''}${vars.location ? ` in ${vars.location}` : ''}. If this wasn't you, secure your account immediately at ${APP_URL}/account/settings.`,

  study_reminder: (vars) =>
    `${APP_NAME}: Hey ${vars.userName ?? 'there'}! Don't forget to study today. ${vars.currentStreak ? `Your streak: ${vars.currentStreak} days. ` : ''}Keep it going at ${APP_URL}/dashboard`,

  achievement_unlocked: (vars) =>
    `${APP_NAME}: Achievement unlocked - ${vars.achievementName ?? 'New Badge'}! ${vars.xpReward ? `+${vars.xpReward} XP ` : ''}View your achievements at ${APP_URL}/achievements`,

  streak_milestone: (vars) =>
    `${APP_NAME}: Incredible! You've hit a ${vars.streakDays ?? '7'}-day study streak! ${vars.xpBonus ? `Bonus: +${vars.xpBonus} XP ` : ''}Keep it up!`,
};

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

type TemplateFunction = (
  vars: Record<string, string>
) => { subject: string; html: string; text: string };

const EMAIL_TEMPLATES: Record<string, TemplateFunction> = {
  // 1. Welcome
  welcome: (vars) => ({
    subject: `Welcome to ${APP_NAME}, ${vars.userName ?? 'there'}!`,
    html: wrapInLayout(
      `<h2>Welcome to ${APP_NAME}!</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
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
    ),
    text: `Welcome to ${APP_NAME}, ${vars.userName ?? 'there'}!\n\nWe're thrilled to have you join our community. Get started by taking a practice quiz, setting up your study plan, and exploring flashcard decks.\n\nVisit your dashboard: ${APP_URL}/dashboard\n\nBest of luck on your NCLEX journey!\n- The ${APP_NAME} Team`,
  }),

  // 2. Subscription Activated
  subscription_activated: (vars) => ({
    subject: `Your ${vars.planName ?? 'subscription'} is now active!`,
    html: wrapInLayout(
      `<h2>Subscription Activated!</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>Great news! Your <strong>${vars.planName ?? 'subscription'}</strong> plan is now active. You now have access to all the premium features included in your plan.</p>
      <div class="stat-box">
        <p class="label">Your Plan</p>
        <p class="value">${vars.planName ?? 'Premium'}</p>
      </div>
      ${vars.billingPeriod ? `<p><strong>Billing:</strong> ${vars.billingPeriod === 'year' ? 'Yearly' : 'Monthly'}</p>` : ''}
      ${vars.amount ? `<p><strong>Amount:</strong> $${vars.amount}/${vars.billingPeriod === 'year' ? 'year' : 'month'}</p>` : ''}
      <p>Here's what's now unlocked for you:</p>
      <ul style="color:#4b5563; font-size:15px; line-height:1.8;">
        <li>Unlimited practice questions</li>
        <li>CAT simulation exams</li>
        <li>Advanced analytics and insights</li>
        <li>Custom study plans</li>
      </ul>
      <p style="text-align:center;">
        <a href="${APP_URL}/dashboard" class="btn">Start Studying</a>
      </p>
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Your ${vars.planName ?? 'subscription'} plan is now active!`
    ),
    text: `Your ${vars.planName ?? 'subscription'} is now active!\n\nHi ${vars.userName ?? 'there'},\n\nYour ${vars.planName ?? 'subscription'} plan is now active. You have access to all premium features.\n\nStart studying: ${APP_URL}/dashboard\n\n- The ${APP_NAME} Team`,
  }),

  // 3. Subscription Canceled
  subscription_canceled: (vars) => ({
    subject: `Your ${APP_NAME} subscription has been canceled`,
    html: wrapInLayout(
      `<h2>Subscription Canceled</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>We've processed your subscription cancellation. Your ${vars.planName ?? 'premium'} features will remain active until <strong>${vars.endDate ?? 'the end of your billing period'}</strong>.</p>
      <hr class="divider" />
      <p>We're sorry to see you go. If you changed your mind or if there's anything we could improve, we'd love to hear from you.</p>
      <p style="text-align:center;">
        <a href="${APP_URL}/account/subscription" class="btn">Resubscribe</a>
      </p>
      <p>You can continue using the free tier after your current period ends. Your progress and data will be preserved.</p>
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Your subscription has been canceled.`
    ),
    text: `Subscription Canceled\n\nHi ${vars.userName ?? 'there'},\n\nYour subscription has been canceled. Your premium features remain active until ${vars.endDate ?? 'the end of your billing period'}.\n\nResubscribe: ${APP_URL}/account/subscription\n\n- The ${APP_NAME} Team`,
  }),

  // 4. Payment Received
  payment_received: (vars) => ({
    subject: `Payment receipt from ${APP_NAME}`,
    html: wrapInLayout(
      `<h2>Payment Received</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>We've received your payment. Here are the details:</p>
      <div class="stat-box">
        <p class="label">Amount Paid</p>
        <p class="value">$${vars.amount ?? '0.00'}</p>
      </div>
      <table style="width:100%; font-size:14px; color:#4b5563; margin:16px 0;">
        <tr><td style="padding:8px 0;"><strong>Plan:</strong></td><td style="padding:8px 0; text-align:right;">${vars.planName ?? 'N/A'}</td></tr>
        <tr><td style="padding:8px 0;"><strong>Date:</strong></td><td style="padding:8px 0; text-align:right;">${vars.date ?? new Date().toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px 0;"><strong>Invoice ID:</strong></td><td style="padding:8px 0; text-align:right;">${vars.invoiceId ?? 'N/A'}</td></tr>
      </table>
      ${vars.receiptUrl ? `<p style="text-align:center;"><a href="${vars.receiptUrl}" class="btn">View Receipt</a></p>` : ''}
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Payment receipt for $${vars.amount ?? '0.00'}`
    ),
    text: `Payment Received\n\nHi ${vars.userName ?? 'there'},\n\nAmount: $${vars.amount ?? '0.00'}\nPlan: ${vars.planName ?? 'N/A'}\nDate: ${vars.date ?? new Date().toLocaleDateString()}\nInvoice: ${vars.invoiceId ?? 'N/A'}\n\n- The ${APP_NAME} Team`,
  }),

  // 5. Payment Failed
  payment_failed: (vars) => ({
    subject: `Action required: Payment failed for your ${APP_NAME} subscription`,
    html: wrapInLayout(
      `<h2 style="color:#dc2626;">Payment Failed</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>We were unable to process your payment for your <strong>${vars.planName ?? 'subscription'}</strong> plan. This may be due to an expired card, insufficient funds, or a temporary issue with your payment method.</p>
      ${vars.failureReason ? `<div class="stat-box"><p class="label">Reason</p><p style="color:#dc2626; font-weight:600; margin:4px 0 0;">${vars.failureReason}</p></div>` : ''}
      <p><strong>What happens next:</strong></p>
      <ul style="color:#4b5563; font-size:15px; line-height:1.8;">
        <li>We'll automatically retry the payment in a few days</li>
        <li>If the issue persists, your subscription may be paused</li>
        <li>Update your payment method to avoid service interruption</li>
      </ul>
      <p style="text-align:center;">
        <a href="${APP_URL}/account/subscription" class="btn" style="background:linear-gradient(135deg, #dc2626, #ef4444);">Update Payment Method</a>
      </p>
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Payment failed - please update your payment method.`
    ),
    text: `Payment Failed\n\nHi ${vars.userName ?? 'there'},\n\nWe were unable to process your payment for your ${vars.planName ?? 'subscription'} plan.${vars.failureReason ? `\nReason: ${vars.failureReason}` : ''}\n\nPlease update your payment method: ${APP_URL}/account/subscription\n\n- The ${APP_NAME} Team`,
  }),

  // 6. Study Reminder
  study_reminder: (vars) => ({
    subject: `Time to study, ${vars.userName ?? 'there'}! Keep your streak alive`,
    html: wrapInLayout(
      `<h2>Daily Study Reminder</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>Don't forget to study today! Consistency is key to NCLEX success.</p>
      ${vars.currentStreak ? `
      <div class="stat-box" style="text-align:center;">
        <p class="label">Current Streak</p>
        <p class="value">${vars.currentStreak} day${parseInt(vars.currentStreak) !== 1 ? 's' : ''}</p>
      </div>` : ''}
      ${vars.dailyGoal ? `<p>Your daily goal: <strong>${vars.dailyGoal} questions</strong></p>` : ''}
      ${vars.questionsToday ? `<p>Questions completed today: <strong>${vars.questionsToday}</strong></p>` : ''}
      <p style="text-align:center;">
        <a href="${APP_URL}/dashboard" class="btn">Start Studying</a>
      </p>
      <p style="font-size:13px; color:#9ca3af;">Tip: Even 15 minutes of practice each day can make a big difference!</p>
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Keep your study streak going! Log in to practice today.`
    ),
    text: `Daily Study Reminder\n\nHi ${vars.userName ?? 'there'},\n\nDon't forget to study today!${vars.currentStreak ? ` Current streak: ${vars.currentStreak} days.` : ''}\n\nStart studying: ${APP_URL}/dashboard\n\n- The ${APP_NAME} Team`,
  }),

  // 7. Weekly Digest
  weekly_digest: (vars) => ({
    subject: `Your weekly progress report from ${APP_NAME}`,
    html: wrapInLayout(
      `<h2>Weekly Progress Report</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>Here's your study summary for the past week:</p>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin:16px 0;">
        <div class="stat-box" style="flex:1; min-width:120px; text-align:center;">
          <p class="label">Questions</p>
          <p class="value">${vars.questionsAnswered ?? '0'}</p>
        </div>
        <div class="stat-box" style="flex:1; min-width:120px; text-align:center;">
          <p class="label">Accuracy</p>
          <p class="value">${vars.accuracy ?? '0'}%</p>
        </div>
        <div class="stat-box" style="flex:1; min-width:120px; text-align:center;">
          <p class="label">Study Hours</p>
          <p class="value">${vars.studyHours ?? '0'}</p>
        </div>
      </div>
      ${vars.streak ? `<p>Current streak: <strong>${vars.streak} days</strong></p>` : ''}
      ${vars.xpEarned ? `<p>XP earned this week: <strong>${vars.xpEarned} XP</strong></p>` : ''}
      ${vars.weakAreas ? `<p><strong>Focus areas:</strong> ${vars.weakAreas}</p>` : ''}
      <hr class="divider" />
      <p style="text-align:center;">
        <a href="${APP_URL}/analytics" class="btn">View Full Analytics</a>
      </p>
      <p style="color:#6b7280;">Keep up the great work! - The ${APP_NAME} Team</p>`,
      `Your weekly study report is ready.`
    ),
    text: `Weekly Progress Report\n\nHi ${vars.userName ?? 'there'},\n\nQuestions answered: ${vars.questionsAnswered ?? '0'}\nAccuracy: ${vars.accuracy ?? '0'}%\nStudy hours: ${vars.studyHours ?? '0'}\n${vars.streak ? `Streak: ${vars.streak} days\n` : ''}${vars.xpEarned ? `XP earned: ${vars.xpEarned}\n` : ''}\nView analytics: ${APP_URL}/analytics\n\n- The ${APP_NAME} Team`,
  }),

  // 8. Achievement Unlocked
  achievement_unlocked: (vars) => ({
    subject: `Achievement Unlocked: ${vars.achievementName ?? 'New Badge'}!`,
    html: wrapInLayout(
      `<h2 style="text-align:center;">Achievement Unlocked!</h2>
      <div style="text-align:center; padding:24px 0;">
        ${vars.badgeUrl ? `<img src="${vars.badgeUrl}" alt="${vars.achievementName}" style="width:96px; height:96px; margin:0 auto;" />` : `<div style="width:96px; height:96px; margin:0 auto; background:linear-gradient(135deg, #f59e0b, #d97706); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:48px;">&#127942;</div>`}
      </div>
      <p style="text-align:center;">Hi ${vars.userName ?? 'there'},</p>
      <div class="stat-box" style="text-align:center;">
        <p class="label">Achievement</p>
        <p class="value">${vars.achievementName ?? 'New Achievement'}</p>
        ${vars.achievementDescription ? `<p style="color:#6b7280; margin:4px 0 0; font-size:14px;">${vars.achievementDescription}</p>` : ''}
      </div>
      ${vars.xpReward ? `<p style="text-align:center; color:#4f46e5; font-weight:600; font-size:18px;">+${vars.xpReward} XP</p>` : ''}
      <p style="text-align:center;">
        <a href="${APP_URL}/achievements" class="btn">View All Achievements</a>
      </p>
      <p style="color:#6b7280; text-align:center;">- The ${APP_NAME} Team</p>`,
      `You've unlocked a new achievement: ${vars.achievementName ?? 'New Badge'}!`
    ),
    text: `Achievement Unlocked!\n\nHi ${vars.userName ?? 'there'},\n\n${vars.achievementName ?? 'New Achievement'}${vars.achievementDescription ? `: ${vars.achievementDescription}` : ''}${vars.xpReward ? `\n+${vars.xpReward} XP` : ''}\n\nView achievements: ${APP_URL}/achievements\n\n- The ${APP_NAME} Team`,
  }),

  // 9. Streak Milestone
  streak_milestone: (vars) => ({
    subject: `Incredible! ${vars.streakDays ?? '7'}-day study streak!`,
    html: wrapInLayout(
      `<h2 style="text-align:center;">Streak Milestone!</h2>
      <div style="text-align:center; padding:16px 0;">
        <div style="display:inline-block; background:linear-gradient(135deg, #f59e0b, #ef4444); color:#fff; border-radius:50%; width:100px; height:100px; line-height:100px; font-size:36px; font-weight:800;">${vars.streakDays ?? '7'}</div>
      </div>
      <p style="text-align:center; font-size:18px; font-weight:600; color:#111827;">
        ${vars.streakDays ?? '7'} Days in a Row!
      </p>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>You've studied for <strong>${vars.streakDays ?? '7'} consecutive days</strong>. That's an amazing commitment to your NCLEX preparation!</p>
      ${vars.xpBonus ? `<div class="stat-box" style="text-align:center;"><p class="label">Streak Bonus</p><p class="value" style="color:#4f46e5;">+${vars.xpBonus} XP</p></div>` : ''}
      <p>Keep it up! Every day of consistent study brings you closer to passing the NCLEX.</p>
      <p style="text-align:center;">
        <a href="${APP_URL}/dashboard" class="btn">Continue Studying</a>
      </p>
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Amazing! You've hit a ${vars.streakDays ?? '7'}-day study streak!`
    ),
    text: `Streak Milestone: ${vars.streakDays ?? '7'} Days!\n\nHi ${vars.userName ?? 'there'},\n\nYou've studied for ${vars.streakDays ?? '7'} consecutive days!${vars.xpBonus ? ` Streak bonus: +${vars.xpBonus} XP` : ''}\n\nKeep it up! ${APP_URL}/dashboard\n\n- The ${APP_NAME} Team`,
  }),

  // 10. Password Changed
  password_changed: (vars) => ({
    subject: `Security alert: Your ${APP_NAME} password was changed`,
    html: wrapInLayout(
      `<h2>Password Changed</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>Your password was successfully changed on <strong>${vars.date ?? new Date().toLocaleString()}</strong>.</p>
      <div class="stat-box" style="background-color:#fef2f2; border-color:#fecaca;">
        <p style="color:#dc2626; font-size:14px; margin:0;"><strong>If you did not make this change</strong>, please secure your account immediately by resetting your password and contacting our support team.</p>
      </div>
      <p style="text-align:center;">
        <a href="${APP_URL}/account/settings" class="btn">Account Settings</a>
      </p>
      <p style="color:#6b7280;">- The ${APP_NAME} Security Team</p>`,
      `Your password was changed. If this wasn't you, please secure your account.`
    ),
    text: `Password Changed\n\nHi ${vars.userName ?? 'there'},\n\nYour password was changed on ${vars.date ?? new Date().toLocaleString()}.\n\nIf you did not make this change, please secure your account immediately.\n\nAccount settings: ${APP_URL}/account/settings\n\n- The ${APP_NAME} Security Team`,
  }),

  // 11. Quiz Completed
  quiz_completed: (vars) => ({
    subject: `Quiz results: ${vars.score ?? '0'}% - ${vars.correctAnswers ?? '0'}/${vars.totalQuestions ?? '0'} correct`,
    html: wrapInLayout(
      `<h2>Quiz Completed!</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>Great job completing your quiz! Here are your results:</p>
      <div class="stat-box" style="text-align:center;">
        <p class="label">Score</p>
        <p class="value" style="color:${parseInt(vars.score ?? '0') >= 70 ? '#059669' : '#dc2626'};">${vars.score ?? '0'}%</p>
      </div>
      <table style="width:100%; font-size:14px; color:#4b5563; margin:16px 0;">
        <tr><td style="padding:8px 0;"><strong>Correct:</strong></td><td style="padding:8px 0; text-align:right;">${vars.correctAnswers ?? '0'} / ${vars.totalQuestions ?? '0'}</td></tr>
        ${vars.timeSpent ? `<tr><td style="padding:8px 0;"><strong>Time:</strong></td><td style="padding:8px 0; text-align:right;">${vars.timeSpent}</td></tr>` : ''}
        ${vars.difficulty ? `<tr><td style="padding:8px 0;"><strong>Difficulty:</strong></td><td style="padding:8px 0; text-align:right;">${vars.difficulty}</td></tr>` : ''}
      </table>
      ${vars.xpEarned ? `<p style="text-align:center; color:#4f46e5; font-weight:600;">+${vars.xpEarned} XP earned</p>` : ''}
      <p style="text-align:center;">
        <a href="${APP_URL}/analytics" class="btn">View Detailed Analysis</a>
      </p>
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Quiz results: ${vars.score ?? '0'}% score`
    ),
    text: `Quiz Completed!\n\nHi ${vars.userName ?? 'there'},\n\nScore: ${vars.score ?? '0'}%\nCorrect: ${vars.correctAnswers ?? '0'}/${vars.totalQuestions ?? '0'}${vars.xpEarned ? `\nXP earned: +${vars.xpEarned}` : ''}\n\nView analysis: ${APP_URL}/analytics\n\n- The ${APP_NAME} Team`,
  }),

  // 12. CAT Completed
  cat_completed: (vars) => ({
    subject: `CAT Simulation ${vars.result === 'pass' ? 'Passed' : vars.result === 'fail' ? 'Complete' : 'Complete'}: Your results are ready`,
    html: wrapInLayout(
      `<h2>CAT Simulation Complete</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>You've completed your NCLEX CAT simulation. Here are your results:</p>
      <div class="stat-box" style="text-align:center;">
        <p class="label">Result</p>
        <p class="value" style="color:${vars.result === 'pass' ? '#059669' : vars.result === 'fail' ? '#dc2626' : '#d97706'};">
          ${vars.result === 'pass' ? 'PASS' : vars.result === 'fail' ? 'BELOW PASSING' : 'UNDETERMINED'}
        </p>
      </div>
      <table style="width:100%; font-size:14px; color:#4b5563; margin:16px 0;">
        <tr><td style="padding:8px 0;"><strong>Questions Answered:</strong></td><td style="padding:8px 0; text-align:right;">${vars.questionsAnswered ?? 'N/A'}</td></tr>
        ${vars.passingProbability ? `<tr><td style="padding:8px 0;"><strong>Passing Probability:</strong></td><td style="padding:8px 0; text-align:right;">${vars.passingProbability}%</td></tr>` : ''}
        ${vars.timeSpent ? `<tr><td style="padding:8px 0;"><strong>Time:</strong></td><td style="padding:8px 0; text-align:right;">${vars.timeSpent}</td></tr>` : ''}
      </table>
      ${vars.result === 'pass'
        ? `<p style="color:#059669;">Congratulations! Your performance indicates you are likely ready for the NCLEX. Keep practicing to stay sharp!</p>`
        : `<p>Don't be discouraged. Review your weak areas and keep practicing. Each simulation helps you get closer to passing!</p>`
      }
      ${vars.xpEarned ? `<p style="text-align:center; color:#4f46e5; font-weight:600;">+${vars.xpEarned} XP earned</p>` : ''}
      <p style="text-align:center;">
        <a href="${APP_URL}/analytics" class="btn">View Detailed Results</a>
      </p>
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Your CAT simulation results are ready.`
    ),
    text: `CAT Simulation Complete\n\nHi ${vars.userName ?? 'there'},\n\nResult: ${vars.result === 'pass' ? 'PASS' : vars.result === 'fail' ? 'BELOW PASSING' : 'UNDETERMINED'}\nQuestions: ${vars.questionsAnswered ?? 'N/A'}${vars.passingProbability ? `\nPassing probability: ${vars.passingProbability}%` : ''}${vars.xpEarned ? `\nXP earned: +${vars.xpEarned}` : ''}\n\nView results: ${APP_URL}/analytics\n\n- The ${APP_NAME} Team`,
  }),

  // 13. Email Verification
  email_verification: (vars) => ({
    subject: `Verify your email address - ${APP_NAME}`,
    html: wrapInLayout(
      `<h2>Verify Your Email Address</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>Thanks for signing up for ${APP_NAME}! Please verify your email address to activate your account and start your NCLEX preparation journey.</p>
      <p>Click the button below to verify your email:</p>
      <p style="text-align:center;">
        <a href="${vars.verificationUrl ?? `${APP_URL}/api/auth/verify-email?token=${vars.token ?? ''}`}" class="btn">Verify Email Address</a>
      </p>
      <p style="font-size:13px; color:#9ca3af;">If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size:13px; color:#6366f1; word-break:break-all;">${vars.verificationUrl ?? `${APP_URL}/api/auth/verify-email?token=${vars.token ?? ''}`}</p>
      <hr class="divider" />
      <p style="font-size:13px; color:#9ca3af;">If you did not create an account with ${APP_NAME}, you can safely ignore this email.</p>
      <p style="color:#6b7280;">- The ${APP_NAME} Team</p>`,
      `Please verify your email address to get started with ${APP_NAME}.`
    ),
    text: `Verify Your Email Address\n\nHi ${vars.userName ?? 'there'},\n\nThanks for signing up for ${APP_NAME}! Please verify your email by visiting:\n\n${vars.verificationUrl ?? `${APP_URL}/api/auth/verify-email?token=${vars.token ?? ''}`}\n\nIf you did not create an account, you can safely ignore this email.\n\n- The ${APP_NAME} Team`,
  }),

  // 14. Password Reset
  password_reset: (vars) => ({
    subject: `Reset your password - ${APP_NAME}`,
    html: wrapInLayout(
      `<h2>Reset Your Password</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>We received a request to reset the password for your ${APP_NAME} account. Click the button below to create a new password:</p>
      <p style="text-align:center;">
        <a href="${vars.resetUrl ?? `${APP_URL}/auth/reset-password?token=${vars.token ?? ''}`}" class="btn">Reset Password</a>
      </p>
      <p style="font-size:13px; color:#9ca3af;">If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size:13px; color:#6366f1; word-break:break-all;">${vars.resetUrl ?? `${APP_URL}/auth/reset-password?token=${vars.token ?? ''}`}</p>
      <hr class="divider" />
      <div class="stat-box" style="background-color:#fef2f2; border-color:#fecaca;">
        <p style="color:#dc2626; font-size:14px; margin:0;"><strong>This link will expire in 1 hour.</strong> If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      </div>
      <p style="color:#6b7280;">- The ${APP_NAME} Security Team</p>`,
      `Reset your ${APP_NAME} password. This link expires in 1 hour.`
    ),
    text: `Reset Your Password\n\nHi ${vars.userName ?? 'there'},\n\nWe received a request to reset your password. Visit the link below to create a new password:\n\n${vars.resetUrl ?? `${APP_URL}/auth/reset-password?token=${vars.token ?? ''}`}\n\nThis link expires in 1 hour. If you did not request a password reset, please ignore this email.\n\n- The ${APP_NAME} Security Team`,
  }),

  // 15. Login Alert
  login_alert: (vars) => ({
    subject: `New login to your ${APP_NAME} account`,
    html: wrapInLayout(
      `<h2>New Login Detected</h2>
      <p>Hi ${vars.userName ?? 'there'},</p>
      <p>A new login was detected on your ${APP_NAME} account.</p>
      <div class="stat-box">
        <table style="width:100%; font-size:14px; color:#4b5563;">
          ${vars.date ? `<tr><td style="padding:6px 0;"><strong>Date:</strong></td><td style="padding:6px 0; text-align:right;">${vars.date}</td></tr>` : ''}
          ${vars.device ? `<tr><td style="padding:6px 0;"><strong>Device:</strong></td><td style="padding:6px 0; text-align:right;">${vars.device}</td></tr>` : ''}
          ${vars.browser ? `<tr><td style="padding:6px 0;"><strong>Browser:</strong></td><td style="padding:6px 0; text-align:right;">${vars.browser}</td></tr>` : ''}
          ${vars.location ? `<tr><td style="padding:6px 0;"><strong>Location:</strong></td><td style="padding:6px 0; text-align:right;">${vars.location}</td></tr>` : ''}
          ${vars.ipAddress ? `<tr><td style="padding:6px 0;"><strong>IP Address:</strong></td><td style="padding:6px 0; text-align:right;">${vars.ipAddress}</td></tr>` : ''}
        </table>
      </div>
      <div class="stat-box" style="background-color:#fef2f2; border-color:#fecaca;">
        <p style="color:#dc2626; font-size:14px; margin:0;"><strong>If this wasn't you</strong>, your account may be compromised. Please change your password immediately and contact our support team.</p>
      </div>
      <p style="text-align:center;">
        <a href="${APP_URL}/account/settings" class="btn" style="background:linear-gradient(135deg, #dc2626, #ef4444);">Secure My Account</a>
      </p>
      <p style="color:#6b7280;">- The ${APP_NAME} Security Team</p>`,
      `New login detected on your ${APP_NAME} account.`
    ),
    text: `New Login Detected\n\nHi ${vars.userName ?? 'there'},\n\nA new login was detected on your ${APP_NAME} account.${vars.date ? `\nDate: ${vars.date}` : ''}${vars.device ? `\nDevice: ${vars.device}` : ''}${vars.location ? `\nLocation: ${vars.location}` : ''}${vars.ipAddress ? `\nIP: ${vars.ipAddress}` : ''}\n\nIf this wasn't you, secure your account immediately: ${APP_URL}/account/settings\n\n- The ${APP_NAME} Security Team`,
  }),
};
