/**
 * System Settings Service
 * 
 * Manages admin-configurable system settings like Stripe keys, OAuth, etc.
 * Settings are stored in the database and can be managed via admin dashboard.
 */

import { SystemSettings, SettingCategory, SettingKey } from '../models/SystemSettings';
import { logger } from '../utils/logger';

// Stripe settings definition
export const STRIPE_SETTINGS: Array<{
  key: SettingKey;
  description: string;
  isSecret: boolean;
}> = [
  { key: 'stripe_secret_key', description: 'Stripe Secret Key (sk_...)', isSecret: true },
  { key: 'stripe_publishable_key', description: 'Stripe Publishable Key (pk_...)', isSecret: false },
  { key: 'stripe_webhook_secret', description: 'Stripe Webhook Secret (whsec_...)', isSecret: true },
  { key: 'stripe_pro_monthly_price_id', description: 'Pro Monthly Plan Price ID', isSecret: false },
  { key: 'stripe_pro_yearly_price_id', description: 'Pro Yearly Plan Price ID', isSecret: false },
  { key: 'stripe_premium_monthly_price_id', description: 'Premium Monthly Plan Price ID', isSecret: false },
  { key: 'stripe_premium_yearly_price_id', description: 'Premium Yearly Plan Price ID', isSecret: false },
];

// Email settings definition
export const EMAIL_SETTINGS: Array<{
  key: SettingKey;
  description: string;
  isSecret: boolean;
}> = [
  { key: 'smtp_host', description: 'SMTP Server Host', isSecret: false },
  { key: 'smtp_port', description: 'SMTP Server Port', isSecret: false },
  { key: 'smtp_user', description: 'SMTP Username/Email', isSecret: false },
  { key: 'smtp_password', description: 'SMTP Password', isSecret: true },
  { key: 'email_from', description: 'From Email Address', isSecret: false },
];

// OAuth settings definition
export const OAUTH_SETTINGS: Array<{
  key: SettingKey;
  description: string;
  isSecret: boolean;
}> = [
  { key: 'google_client_id', description: 'Google OAuth Client ID', isSecret: false },
  { key: 'google_client_secret', description: 'Google OAuth Client Secret', isSecret: true },
];

// AI settings definition
export const AI_SETTINGS: Array<{
  key: SettingKey;
  description: string;
  isSecret: boolean;
}> = [
  { key: 'openai_api_key', description: 'OpenAI API Key', isSecret: true },
  { key: 'openai_model', description: 'OpenAI Model (e.g., gpt-4-turbo)', isSecret: false },
  { key: 'deepseek_api_key', description: 'DeepSeek API Key', isSecret: true },
  { key: 'grok_api_key', description: 'Grok (xAI) API Key', isSecret: true },
  { key: 'ai_provider', description: 'Default AI Provider (openai/deepseek/grok)', isSecret: false },
];

// Feature flags definition
export const FEATURE_FLAGS: Array<{
  key: SettingKey;
  description: string;
  isSecret: boolean;
}> = [
  { key: 'enable_payments', description: 'Enable payment processing', isSecret: false },
  { key: 'enable_ai_chat', description: 'Enable AI chat feature', isSecret: false },
  { key: 'enable_email', description: 'Enable email notifications', isSecret: false },
  { key: 'maintenance_mode', description: 'Enable maintenance mode', isSecret: false },
];

export class SystemSettingsService {
  /**
   * Get a single setting value with env fallback
   */
  async getSetting(key: SettingKey, envFallback?: string): Promise<string | null> {
    try {
      const dbValue = await SystemSettings.getValue(key);
      if (dbValue !== null) {
        return dbValue;
      }
      return envFallback ?? null;
    } catch (error) {
      logger.error(`Error getting setting ${key}:`, error);
      return envFallback ?? null;
    }
  }

  /**
   * Get all Stripe settings (with env fallback)
   */
  async getStripeSettings(): Promise<{
    secretKey: string | null;
    publishableKey: string | null;
    webhookSecret: string | null;
    proPriceIds: { monthly: string | null; yearly: string | null };
    premiumPriceIds: { monthly: string | null; yearly: string | null };
  }> {
    return {
      secretKey: await this.getSetting('stripe_secret_key', process.env.STRIPE_SECRET_KEY),
      publishableKey: await this.getSetting('stripe_publishable_key', process.env.STRIPE_PUBLISHABLE_KEY),
      webhookSecret: await this.getSetting('stripe_webhook_secret', process.env.STRIPE_WEBHOOK_SECRET),
      proPriceIds: {
        monthly: await this.getSetting('stripe_pro_monthly_price_id', process.env.STRIPE_PRO_MONTHLY_PRICE_ID),
        yearly: await this.getSetting('stripe_pro_yearly_price_id', process.env.STRIPE_PRO_YEARLY_PRICE_ID),
      },
      premiumPriceIds: {
        monthly: await this.getSetting('stripe_premium_monthly_price_id', process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID),
        yearly: await this.getSetting('stripe_premium_yearly_price_id', process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID),
      },
    };
  }

