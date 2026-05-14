/**
 * GraphQL Mutation Definitions
 *
 * Mutation operations for modifying data in Unimatrix API
 */

import { gql } from '@apollo/client';

/**
 * Create a new memory palace
 */
export const CREATE_PALACE_MUTATION = gql`
  mutation CreatePalace($input: CreatePalaceInput!) {
    createPalace(input: $input) {
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
      }
    }
  }
`;

/**
 * Update an existing palace
 */
export const UPDATE_PALACE_MUTATION = gql`
  mutation UpdatePalace($input: UpdatePalaceInput!) {
    updatePalace(input: $input) {
      id
      userId
      name
      description
      isPublic
      operationalProfile
      updatedAt
    }
  }
`;

/**
 * Delete a palace
 */
export const DELETE_PALACE_MUTATION = gql`
  mutation DeletePalace($palaceId: String!) {
    deletePalace(palaceId: $palaceId)
  }
`;

/**
 * Create a location (folder) within a palace
 */
export const CREATE_LOCATION_MUTATION = gql`
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      id
      palaceId
      parentId
      name
      position
      createdAt
      updatedAt
    }
  }
`;

/**
 * Update a location
 */
export const UPDATE_LOCATION_MUTATION = gql`
  mutation UpdateLocation($input: UpdateLocationInput!) {
    updateLocation(input: $input) {
      id
      palaceId
      parentId
      name
      position
      updatedAt
    }
  }
`;

/**
 * Delete a location
 */
export const DELETE_LOCATION_MUTATION = gql`
  mutation DeleteLocation($locationId: String!) {
    deleteLocation(locationId: $locationId)
  }
`;

/**
 * Create a new memory
 */
export const CREATE_MEMORY_MUTATION = gql`
  mutation CreateMemory($input: CreateMemoryInput!) {
    createMemory(input: $input) {
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
 * Update an existing memory
 */
export const UPDATE_MEMORY_MUTATION = gql`
  mutation UpdateMemory($input: UpdateMemoryInput!) {
    updateMemory(input: $input) {
      id
      locationId
      palaceId
      userId
      content
      tags
      updatedAt
    }
  }
`;

/**
 * Delete a memory
 */
export const DELETE_MEMORY_MUTATION = gql`
  mutation DeleteMemory($input: DeleteMemoryInput!) {
    deleteMemory(input: $input)
  }
`;

/**
 * Complete a message using specified LLM provider
 */
export const COMPLETE_LLM_MESSAGE_MUTATION = gql`
  mutation CompleteLLMMessage(
    $palaceId: String!
    $locationId: String!
    $message: String!
    $provider: LLMProvider
    $routingStrategy: RoutingStrategy
  ) {
    completeLLMMessage(
      palaceId: $palaceId
      locationId: $locationId
      message: $message
      provider: $provider
      routingStrategy: $routingStrategy
    ) {
      content
      tokenCount
      latencyMs
      costUsd
    }
  }
`;

/**
 * Stream LLM completion
 */
export const STREAM_LLM_COMPLETION_MUTATION = gql`
  mutation StreamLLMCompletion(
    $palaceId: String!
    $message: String!
    $provider: LLMProvider
  ) {
    streamLLMCompletion(
      palaceId: $palaceId
      message: $message
      provider: $provider
    )
  }
`;

/**
 * Invite an LLM agent to collaborate on a palace
 */
export const INVITE_AGENT_MUTATION = gql`
  mutation InviteAgent($input: InviteAgentInput!) {
    inviteAgent(input: $input) {
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
 * Revoke agent access to a palace
 */
export const REVOKE_AGENT_ACCESS_MUTATION = gql`
  mutation RevokeAgentAccess($palaceId: String!, $agentId: String!) {
    revokeAgentAccess(palaceId: $palaceId, agentId: $agentId)
  }
`;

/**
 * Manually trigger sync for a device
 */
export const SYNC_PALACES_MUTATION = gql`
  mutation SyncPalaces($palaceIds: [String!]) {
    syncPalaces(palaceIds: $palaceIds) {
      success
      syncedMemories
      syncedLocations
      syncedPalaces
      timestamp
    }
  }
`;

/**
 * Export a palace in specified format
 */
export const EXPORT_PALACE_MUTATION = gql`
  mutation ExportPalace($palaceId: String!, $format: String!) {
    exportPalace(palaceId: $palaceId, format: $format) {
      format
      data
      url
      expiresAt
    }
  }
`;

/**
 * Import a palace from exported data
 */
export const IMPORT_PALACE_MUTATION = gql`
  mutation ImportPalace($data: AWSJSON!, $format: String!) {
    importPalace(data: $data, format: $format) {
      id
      userId
      name
      description
      isPublic
      createdAt
      updatedAt
      memoryCount
    }
  }
`;

/**
 * Update user tier/subscription
 */
export const UPDATE_SUBSCRIPTION_MUTATION = gql`
  mutation UpdateSubscription($tier: String!) {
    updateSubscription(tier: $tier) {
      id
      email
      tier
      createdAt
      updatedAt
      palaceCount
      memoryCount
    }
  }
`;
