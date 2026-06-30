/**
 * Sentry Error Tracking for MCP Server
 */

import * as Sentry from '@sentry/node';

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.log('[Sentry] SENTRY_DSN not set, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      // Add any server-specific integrations here
    ],

    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      
      // Filter out PII from user context
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      return event;
    },
  });

  console.log('[Sentry] Initialized');
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, { level });
}
