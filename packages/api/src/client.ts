/**
 * Apollo GraphQL Client Configuration
 *
 * Sets up Apollo Client with:
 * - AppSync endpoint
 * - WebSocket subscription support
 * - Cognito authentication
 * - Error handling and retry logic
 * - Cache management
 */

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
  concat,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient as createWsClient } from 'graphql-ws';
import { getCognitoToken, refreshCognitoToken } from './auth.js';

let apolloClient: ApolloClient<any> | null = null;

/**
 * Create or retrieve Apollo Client instance
 */
export function getApolloClient(graphqlEndpoint: string): ApolloClient<any> {
  if (apolloClient) {
    return apolloClient;
  }

  const httpLink = new HttpLink({
    uri: graphqlEndpoint,
    credentials: 'include',
    fetchOptions: {
      mode: 'cors',
    },
  });

  // WebSocket link for subscriptions
  const wsLink = new GraphQLWsLink(
    createWsClient({
      url: graphqlEndpoint.replace(/^https?/, 'wss'),
      connectionParams: async () => {
        const token = await getCognitoToken();
        return {
          authorization: `Bearer ${token}`,
        };
      },
      retryAttempts: 5,
      shouldRetry: () => true,
    })
  );

  // Auth link - adds Cognito token to each request
  const authLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      let handle: any;
      Promise.resolve()
        .then(async () => {
          const token = await getCognitoToken();
          operation.setContext({
            headers: {
              authorization: `Bearer ${token}`,
            },
          });
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: async (err) => {
              if (err?.graphQLErrors?.[0]?.extensions?.code === 'UNAUTHENTICATED') {
                // Token expired, try to refresh
                try {
                  await refreshCognitoToken();
                  const newToken = await getCognitoToken();
                  operation.setContext({
                    headers: {
                      authorization: `Bearer ${newToken}`,
                    },
                  });
                  forward(operation).subscribe(observer);
                } catch (refreshErr) {
                  observer.error(refreshErr);
                }
              } else {
                observer.error(err);
              }
            },
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    });
  });

  // Split traffic: subscriptions go to WebSocket, queries/mutations to HTTP
  const splitLink = new ApolloLink.from([
    new ApolloLink(({ query }, forward) => {
      const definition = getMainDefinition(query);
      if (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      ) {
        return wsLink.request({ query, variables: {} } as any);
      }
      return forward({ query } as any);
    }),
    authLink,
    httpLink,
  ]);

  apolloClient = new ApolloClient({
    ssrMode: false,
    link: splitLink,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getPalaces: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            searchMemories: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
        Memory: {
          keyFields: ['id'],
        },
        Palace: {
          keyFields: ['id'],
        },
        Location: {
          keyFields: ['id'],
        },
      },
    }),
  });

  return apolloClient;
}

/**
 * Reset Apollo Client (useful for logout)
 */
export async function resetApolloClient(): Promise<void> {
  if (apolloClient) {
    await apolloClient.clearStore();
    apolloClient = null;
  }
}

/**
 * Get current Apollo Client instance
 */
export function getCurrentApolloClient(): ApolloClient<any> | null {
  return apolloClient;
}
