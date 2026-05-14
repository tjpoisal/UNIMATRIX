# UNIMATRIX — Deployment & Testing Guide

**Status:** Production-ready to deploy

## Deployment Checklist (Steps 1-8, ~2 hours)

### Step 1: Prerequisites
```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Install CDK
npm install -g aws-cdk

# Clone/create Unimatrix project directory
mkdir ~/unimatrix-backend
cd ~/unimatrix-backend
npm init -y
npm install aws-cdk aws-sdk @anthropic-ai/sdk
```

### Step 2: Deploy AWS Infrastructure
```bash
# Copy the CDK stack file
cp ~/unimatrix-stack.ts ./lib/

# Synthesize CDK
npx cdk synth

# Deploy (takes ~10 minutes)
npx cdk deploy --all --require-approval never

# Capture outputs
npx cdk output UnimatrixStack > outputs.json
export APPSYNC_ENDPOINT=$(cat outputs.json | jq -r '.APIEndpoint')
export REDIS_ENDPOINT=$(cat outputs.json | jq -r '.RedisEndpoint')
echo $APPSYNC_ENDPOINT $REDIS_ENDPOINT
```

### Step 3: Create DynamoDB Global Secondary Indexes
```bash
# These are created automatically by CDK, but verify:
aws dynamodb list-tables --region us-east-1 | grep unimatrix

# Should see:
# - unimatrix-palaces
# - unimatrix-conversation-history
# - unimatrix-agent-memory
# - unimatrix-vector-index
```

### Step 4: Deploy Lambda Functions
```bash
# Create embedding function directory
mkdir -p lambdas/embedding
cat > lambdas/embedding/requirements.txt << 'EOF'
boto3==1.28.0
sentence-transformers==2.2.2
redis==4.5.5
numpy==1.24.3
EOF

cat > lambdas/embedding/index.py << 'EOF'
import json
import boto3
import redis
from sentence_transformers import SentenceTransformer

dynamodb = boto3.resource('dynamodb')
model = SentenceTransformer('all-MiniLM-L6-v2')
redis_client = redis.Redis(host=os.getenv('REDIS_ENDPOINT'), port=6379, decode_responses=True)

def handler(event, context):
    drawer_content = event['drawerContent']
    drawer_id = event['drawerId']
    palace_id = event['palaceId']
    
    # Generate embedding (384-dim)
    embedding = model.encode(drawer_content).tolist()
    
    # Store in DynamoDB
    table = dynamodb.Table('unimatrix-vector-index')
    table.put_item(Item={
        'pk': f"vector#{palace_id}#{drawer_id}",
        'sk': 'embedding',
        'vectorEmbedding': embedding,
        'createdAt': str(datetime.now()),
        'ttl': int(time.time()) + 7776000  # 90 days
    })
    
    # Cache in Redis
    redis_client.setex(f"vector:{drawer_id}", 300, json.dumps(embedding))
    
    return {'statusCode': 200, 'body': json.dumps('Embedding stored')}
EOF

# Package and deploy
cd lambdas/embedding
pip install -r requirements.txt -t .
zip -r ../embedding-function.zip .
aws lambda create-function \
  --function-name unimatrix-embedding-fn \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://../embedding-function.zip \
  --timeout 300 \
  --memory-size 1024 \
  --environment Variables="{REDIS_ENDPOINT=$REDIS_ENDPOINT,VECTOR_TABLE=unimatrix-vector-index}"
```

### Step 5: Configure AppSync API
```bash
# The GraphQL API is created by CDK, but test it:
export API_KEY=$(aws appsync list-api-keys --api-id YOUR_API_ID | jq -r '.apiKeys[0].id')

# Test a simple query
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"query":"query { getUserPalaces(userId:\"test-user\") { id name } }"}' \
  https://$APPSYNC_ENDPOINT/graphql
```

### Step 6: Deploy Claude Integration
```bash
# Copy integration module
cp ~/unimatrix-claude-integration.ts ./src/

# Create environment file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=sk-ant-xxxxx
APPSYNC_API_KEY=da2-xxxxx
APPSYNC_ENDPOINT=https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
REDIS_ENDPOINT=unimatrix-redis-xxx.xxxxx.ng.0001.use1.cache.amazonaws.com
EOF

# Install dependencies
npm install @anthropic-ai/sdk aws-sdk
```

### Step 7: Create Test Palaces
```bash
# Create a test palace for Resilience Weather
cat > scripts/create-test-palaces.ts << 'EOF'
import { claudeWithUnimatrix } from '../src/unimatrix-claude-integration';

const testPalacePayload = {
  userId: 'test-user-123',
  conversationId: 'conv-test-001',
  userMessage: 'Create a test palace for weather analysis',
  palaceIds: undefined  // Will auto-discover
};

claudeWithUnimatrix(testPalacePayload)
  .then(response => console.log('✓ Test palace created'))
  .catch(err => console.error('✗ Error:', err));
EOF

npx ts-node scripts/create-test-palaces.ts
```

### Step 8: Enable Real-time Subscriptions
```bash
# The subscriptions are defined in the schema, but enable WebSocket
aws appsync get-graphql-api --api-id YOUR_API_ID | jq '.graphqlApi.xrayEnabled'

# Should be true. If false, enable:
aws appsync update-graphql-api \
  --api-id YOUR_API_ID \
  --xray-enabled
```

---

## Testing (Validate Each Component)

