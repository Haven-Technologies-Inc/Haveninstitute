/**
 * Sentry Error Monitoring Configuration
 *
 * Initializes Sentry for error tracking and performance monitoring
 */

import * as Sentry from '@sentry/node';
import { Express } from 'express';

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
}

// Get Sentry configuration from environment
export function getSentryConfig(): SentryConfig {
  return {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1')
  };
}

// Initialize Sentry
export function initSentry(): void {
  const config = getSentryConfig();

  // Skip initialization if no DSN provided
  if (!config.dsn) {
    console.log('⚠️  Sentry DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,

    // Performance Monitoring
    tracesSampleRate: config.tracesSampleRate,
    profilesSampleRate: config.profilesSampleRate,

    // Integrations
    integrations: [
      // HTTP calls tracing
      Sentry.httpIntegration(),
      // Express middleware tracing
      Sentry.expressIntegration(),
      // Database query tracing
      Sentry.prismaIntegration(),
    ],

    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }

      // Remove sensitive body data
      if (event.request?.data) {
        const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
        const data = typeof event.request.data === 'string'
          ? JSON.parse(event.request.data)
          : event.request.data;

        sensitiveKeys.forEach(key => {
          if (data[key]) {
            data[key] = '[REDACTED]';
          }
        });

        event.request.data = JSON.stringify(data);
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Rate limiting errors
      'Too Many Requests',
      // Authentication errors (expected)
      'Invalid token',
      'Token expired',
      // Network errors
      'Network request failed',
      'Failed to fetch',
      // User-caused errors
      'Validation error',
    ],

    // Add additional context
    beforeBreadcrumb(breadcrumb) {
      // Remove sensitive data from breadcrumbs
      if (breadcrumb.data?.password) {
        breadcrumb.data.password = '[REDACTED]';
      }
      return breadcrumb;
    }
  });

  console.log('✅ Sentry initialized for error monitoring');
}

// Setup Express error handler
export function setupSentryErrorHandler(app: Express): void {
  // The error handler must be before any other error middleware
  Sentry.setupExpressErrorHandler(app);
}

// Setup Express request handler (must be first middleware)
export function setupSentryRequestHandler(app: Express): void {
  Sentry.setupExpressErrorHandler(app);
}

// Capture exception manually
export function captureException(error: Error, context?: Record<string, any>): string {
  if (context) {
    Sentry.setContext('additional', context);
  }
  return Sentry.captureException(error);
}

// Capture message
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): string {
  return Sentry.captureMessage(message, level);
}

// Set user context
export function setUser(user: { id: string; email?: string; role?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role
  });
}

// Clear user context
export function clearUser(): void {
  Sentry.setUser(null);
}

// Add breadcrumb
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

// Start a transaction for performance monitoring
export function startTransaction(name: string, op: string): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({ name, op });
}

// Flush events before shutdown
export async function flushSentry(timeout: number = 2000): Promise<boolean> {
  return Sentry.flush(timeout);
}

export default {
  initSentry,
  setupSentryErrorHandler,
  setupSentryRequestHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
  flushSentry
};
