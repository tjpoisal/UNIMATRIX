# UNIMATRIX — LLM/Agent Memory Layer Architecture

**Status:** Production-ready design for AWS backend

## System Overview

```
Claude / LLMs / Agents
    ↓ (reads/writes during every interaction)
AppSync API Gateway (GraphQL subscriptions for real-time sync)
    ↓
DynamoDB (palace data storage)
├── Tables: PalaceData, ConversationHistory, AgentMemory
└── TTL: Auto-expire old data
    ↓
ElastiCache (Redis for real-time agent collaboration)
├── Active agent state
├── Pending writes from concurrent agents
└── Real-time palace updates
    ↓
Lambda Functions (event processors)
├── OnPalaceWrite → trigger downstream agents
├── OnAgentMemoryUpdate → sync to DynamoDB
└── OnConversationEnd → compress and archive
```

---

## Core Components

### 1. **DynamoDB Tables** (Persistent Storage)

#### Table 1: `unimatrix-palaces`
```json
{
  "pk": "palace#user-id#palace-id",  // Partition key
  "sk": "metadata",                  // Sort key
  "palaceId": "uuid",
  "userId": "user-id or agent-id",
  "name": "Resilience Weather Intelligence",
  "structure": {
    "wings": {
      "Alert Reasoning": {
        "rooms": {
          "Active Warnings": {
            "halls": [
              {
                "name": "Tornado Warning - County A",
                "drawers": {
                  "alert-123": {
                    "type": "warning",
                    "timestamp": "2026-05-06T14:32:00Z",
                    "severity": "critical",
                    "vector_embedding": [0.12, 0.45, ...],
                    "metadata": {}
                  }
                }
              }
            ]
          }
        }
      },
      "Agent Memory": { ... },
      "Shared Context": { ... }
    }
  },
  "createdAt": "2026-05-06T00:00:00Z",
  "updatedAt": "2026-05-06T14:32:00Z",
  "ttl": 7776000  // 90 days
}
```

#### Table 2: `unimatrix-conversation-history`
```json
{
  "pk": "conversation#user-id#conversation-id",
  "sk": "message#timestamp",
  "userId": "user-id",
  "conversationId": "uuid",
  "messageId": "uuid",
  "role": "user | assistant | agent",
  "content": "full message text",
  "palaceReads": ["palace-id-1", "palace-id-2"],  // Which palaces were queried
  "palaceWrites": [                               // What was written back
    {
      "palaceId": "palace-id",
      "wingName": "Agent Memory",
      "roomName": "Findings",
      "data": {...}
    }
  ],
  "timestamp": "2026-05-06T14:32:00Z",
  "ttl": 7776000  // 90 days
}
```

#### Table 3: `unimatrix-agent-memory`
```json
{
  "pk": "agent#agent-id",
  "sk": "state#timestamp",
  "agentId": "claude-main | sentiment-analyzer | etc",
  "currentContext": {
    "activePalaces": ["palace-id-1", "palace-id-2"],
    "lastAction": "wrote_to_palace",
    "lastActionTime": "2026-05-06T14:32:00Z"
  },
  "memorySnapshot": {
    "shortTerm": {...},  // Last 5 interactions
    "longTerm": {...}    // Distilled learnings
  },
  "collaboratingAgents": ["agent-id-2", "agent-id-3"],
  "timestamp": "2026-05-06T14:32:00Z",
  "ttl": 2592000  // 30 days
}
```

#### Table 4: `unimatrix-vector-index`
```json
{
  "pk": "vector#palace-id#drawer-id",
  "sk": "embedding",
  "vectorEmbedding": [0.12, 0.45, 0.67, ...],  // 768-dim for sentence-transformers
  "source": "palace-data | conversation | agent-reasoning",
  "sourceId": "drawer-id or message-id",
  "metadata": {
    "palaceId": "palace-id",
    "wing": "wing-name",
    "room": "room-name",
    "hall": "hall-name",
    "createdBy": "agent-id",
    "timestamp": "2026-05-06T14:32:00Z"
  },
  "ttl": 7776000  // 90 days
}
```

---

### 2. **AppSync API** (Real-time GraphQL)

#### Schema

