/**
 * @unimatrix/api
 *
 * Apollo GraphQL client with AppSync + Cognito integration
 * Handles:
 * - Real-time subscriptions via WebSocket
 * - Cognito authentication with token refresh
 * - Offline queue and sync
 * - Error handling and retry logic
 */

export * from './client.js';
export * from './subscriptions.js';
export * from './mutations.js';
export * from './queries.js';
export * from './auth.js';
export { useUnimatrixApi } from './hooks.js';
