/**
 * Environment variable validation for production readiness.
 * Import this in instrumentation.ts or the root layout to validate on startup.
 */

type EnvVar = {
  key: string;
  required: boolean;
  description: string;
};

const ENV_VARS: EnvVar[] = [
  // Core
  { key: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },
  { key: 'NEXTAUTH_URL', required: true, description: 'Application base URL' },
  { key: 'NEXTAUTH_SECRET', required: true, description: 'NextAuth.js encryption secret' },

  // Stripe
  { key: 'STRIPE_SECRET_KEY', required: true, description: 'Stripe secret API key' },
  { key: 'STRIPE_PUBLISHABLE_KEY', required: true, description: 'Stripe publishable API key' },
  { key: 'STRIPE_WEBHOOK_SECRET', required: true, description: 'Stripe webhook signing secret' },

  // AI
  { key: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key for AI tutor' },
  { key: 'GROK_API_KEY', required: false, description: 'Grok/xAI API key (fallback AI)' },

  // Email
  { key: 'ZEPTOMAIL_HOST', required: false, description: 'Zeptomail SMTP host' },
  { key: 'ZEPTOMAIL_USER', required: false, description: 'Zeptomail SMTP username' },
  { key: 'ZEPTOMAIL_PASSWORD', required: false, description: 'Zeptomail SMTP password' },

  // SMS
  { key: 'TWILIO_ACCOUNT_SID', required: false, description: 'Twilio Account SID' },
  { key: 'TWILIO_AUTH_TOKEN', required: false, description: 'Twilio Auth Token' },
  { key: 'TWILIO_PHONE_NUMBER', required: false, description: 'Twilio sending phone number' },

  // OAuth
  { key: 'GOOGLE_CLIENT_ID', required: false, description: 'Google OAuth Client ID' },
  { key: 'GOOGLE_CLIENT_SECRET', required: false, description: 'Google OAuth Client Secret' },
];

export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.key];
    if (!value || value.trim() === '') {
      if (envVar.required) {
        errors.push(`Missing required env var: ${envVar.key} (${envVar.description})`);
      } else {
        warnings.push(`Optional env var not set: ${envVar.key} (${envVar.description})`);
      }
    }
  }

  // Validate specific formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function logEnvStatus(): void {
  const { valid, errors, warnings } = validateEnv();

  if (errors.length > 0) {
    console.error('\n[ENV] Configuration errors:');
    errors.forEach((e) => console.error(`  - ${e}`));
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('\n[ENV] Configuration warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (valid) {
    console.log('[ENV] All required environment variables are configured.');
  }
}