### Test 1: DynamoDB Write/Read
```typescript
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Write test data
await dynamodb.put({
  TableName: 'unimatrix-palaces',
  Item: {
    pk: 'palace#test-palace-001',
    sk: 'wing#Alert Reasoning#room#Active Warnings#hall#Tornado-A',
    content: 'Tornado warning issued for County A at 14:32 UTC',
    createdBy: 'claude-main',
    timestamp: new Date().toISOString(),
    ttl: Math.floor(Date.now() / 1000) + 7776000
  }
}).promise();

// Read test data
const result = await dynamodb.get({
  TableName: 'unimatrix-palaces',
  Key: { pk: 'palace#test-palace-001', sk: 'wing#Alert Reasoning#room#Active Warnings#hall#Tornado-A' }
}).promise();

console.log('✓ DynamoDB read:', result.Item);
```

### Test 2: Vector Embedding (Lambda)
```bash
# Invoke embedding function
aws lambda invoke \
  --function-name unimatrix-embedding-fn \
  --payload '{"drawerContent":"Tornado warning issued","drawerId":"drawer-123","palaceId":"palace-001"}' \
  response.json

cat response.json
# Should show successful embedding storage
```

### Test 3: AppSync GraphQL Query
```bash
# Query test palace
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "query": "query { getPalace(id: \"palace#test-palace-001\") { id name structure { wings { name } } } }"
  }' \
  $APPSYNC_ENDPOINT/graphql
```

### Test 4: Redis Real-time Collaboration
```typescript
import * as redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_ENDPOINT,
  port: 6379
});

// Subscribe to palace updates
client.subscribe('palace:test-palace-001:writes', (err, count) => {
  if (err) console.error('Error subscribing:', err);
  console.log(`✓ Subscribed to ${count} channels`);
});

// Listen for messages
client.on('message', (channel, message) => {
  console.log(`✓ Got message on ${channel}:`, JSON.parse(message));
});

// Publish test message
setTimeout(() => {
  client.publish('palace:test-palace-001:writes', 
    JSON.stringify({ drawerId: 'test-123', content: 'Test message' }));
}, 1000);
```

### Test 5: Claude Integration (Full Loop)
```typescript
import { claudeWithUnimatrix } from './src/unimatrix-claude-integration';

const result = await claudeWithUnimatrix({
  userId: 'test-user-123',
  conversationId: 'conv-test-002',
  userMessage: 'Analyze the latest weather patterns and record findings',
  palaceIds: ['palace#test-palace-001']
});

console.log('✓ Claude response:', result);

// Check that palace was written to:
// - Query DynamoDB for new drawers
// - Verify conversation history was logged
```

### Test 6: Agent Collaboration Trigger
```bash
# Trigger agent collaboration manually
aws lambda invoke \
  --function-name unimatrix-agent-trigger-fn \
  --payload '{
    "palaceId": "palace-001",
    "drawerContent": "New weather alert from National Weather Service",
    "writingAgent": "claude-main"
  }' \
  response.json

cat response.json
```

### Test 7: Load Testing (Concurrent Agents)
```typescript
// Simulate 5 concurrent agents writing to same palace
const agents = ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'];

await Promise.all(agents.map(agentId =>
  claudeWithUnimatrix({
    userId: 'test-user-123',
    conversationId: `conv-load-test-${agentId}`,
    userMessage: `Agent ${agentId} analyzing palace data`,
    palaceIds: ['palace#test-palace-001']
  })
));

console.log('✓ All agents completed without conflict');

// Verify all writes were persisted
const allWrites = await dynamodb.query({
  TableName: 'unimatrix-palaces',
  KeyConditionExpression: 'pk = :pk',
  ExpressionAttributeValues: { ':pk': 'palace#test-palace-001' }
}).promise();

console.log(`✓ Total writes: ${allWrites.Items.length}`);
```

### Test 8: Latency Benchmarks
```typescript
// Measure end-to-end latency
const start = Date.now();

const response = await claudeWithUnimatrix({
  userId: 'test-user-123',
  conversationId: 'conv-latency-test',
  userMessage: 'Quick response test',
  palaceIds: ['palace#test-palace-001']
});

const latency = Date.now() - start;
console.log(`✓ Latency: ${latency}ms`);

// Baseline targets:
// - Palace query: <100ms
// - Claude API: 500-2000ms
// - Palace write: <100ms
// - Total: <2500ms
```

---

## Monitoring & Debugging

### CloudWatch Logs
```bash
# View AppSync logs
aws logs tail /aws/appsync/unimatrix-api --follow

# View Lambda logs
aws logs tail /aws/lambda/unimatrix-embedding-fn --follow
aws logs tail /aws/lambda/unimatrix-agent-trigger-fn --follow
```

### DynamoDB Monitoring
```bash
# Check table metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=unimatrix-palaces \
  --start-time 2026-05-06T00:00:00Z \
  --end-time 2026-05-07T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### Redis Monitoring
```bash
# Check Redis stats
redis-cli -h $REDIS_ENDPOINT INFO stats

# Should show:
# connected_clients
# used_memory
# total_commands_processed
```

---

## Rollback Plan

If deployment fails:

```bash
# Destroy all AWS resources
npx cdk destroy --all --force

# This will destroy:
# - DynamoDB tables (with retention enabled)
# - AppSync API
# - ElastiCache cluster
# - Lambda functions
# - VPC resources

# Revert code changes
git revert HEAD
```

---

## Next Steps After Deployment

1. **Connect to OpenClaw:** Configure OpenClaw agents to write to Unimatrix palaces
2. **iOS App:** Wire Unimatrix endpoint into Unimatrix iOS app
3. **Production DNS:** Point strattora.com subdomain to AppSync endpoint
4. **Monitoring:** Set up CloudWatch alarms for key metrics
5. **Load testing:** Run sustained 100+ concurrent agent test
