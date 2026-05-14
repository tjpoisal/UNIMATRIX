/**
 * Lambda Handlers for Unimatrix GraphQL Mutations
 *
 * These functions process complex mutations that require:
 * - LLM provider integration
 * - Routing strategy selection
 * - Cost calculation and billing
 * - Agent collaboration workflows
 */

import {
  LLMProvider,
  RoutingStrategy,
  CompletionResult,
  AgentCollaboration,
  Memory,
  Palace,
  Message,
} from '@unimatrix/types';
import {
  initializeLLMSystem,
  IntelligentLLMRouter,
  LLMProviderRegistry,
  LLMLoadBalancer,
} from '@unimatrix/llm';

// Initialize LLM system at module load (cached)
let llmSystem: ReturnType<typeof initializeLLMSystem> | null = null;

function getLLMSystem() {
  if (!llmSystem) {
    llmSystem = initializeLLMSystem();
  }
  return llmSystem;
}

/**
 * Handler for completeLLMMessage mutation
 * Routes message to appropriate LLM provider and returns completion
 */
export async function handleCompleteLLMMessage(event: {
  palaceId: string;
  locationId: string;
  message: string;
  provider?: LLMProvider;
  routingStrategy?: RoutingStrategy;
  userId: string;
}): Promise<CompletionResult> {
  const {
    palaceId,
    locationId,
    message,
    provider: preferredProvider,
    routingStrategy = 'best',
    userId,
  } = event;

  try {
    const { registry, router, loadBalancer } = getLLMSystem();

    // Ensure all providers are healthy
    await registry.healthCheckAll();

    let selectedProvider;

    // 1. If provider specified, use that
    if (preferredProvider) {
      selectedProvider = registry.getProvider(preferredProvider);
      if (!selectedProvider) {
        throw new Error(`Provider ${preferredProvider} not found or not healthy`);
      }
    } else {
      // 2. Use intelligent router with routing strategy
      const messages: Message[] = [
        {
          role: 'user',
          content: message,
        },
      ];

      selectedProvider = await router.route(messages, routingStrategy);

      if (!selectedProvider) {
        throw new Error('No suitable LLM provider available');
      }
    }

    console.log(`[Handler] Routing to ${selectedProvider.name} (${selectedProvider.model})`);

    // 3-4. Execute completion
    const result = await selectedProvider.complete(
      [
        {
          role: 'user',
          content: message,
        },
      ],
      {
        maxTokens: 2048,
        temperature: 0.7,
      }
    );

    // 5. Track cost in load balancer
    loadBalancer.trackRequest(selectedProvider.name, result.cost);

    // 6. Return completion result (memory storage will be handled by AppSync resolver)
    return {
      content: result.content,
      tokensUsed: result.tokensUsed,
      latencyMs: result.latencyMs,
      cost: result.cost,
      model: result.model,
      provider: result.provider,
    };
  } catch (error) {
    console.error('[Handler] Error in completeLLMMessage:', error);
    throw error;
  }
}

/**
 * Handler for streamLLMCompletion mutation
 * Streams response tokens in real-time via AppSync subscription
 * Note: Actual streaming implementation would use AppSync's managed streaming
 */
