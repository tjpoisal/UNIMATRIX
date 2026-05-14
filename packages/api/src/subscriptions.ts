/**
 * GraphQL Subscription Definitions
 *
 * Subscription operations for real-time updates from Unimatrix API
 * Uses AppSync WebSocket subscriptions for live data
 */

import { gql } from '@apollo/client';

/**
 * Subscribe to memory creation events
 */
export const ON_CREATE_MEMORY_SUBSCRIPTION = gql`
  subscription OnCreateMemory($palaceId: String!) {
    onCreateMemory(palaceId: $palaceId) {
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
 * Subscribe to memory update events
 */
export const ON_UPDATE_MEMORY_SUBSCRIPTION = gql`
  subscription OnUpdateMemory($palaceId: String!) {
    onUpdateMemory(palaceId: $palaceId) {
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
 * Subscribe to memory deletion events
 */
export const ON_DELETE_MEMORY_SUBSCRIPTION = gql`
  subscription OnDeleteMemory($palaceId: String!) {
    onDeleteMemory(palaceId: $palaceId) {
      id
      locationId
      palaceId
      userId
      content
      tags
      createdAt
      updatedAt
    }
  }
`;

/**
 * Subscribe to palace sync events
 */
export const ON_PALACE_SYNC_SUBSCRIPTION = gql`
  subscription OnPalaceSync($palaceId: String!) {
    onPalaceSync(palaceId: $palaceId) {
      success
      syncedMemories
      syncedLocations
      syncedPalaces
      timestamp
    }
  }
`;

/**
 * Subscribe to agent activity
 */
export const ON_AGENT_ACTIVITY_SUBSCRIPTION = gql`
  subscription OnAgentActivity($palaceId: String!) {
    onAgentActivity(palaceId: $palaceId) {
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
 * Subscribe to real-time LLM completion streams
 */
export const ON_LLM_STREAM_CHUNK_SUBSCRIPTION = gql`
  subscription OnLLMStreamChunk($requestId: String!) {
    onLLMStreamChunk(requestId: $requestId)
  }
`;
