/**
 * Environment Configuration Utility
 * Validates required environment variables at startup
 * Prevents hardcoded fallbacks in production
 */

interface EnvConfig {
  // API Configuration
  VITE_API_URL: string;
  VITE_WS_URL: string;
  
  // Feature Flags
  VITE_ENABLE_AI_CHAT?: string;
  VITE_ENABLE_PAYMENTS?: string;
  VITE_ENABLE_ANALYTICS?: string;
  
  // Third-party
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  
  // Environment
  VITE_APP_ENV?: string;
}

class EnvironmentConfig {
  private config: EnvConfig;
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
    this.config = this.loadConfig();
    this.validate();
  }

  private loadConfig(): EnvConfig {
    return {
      VITE_API_URL: import.meta.env.VITE_API_URL || '',
      VITE_WS_URL: import.meta.env.VITE_WS_URL || '',
      VITE_ENABLE_AI_CHAT: import.meta.env.VITE_ENABLE_AI_CHAT,
      VITE_ENABLE_PAYMENTS: import.meta.env.VITE_ENABLE_PAYMENTS,
      VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
      VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      VITE_APP_ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE
    };
  }

  private validate(): void {
    const requiredVars = ['VITE_API_URL'];
    const missing: string[] = [];

    for (const varName of requiredVars) {
      const value = this.config[varName as keyof EnvConfig];
      if (!value || value.includes('localhost')) {
        if (this.isProduction) {
          missing.push(varName);
        }
      }
    }

    if (missing.length > 0 && this.isProduction) {
      throw new Error(
        `Missing or invalid required environment variables in production: ${missing.join(', ')}. ` +
        `Please check your .env.production file.`
      );
    }

    // Warn about localhost in non-production
    if (!this.isProduction) {
      const localhostVars = Object.entries(this.config)
        .filter(([_, value]) => typeof value === 'string' && value.includes('localhost'))
        .map(([key]) => key);

      if (localhostVars.length > 0) {
        console.warn(
          `[Haven] Development mode: Using localhost for ${localhostVars.join(', ')}`
        );
      }
    }
  }

  get apiUrl(): string {
    if (!this.config.VITE_API_URL) {
      if (this.isProduction) {
        throw new Error('VITE_API_URL is required in production');
      }
      return 'http://localhost:3001/api/v1';
    }
    return this.config.VITE_API_URL;
  }

  get wsUrl(): string {
    if (!this.config.VITE_WS_URL) {
      if (this.isProduction) {
        throw new Error('VITE_WS_URL is required in production');
      }
      return 'http://localhost:3001';
    }
    return this.config.VITE_WS_URL;
  }

  get stripePublishableKey(): string | undefined {
    return this.config.VITE_STRIPE_PUBLISHABLE_KEY;
  }

  get isAIChatEnabled(): boolean {
    return this.config.VITE_ENABLE_AI_CHAT !== 'false';
  }

  get isPaymentsEnabled(): boolean {
    return this.config.VITE_ENABLE_PAYMENTS !== 'false';
  }

  get isAnalyticsEnabled(): boolean {
    return this.config.VITE_ENABLE_ANALYTICS !== 'false';
  }

  get environment(): string {
    return this.config.VITE_APP_ENV || 'development';
  }

  get isDevelopment(): boolean {
    return !this.isProduction;
  }
}

// Singleton instance
export const env = new EnvironmentConfig();

// Default export
export default env;
