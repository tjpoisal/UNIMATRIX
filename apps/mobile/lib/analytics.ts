/**
 * PostHog Analytics for React Native
 * 
 * Tracks user events and screen views for product analytics.
 */

import PostHog from 'posthog-react-native';

let posthog: PostHog | null = null;

export function initAnalytics() {
  if (!process.env.EXPO_PUBLIC_POSTHOG_KEY) {
    console.log('[Analytics] POSTHOG_KEY not set, skipping analytics initialization');
    return;
  }

  posthog = PostHog.init(process.env.EXPO_PUBLIC_POSTHOG_KEY, {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    captureApplicationLifecycleEvents: true,
    captureDeepLinks: true,
    captureScreenViews: true,
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

export function trackScreenView(screenName: string) {
  if (!posthog) return;
  posthog.screen(screenName);
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
  
  // OAuth events
  OAUTH_GOOGLE: 'oauth_google',
  OAUTH_GITHUB: 'oauth_github',
  
  // Sync events
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
} as const;
