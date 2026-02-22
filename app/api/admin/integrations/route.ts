import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

interface EnvVarStatus {
  name: string;
  isSet: boolean;
  maskedValue: string | null;
}

interface IntegrationStatus {
  service: string;
  label: string;
  description: string;
  category: string;
  status: 'connected' | 'not_configured' | 'error';
  envVars: EnvVarStatus[];
  lastTested: string | null;
  lastTestResult: string | null;
}

function maskValue(value: string | undefined): string | null {
  if (!value) return null;
  if (value.length <= 8) return '****';
  return `${value.slice(0, 4)}${'*'.repeat(Math.min(value.length - 8, 20))}${value.slice(-4)}`;
}

function checkEnvVar(name: string): EnvVarStatus {
  const value = process.env[name];
  return {
    name,
    isSet: !!value && value.trim().length > 0,
    maskedValue: maskValue(value),
  };
}

function getIntegrationStatus(envVars: EnvVarStatus[]): 'connected' | 'not_configured' | 'error' {
  const allSet = envVars.every((v) => v.isSet);
  const someSet = envVars.some((v) => v.isSet);

  if (allSet) return 'connected';
  if (someSet) return 'error'; // partially configured
  return 'not_configured';
}

function getAllIntegrations(): IntegrationStatus[] {
  const stripeVars = [
    checkEnvVar('STRIPE_SECRET_KEY'),
    checkEnvVar('STRIPE_PUBLISHABLE_KEY'),
    checkEnvVar('STRIPE_WEBHOOK_SECRET'),
  ];

  const openaiVars = [
    checkEnvVar('OPENAI_API_KEY'),
    checkEnvVar('OPENAI_MODEL'),
  ];

  const grokVars = [
    checkEnvVar('GROK_API_KEY'),
    checkEnvVar('GROK_API_BASE'),
    checkEnvVar('GROK_MODEL'),
  ];

  const twilioVars = [
    checkEnvVar('TWILIO_ACCOUNT_SID'),
    checkEnvVar('TWILIO_AUTH_TOKEN'),
    checkEnvVar('TWILIO_PHONE_NUMBER'),
  ];

  const zeptomailVars = [
    checkEnvVar('ZEPTOMAIL_HOST'),
    checkEnvVar('ZEPTOMAIL_USER'),
    checkEnvVar('ZEPTOMAIL_PASSWORD'),
  ];

  const googleVars = [
    checkEnvVar('GOOGLE_CLIENT_ID'),
    checkEnvVar('GOOGLE_CLIENT_SECRET'),
  ];

  const databaseVars = [
    checkEnvVar('DATABASE_URL'),
  ];

  return [
    {
      service: 'stripe',
      label: 'Stripe',
      description: 'Payment processing for subscriptions and one-time purchases',
      category: 'Payments',
      status: getIntegrationStatus(stripeVars),
      envVars: stripeVars,
      lastTested: null,
      lastTestResult: null,
    },
    {
      service: 'openai',
      label: 'OpenAI',
      description: 'Primary AI provider for chat completions and content generation',
      category: 'AI Chat - Primary',
      status: getIntegrationStatus(openaiVars),
      envVars: openaiVars,
      lastTested: null,
      lastTestResult: null,
    },
    {
      service: 'grok',
      label: 'Grok / xAI',
      description: 'Fallback AI provider using xAI models',
      category: 'AI Chat - Fallback',
      status: getIntegrationStatus(grokVars),
      envVars: grokVars,
      lastTested: null,
      lastTestResult: null,
    },
    {
      service: 'twilio',
      label: 'Twilio',
      description: 'SMS messaging for notifications and verification codes',
      category: 'SMS',
      status: getIntegrationStatus(twilioVars),
      envVars: twilioVars,
      lastTested: null,
      lastTestResult: null,
    },
    {
      service: 'zeptomail',
      label: 'Zeptomail',
      description: 'Transactional email delivery service via SMTP',
      category: 'Email',
      status: getIntegrationStatus(zeptomailVars),
      envVars: zeptomailVars,
      lastTested: null,
      lastTestResult: null,
    },
    {
      service: 'google',
      label: 'Google OAuth',
      description: 'Allow users to sign in with their Google accounts',
      category: 'Authentication',
      status: getIntegrationStatus(googleVars),
      envVars: googleVars,
      lastTested: null,
      lastTestResult: null,
    },
    {
      service: 'database',
      label: 'Database',
      description: 'PostgreSQL database for application data storage',
      category: 'PostgreSQL',
      status: getIntegrationStatus(databaseVars),
      envVars: databaseVars,
      lastTested: null,
      lastTestResult: null,
    },
  ];
}

