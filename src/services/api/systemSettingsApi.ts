/**
 * System Settings API Service
 * 
 * Frontend API client for managing admin-configurable system settings
 */

import api from './index';

export interface SystemSetting {
  key: string;
  value: string | null;
  description: string;
  isSecret: boolean;
  isConfigured: boolean;
}

export interface AllSettings {
  stripe: SystemSetting[];
  email: SystemSetting[];
  oauth: SystemSetting[];
  features: SystemSetting[];
}

export interface StripeSettingsUpdate {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  proMonthlyPriceId?: string;
  proYearlyPriceId?: string;
  premiumMonthlyPriceId?: string;
  premiumYearlyPriceId?: string;
}

export interface SettingUpdate {
  key: string;
  value: string | null;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

class SystemSettingsApi {
  private basePath = '/admin/settings';

  /**
   * Get all system settings
   */
  async getAllSettings(): Promise<AllSettings> {
    const response = await api.get<{ data: AllSettings }>(this.basePath);
    return response.data.data;
  }

  /**
   * Get Stripe settings
   */
  async getStripeSettings(): Promise<SystemSetting[]> {
    const response = await api.get<{ data: SystemSetting[] }>(`${this.basePath}/stripe`);
    return response.data.data;
  }

  /**
   * Update Stripe settings
   */
  async updateStripeSettings(settings: StripeSettingsUpdate): Promise<void> {
    await api.put(`${this.basePath}/stripe`, settings);
  }

  /**
   * Test Stripe connection
   */
  async testStripeConnection(): Promise<ConnectionTestResult> {
    const response = await api.post<{ data: ConnectionTestResult }>(`${this.basePath}/stripe/test`);
    return response.data.data;
  }

  /**
   * Get email settings
   */
  async getEmailSettings(): Promise<SystemSetting[]> {
    const response = await api.get<{ data: SystemSetting[] }>(`${this.basePath}/email`);
    return response.data.data;
  }

  /**
   * Update email settings
   */
  async updateEmailSettings(settings: SettingUpdate[]): Promise<void> {
    await api.put(`${this.basePath}/email`, { settings });
  }

  /**
   * Get OAuth settings
   */
  async getOAuthSettings(): Promise<SystemSetting[]> {
    const response = await api.get<{ data: SystemSetting[] }>(`${this.basePath}/oauth`);
    return response.data.data;
  }

  /**
   * Update OAuth settings
   */
  async updateOAuthSettings(settings: SettingUpdate[]): Promise<void> {
    await api.put(`${this.basePath}/oauth`, { settings });
  }

  /**
   * Get feature flags
   */
  async getFeatureFlags(): Promise<SystemSetting[]> {
    const response = await api.get<{ data: SystemSetting[] }>(`${this.basePath}/features`);
    return response.data.data;
  }

  /**
   * Update feature flags
   */
  async updateFeatureFlags(settings: SettingUpdate[]): Promise<void> {
    await api.put(`${this.basePath}/features`, { settings });
  }

  /**
   * Update a single setting
   */
  async updateSetting(key: string, value: string | null): Promise<void> {
    await api.put(`${this.basePath}/${key}`, { value });
  }

  /**
   * Initialize default settings
   */
  async initializeSettings(): Promise<void> {
    await api.post(`${this.basePath}/initialize`);
  }
}

export const systemSettingsApi = new SystemSettingsApi();
export default systemSettingsApi;