export async function handleStreamLLMCompletion(event: {
  palaceId: string;
  message: string;
  provider?: LLMProvider;
  userId: string;
  requestId: string;
}): Promise<void> {
  const { palaceId, message, provider: preferredProvider, userId, requestId } = event;

  try {
    const { registry, loadBalancer } = getLLMSystem();

    // Ensure all providers are healthy
    await registry.healthCheckAll();

    // 1. Route message to provider
    let selectedProvider;
    if (preferredProvider) {
      selectedProvider = registry.getProvider(preferredProvider);
      if (!selectedProvider) {
        throw new Error(`Provider ${preferredProvider} not found`);
      }
    } else {
      // Use fastest provider for streaming (lower latency)
      selectedProvider = registry.selectProvider(
        {
          messageLength: message.length,
          taskComplexity: 'moderate',
          urgency: 'high',
        },
        'fastest'
      );

      if (!selectedProvider) {
        throw new Error('No suitable LLM provider available');
      }
    }

    console.log(`[Handler] Streaming with ${selectedProvider.name} (${selectedProvider.model})`);

    // 2. Get streaming iterator from provider
    const streamIterator = selectedProvider.stream(
      [
        {
          role: 'user',
          content: message,
        },
      ],
      {
        maxTokens: 2048,
        temperature: 0.7,
      }
    );

    let totalContent = '';
    let totalTokens = 0;
    const startTime = Date.now();

    // 3. Process stream chunks
    // Note: In a real implementation, each chunk would be published to AppSync
    // via the onLLMStreamChunk subscription using AppSync's realtime API
    for await (const chunk of streamIterator) {
      totalContent += chunk;
      // Estimate tokens (roughly 4 chars per token)
      totalTokens = Math.ceil(totalContent.length / 4);

      // In production, publish chunk to AppSync:
      // await publishStreamChunk(requestId, chunk, totalTokens);
      console.log(
        `[Handler] Stream chunk: ${chunk.length} chars, total: ${totalTokens} tokens`
      );
    }

    const latency = Date.now() - startTime;

    // 4. Calculate final cost
    const cost = selectedProvider.calculateCost(totalTokens / 2, totalTokens / 2);
    loadBalancer.trackRequest(selectedProvider.name, cost);

    // 5. In production, store final memory with LLM metadata
    // await storeMemoryWithLLMMetadata({
    //   palaceId,
    //   content: totalContent,
    //   provider: selectedProvider.name,
    //   model: selectedProvider.model,
    //   tokensUsed: totalTokens,
    //   latencyMs: latency,
    //   costUsd: cost,
    // });

    console.log(
      `[Handler] Stream complete: ${totalTokens} tokens, ${latency}ms, $${cost.toFixed(4)}`
    );
  } catch (error) {
    console.error('[Handler] Error in streamLLMCompletion:', error);
    throw error;
  }
}

/**
 * Handler for inviteAgent mutation
 * Adds LLM agent to palace with specified permissions
 */