```graphql
type Palace {
  id: ID!
  name: String!
  userId: String!
  structure: PalaceStructure!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type PalaceStructure {
  wings: [Wing!]!
}

type Wing {
  name: String!
  rooms: [Room!]!
}

type Room {
  name: String!
  halls: [Hall!]!
}

type Hall {
  name: String!
  drawers: [Drawer!]!
}

type Drawer {
  id: ID!
  type: String!  # "alert", "reasoning", "finding", "context"
  content: String!
  vectorEmbedding: [Float!]
  metadata: String  # JSON
  createdBy: String!  # agent-id
  createdAt: AWSDateTime!
}

type Query {
  # Read palace by ID
  getPalace(id: ID!): Palace
  
  # Vector semantic search
  searchPalace(
    palaceId: ID!
    query: String!
    topK: Int = 5
  ): [Drawer!]!
  
  # Get agent's active palaces
  getAgentContext(agentId: String!): [Palace!]!
  
  # Get conversation history with palace context
  getConversation(
    conversationId: ID!
  ): [ConversationMessage!]!
}

type Mutation {
  # LLM/Agent writes to palace
  writeToPalace(
    palaceId: ID!
    wing: String!
    room: String!
    hall: String!
    drawer: DrawerInput!
  ): Drawer!
  
  # Update conversation history
  recordMessage(
    conversationId: ID!
    message: MessageInput!
    palaceReads: [ID!]
    palaceWrites: [PalaceWriteInput!]
  ): ConversationMessage!
  
  # Agent updates its state
  updateAgentMemory(
    agentId: String!
    memory: AgentMemoryInput!
  ): AgentMemory!
}

type Subscription {
  # Real-time palace updates
  onPalaceWrite(palaceId: ID!): Drawer!
  
  # Real-time agent state changes
  onAgentStateChange(agentId: String!): AgentMemory!
  
  # Real-time collaboration signals
  onAgentCollaboration(palaceId: ID!): AgentCollaborationEvent!
}
```

#### Key Resolvers

```typescript
// readToPalace mutation resolver
async function writeToPalace(input) {
  // 1. Write to DynamoDB
  const drawer = await dynamodb.put({
    TableName: 'unimatrix-palaces',
    Item: {
      pk: `palace#${input.palaceId}`,
      sk: `wing#${input.wing}#room#${input.room}#hall#${input.hall}#drawer#${uuid()}`,
      content: input.drawer.content,
      createdBy: input.drawer.createdBy,
      timestamp: now(),
      ttl: ttlInSeconds(90)
    }
  });
  
  // 2. Generate vector embedding (async, non-blocking)
  lambda.invoke({
    FunctionName: 'unimatrix-embedding-fn',
    InvocationType: 'Event',  // async
    Payload: {
      drawerId: drawer.id,
      palaceId: input.palaceId,
      content: input.drawer.content
    }
  });
  
  // 3. Cache in Redis for real-time collaboration
  await redis.set(
    `palace:${input.palaceId}:recent`,
    JSON.stringify(drawer),
    'EX', 300  // 5 min TTL
  );
  
  // 4. Publish to subscription channels
  await appSync.publish({
    channel: `palace:${input.palaceId}:writes`,
    message: drawer
  });
  
  // 5. Trigger agent collaboration check
  lambda.invoke({
    FunctionName: 'unimatrix-agent-trigger-fn',
    InvocationType: 'Event',
    Payload: {
      palaceId: input.palaceId,
      drawerContent: input.drawer.content,
      writingAgent: input.drawer.createdBy
    }
  });
  
  return drawer;
}
```

---

### 3. **ElastiCache Redis** (Real-time Collaboration)

#### Data Structure

```
palace:{palaceId}:recent → JSON array of last 10 writes (5 min TTL)
agent:{agentId}:active → agent state + current palace context (10 min TTL)
collaboration:queue:{palaceId} → pending agent triggers (FIFO queue)
vector:index:{palaceId} → recent embeddings cache (30 min TTL)
```

#### Pattern: Agent Collaboration via Redis Pub/Sub

```
Agent A writes to palace:weather
  ↓
Redis pub/sub broadcasts to agent:sentiment-analyzer (subscribed)
  ↓
Agent B (sentiment analyzer) wakes up
  ↓
Agent B queries palace:weather (reads from DynamoDB + Redis cache)
  ↓
Agent B writes findings to palace:weather (Wing: Analysis)
  ↓
Back to Agent A (via subscription)
```

---

### 4. **Lambda Functions**

#### `unimatrix-embedding-fn`
Converts palace drawer content → vector embeddings (async, batched)

```python
import boto3
from sentence_transformers import SentenceTransformer

def handler(event, context):
    # event = {drawerContent, drawerId, palaceId}
    
    model = SentenceTransformer('all-MiniLM-L6-v2')  # 384-dim
    embedding = model.encode(event['drawerContent']).tolist()
    
    # Store in vector index table
    dynamodb.put_item(
        TableName='unimatrix-vector-index',
        Item={
            'pk': f"vector#{event['palaceId']}#{event['drawerId']}",
            'sk': 'embedding',
            'vectorEmbedding': embedding,
            'createdAt': now(),
            'ttl': ttl(90)
        }
    )
    
    # Cache in Redis
    redis.setex(
        f"vector:{event['drawerId']}",
        300,  # 5 min
        json.dumps(embedding)
    )
