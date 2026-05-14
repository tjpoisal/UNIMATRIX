# Claude Code + Unimatrix — Complete Integration Requirements

**Purpose:** Claude Code (terminal-based Claude agent) must orchestrate all Unimatrix operations autonomously.

---

## Part 1: Claude Code Environment Setup

### 1.1 Installation & Verification

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify installation
which claude-code
claude-code --version

# Should output: claude-code version X.X.X

# Test basic operation
echo "ls -la" | claude-code

# Should execute `ls -la` and return results
```

### 1.2 Configuration File

Claude Code reads from `~/.claude-code/config.json`:

```json
{
  "apiKey": "sk-ant-xxxxxxxxxxxxx",
  "model": "claude-sonnet-4-20250514",
  "workspace": "/Users/tim/unimatrix-backend",
  "environment": {
    "AWS_REGION": "us-east-1",
    "AWS_PROFILE": "default",
    "NODE_ENV": "development",
    "ANTHROPIC_API_KEY": "sk-ant-xxxxxxxxxxxxx",
    "APPSYNC_ENDPOINT": "https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql",
    "APPSYNC_API_KEY": "da2-xxxxxxxxxxxxx",
    "REDIS_ENDPOINT": "unimatrix-redis-xxx.ng.0001.use1.cache.amazonaws.com",
    "REDIS_PORT": "6379"
  },
  "shell": {
    "executable": "/bin/zsh",
    "profile": "~/.zshrc"
  },
  "tools": {
    "enabled": [
      "filesystem",
      "process",
      "git",
      "npm",
      "aws",
      "docker"
    ]
  },
  "logging": {
    "level": "info",
    "file": "~/.claude-code/logs/claude-code.log"
  }
}
```

### 1.3 Directory Structure

Claude Code needs this workspace layout:

```
~/unimatrix-backend/
├── src/
│   ├── unimatrix-claude-integration.ts
│   ├── unimatrix-appsync-client.ts
│   ├── unimatrix-dynamodb-client.ts
│   └── unimatrix-redis-client.ts
├── lib/
│   ├── unimatrix-stack.ts
│   └── index.ts
├── lambdas/
│   ├── embedding/
│   │   ├── index.py
│   │   └── requirements.txt
│   └── agent-trigger/
│       ├── index.js
│       └── package.json
├── resolvers/
│   ├── writeToPalace-request.vtl
│   └── writeToPalace-response.vtl
├── tests/
│   ├── unimatrix.test.ts
│   ├── claude-integration.test.ts
│   └── end-to-end.test.ts
├── scripts/
│   ├── deploy.sh
│   ├── test.sh
│   └── monitor.sh
├── package.json
├── tsconfig.json
├── cdk.json
└── .env
```

---

## Part 2: What Claude Code Must Do

### 2.1 AWS CLI Integration

Claude Code must **execute AWS CLI commands** for infrastructure management:

```bash
# Claude Code must have access to these commands:
aws cdk synth
aws cdk deploy
aws dynamodb list-tables
aws appsync list-graphql-apis
aws lambda list-functions
aws elasticache describe-cache-clusters
aws cloudwatch get-metric-statistics
```

**Requirements:**

1. **AWS Credentials:**
   ```bash
   # Must be configured in ~/.aws/credentials
   [default]
   aws_access_key_id = AKIAIOSFODNN7EXAMPLE
   aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   region = us-east-1
   ```

2. **IAM Permissions:**
   Claude Code (via your AWS identity) needs:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:*",
           "appsync:*",
           "lambda:*",
           "elasticache:*",
           "ec2:*",
           "iam:*",
           "cloudformation:*",
           "logs:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **CDK Bootstrap (one-time):**
   ```bash
   # Claude Code must run this once per AWS account:
   cdk bootstrap aws://ACCOUNT_ID/us-east-1
   ```

### 2.2 Node.js / TypeScript Integration

Claude Code must **build and test TypeScript** code:

```bash
# Claude Code needs these tools installed:
node --version          # v20.10.0+
npm --version          # v10.0.0+
npx tsc --version      # TypeScript 5.0+
ts-node --version      # ts-node 10.0+