export async function handleInviteAgent(event: {
  palaceId: string;
  agentName: string;
  agentIdentifier: string;
  llmProvider: LLMProvider;
  permissions: string[];
  userId: string;
}): Promise<AgentCollaboration> {
  const {
    palaceId,
    agentName,
    agentIdentifier,
    llmProvider,
    permissions,
    userId,
  } = event;

  try {
    // 1. Validate user owns palace
    // In production: query DynamoDB to verify user ownership
    // For now, just log
    console.log(`[Handler] Validating palace ownership: ${palaceId} for user: ${userId}`);

    // 2. Create agent collaboration record
    const agent: AgentCollaboration = {
      id: `${palaceId}#${agentIdentifier}`,
      palaceId,
      agentName,
      agentIdentifier,
      llmProvider,
      permissions,
      memoriesWritten: 0,
      memoriesRead: 0,
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // 3-4. Store in AgentMetadata table (DynamoDB)
    // In production: await dynamodb.putItem({ TableName: 'AgentMetadata', Item: agent })
    console.log('[Handler] Created agent collaboration:', agent);

    // 5. Publish onAgentActivity subscription
    // In production: await appsync.publishEvent({
    //   subscription: 'onAgentActivity',
    //   payload: agent
    // });

    return agent;
  } catch (error) {
    console.error('[Handler] Error in inviteAgent:', error);
    throw error;
  }
}

/**
 * Handler for syncPalaces mutation
 * Synchronizes offline changes from device to cloud
 */
export async function handleSyncPalaces(event: {
  palaceIds: string[];
  userId: string;
  deviceId: string;
  changes: {
    createdMemories: Memory[];
    updatedMemories: Memory[];
    deletedMemoryIds: string[];
  };
}): Promise<{
  success: boolean;
  syncedMemories: number;
  syncedLocations: number;
  syncedPalaces: number;
  timestamp: string;
}> {
  const { palaceIds, userId, deviceId, changes } = event;

  try {
    // 1. Validate user owns palaces
    console.log(`[Handler] Validating palaces for user: ${userId}, device: ${deviceId}`);

    // 2. Apply changes to DynamoDB
    let syncedMemories = 0;

    // Apply created memories
    for (const memory of changes.createdMemories) {
      // In production: await dynamodb.putItem({ TableName: 'Memories', Item: memory })
      syncedMemories++;
    }

    // Apply updated memories
    for (const memory of changes.updatedMemories) {
      // In production: await dynamodb.updateItem({ TableName: 'Memories', Key: { id: memory.id }, ... })
      syncedMemories++;
    }

    // Apply deleted memories
    for (const memoryId of changes.deletedMemoryIds) {
      // In production: await dynamodb.deleteItem({ TableName: 'Memories', Key: { id: memoryId } })
      syncedMemories++;
    }

    // 4. Update sync_state table with last sync timestamp
    const syncState = {
      deviceId,
      userId,
      lastSync: new Date().toISOString(),
      deviceName: `Device-${deviceId.substring(0, 8)}`,
    };
    // In production: await dynamodb.putItem({ TableName: 'SyncState', Item: syncState })

    console.log(`[Handler] Sync complete: ${syncedMemories} memories, ${palaceIds.length} palaces`);

    return {
      success: true,
      syncedMemories,
      syncedLocations: 0, // Implemented separately
      syncedPalaces: palaceIds.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Handler] Error in syncPalaces:', error);
    throw error;
  }
}

/**
 * Handler for exportPalace mutation
 * Exports palace in JSON or Markdown format
 */
export async function handleExportPalace(event: {
  palaceId: string;
  format: 'json' | 'markdown';
  userId: string;
}): Promise<{
  format: string;
  data: Record<string, unknown>;
  url?: string;
  expiresAt?: string;
}> {
  const { palaceId, format, userId } = event;

  try {
    // 1. Validate user owns palace
    console.log(`[Handler] Exporting palace: ${palaceId} for user: ${userId}, format: ${format}`);

    // 2. Query all locations and memories from DynamoDB
    // In production: const palace = await queryPalaceHierarchy(palaceId, userId)
    const palace = {
      id: palaceId,
      name: 'Example Palace',
      description: 'An example memory palace',
      locations: [
        {
          id: 'loc1',
          name: 'Room 1',
          position: 0,
          memories: [
            {
              id: 'mem1',
              content: 'Memory content',
              tags: ['important'],
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3-4. Format according to type
    if (format === 'json') {
      // Return JSON directly
      return {
        format: 'json',
        data: palace,
      };
    } else {
      // 5. For Markdown: create file and prepare export
      const markdown = formatPalaceAsMarkdown(palace);

      // In production:
      // 1. Upload to S3
      // 2. Generate signed URL
      // const s3Url = await uploadToS3(`palaces/${palaceId}.md`, markdown);
      // const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      return {
        format: 'markdown',
        data: { content: markdown },
        url: `s3://unimatrix-exports/${palaceId}.md`, // Example URL
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  } catch (error) {
    console.error('[Handler] Error in exportPalace:', error);
    throw error;
  }
}

/**
 * Helper: Format palace hierarchy as Markdown
 */
function formatPalaceAsMarkdown(palace: any): string {
  let md = `# ${palace.name}\n\n`;

  if (palace.description) {
    md += `${palace.description}\n\n`;
  }

  if (palace.locations && palace.locations.length > 0) {
    for (const location of palace.locations) {
      md += `## ${location.name}\n\n`;

      if (location.memories && location.memories.length > 0) {
        for (const memory of location.memories) {
          md += `- ${memory.content}\n`;
          if (memory.tags && memory.tags.length > 0) {
            md += `  _Tags: ${memory.tags.join(', ')}_\n`;
          }
        }
      }

      md += '\n';
    }
  }

  return md;
}

/**
 * Handler for importPalace mutation
 * Imports palace from JSON data
 */
export async function handleImportPalace(event: {
  data: Record<string, unknown>;
  format: 'json' | 'markdown';
  userId: string;
}): Promise<Palace> {
  const { data, format, userId } = event;

  try {
    // 1. Validate data structure
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Invalid palace data: missing name');
    }

    console.log(`[Handler] Importing palace for user: ${userId}, format: ${format}`);

    // 2. Create new palace
    const now = new Date().toISOString();
    const palaceId = `palace_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const palace: Palace = {
      id: palaceId,
      userId,
      name: data.name as string,
      description: (data.description as string) || '',
      isPublic: (data.isPublic as boolean) || false,
      operationalProfile: (data.operationalProfile as string) || 'General Public',
      createdAt: now,
      updatedAt: now,
      memoryCount: 0,
      locations: [],
    };

    // 3. Create locations and memories from data
    if (data.locations && Array.isArray(data.locations)) {
      for (const locationData of data.locations) {
        const location = {
          id: `loc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          palaceId,
          parentId: null,
          name: locationData.name,
          position: locationData.position || 0,
          createdAt: now,
          updatedAt: now,
          memories: [],
        };

        if (locationData.memories && Array.isArray(locationData.memories)) {
          for (const memoryData of locationData.memories) {
            const memory = {
              id: `mem_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              locationId: location.id,
              palaceId,
              userId,
              content: memoryData.content || '',
              tags: memoryData.tags || [],
              llmProvider: 'None' as const,
              llmModel: null,
              tokensUsed: 0,
              latencyMs: 0,
              costUsd: 0,
              createdAt: now,
              updatedAt: now,
              lastAccessedAt: now,
              createdByAgent: false,
            };

            location.memories!.push(memory);
            palace.memoryCount!++;
          }
        }

        palace.locations!.push(location);
      }
    }

    // 4. Store in DynamoDB
    // In production:
    // await dynamodb.putItem({ TableName: 'Palaces', Item: palace })
    // for (const location of palace.locations) {
    //   await dynamodb.putItem({ TableName: 'Locations', Item: location })
    //   for (const memory of location.memories) {
    //     await dynamodb.putItem({ TableName: 'Memories', Item: memory })
    //   }
    // }

    console.log(
      `[Handler] Imported palace: ${palace.id} with ${palace.memoryCount} memories`
    );

    // 5. Return created palace
    return palace;
  } catch (error) {
    console.error('[Handler] Error in importPalace:', error);
    throw error;
  }
}

/**
 * Handler for checkLLMProvidersHealth
 * Verifies health status of all configured LLM providers
 */
export async function handleCheckLLMProvidersHealth(event: {
  userId: string;
}): Promise<Record<string, { healthy: boolean; latencyMs?: number }>> {
  const { userId } = event;

  try {
    const { registry } = getLLMSystem();

    const startTime = Date.now();

    // 1-2. Call healthCheck() on all providers
    const healthResults = await registry.healthCheckAll();

    const latency = Date.now() - startTime;

    // 3-4. Return health status
    const result: Record<string, { healthy: boolean; latencyMs?: number }> = {};

    for (const health of healthResults) {
      result[health.provider] = {
        healthy: health.healthy,
        latencyMs: latency,
      };
    }

    console.log('[Handler] Provider health check complete:', result);

    return result;
  } catch (error) {
    console.error('[Handler] Error in checkLLMProvidersHealth:', error);
    throw error;
  }
}

/**
 * Handler for suggestRoutingStrategy
 * Analyzes message and recommends best routing strategy
 */
export async function handleSuggestRoutingStrategy(event: {
  messageContent: string;
  userId: string;
}): Promise<RoutingStrategy> {
  const { messageContent, userId } = event;

  try {
    const { registry } = getLLMSystem();

    // 1. Analyze message complexity (0-1 score)
    const complexityScore = LLMProviderRegistry.analyzeComplexity(messageContent);

    console.log(`[Handler] Message complexity: ${complexityScore.toFixed(2)}`);

    // 2. Categorize complexity
    let taskComplexity: 'simple' | 'moderate' | 'complex';
    if (complexityScore < 0.33) {
      taskComplexity = 'simple';
    } else if (complexityScore < 0.66) {
      taskComplexity = 'moderate';
    } else {
      taskComplexity = 'complex';
    }

    // 3. Suggest strategy based on complexity
    // - High complexity → 'best' (use most capable model)
    // - Short message → 'cheapest' (use fastest, cheapest provider)
    // - Medium → 'roundrobin' (load balance)
    const strategy = LLMProviderRegistry.suggestStrategy({
      messageLength: messageContent.length,
      taskComplexity,
      urgency: 'normal',
    });

    console.log(
      `[Handler] Suggested strategy: ${strategy} (complexity: ${taskComplexity})`
    );

    return strategy;
  } catch (error) {
    console.error('[Handler] Error in suggestRoutingStrategy:', error);
    throw error;
  }
}

/**
 * Event types for Lambda handlers
 */
export interface LambdaEvent {
  [key: string]: unknown;
  userId: string;
}

/**
 * Wrapper to handle AppSync resolver events
 */
export async function appSyncHandler(
  event: LambdaEvent,
  context: unknown
): Promise<unknown> {
  // Determine which mutation was called and route to appropriate handler
  const fieldName = (event as any).fieldName;

  switch (fieldName) {
    case 'completeLLMMessage':
      return await handleCompleteLLMMessage(event as any);
    case 'streamLLMCompletion':
      return await handleStreamLLMCompletion(event as any);
    case 'inviteAgent':
      return await handleInviteAgent(event as any);
    case 'syncPalaces':
      return await handleSyncPalaces(event as any);
    case 'exportPalace':
      return await handleExportPalace(event as any);
    case 'importPalace':
      return await handleImportPalace(event as any);
    case 'checkLLMProvidersHealth':
      return await handleCheckLLMProvidersHealth(event as any);
    case 'suggestRoutingStrategy':
      return await handleSuggestRoutingStrategy(event as any);
    default:
      throw new Error(`Unknown mutation: ${fieldName}`);
  }
}