async function testStripe(): Promise<{ success: boolean; message: string }> {
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil' as any,
    });
    await stripe.customers.list({ limit: 1 });
    return { success: true, message: 'Successfully connected to Stripe API' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Stripe' };
  }
}

async function testOpenAI(): Promise<{ success: boolean; message: string }> {
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Say "ok"' }],
      max_tokens: 5,
    });
    return { success: true, message: `Successfully connected to OpenAI (model: ${model})` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to OpenAI' };
  }
}

async function testGrok(): Promise<{ success: boolean; message: string }> {
  try {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: process.env.GROK_API_BASE || 'https://api.x.ai/v1',
    });
    const model = process.env.GROK_MODEL || 'grok-3-mini';
    await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Say "ok"' }],
      max_tokens: 5,
    });
    return { success: true, message: `Successfully connected to xAI (model: ${model})` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to xAI/Grok' };
  }
}

async function testTwilio(): Promise<{ success: boolean; message: string }> {
  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.api.accounts.list({ limit: 1 });
    return { success: true, message: 'Successfully connected to Twilio API' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Twilio' };
  }
}

async function testZeptomail(): Promise<{ success: boolean; message: string }> {
  try {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      host: process.env.ZEPTOMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.ZEPTOMAIL_USER,
        pass: process.env.ZEPTOMAIL_PASSWORD,
      },
    });
    await transporter.verify();
    return { success: true, message: 'Successfully verified SMTP connection to Zeptomail' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to verify Zeptomail SMTP connection' };
  }
}

async function testDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: 'Successfully connected to PostgreSQL database' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to database' };
  }
}

async function testGoogle(): Promise<{ success: boolean; message: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (clientId && clientSecret) {
    return { success: true, message: 'Google OAuth credentials are configured (cannot test without redirect)' };
  }
  return { success: false, message: 'Google OAuth credentials are not fully configured' };
}

export async function GET() {
  try {
    await requireAdmin();
    const integrations = getAllIntegrations();

    const totalCount = integrations.length;
    const connectedCount = integrations.filter((i) => i.status === 'connected').length;
    const attentionCount = integrations.filter((i) => i.status !== 'connected').length;

    return successResponse({
      integrations,
      summary: {
        total: totalCount,
        connected: connectedCount,
        needsAttention: attentionCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { service, action } = body;

    if (action !== 'test') {
      return errorResponse('Invalid action. Only "test" is supported.', 400);
    }

    if (!service) {
      return errorResponse('Service name is required', 400);
    }

    let result: { success: boolean; message: string };

    switch (service) {
      case 'stripe':
        result = await testStripe();
        break;
      case 'openai':
        result = await testOpenAI();
        break;
      case 'grok':
        result = await testGrok();
        break;
      case 'twilio':
        result = await testTwilio();
        break;
      case 'zeptomail':
        result = await testZeptomail();
        break;
      case 'database':
        result = await testDatabase();
        break;
      case 'google':
        result = await testGoogle();
        break;
      default:
        return errorResponse(`Unknown service: ${service}`, 400);
    }

    return successResponse({
      service,
      tested: true,
      testedAt: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
