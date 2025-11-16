import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true
});

export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  priceIds: {
    proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    proYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    premiumMonthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    premiumYearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || ''
  },
  prices: {
    pro: {
      monthly: 29.99,
      yearly: 299.99
    },
    premium: {
      monthly: 49.99,
      yearly: 499.99
    }
  }
};