  /**
   * Update Stripe settings
   */
  async updateStripeSettings(settings: {
    secretKey?: string;
    publishableKey?: string;
    webhookSecret?: string;
    proMonthlyPriceId?: string;
    proYearlyPriceId?: string;
    premiumMonthlyPriceId?: string;
    premiumYearlyPriceId?: string;
  }): Promise<void> {
    const updates: Array<{ key: SettingKey; value: string | null; isSecret: boolean }> = [];

    if (settings.secretKey !== undefined) {
      updates.push({ key: 'stripe_secret_key', value: settings.secretKey || null, isSecret: true });
    }
    if (settings.publishableKey !== undefined) {
      updates.push({ key: 'stripe_publishable_key', value: settings.publishableKey || null, isSecret: false });
    }
    if (settings.webhookSecret !== undefined) {
      updates.push({ key: 'stripe_webhook_secret', value: settings.webhookSecret || null, isSecret: true });
    }
    if (settings.proMonthlyPriceId !== undefined) {
      updates.push({ key: 'stripe_pro_monthly_price_id', value: settings.proMonthlyPriceId || null, isSecret: false });
    }
    if (settings.proYearlyPriceId !== undefined) {
      updates.push({ key: 'stripe_pro_yearly_price_id', value: settings.proYearlyPriceId || null, isSecret: false });
    }
    if (settings.premiumMonthlyPriceId !== undefined) {
      updates.push({ key: 'stripe_premium_monthly_price_id', value: settings.premiumMonthlyPriceId || null, isSecret: false });
    }
    if (settings.premiumYearlyPriceId !== undefined) {
      updates.push({ key: 'stripe_premium_yearly_price_id', value: settings.premiumYearlyPriceId || null, isSecret: false });
    }

    await SystemSettings.bulkSet(updates, 'stripe');
    logger.info('Stripe settings updated by admin');
  }

  /**
   * Get settings by category for admin display
   */
  async getSettingsByCategory(category: SettingCategory): Promise<Array<{
    key: string;
    value: string | null;
    description: string;
    isSecret: boolean;
    isConfigured: boolean;
  }>> {
    const definitions = this.getSettingDefinitions(category);
    const dbSettings = await SystemSettings.getByCategory(category);
    
    return definitions.map(def => {
      const dbValue = dbSettings[def.key];
      const envKey = this.getEnvKeyForSetting(def.key);
      const envValue = envKey ? process.env[envKey] : undefined;
      const hasValue = dbValue !== null && dbValue !== undefined && dbValue !== '';
      const hasEnvValue = envValue !== undefined && envValue !== '';
      
      return {
        key: def.key,
        value: def.isSecret && hasValue ? '••••••••' : (dbValue || null),
        description: def.description,
        isSecret: def.isSecret,
        isConfigured: hasValue || hasEnvValue,
      };
    });
  }

  /**
   * Get all settings for admin dashboard
   */
  async getAllSettingsForAdmin(): Promise<{
    stripe: Array<{ key: string; value: string | null; description: string; isSecret: boolean; isConfigured: boolean }>;
    email: Array<{ key: string; value: string | null; description: string; isSecret: boolean; isConfigured: boolean }>;
    oauth: Array<{ key: string; value: string | null; description: string; isSecret: boolean; isConfigured: boolean }>;
    features: Array<{ key: string; value: string | null; description: string; isSecret: boolean; isConfigured: boolean }>;
  }> {
    return {
      stripe: await this.getSettingsByCategory('stripe'),
      email: await this.getSettingsByCategory('email'),
      oauth: await this.getSettingsByCategory('oauth'),
      features: await this.getSettingsByCategory('features'),
    };
  }

  /**
   * Update a single setting
   */
  async updateSetting(key: SettingKey, value: string | null): Promise<void> {
    const definitions = [
      ...STRIPE_SETTINGS,
      ...EMAIL_SETTINGS,
      ...OAUTH_SETTINGS,
      ...FEATURE_FLAGS,
    ];
    
    const def = definitions.find(d => d.key === key);
    if (!def) {
      throw new Error(`Unknown setting key: ${key}`);
    }

    const category = this.getCategoryForKey(key);
    await SystemSettings.setValue(key, value, {
      category,
      description: def.description,
      isSecret: def.isSecret,
    });
    
    logger.info(`Setting ${key} updated by admin`);
  }

