import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Default Stripe instance using env vars (fallback)
let stripeInstance: Stripe | null = null;

// Get or create Stripe instance
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!secretKey) {
      console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true
    });
  }
  return stripeInstance;
}

// Create Stripe instance with custom key (for dynamic config)
export function createStripeInstance(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    typescript: true
  });
}

// Update the Stripe instance with new key (called when admin updates settings)
export function updateStripeInstance(secretKey: string): void {
  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    typescript: true
  });
}

// Legacy export for backward compatibility
export const stripe = getStripe();

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

// Dynamic config loader (reads from database with env fallback)
export async function getStripeConfig(): Promise<{
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  priceIds: {
    proMonthly: string;
    proYearly: string;
    premiumMonthly: string;
    premiumYearly: string;
  };
}> {
  try {
    // Dynamically import to avoid circular dependencies
    const { systemSettingsService } = await import('../services/systemSettings.service');
    const settings = await systemSettingsService.getStripeSettings();
    
    return {
      secretKey: settings.secretKey || process.env.STRIPE_SECRET_KEY || '',
      publishableKey: settings.publishableKey || process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: settings.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '',
      priceIds: {
        proMonthly: settings.proPriceIds.monthly || process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
        proYearly: settings.proPriceIds.yearly || process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
        premiumMonthly: settings.premiumPriceIds.monthly || process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
        premiumYearly: settings.premiumPriceIds.yearly || process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
      },
    };
  } catch {
    // Fallback to env vars if database not available
    return {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      priceIds: stripeConfig.priceIds,
    };
  }
}
