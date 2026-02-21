import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number }> = {};
  let healthy = true;

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'connected', latencyMs: Date.now() - dbStart };
  } catch {
    checks.database = { status: 'disconnected', latencyMs: Date.now() - dbStart };
    healthy = false;
  }

  // Stripe check (env only - no API call for health)
  checks.stripe = {
    status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
  };

  // AI provider check
  checks.ai = {
    status:
      process.env.OPENAI_API_KEY || process.env.GROK_API_KEY
        ? 'configured'
        : 'not_configured',
  };

  // Email check
  checks.email = {
    status:
      process.env.ZEPTOMAIL_HOST && process.env.ZEPTOMAIL_USER
        ? 'configured'
        : 'not_configured',
  };

  // SMS check
  checks.sms = {
    status:
      process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ? 'configured'
        : 'not_configured',
  };

  const response = {
    success: healthy,
    status: healthy ? 'healthy' : 'degraded',
    version: process.env.npm_package_version ?? '2.0.0',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: checks,
  };

  return NextResponse.json(response, { status: healthy ? 200 : 503 });
}