  /**
   * Bulk update settings
   */
  async bulkUpdateSettings(
    settings: Array<{ key: SettingKey; value: string | null }>,
    category: SettingCategory
  ): Promise<void> {
    const definitions = this.getSettingDefinitions(category);
    
    for (const { key, value } of settings) {
      const def = definitions.find(d => d.key === key);
      if (def) {
        await SystemSettings.setValue(key, value, {
          category,
          description: def.description,
          isSecret: def.isSecret,
        });
      }
    }
    
    logger.info(`Bulk settings update for category ${category}`);
  }

  /**
   * Test Stripe connection with current settings
   */
  async testStripeConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const settings = await this.getStripeSettings();
      
      if (!settings.secretKey) {
        return { success: false, message: 'Stripe Secret Key is not configured' };
      }

      // Dynamically import and test Stripe
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(settings.secretKey, { apiVersion: '2023-10-16' });
      
      // Try to list products as a connection test
      await stripe.products.list({ limit: 1 });
      
      return { success: true, message: 'Stripe connection successful' };
    } catch (error: any) {
      logger.error('Stripe connection test failed:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to connect to Stripe' 
      };
    }
  }

  /**
   * Initialize default settings if not exist
   */
  async initializeDefaults(): Promise<void> {
    const allDefinitions = [
      { defs: STRIPE_SETTINGS, category: 'stripe' as SettingCategory },
      { defs: EMAIL_SETTINGS, category: 'email' as SettingCategory },
      { defs: OAUTH_SETTINGS, category: 'oauth' as SettingCategory },
      { defs: AI_SETTINGS, category: 'general' as SettingCategory },
      { defs: FEATURE_FLAGS, category: 'features' as SettingCategory },
    ];

    for (const { defs, category } of allDefinitions) {
      for (const def of defs) {
        const existing = await SystemSettings.findOne({ where: { key: def.key } });
        if (!existing) {
          await SystemSettings.create({
            key: def.key,
            value: null,
            category,
            description: def.description,
            isEncrypted: false,
            isSecret: def.isSecret,
          });
        }
      }
    }
    
    logger.info('System settings initialized');
  }

  // Helper methods
  private getSettingDefinitions(category: SettingCategory) {
    switch (category) {
      case 'stripe': return STRIPE_SETTINGS;
      case 'email': return EMAIL_SETTINGS;
      case 'oauth': return OAUTH_SETTINGS;
      case 'features': return FEATURE_FLAGS;
      case 'general': return AI_SETTINGS;
      default: return [];
    }
  }

  private getCategoryForKey(key: SettingKey): SettingCategory {
    if (STRIPE_SETTINGS.some(s => s.key === key)) return 'stripe';
    if (EMAIL_SETTINGS.some(s => s.key === key)) return 'email';
    if (OAUTH_SETTINGS.some(s => s.key === key)) return 'oauth';
    if (AI_SETTINGS.some(s => s.key === key)) return 'general';
    if (FEATURE_FLAGS.some(s => s.key === key)) return 'features';
    return 'general';
  }

  private getEnvKeyForSetting(key: SettingKey): string | null {
    const mapping: Record<string, string> = {
      'stripe_secret_key': 'STRIPE_SECRET_KEY',
      'stripe_publishable_key': 'STRIPE_PUBLISHABLE_KEY',
      'stripe_webhook_secret': 'STRIPE_WEBHOOK_SECRET',
      'stripe_pro_monthly_price_id': 'STRIPE_PRO_MONTHLY_PRICE_ID',
      'stripe_pro_yearly_price_id': 'STRIPE_PRO_YEARLY_PRICE_ID',
      'stripe_premium_monthly_price_id': 'STRIPE_PREMIUM_MONTHLY_PRICE_ID',
      'stripe_premium_yearly_price_id': 'STRIPE_PREMIUM_YEARLY_PRICE_ID',
      'smtp_host': 'SMTP_HOST',
      'smtp_port': 'SMTP_PORT',
      'smtp_user': 'SMTP_USER',
      'smtp_password': 'SMTP_PASSWORD',
      'email_from': 'EMAIL_FROM',
      'google_client_id': 'GOOGLE_CLIENT_ID',
      'google_client_secret': 'GOOGLE_CLIENT_SECRET',
      'openai_api_key': 'OPENAI_API_KEY',
      'openai_model': 'OPENAI_MODEL',
      'deepseek_api_key': 'DEEPSEEK_API_KEY',
      'grok_api_key': 'GROK_API_KEY',
      'ai_provider': 'AI_PROVIDER',
      'enable_payments': 'ENABLE_PAYMENTS',
      'enable_ai_chat': 'ENABLE_AI_CHAT',
      'enable_email': 'ENABLE_EMAIL',
      'maintenance_mode': 'MAINTENANCE_MODE',
    };
    return mapping[key] || null;
  }
}

export const systemSettingsService = new SystemSettingsService();
export default systemSettingsService;