```

#### `unimatrix-agent-trigger-fn`
Determines which agents should wake up based on palace write

```python
def handler(event, context):
    # event = {palaceId, drawerContent, writingAgent}
    
    # Get all agents subscribed to this palace
    subscriptions = dynamodb.query(
        TableName='agent-subscriptions',
        KeyConditionExpression='palaceId = :pid',
        ExpressionAttributeValues={':pid': event['palaceId']}
    )
    
    for agent in subscriptions:
        # Check if agent cares about this content
        if should_agent_respond(agent['interests'], event['drawerContent']):
            # Queue task for agent
            queue_agent_task({
                'agentId': agent['agentId'],
                'palaceId': event['palaceId'],
                'triggeringDrawer': event['drawerId'],
                'context': 'new_palace_write'
            })
```

---

### 5. **Integration with Claude/LLMs**

Every Claude interaction follows this pattern:

```typescript
async function claudeWithUnimatrix(userMessage, userId, conversationId) {
  // 1. BEFORE: Query palaces for context
  const relevantPalaces = await searchPalaces(userId, userMessage);
  const contextFromPalaces = relevantPalaces.map(p => 
    summarizePalaceForContext(p)
  );
  
  // 2. CALL: Claude with palace context in system prompt
  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: userMessage
    }],
    system: `
You have access to a persistent memory system called Unimatrix.
Here is the relevant context from your palaces:

${contextFromPalaces.join('\n\n')}

During your response, if you uncover something important:
- Write it to the appropriate palace
- Format: [PALACE_WRITE: wing/room/hall with content]

Important insights, decisions, or findings should be written so 
future interactions can reference them.
    `
  });
  
  // 3. PARSE: Extract palace writes from Claude response
  const palaceWrites = parseClaudeResponse(response);
  
  // 4. AFTER: Write findings back to palaces
  for (const write of palaceWrites) {
    await appSync.writeToPalace(write);
  }
  
  // 5. RECORD: Log entire interaction to conversation history
  await appSync.recordMessage({
    conversationId,
    message: {
      role: 'assistant',
      content: response.content
    },
    palaceReads: relevantPalaces.map(p => p.id),
    palaceWrites: palaceWrites
  });
  
  return response.content;
}
```

---

## Deployment Checklist

- [ ] **DynamoDB Tables**: Create 4 tables with on-demand billing
- [ ] **AppSync API**: Deploy GraphQL API with subscriptions
- [ ] **ElastiCache**: Create Redis cluster (cache.t3.micro for dev, cache.r6g.large for prod)
- [ ] **Lambda Functions**: Deploy embedding + trigger functions
- [ ] **IAM Roles**: Grant Lambda → DynamoDB, Redis, AppSync permissions
- [ ] **Claude Integration**: Wire up system prompt injection + palace writes
- [ ] **OpenClaw Integration**: Sync OpenClaw agents ↔ Unimatrix palaces via WebSocket
- [ ] **Testing**: 
  - [ ] Single agent writes to palace
  - [ ] Multiple agents read same palace concurrently
  - [ ] Real-time subscription updates
  - [ ] Vector search accuracy
  - [ ] TTL cleanup

---

## Cost Estimate (Monthly)

| Component | Usage | Cost |
|-----------|-------|------|
| DynamoDB | 1M reads/month, 100K writes/month | ~$50 |
| AppSync | 100K requests/month | ~$5 |
| ElastiCache | cache.t3.micro | ~$15 |
| Lambda | 1M invocations, 128MB RAM | ~$10 |
| Data Transfer | <10GB/month | ~$1 |
| **Total** | | **~$80/month** |

---

## Architecture Decisions

### Why AppSync + DynamoDB + Redis?

1. **AppSync subscriptions** = real-time palace updates without polling
2. **DynamoDB** = serverless, auto-scale, sub-millisecond reads
3. **Redis** = agent collaboration at <10ms latency
4. **Lambda** = async processing (embeddings, agent triggers)

### Why NOT:

- ❌ PostgreSQL/RDS: Overkill for palace data, less real-time
- ❌ Firestore: Cross-region latency, cost scaling
- ❌ MongoDB Atlas: Higher cost, eventual consistency
- ❌ Supabase: Good but Redis needed for real-time agent sync anyway

### Vector Search Strategy

- **Embedding model**: `all-MiniLM-L6-v2` (384-dim, fast)
- **Storage**: DynamoDB vector index table
- **Search**: DynamoDB Query (pk = palace#id) + in-memory cosine similarity
- **Future upgrade**: OpenSearch for semantic search at scale (>1M vectors)

---

## Phase 2: Production Scaling

When you hit 1K+ concurrent agents:

1. **Add OpenSearch** for semantic palace search
2. **Add SQS** for agent task queuing (instead of direct invoke)
3. **Add Kinesis** for event streaming (audit trail)
4. **Upgrade Redis** to cache.r6g.large (multi-AZ)
5. **Add RDS Aurora** for agent profiles (metadata)