# These npm packages must be installed in workspace:
npm list @anthropic-ai/sdk      # Claude API
npm list aws-cdk                # AWS CDK
npm list aws-sdk               # AWS SDK
npm list dotenv                # Environment variables
npm list node-fetch            # GraphQL queries
npm list redis                 # Redis client
npm list jest                  # Testing
```

**package.json must include:**

```json
{
  "name": "unimatrix-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "deploy": "cdk deploy --all --require-approval never",
    "synth": "cdk synth",
    "test": "jest",
    "test:e2e": "jest --testPathPattern=e2e",
    "monitor": "ts-node scripts/monitor.ts",
    "logs": "ts-node scripts/logs.ts",
    "destroy": "cdk destroy --all --force"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "aws-sdk": "^2.1500.0",
    "aws-cdk-lib": "^2.100.0",
    "constructs": "^10.0.0",
    "dotenv": "^16.3.1",
    "redis": "^4.6.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

### 2.3 Python Integration (For Lambda Embedding Function)

Claude Code must **build and package Python Lambda functions**:

```bash
# Claude Code needs:
python3 --version      # v3.11+
pip3 --version        # v23.0+

# These Python packages in lambdas/embedding:
pip3 list | grep -i sentence-transformers
pip3 list | grep -i boto3
pip3 list | grep -i redis
pip3 list | grep -i numpy
```

**lambdas/embedding/requirements.txt:**

```
boto3==1.28.87
botocore==1.31.87
sentence-transformers==2.2.2
redis==4.5.5
numpy==1.24.3
torch==2.0.1
scikit-learn==1.3.0
```

Claude Code workflow for Lambda:
```bash
cd lambdas/embedding
pip install -r requirements.txt -t .
zip -r ../embedding-function.zip .
aws lambda update-function-code \
  --function-name unimatrix-embedding-fn \
  --zip-file fileb://../embedding-function.zip
```

### 2.4 Git Integration

Claude Code must **commit and push** infrastructure changes:

```bash
# Claude Code needs access to:
git status
git add .
git commit -m "message"
git push origin main

# Requires:
- Git configured: git config --global user.email "tim@getstackmax.com"
- GitHub PAT: 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 (already in memory)
- Remote configured: git remote add origin https://github.com/tjpoisal/unimatrix-backend.git
```

---

## Part 3: Claude Code Task Workflows

### 3.1 Infrastructure Deployment Workflow

**Task:** Deploy entire Unimatrix stack to AWS

**Claude Code must execute in sequence:**

```
1. Verify AWS credentials
   → aws sts get-caller-identity
   
2. Verify Node.js environment
   → npm list @anthropic-ai/sdk aws-cdk-lib
   
3. Install dependencies
   → npm install (if package-lock.json missing)
   
4. Build TypeScript
   → npm run build
   
5. Synthesize CDK
   → cdk synth
   → Capture outputs to cdk.context.json
   
6. Deploy infrastructure
   → cdk deploy --all --require-approval never
   → Wait for completion (~10 minutes)
   → Capture outputs to outputs.json
   
7. Extract credentials from outputs
   → Parse outputs.json
   → Export APPSYNC_ENDPOINT, REDIS_ENDPOINT, API_KEY
   → Update .env file
   
8. Build Lambda functions
   → cd lambdas/embedding
   → pip install -r requirements.txt -t .
   → zip -r ../embedding-function.zip .
   → Deploy: aws lambda update-function-code --zip-file
   
9. Verify AppSync API
   → Make test GraphQL query
   → Verify response success
   
10. Verify Redis
    → Connect to Redis endpoint
    → Test SET/GET operations
    
11. Create git commit
    → git add .
    → git commit -m "Deploy: Unimatrix infrastructure"
    → git push origin main
    
12. Summary report
    → Print all endpoints
    → Print costs
    → Print next steps
```

### 3.2 Testing Workflow

**Task:** Run all Unimatrix tests

**Claude Code must execute:**

```
1. Run unit tests
   → npm run test
   
2. Run integration tests
   → npm run test:integration
   
3. Run end-to-end tests
   → npm run test:e2e
   
4. Load test (concurrent writes)
   → ts-node tests/load-test.ts
   → Report: latency, throughput, errors
   
5. Vector search validation
   → Verify embedding function works
   → Check vector similarity scores
   
6. Agent collaboration test
   → Trigger agent-trigger Lambda
   → Verify cross-palace communication
   
7. Report results
   → Print test summary
   → Identify failures
   → Suggest fixes
```

### 3.3 Monitoring Workflow

**Task:** Monitor Unimatrix health (runs periodically)

**Claude Code must execute:**

```
1. DynamoDB metrics
   → aws cloudwatch get-metric-statistics --metric-name ConsumedWriteCapacityUnits
   
2. AppSync metrics
   → aws cloudwatch get-metric-statistics --metric-name Requests
   
3. Lambda errors
   → aws cloudwatch get-metric-statistics --metric-name Errors
   
4. Redis memory
   → redis-cli INFO memory
   
5. Log tail (recent errors)
   → aws logs tail /aws/appsync/unimatrix-api
   → aws logs tail /aws/lambda/unimatrix-embedding-fn
   
6. Alarm status
   → aws cloudwatch describe-alarms
   
7. Report summary
   → Print health status
   → Flag any issues
   → Suggest remediation
```

---

## Part 4: MCP (Model Context Protocol) Setup

Claude Code must integrate with **MCP servers** to access tools:

### 4.1 Required MCP Servers

Claude Code needs these MCP servers connected:

1. **AWS CLI MCP**
   ```bash
   # Provides: aws commands
   # Required for: cdk deploy, dynamodb queries, lambda invocation
   ```

2. **Filesystem MCP** (built-in)
   ```bash
   # Provides: read/write files, directory listing
   # Already available via Desktop Commander
   ```

3. **Git MCP**
   ```bash
   # Provides: git operations
   # Required for: committing code
   ```

4. **Process MCP** (built-in)
   ```bash
   # Provides: shell command execution
   # Required for: npm install, aws cli, python
   ```

### 4.2 MCP Configuration for Claude Code

Create `~/.claude-code/mcp.json`:

```json
{
  "servers": [
    {
      "name": "aws-cli",
      "command": "aws",
      "args": ["--version"],
      "environment": {
        "AWS_REGION": "us-east-1",
        "AWS_PROFILE": "default"
      },
      "enabled": true
    },
    {
      "name": "git",
      "command": "git",
      "args": ["--version"],
      "enabled": true
    },
    {
      "name": "node-npm",
      "command": "npm",
      "args": ["--version"],
      "environment": {
        "NODE_ENV": "development"
      },
      "enabled": true
    },
    {
      "name": "python",
      "command": "python3",
      "args": ["--version"],
      "enabled": true
    },
    {
      "name": "redis-cli",
      "command": "redis-cli",
      "args": ["--version"],
      "enabled": true
    }
  ]
}
```

---

## Part 5: Permissions & Security

### 5.1 File Permissions

Claude Code must have **read/write access**:

```bash
# Make workspace writable
chmod -R 755 ~/unimatrix-backend
chmod -R 755 ~/unimatrix-backend/src
chmod -R 755 ~/unimatrix-backend/lambdas
chmod -R 755 ~/unimatrix-backend/tests

# Ensure .env is readable by Claude Code
chmod 600 ~/unimatrix-backend/.env
```

### 5.2 Environment Variables

Claude Code must access **sensitive credentials**. Set in `.env`:

```bash
# Create ~/.env or ~/unimatrix-backend/.env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
APPSYNC_API_KEY=da2-xxxxxxxxxxxxx
APPSYNC_ENDPOINT=https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
REDIS_ENDPOINT=unimatrix-redis-xxx.ng.0001.use1.cache.amazonaws.com
REDIS_PORT=6379
GITHUB_TOKEN=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
```

### 5.3 AWS Credentials

Claude Code reads from `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
region = us-east-1
```

---

## Part 6: Error Handling & Fallbacks

### 6.1 What Claude Code Must Handle

**Scenario:** CDK deploy fails

Claude Code recovery:
```
1. Capture error message
2. Check CloudFormation events for root cause
3. Suggest fix based on error type:
   - "Resource already exists" → Destroy and redeploy
   - "IAM permission denied" → Check policy
   - "VPC limit exceeded" → Increase limit or use different region
4. Re-attempt if user confirms
5. Rollback if unrecoverable
```

**Scenario:** Lambda deployment fails

Claude Code recovery:
```
1. Check if function exists (aws lambda get-function)
2. If not, create it (aws lambda create-function)
3. If exists, update it (aws lambda update-function-code)
4. Verify deployment (aws lambda get-function-configuration)
5. Test invocation (aws lambda invoke)
```

**Scenario:** AppSync query fails

Claude Code recovery:
```
1. Check API key validity
2. Check endpoint connectivity (curl)
3. Verify GraphQL query syntax
4. Check DynamoDB table permissions
5. Suggest fixes or fallback to raw DynamoDB queries
```

### 6.2 Logging & Debugging

Claude Code must maintain logs:

```bash
# Logs to ~/.claude-code/logs/claude-code.log
# Each operation logged with:
# - Timestamp
# - Command executed
# - Exit code
# - Output/errors
# - Time taken

# Claude Code can tail logs:
tail -f ~/.claude-code/logs/claude-code.log
```

---

## Part 7: Integration with Unimatrix System

### 7.1 Claude Code ↔ Unimatrix Data Flow

```
Claude Code (terminal)
    ↓
AWS CDK deploy
    ↓
Creates: DynamoDB + AppSync + ElastiCache + Lambda
    ↓
Claude Code configures environment variables
    ↓
Claude Code runs tests
    ↓
Tests use unimatrix-claude-integration.ts
    ↓
Which queries palaces via AppSync
    ↓
Which reads/writes DynamoDB & Redis
    ↓
Claude Code validates results
    ↓
Claude Code commits to GitHub
```

### 7.2 Claude Code + OpenClaw Integration

Once Unimatrix is live, Claude Code can:

```
1. Verify OpenClaw is running
   → Check port 18789
   
2. Register OpenClaw with Unimatrix
   → Create palace for OpenClaw agents
   → Set up agent subscriptions
   
3. Monitor agent execution
   → Check palace writes from agents
   → Verify agent collaboration
   
4. Auto-scale agents
   → If write latency > threshold
   → Increase Redis cluster size
```

---

## Part 8: Complete Claude Code Prompt for Unimatrix

When you invoke Claude Code, use this system prompt:

```
You are Claude Code, an autonomous agent responsible for building and managing Unimatrix.

## Your Mission
1. Deploy AWS infrastructure (CDK)
2. Build and test Node.js/TypeScript backend
3. Build and deploy Python Lambda functions
4. Verify all components work
5. Monitor system health
6. Git commit all changes

## Tools You Have
- AWS CLI (cdk, dynamodb, lambda, appsync, elasticache)
- Node.js (npm, npx, ts-node, typescript)
- Python (pip, python3)
- Git (commit, push)
- Shell (bash, zsh)
- File I/O (read, write, chmod)

## Workspace
Your workspace is: ~/unimatrix-backend/
All code is TypeScript/Python in this directory.
All AWS interactions use CDK or AWS CLI.

## Critical Rules
1. ALWAYS verify AWS credentials before deployment
2. ALWAYS run tests before committing
3. ALWAYS capture deployment outputs to .env
4. ALWAYS check error logs if something fails
5. NEVER skip steps (deploy → test → commit)
6. NEVER delete production resources without confirmation

## Success Metrics
- ✅ CDK synth completes without errors
- ✅ CDK deploy completes in <15 minutes
- ✅ All 4 DynamoDB tables created
- ✅ AppSync API responds to GraphQL queries
- ✅ Redis cluster is accessible
- ✅ Lambda embedding function works
- ✅ All tests pass
- ✅ Code committed to GitHub

## Starting Tasks
1. Verify environment setup
2. Deploy CDK stack
3. Run test suite
4. Monitor system for 5 minutes
5. Report status

Begin.
```

---

## Summary: What Claude Code Needs

| Component | Requirements | Status |
|-----------|--------------|--------|
| **Node.js** | v20.10.0+, npm 10.0.0+ | ✅ |
| **TypeScript** | 5.0+, ts-node 10.0+ | ✅ |
| **Python** | 3.11+, pip3 | ✅ |
| **AWS CLI** | Latest version, configured credentials | ✅ |
| **Git** | Latest version, GitHub PAT configured | ✅ |
| **Redis CLI** | Latest version (optional, for monitoring) | ✅ |
| **Workspace** | ~/unimatrix-backend/ with correct structure | Create |
| **Environment** | .env with all credentials | Create |
| **AWS Permissions** | IAM policy with CDK + Lambda + DynamoDB access | Create |
| **CDK Bootstrap** | Run once per AWS account | Required |
| **package.json** | All dependencies listed | Create |
| **MCP Servers** | AWS CLI, Git, Process, Filesystem | Connect |

---

## Next: What Should You Do Now, Sir?

Claude Code is ready to orchestrate once you:

1. **Create the workspace directory** — `mkdir -p ~/unimatrix-backend/{src,lib,lambdas,tests,scripts,resolvers}`
2. **Copy the files** I created into proper locations
3. **Create .env** with your AWS credentials
4. **Run CDK bootstrap** — `cdk bootstrap aws://ACCOUNT_ID/us-east-1`
5. **Invoke Claude Code** — `claude-code "Deploy Unimatrix infrastructure"`

**Or should I detail exactly which files go where, and the precise setup order?**
