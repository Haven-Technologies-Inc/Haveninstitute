import twilio from 'twilio';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const APP_NAME = 'Haven Institute';
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://haveninstitute.com';

// Twilio client (lazy-initialized singleton)
let _client: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio | null {
  if (_client) return _client;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('[SMS] Twilio is not configured. SMS messages will be logged to console.');
    return null;
  }

  _client = twilio(accountSid, authToken);
  return _client;
}

function getFromNumber(): string {
  return process.env.TWILIO_PHONE_NUMBER ?? '';
}

// ---------------------------------------------------------------------------
// Core SMS sender
// ---------------------------------------------------------------------------

export async function sendSMS(
  to: string,
  body: string
): Promise<boolean> {
  const client = getTwilioClient();
  const from = getFromNumber();

  if (!client || !from) {
    console.log(`[SMS] (dev) Would send to: ${to}`);
    console.log(`[SMS] (dev) Body: ${body}`);
    return false;
  }

  try {
    const message = await client.messages.create({
      body,
      from,
      to,
    });

    console.log(`[SMS] Sent to ${to}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error(`[SMS] Failed to send to ${to}:`, error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Verification SMS
// ---------------------------------------------------------------------------

export async function sendVerificationSMS(
  phone: string,
  code: string
): Promise<boolean> {
  const body = `${APP_NAME}: Your verification code is ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;
  return sendSMS(phone, body);
}

// ---------------------------------------------------------------------------
// Welcome SMS
// ---------------------------------------------------------------------------

export async function sendWelcomeSMS(
  phone: string,
  name: string
): Promise<boolean> {
  const body = `Welcome to ${APP_NAME}, ${name}! Your NCLEX prep journey starts now. Log in at ${APP_URL}/dashboard to get started.`;
  return sendSMS(phone, body);
}
