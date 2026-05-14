/**
 * GraphQL Query Definitions
 *
 * Query operations for fetching data from Unimatrix API
 */

import { gql } from '@apollo/client';

/**
 * Get current authenticated user
 */
export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      tier
      createdAt
      updatedAt
      palaceCount
      memoryCount
      llmUsageMetrics {
        totalTokensUsed
        totalCostUsd
        byProvider {
          provider
          tokensUsed
          costUsd
          requestCount
          avgLatencyMs
        }
        currentMonth {
          month
          tokensUsed
          costUsd
          requestCount
        }
      }
    }
  }
`;

/**
 * Get all palaces for current user
 */
export const GET_PALACES_QUERY = gql`
  query GetPalaces {
    getPalaces {
      id
      userId
      name
      description
      isPublic
      operationalProfile
      createdAt
      updatedAt
      memoryCount
      locations {
        id
        name
        position
        createdAt
      }
      agents {
        id
        agentName
        llmProvider
        lastActivityAt
      }
    }
  }
`;

/**
 * Get specific palace
 */
export const GET_PALACE_QUERY = gql`
  query GetPalace($id: String!) {
    getPalace(id: $id) {
      id
      userId
      name
      description
      isPublic
      operationalProfile
      createdAt
      updatedAt
      memoryCount
      locations {
        id
        parentId
        name
        position
        createdAt
        updatedAt
        memories {
          id
          content
          tags
          llmProvider
          llmModel
          tokensUsed
          latencyMs
          costUsd
          createdAt
          updatedAt
          lastAccessedAt
          createdByAgent
        }
      }
      agents {
        id
        agentName
        agentIdentifier
        llmProvider
        permissions
        memoriesWritten
        memoriesRead
        lastActivityAt
        createdAt
      }
    }
  }
`;

/**
 * Get memories in a specific location
 */
export const GET_MEMORIES_BY_LOCATION_QUERY = gql`
  query GetMemoriesByLocation($locationId: String!) {
    getMemoriesByLocation(locationId: $locationId) {
      id
      locationId
      palaceId
      userId
      content
      tags
      llmProvider
      llmModel
      tokensUsed
      latencyMs
      costUsd
      createdAt
      updatedAt
      lastAccessedAt
      createdByAgent
    }
  }
`;

/**
 * Search memories across all palaces
 */
export const SEARCH_MEMORIES_QUERY = gql`
  query SearchMemories(
    $query: String!
    $palaceId: String
    $tags: [String!]
    $limit: Int
    $offset: Int
  ) {
    searchMemories(
      query: $query
      palaceId: $palaceId
      tags: $tags
      limit: $limit
      offset: $offset
    ) {
      memories {
        id
        locationId
        palaceId
        userId
        content
        tags
        llmProvider
        llmModel
        tokensUsed
        latencyMs
        costUsd
        createdAt
        updatedAt
        lastAccessedAt
        createdByAgent
      }
      totalCount
      hasMore
    }
  }
`;

/**
 * Get LLM usage metrics for current user
 */
export const GET_LLM_USAGE_METRICS_QUERY = gql`
  query GetLLMUsageMetrics {
    getLLMUsageMetrics {
      totalTokensUsed
      totalCostUsd
      byProvider {
        provider
        tokensUsed
        costUsd
        requestCount
        avgLatencyMs
      }
      currentMonth {
        month
        tokensUsed
        costUsd
        requestCount
      }
    }
  }
`;

/**
 * Get agent collaborations for a palace
 */
export const GET_AGENT_COLLABORATIONS_QUERY = gql`
  query GetAgentCollaborations($palaceId: String!) {
    getAgentCollaborations(palaceId: $palaceId) {
      id
      palaceId
      agentName
      agentIdentifier
      llmProvider
      permissions
      memoriesWritten
      memoriesRead
      lastActivityAt
      createdAt
    }
  }
`;

/**
 * Check health of LLM providers
 */
export const CHECK_LLM_PROVIDERS_HEALTH_QUERY = gql`
  query CheckLLMProvidersHealth {
    checkLLMProvidersHealth
  }
`;

/**
 * Get suggested routing strategy for a message
 */
export const SUGGEST_ROUTING_STRATEGY_QUERY = gql`
  query SuggestRoutingStrategy($messageContent: String!) {
    suggestRoutingStrategy(messageContent: $messageContent)
  }
`;
