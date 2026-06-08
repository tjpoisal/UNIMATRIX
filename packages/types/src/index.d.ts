/**
 * @unimatrix/types
 * Shared TypeScript interfaces for the Unimatrix system
 */
export interface User {
    id: string;
    email: string;
    tier: 'free' | 'pro' | 'enterprise';
    subscriptionStatus: 'active' | 'trial' | 'canceled';
    createdAt: Date;
    updatedAt: Date;
}
export interface CognitoUser {
    username: string;
    email: string;
    emailVerified?: boolean;
    attributes?: Record<string, string>;
}
export interface Palace {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Location {
    id: string;
    palaceId: string;
    parentId?: string;
    name: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Memory {
    id: string;
    locationId: string;
    content: string;
    tags: string[];
    llmProvider?: string;
    llmModel?: string;
    tokensUsed?: number;
    latencyMs?: number;
    costUsd?: number;
    createdAt: Date;
    updatedAt: Date;
    lastAccessed?: Date;
}
export interface AgentCollaboration {
    id: string;
    palaceId: string;
    agentName: string;
    agentProvider: string;
    writesCount: number;
    readsCount: number;
    lastInteraction?: Date;
    createdAt: Date;
}
export interface LLMUsageMetrics {
    id: string;
    userId: string;
    palaceId?: string;
    provider: string;
    model: string;
    requestType: 'query' | 'write' | 'stream';
    tokensInput: number;
    tokensOutput: number;
    costUsd: number;
    latencyMs: number;
    timestamp: Date;
}
export interface SyncState {
    deviceId: string;
    userId: string;
    lastSync: Date;
    deviceName: string;
    pendingChanges: SyncedMutation[];
}
export interface SyncedMutation {
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: 'palace' | 'location' | 'memory';
    entityId: string;
    payload: Record<string, unknown>;
    timestamp: Date;
    synced: boolean;
}
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface CompletionOptions {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stream?: boolean;
}
export interface ModelInfo {
    name: string;
    provider: string;
    costPer1kInputTokens: number;
    costPer1kOutputTokens: number;
    contextWindow: number;
    supportsStreaming: boolean;
}
export interface CompletionResult {
    content: string;
    tokensUsed: number;
    latencyMs: number;
    cost: number;
    model: string;
    provider: string;
}
export interface HealthStatus {
    provider: string;
    healthy: boolean;
    lastCheck: Date;
    error?: string;
}
export interface ILLMProvider {
    readonly name: string;
    readonly model: string;
    complete(messages: Message[], options?: CompletionOptions): Promise<CompletionResult>;
    stream(messages: Message[], options?: CompletionOptions): AsyncIterableIterator<string>;
    getModelInfo(): ModelInfo;
    healthCheck(): Promise<boolean>;
}
export interface ProviderConfig {
    name: string;
    model: string;
    apiKey: string;
    endpoint?: string;
}
export interface ProviderHealth {
    provider: string;
    healthy: boolean;
    lastCheck: Date;
    error?: string;
}
export type RoutingStrategy = 'cheapest' | 'fastest' | 'best' | 'roundrobin';
export interface RoutingContext {
    messageLength: number;
    taskComplexity: 'simple' | 'moderate' | 'complex';
    urgency: 'low' | 'normal' | 'high';
    preferredProviders?: string[];
}
export interface ILLMProviderRegistry {
    register(provider: ILLMProvider): void;
    getProvider(name: string): ILLMProvider | null;
    listProviders(): ILLMProvider[];
    healthCheckAll(): Promise<ProviderHealth[]>;
    selectProvider(context: RoutingContext, strategy: RoutingStrategy): ILLMProvider | null;
}
export interface Agent {
    id: string;
    name: string;
    provider: string;
    model?: string;
    instructions?: string;
    createdAt: Date;
}
export interface AgentMessage {
    agentId: string;
    agentName: string;
    content: string;
    palaceId: string;
    locationId?: string;
    timestamp: Date;
}
export interface AgentInteraction {
    id: string;
    palaceId: string;
    agents: string[];
    type: 'read' | 'write' | 'collaborate';
    summary?: string;
    timestamp: Date;
}
export interface SelfHostedLicense {
    id: string;
    userId: string;
    licenseKey: string;
    activationDate: Date;
    expiresAt: Date;
    maxUsers: number;
    createdAt: Date;
}
export interface SelfHostedConfig {
    databaseUrl: string;
    redisUrl: string;
    jwtSecret: string;
    allowedLlmProviders: string[];
    maxConcurrentRequests: number;
}
export interface GraphQLContext {
    userId?: string;
    user?: User;
    cognitoUser?: CognitoUser;
    deviceId?: string;
    isAuthenticated: boolean;
}
export interface GraphQLMutation {
    createPalace(input: CreatePalaceInput): Promise<Palace>;
    updatePalace(input: UpdatePalaceInput): Promise<Palace>;
    deletePalace(id: string): Promise<boolean>;
    createMemory(input: CreateMemoryInput): Promise<Memory>;
    updateMemory(input: UpdateMemoryInput): Promise<Memory>;
    deleteMemory(id: string): Promise<boolean>;
    createLocation(input: CreateLocationInput): Promise<Location>;
    updateLocation(input: UpdateLocationInput): Promise<Location>;
    deleteLocation(id: string): Promise<boolean>;
    syncChanges(changes: SyncedMutation[]): Promise<SyncResult>;
}
export interface GraphQLQuery {
    palace(id: string): Promise<Palace | null>;
    palaces(): Promise<Palace[]>;
    locations(palaceId: string): Promise<Location[]>;
    memories(locationId: string): Promise<Memory[]>;
    search(query: string): Promise<Memory[]>;
    metrics(userId: string): Promise<LLMUsageMetrics[]>;
}
export interface GraphQLSubscription {
    onPalaceCreated(): AsyncIterableIterator<Palace>;
    onMemoryUpdated(palaceId: string): AsyncIterableIterator<Memory>;
    onSyncRequired(userId: string): AsyncIterableIterator<SyncState>;
}
export interface CreatePalaceInput {
    name: string;
    description?: string;
    isPublic?: boolean;
}
export interface UpdatePalaceInput {
    id: string;
    name?: string;
    description?: string;
    isPublic?: boolean;
}
export interface CreateMemoryInput {
    locationId: string;
    content: string;
    tags?: string[];
    llmProvider?: string;
    llmModel?: string;
}
export interface UpdateMemoryInput {
    id: string;
    content?: string;
    tags?: string[];
}
export interface CreateLocationInput {
    palaceId: string;
    parentId?: string;
    name: string;
    position?: number;
}
export interface UpdateLocationInput {
    id: string;
    name?: string;
    position?: number;
    parentId?: string;
}
export interface SyncResult {
    success: boolean;
    synced: SyncedMutation[];
    failed: SyncedMutation[];
    conflicts?: ConflictResolution[];
}
export interface ConflictResolution {
    entityId: string;
    localVersion: SyncedMutation;
    remoteVersion: SyncedMutation;
    resolution: 'local' | 'remote';
}
export interface TreeNode {
    id: string;
    name: string;
    children?: TreeNode[];
    data?: Memory[];
    metadata?: {
        llmProvider?: string;
        agentWriters?: string[];
    };
}
export interface SearchResult {
    memory: Memory;
    location: Location;
    palace: Palace;
    relevanceScore: number;
}
export interface AuthFormProps {
    mode: 'signin' | 'signup';
    onSuccess: (user: User) => void;
    onError: (error: Error) => void;
}
export interface EditorState {
    memory?: Memory;
    unsavedChanges: boolean;
    isSaving: boolean;
    lastSaved?: Date;
}
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
//# sourceMappingURL=index.d.ts.map