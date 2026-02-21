/**
 * Payment Notifications Service
 *
 * Sends email notifications for payment-related events:
 * - Subscription created/renewed
 * - Subscription canceled
 * - Payment failed
 * - Trial ending
 * - Invoice receipts
 */

import { emailService } from './email.service';
import { User } from '../models/User';
import { PLAN_PRICING } from '../models/Subscription';

export interface PaymentNotificationData {
  userId: string;
  amount?: number;
  planType?: string;
  billingPeriod?: string;
  nextBillingDate?: Date;
  receiptUrl?: string;
  failureReason?: string;
  trialEndDate?: Date;
}

export class PaymentNotificationsService {
  /**
   * Send subscription created/welcome email
   */
  async sendSubscriptionCreated(data: PaymentNotificationData): Promise<void> {
    const user = await User.findByPk(data.userId);
    if (!user) return;

    const amount = data.amount || PLAN_PRICING[data.planType as keyof typeof PLAN_PRICING]?.[data.billingPeriod as 'monthly' | 'yearly'] || 0;

    await emailService.sendEmail({
      to: user.email,
      subject: `Welcome to Haven Institute ${data.planType}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to ${data.planType}!</h1>
          </div>

          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi ${user.fullName},</p>
            <p>Thank you for subscribing to Haven Institute ${data.planType}! Your account has been upgraded and you now have access to all ${data.planType} features.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Subscription Details</h3>
              <p><strong>Plan:</strong> ${data.planType}</p>
              <p><strong>Billing:</strong> ${data.billingPeriod === 'yearly' ? 'Annually' : 'Monthly'}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}/${data.billingPeriod === 'yearly' ? 'year' : 'month'}</p>
              ${data.nextBillingDate ? `<p><strong>Next billing date:</strong> ${new Date(data.nextBillingDate).toLocaleDateString()}</p>` : ''}
            </div>

            <h3 style="color: #374151;">What's included:</h3>
            <ul style="color: #6b7280; line-height: 1.8;">
              ${data.planType === 'Premium' ? `
                <li>Unlimited practice questions</li>
                <li>Unlimited CAT exams</li>
                <li>Unlimited AI tutor access</li>
                <li>Priority support</li>
                <li>All study materials</li>
                <li>Advanced analytics</li>
              ` : `
                <li>Extended question bank access</li>
                <li>More CAT practice exams</li>
                <li>AI tutor access</li>
                <li>Detailed analytics</li>
              `}
            </ul>

            <a href="${process.env.FRONTEND_URL}/dashboard"
               style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
              Start Studying
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

            <p style="color: #6b7280; font-size: 14px;">
              You can manage your subscription anytime from your <a href="${process.env.FRONTEND_URL}/account/subscription" style="color: #6366f1;">account settings</a>.
            </p>
          </div>
        </div>
      `,
      text: `Welcome to Haven Institute ${data.planType}!\n\nHi ${user.fullName},\n\nThank you for subscribing! Your account has been upgraded to ${data.planType}.\n\nPlan: ${data.planType}\nBilling: ${data.billingPeriod === 'yearly' ? 'Annually' : 'Monthly'}\nAmount: $${amount.toFixed(2)}/${data.billingPeriod === 'yearly' ? 'year' : 'month'}\n\nStart studying now at: ${process.env.FRONTEND_URL}/dashboard`
    });
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(data: PaymentNotificationData): Promise<void> {
    const user = await User.findByPk(data.userId);
    if (!user) return;

    await emailService.sendEmail({
      to: user.email,
      subject: 'Payment Receipt - Haven Institute',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #374151;">Payment Receipt</h1>

          <p>Hi ${user.fullName},</p>
          <p>This is a receipt for your recent payment to Haven Institute.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount paid:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(data.amount || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Plan:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.planType || 'Subscription'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
          </div>

          ${data.receiptUrl ? `
            <p>
              <a href="${data.receiptUrl}" style="color: #6366f1;">View full receipt</a>
            </p>
          ` : ''}

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Questions about your billing? <a href="${process.env.FRONTEND_URL}/account/subscription" style="color: #6366f1;">Manage subscription</a> or contact support.
          </p>
        </div>
      `,
      text: `Payment Receipt\n\nHi ${user.fullName},\n\nThis is a receipt for your payment to Haven Institute.\n\nAmount: $${(data.amount || 0).toFixed(2)}\nPlan: ${data.planType || 'Subscription'}\nDate: ${new Date().toLocaleDateString()}\n\n${data.receiptUrl ? `View receipt: ${data.receiptUrl}` : ''}`
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailed(data: PaymentNotificationData): Promise<void> {
    const user = await User.findByPk(data.userId);
    if (!user) return;

    await emailService.sendEmail({
      to: user.email,
      subject: 'Action Required: Payment Failed - Haven Institute',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #991b1b; margin: 0 0 10px 0;">Payment Failed</h2>
            <p style="color: #7f1d1d; margin: 0;">We couldn't process your subscription payment.</p>
          </div>

          <p>Hi ${user.fullName},</p>
          <p>We attempted to charge your payment method for your Haven Institute subscription, but the payment was unsuccessful.</p>

          ${data.failureReason ? `
            <p><strong>Reason:</strong> ${data.failureReason}</p>
          ` : ''}

          <p>To continue your subscription without interruption, please update your payment method:</p>

          <a href="${process.env.FRONTEND_URL}/account/billing"
             style="display: inline-block; background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Update Payment Method
          </a>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you don't update your payment method, your subscription will be canceled and you'll lose access to premium features.
          </p>

          <p>Need help? Contact our support team.</p>
        </div>
      `,
      text: `Payment Failed\n\nHi ${user.fullName},\n\nWe couldn't process your subscription payment.${data.failureReason ? `\nReason: ${data.failureReason}` : ''}\n\nPlease update your payment method to continue your subscription:\n${process.env.FRONTEND_URL}/account/billing`
    });
  }

  /**
   * Send subscription canceled notification
   */
  async sendSubscriptionCanceled(data: PaymentNotificationData): Promise<void> {
    const user = await User.findByPk(data.userId);
    if (!user) return;

    await emailService.sendEmail({
      to: user.email,
      subject: 'Your Subscription Has Been Canceled - Haven Institute',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #374151;">Subscription Canceled</h1>

          <p>Hi ${user.fullName},</p>
          <p>Your Haven Institute ${data.planType || ''} subscription has been canceled as requested.</p>

          ${data.nextBillingDate ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Note:</strong> You'll continue to have access until ${new Date(data.nextBillingDate).toLocaleDateString()}.
              </p>
            </div>
          ` : ''}

          <p>We're sorry to see you go! If you change your mind, you can always resubscribe.</p>

          <a href="${process.env.FRONTEND_URL}/account/subscription"
             style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Resubscribe
          </a>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 14px;">
            We'd love to hear your feedback. Why did you cancel? <a href="mailto:support@havenstudy.com" style="color: #6366f1;">Let us know</a>
          </p>
        </div>
      `,
      text: `Subscription Canceled\n\nHi ${user.fullName},\n\nYour Haven Institute subscription has been canceled.${data.nextBillingDate ? `\n\nYou'll continue to have access until ${new Date(data.nextBillingDate).toLocaleDateString()}.` : ''}\n\nIf you change your mind, you can resubscribe anytime at: ${process.env.FRONTEND_URL}/account/subscription`
    });
  }

  /**
   * Send trial ending reminder
   */
  async sendTrialEndingReminder(data: PaymentNotificationData): Promise<void> {
    const user = await User.findByPk(data.userId);
    if (!user || !data.trialEndDate) return;

    const daysLeft = Math.ceil((data.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    await emailService.sendEmail({
      to: user.email,
      subject: `Your Trial Ends in ${daysLeft} Days - Haven Institute`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #374151;">Your Trial is Ending Soon</h1>

          <p>Hi ${user.fullName},</p>
          <p>Your Haven Institute trial ends in <strong>${daysLeft} days</strong> (${new Date(data.trialEndDate).toLocaleDateString()}).</p>

          <p>Don't lose access to:</p>
          <ul style="color: #6b7280; line-height: 1.8;">
            <li>Comprehensive question bank</li>
            <li>AI-powered tutoring</li>
            <li>CAT practice exams</li>
            <li>Performance analytics</li>
          </ul>

          <a href="${process.env.FRONTEND_URL}/account/subscription"
             style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Subscribe Now
          </a>

          <p style="color: #6b7280; font-size: 14px;">
            Questions? We're here to help at support@havenstudy.com
          </p>
        </div>
      `,
      text: `Your Trial is Ending Soon\n\nHi ${user.fullName},\n\nYour Haven Institute trial ends in ${daysLeft} days (${new Date(data.trialEndDate).toLocaleDateString()}).\n\nSubscribe now to keep access: ${process.env.FRONTEND_URL}/account/subscription`
    });
  }

  /**
   * Send subscription renewal reminder
   */
  async sendRenewalReminder(data: PaymentNotificationData): Promise<void> {
    const user = await User.findByPk(data.userId);
    if (!user || !data.nextBillingDate) return;

    await emailService.sendEmail({
      to: user.email,
      subject: 'Subscription Renewal Reminder - Haven Institute',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #374151;">Subscription Renewal</h1>

          <p>Hi ${user.fullName},</p>
          <p>This is a friendly reminder that your Haven Institute ${data.planType || ''} subscription will automatically renew on <strong>${new Date(data.nextBillingDate).toLocaleDateString()}</strong>.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Renewal amount:</strong> $${(data.amount || 0).toFixed(2)}</p>
            <p><strong>Plan:</strong> ${data.planType}</p>
          </div>

          <p>No action is needed if you wish to continue. Your payment method on file will be charged automatically.</p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Want to make changes? <a href="${process.env.FRONTEND_URL}/account/subscription" style="color: #6366f1;">Manage your subscription</a>
          </p>
        </div>
      `,
      text: `Subscription Renewal Reminder\n\nHi ${user.fullName},\n\nYour ${data.planType || ''} subscription will renew on ${new Date(data.nextBillingDate).toLocaleDateString()} for $${(data.amount || 0).toFixed(2)}.\n\nManage your subscription: ${process.env.FRONTEND_URL}/account/subscription`
    });
  }
}

export const paymentNotificationsService = new PaymentNotificationsService();
export default paymentNotificationsService;
