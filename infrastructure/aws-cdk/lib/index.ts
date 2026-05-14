#!/usr/bin/env node
/**
 * Unimatrix AWS CDK Application
 * Deploys:
 * - Cognito (auth + MFA)
 * - RDS PostgreSQL (database)
 * - AppSync (GraphQL API + subscriptions)
 * - Lambda (mutations + routing)
 * - ElastiCache Redis (sessions + agent state)
 * - CloudWatch (monitoring + logging)
 */

import * as cdk from 'aws-cdk-lib';
import { UnimatrixStack } from './stacks/main-stack.js';

const app = new cdk.App();

const env = {
  region: process.env.AWS_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

// Main stack that orchestrates all sub-stacks
const mainStack = new UnimatrixStack(app, 'UnimatrixStack', {
  env,
  description: 'Unimatrix - AWS-native memory palace with multi-LLM integration',
});

// Tags for resource management
cdk.Tags.of(mainStack).add('Project', 'Unimatrix');
cdk.Tags.of(mainStack).add('Environment', 'Production');
cdk.Tags.of(mainStack).add('ManagedBy', 'CDK');
