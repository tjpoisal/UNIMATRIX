/**
 * PostHog Analytics for Web
 * 
 * Tracks user events and page views for product analytics.
 */

import PostHog from 'posthog-js';

let posthog: PostHog | null = null;

export function initAnalytics() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.log('[Analytics] POSTHOG_KEY not set, skipping analytics initialization');
    return;
  }

  posthog = PostHog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // We'll track events manually
    loaded: (ph) => {
      ph.register({
        platform: 'web',
      });
    },
  });

  console.log('[Analytics] PostHog initialized');
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!posthog) return;
  posthog.capture(eventName, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (!posthog) return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (!posthog) return;
  posthog.reset();
}

export function trackPageView(page: string) {
  if (!posthog) return;
  posthog.capture('$pageview', { $current_url: page });
}

// Key events to track
export const AnalyticsEvents = {
  // Auth events
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PASSWORD_RESET: 'password_reset',
  
  // Onboarding events
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  
  // Memory events
  MEMORY_CREATED: 'memory_created',
  MEMORY_VIEWED: 'memory_viewed',
  MEMORY_SEARCHED: 'memory_searched',
  MEMORY_DELETED: 'memory_deleted',
  
  // Palace events
  PALACE_CREATED: 'palace_created',
  PALACE_DELETED: 'palace_deleted',
  PALACE_SHARED: 'palace_shared',
  
  // LLM events
  LLM_PROVIDER_CONNECTED: 'llm_provider_connected',
  LLM_PROVIDER_DISCONNECTED: 'llm_provider_disconnected',
  MCP_TOKEN_CREATED: 'mcp_token_created',
  MCP_TOKEN_REVOKED: 'mcp_token_revoked',
  
  // MCP events
  MCP_CALLED: 'mcp_called',
  MCP_REMEMBER: 'mcp_remember',
  MCP_RECALL: 'mcp_recall',
  MCP_LIST_CONTEXTS: 'mcp_list_contexts',
  
  // Subscription events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  
  // Collab events
  COLLAB_ROOM_CREATED: 'collab_room_created',
  COLAB_ROOM_JOINED: 'collab_room_joined',
  COLAB_MESSAGE_SENT: 'collab_message_sent',
} as const;
