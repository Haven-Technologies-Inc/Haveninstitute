/**
 * SystemSettings Model
 * 
 * Stores admin-configurable system settings like API keys, feature flags, etc.
 * Settings are encrypted for sensitive values like API keys.
 */

import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import crypto from 'crypto';

// Encryption key from environment (or generate one)
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

// Setting categories for organization
export type SettingCategory = 'stripe' | 'email' | 'oauth' | 'features' | 'general';

// Known setting keys for type safety
export type SettingKey = 
  // Stripe settings
  | 'stripe_secret_key'
  | 'stripe_publishable_key'
  | 'stripe_webhook_secret'
  | 'stripe_pro_monthly_price_id'
  | 'stripe_pro_yearly_price_id'
  | 'stripe_premium_monthly_price_id'
  | 'stripe_premium_yearly_price_id'
  // Email settings
  | 'smtp_host'
  | 'smtp_port'
  | 'smtp_user'
  | 'smtp_password'
  | 'email_from'
  // OAuth settings
  | 'google_client_id'
  | 'google_client_secret'
  // Feature flags
  | 'enable_payments'
  | 'enable_ai_chat'
  | 'enable_email'
  | 'maintenance_mode'
  // General
  | string;

@Table({
  tableName: 'system_settings',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['key'] },
    { fields: ['category'] },
  ],
})
export class SystemSettings extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare key: SettingKey;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare value: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'general',
  })
  declare category: SettingCategory;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isEncrypted: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isSecret: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Encrypt a value
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  // Decrypt a value
  static decrypt(text: string): string {
    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts.shift()!, 'hex');
      const encryptedText = Buffer.from(parts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch {
      return text; // Return as-is if decryption fails
    }
  }

  // Get a setting value (decrypted if needed)
  static async getValue(key: SettingKey, defaultValue?: string): Promise<string | null> {
    const setting = await SystemSettings.findOne({ where: { key } });
    if (!setting || setting.value === null) {
      return defaultValue ?? null;
    }
    return setting.isEncrypted ? SystemSettings.decrypt(setting.value) : setting.value;
  }

  // Set a setting value (encrypts if marked as secret)
  static async setValue(
    key: SettingKey, 
    value: string | null, 
    options?: { 
      category?: SettingCategory; 
      description?: string; 
      isSecret?: boolean;
    }
  ): Promise<SystemSettings> {
    const isSecret = options?.isSecret ?? false;
    const encryptedValue = value && isSecret ? SystemSettings.encrypt(value) : value;

    const [setting] = await SystemSettings.upsert({
      key,
      value: encryptedValue,
      category: options?.category ?? 'general',
      description: options?.description,
      isEncrypted: isSecret && value !== null,
      isSecret,
    });

    return setting;
  }

  // Get all settings by category
  static async getByCategory(category: SettingCategory): Promise<Record<string, string | null>> {
    const settings = await SystemSettings.findAll({ where: { category } });
    const result: Record<string, string | null> = {};
    
    for (const setting of settings) {
      if (setting.value === null) {
        result[setting.key] = null;
      } else {
        result[setting.key] = setting.isEncrypted 
          ? SystemSettings.decrypt(setting.value) 
          : setting.value;
      }
    }
    
    return result;
  }

  // Get all settings (for admin, masks secrets)
  static async getAllForAdmin(): Promise<Array<{
    key: string;
    value: string | null;
    category: string;
    description: string | null;
    isSecret: boolean;
  }>> {
    const settings = await SystemSettings.findAll({ order: [['category', 'ASC'], ['key', 'ASC']] });
    
    return settings.map(setting => ({
      key: setting.key,
      value: setting.isSecret && setting.value ? '••••••••' : setting.value,
      category: setting.category,
      description: setting.description,
      isSecret: setting.isSecret,
    }));
  }

  // Bulk upsert settings
  static async bulkSet(
    settings: Array<{ key: SettingKey; value: string | null; isSecret?: boolean }>,
    category: SettingCategory
  ): Promise<void> {
    for (const { key, value, isSecret } of settings) {
      await SystemSettings.setValue(key, value, { category, isSecret });
    }
  }
}

export default SystemSettings;
