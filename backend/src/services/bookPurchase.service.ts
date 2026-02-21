/**
 * Book Purchase Service
 *
 * Handles book purchases via Stripe, access control, and purchase history
 */

import { stripe } from '../config/stripe';
import { Book, UserBook } from '../models/Book';
import { User } from '../models/User';
import { PaymentTransaction, Subscription } from '../models/Subscription';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';
import emailService from './email.service';

export interface PurchaseResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

export class BookPurchaseService {
  /**
   * Create a checkout session for book purchase
   */
  async createCheckoutSession(
    userId: string,
    bookId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<PurchaseResult> {
    try {
      // Get user and book details
      const user = await User.findByPk(userId);
      const book = await Book.findByPk(bookId);

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (!book) {
        return { success: false, error: 'Book not found' };
      }

      if (book.isFree || (book.price && book.price <= 0)) {
        // Book is free, grant access directly
        await this.grantBookAccess(userId, bookId, 0);
        return { success: true, url: successUrl };
      }

      // Check if already purchased
      const existingPurchase = await UserBook.findOne({
        where: { user_id: userId, book_id: bookId, is_purchased: true }
      });

      if (existingPurchase) {
        return { success: false, error: 'Book already purchased' };
      }

      // Get or create Stripe customer from subscription
      const subscription = await Subscription.findOne({ where: { userId } });
      let stripeCustomerId = subscription?.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          metadata: { userId }
        });
        stripeCustomerId = customer.id;

        // Save customer ID to subscription if exists
        await user.update({ stripe_customer_id: stripeCustomerId });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: book.currency || 'usd',
            product_data: {
              name: book.title,
              description: book.description?.substring(0, 500) || undefined,
              images: book.coverImageUrl ? [book.coverImageUrl] : undefined
            },
            unit_amount: Math.round((book.price || 0) * 100) // Convert to cents
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&book_id=${bookId}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          bookId,
          purchaseType: 'book'
        }
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url || undefined
      };
    } catch (error: any) {
      console.error('Book checkout error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle successful book purchase (called from webhook or after checkout)
   */
  async handlePurchaseComplete(
    sessionId: string
  ): Promise<{ success: boolean; bookId?: string; error?: string }> {
    try {
      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent']
      });

      const userId = session.metadata?.userId;
      const bookId = session.metadata?.bookId;

      if (!userId || !bookId) {
        return { success: false, error: 'Invalid session metadata' };
      }

      // Check if already processed
      const existing = await UserBook.findOne({
        where: { user_id: userId, book_id: bookId, is_purchased: true }
      });

      if (existing) {
        return { success: true, bookId }; // Already processed
      }

      // Grant access
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      await this.grantBookAccess(
        userId,
        bookId,
        amount,
        (session.payment_intent as any)?.id
      );

      // Send confirmation email
      await this.sendPurchaseConfirmation(userId, bookId, amount);

      return { success: true, bookId };
    } catch (error: any) {
      console.error('Purchase completion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Grant book access to user
   */
  async grantBookAccess(
    userId: string,
    bookId: string,
    purchasePrice: number,
    stripePaymentId?: string
  ): Promise<UserBook> {
    // Create or update user book record
    const [userBook, created] = await UserBook.findOrCreate({
      where: { user_id: userId, book_id: bookId },
      defaults: {
        user_id: userId,
        book_id: bookId,
        is_purchased: true,
        purchased_at: new Date(),
        purchase_price: purchasePrice,
        stripe_payment_id: stripePaymentId
      }
    });

    if (!created && !userBook.isPurchased) {
      await userBook.update({
        is_purchased: true,
        purchased_at: new Date(),
        purchase_price: purchasePrice,
        stripe_payment_id: stripePaymentId
      });
    }

    // Update book download count
    await sequelize.query(
      `UPDATE books SET download_count = download_count + 1 WHERE id = :bookId`,
      {
        replacements: { bookId },
        type: QueryTypes.UPDATE
      }
    );

    // Record payment transaction
    if (purchasePrice > 0) {
      await PaymentTransaction.create({
        user_id: userId,
        stripe_payment_intent_id: stripePaymentId,
        amount: purchasePrice,
        currency: 'USD',
        status: 'succeeded',
        payment_method: 'card',
        description: `Book purchase: ${bookId}`,
        metadata: { bookId, type: 'book_purchase' }
      });
    }

    return userBook;
  }

  /**
   * Check if user has access to a book
   */
  async hasAccess(userId: string, bookId: string): Promise<boolean> {
    // Get book and check if free
    const book = await Book.findByPk(bookId);
    if (!book) return false;

    // Check subscription requirement (isPremiumOnly requires Pro or Premium)
    if (book.isPremiumOnly) {
      const user = await User.findByPk(userId);
      const userTier = user?.subscriptionTier || 'Free';
      if (userTier === 'Pro' || userTier === 'Premium') {
        return true; // Subscription covers access
      }
    }

    // Check if purchased
    const userBook = await UserBook.findOne({
      where: { user_id: userId, book_id: bookId, is_purchased: true }
    });

    return !!userBook || book.isFree || (book.price || 0) <= 0;
  }

  /**
   * Get user's purchased books
   */
  async getUserPurchases(userId: string): Promise<any[]> {
    const purchases = await sequelize.query<any>(
      `SELECT
        ub.*,
        b.title,
        b.author,
        b.cover_url,
        b.file_type,
        b.category
      FROM user_books ub
      JOIN books b ON b.id = ub.book_id
      WHERE ub.user_id = :userId AND ub.is_purchased = true
      ORDER BY ub.purchased_at DESC`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    return purchases;
  }

  /**
   * Get purchase history with receipts
   */
  async getPurchaseHistory(userId: string): Promise<any[]> {
    const history = await sequelize.query<any>(
      `SELECT
        pt.id,
        pt.amount,
        pt.currency,
        pt.status,
        pt.created_at,
        pt.receipt_url,
        b.title as book_title,
        b.cover_url
      FROM payment_transactions pt
      LEFT JOIN books b ON JSON_EXTRACT(pt.metadata, '$.bookId') = b.id
      WHERE pt.user_id = :userId
        AND JSON_EXTRACT(pt.metadata, '$.type') = 'book_purchase'
      ORDER BY pt.created_at DESC`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    return history;
  }

  /**
   * Send purchase confirmation email
   */
  private async sendPurchaseConfirmation(
    userId: string,
    bookId: string,
    amount: number
  ): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      const book = await Book.findByPk(bookId);

      if (!user || !book) return;

      await emailService.sendEmail({
        to: user.email,
        subject: `Purchase Confirmation: ${book.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Purchase Confirmed!</h1>
            <p>Hi ${user.fullName},</p>
            <p>Thank you for your purchase! Your book is now available in your library.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${book.title}</h3>
              ${book.author ? `<p style="color: #6b7280;">by ${book.author}</p>` : ''}
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            </div>

            <a href="${process.env.FRONTEND_URL}/library/${bookId}"
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              Read Now
            </a>

            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              If you have any questions, please contact our support team.
            </p>

            <p>Happy studying!</p>
            <p>The Haven Institute Team</p>
          </div>
        `,
        text: `Purchase Confirmed: ${book.title}\n\nHi ${user.fullName},\n\nThank you for your purchase! Your book "${book.title}" is now available in your library.\n\nAmount: $${amount.toFixed(2)}\n\nHappy studying!\nThe Haven Institute Team`
      });
    } catch (error) {
      console.error('Failed to send purchase confirmation:', error);
    }
  }
}

export const bookPurchaseService = new BookPurchaseService();
export default bookPurchaseService;
