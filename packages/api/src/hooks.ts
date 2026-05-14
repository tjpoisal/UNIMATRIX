/**
 * React Hooks for Unimatrix API
 *
 * Provides convenient hooks for React components to:
 * - Use Apollo queries and mutations
 * - Subscribe to real-time updates
 * - Manage authentication state
 * - Handle loading and error states
 */

import { useContext, useMemo } from 'react';
import { useQuery, useMutation, useSubscription, ApolloClient } from '@apollo/client';
import type { DocumentNode } from 'graphql';

/**
 * Create context and hook for Apollo Client
 */
let ApolloClientContext: React.Context<ApolloClient<any> | null>;

try {
  ApolloClientContext = require('react').createContext<ApolloClient<any> | null>(
    null
  );
} catch {
  // In non-React environments, create a placeholder
  ApolloClientContext = { Provider: null } as any;
}

/**
 * Hook to use Apollo Client from context
 */
export function useApolloClient(): ApolloClient<any> | null {
  try {
    return useContext(ApolloClientContext);
  } catch {
    return null;
  }
}

/**
 * Wrapper hook for GraphQL queries
 */
export function useUnimatrixQuery<T = any, V = any>(
  query: DocumentNode,
  variables?: V,
  options?: any
) {
  return useQuery<T, V>(query, {
    variables,
    ...options,
  });
}

/**
 * Wrapper hook for GraphQL mutations
 */
export function useUnimatrixMutation<T = any, V = any>(
  mutation: DocumentNode,
  options?: any
) {
  return useMutation<T, V>(mutation, options);
}

/**
 * Wrapper hook for GraphQL subscriptions
 */
export function useUnimatrixSubscription<T = any, V = any>(
  subscription: DocumentNode,
  variables?: V,
  options?: any
) {
  return useSubscription<T, V>(subscription, {
    variables,
    ...options,
  });
}

/**
 * Combined hook for API operations
 */
export function useUnimatrixApi() {
  const client = useApolloClient();

  return useMemo(
    () => ({
      client,
      useQuery: useUnimatrixQuery,
      useMutation: useUnimatrixMutation,
      useSubscription: useUnimatrixSubscription,
      isReady: !!client,
    }),
    [client]
  );
}

/**
 * Hook for memory creation with LLM integration
 */
export function useCreateMemoryWithLLM() {
  return useUnimatrixMutation(require('./mutations.js').CREATE_MEMORY_MUTATION);
}

/**
 * Hook for palace sync
 */
export function useSyncPalaces() {
  return useUnimatrixMutation(require('./mutations.js').SYNC_PALACES_MUTATION);
}

/**
 * Hook for LLM completion
 */
export function useCompleteLLMMessage() {
  return useUnimatrixMutation(
    require('./mutations.js').COMPLETE_LLM_MESSAGE_MUTATION
  );
}

/**
 * Hook for subscribing to memory updates
 */
export function useMemoryUpdates(palaceId: string) {
  return {
    onCreate: useUnimatrixSubscription(
      require('./subscriptions.js').ON_CREATE_MEMORY_SUBSCRIPTION,
      { palaceId }
    ),
    onUpdate: useUnimatrixSubscription(
      require('./subscriptions.js').ON_UPDATE_MEMORY_SUBSCRIPTION,
      { palaceId }
    ),
    onDelete: useUnimatrixSubscription(
      require('./subscriptions.js').ON_DELETE_MEMORY_SUBSCRIPTION,
      { palaceId }
    ),
  };
}

/**
 * Hook for subscribing to palace sync
 */
export function usePalaceSync(palaceId: string) {
  return useUnimatrixSubscription(
    require('./subscriptions.js').ON_PALACE_SYNC_SUBSCRIPTION,
    { palaceId }
  );
}

/**
 * Hook for fetching palaces
 */
export function usePalaces() {
  return useUnimatrixQuery(require('./queries.js').GET_PALACES_QUERY);
}

/**
 * Hook for fetching specific palace
 */
export function usePalace(palaceId: string) {
  return useUnimatrixQuery(
    require('./queries.js').GET_PALACE_QUERY,
    { id: palaceId }
  );
}

/**
 * Hook for searching memories
 */
export function useSearchMemories(
  query: string,
  options?: { palaceId?: string; tags?: string[]; limit?: number; offset?: number }
) {
  return useUnimatrixQuery(
    require('./queries.js').SEARCH_MEMORIES_QUERY,
    { query, ...options },
    { skip: !query } // Skip query if search term is empty
  );
}

/**
 * Hook for LLM metrics
 */
export function useLLMMetrics() {
  return useUnimatrixQuery(require('./queries.js').GET_LLM_USAGE_METRICS_QUERY);
}

/**
 * Hook for agent collaborations
 */
export function useAgentCollaborations(palaceId: string) {
  return useUnimatrixQuery(
    require('./queries.js').GET_AGENT_COLLABORATIONS_QUERY,
    { palaceId }
  );
}

/**
 * Hook for checking LLM provider health
 */
export function useLLMProvidersHealth() {
  return useUnimatrixQuery(
    require('./queries.js').CHECK_LLM_PROVIDERS_HEALTH_QUERY
  );
}

/**
 * Hook for getting current user
 */
export function useCurrentUser() {
  return useUnimatrixQuery(require('./queries.js').ME_QUERY);
}

/**
 * Hook for updating subscription
 */
export function useUpdateSubscription() {
  return useUnimatrixMutation(
    require('./mutations.js').UPDATE_SUBSCRIPTION_MUTATION
  );
}

/**
 * Hook for exporting palace
 */
export function useExportPalace() {
  return useUnimatrixMutation(require('./mutations.js').EXPORT_PALACE_MUTATION);
}

/**
 * Hook for importing palace
 */
export function useImportPalace() {
  return useUnimatrixMutation(require('./mutations.js').IMPORT_PALACE_MUTATION);
}
