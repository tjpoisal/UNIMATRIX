import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class UnimatrixStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ============================================
    // VPC for ElastiCache
    // ============================================
    const vpc = new ec2.Vpc(this, 'UnimatrixVpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,  // Dev only, use NAT for prod
      subnetConfiguration: [
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // ============================================
    // DynamoDB Tables
    // ============================================

    // Table 1: Palace Data
    const palacesTable = new dynamodb.Table(this, 'UnimatrixPalaces', {
      tableName: 'unimatrix-palaces',
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,  // Auto-scale
      timeToLiveAttribute: 'ttl',
      stream: dynamodb.StreamSpecification.NEW_AND_OLD_IMAGES,  // For Lambda
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI: Query by userId (for "get my palaces")
    palacesTable.addGlobalSecondaryIndex({
      indexName: 'userIdIndex',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Table 2: Conversation History
    const conversationTable = new dynamodb.Table(this, 'UnimatrixConversations', {
      tableName: 'unimatrix-conversation-history',
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Table 3: Agent Memory
    const agentMemoryTable = new dynamodb.Table(this, 'UnimatrixAgentMemory', {
      tableName: 'unimatrix-agent-memory',
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Table 4: Vector Index
    const vectorIndexTable = new dynamodb.Table(this, 'UnimatrixVectorIndex', {
      tableName: 'unimatrix-vector-index',
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ============================================
    // AppSync API
    // ============================================
    const api = new appsync.GraphqlApi(this, 'UnimatrixAPI', {
      name: 'unimatrix-api',
      schema: appsync.SchemaFile.fromAsset('./schema.graphql'),  // We'll create this
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Duration.days(7),
          },
        },
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ERROR,
      },
    });

    // AppSync Data Sources
    const palacesDataSource = api.addDynamoDbDataSource('PalacesDS', palacesTable);
    const conversationDataSource = api.addDynamoDbDataSource('ConversationDS', conversationTable);
    const agentMemoryDataSource = api.addDynamoDbDataSource('AgentMemoryDS', agentMemoryTable);
    const vectorIndexDataSource = api.addDynamoDbDataSource('VectorIndexDS', vectorIndexTable);

    // ============================================
    // ElastiCache Redis Cluster
    // ============================================
    const redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc,
      description: 'Security group for Unimatrix Redis',
      allowAllOutbound: true,
    });

    // Allow inbound from Lambda
    redisSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('10.0.0.0/16'),  // VPC CIDR
      ec2.Port.tcp(6379),
      'Allow Redis from VPC'
    );

    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      subnetIds: vpc.privateSubnets.map(s => s.subnetId),
      description: 'Subnet group for Unimatrix Redis',
    });

    const redisCluster = new elasticache.CfnCacheCluster(this, 'UnimatrixRedis', {
      engine: 'redis',
      cacheNodeType: 'cache.t3.micro',  // Dev; use cache.r6g.large for prod
      numCacheNodes: 1,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      cacheSubnetGroupName: subnetGroup.ref,
      port: 6379,
      autoFailoverEnabled: false,  // Dev only
    });

    // ============================================
    // Lambda: Embedding Function
    // ============================================
    const embeddingFunction = new lambda.Function(this, 'EmbeddingFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lambdas/embedding'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,  // 1GB for ML model
      environment: {
        VECTOR_TABLE: vectorIndexTable.tableName,
        REDIS_ENDPOINT: redisCluster.attrRedisEndpoint.address,
        REDIS_PORT: '6379',
      },
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    // Grant Lambda permissions
    vectorIndexTable.grantWriteData(embeddingFunction);
    redisSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(embeddingFunction.connections.securityGroups[0].securityGroupId),
      ec2.Port.tcp(6379)
    );

    // ============================================
    // Lambda: Agent Trigger Function
    // ============================================
    const agentTriggerFunction = new lambda.Function(this, 'AgentTriggerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lambdas/agent-trigger'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        PALACE_TABLE: palacesTable.tableName,
        REDIS_ENDPOINT: redisCluster.attrRedisEndpoint.address,
        REDIS_PORT: '6379',
      },
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    palacesTable.grantReadData(agentTriggerFunction);

    // ============================================
    // AppSync Resolvers
    // ============================================

    // Query: getPalace
    palacesDataSource.createResolver('GetPalaceResolver', {
      typeName: 'Query',
      fieldName: 'getPalace',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('id', 'palace#$ctx.args.id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    // Mutation: writeToPalace
    palacesDataSource.createResolver('WriteToPalaceResolver', {
      typeName: 'Mutation',
      fieldName: 'writeToPalace',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('./resolvers/writeToPalace-request.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('./resolvers/writeToPalace-response.vtl'),
    });

    // ============================================
    // Outputs
    // ============================================
    new cdk.CfnOutput(this, 'APIEndpoint', {
      value: api.graphqlUrl,
      description: 'GraphQL API Endpoint',
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: redisCluster.attrRedisEndpoint.address,
      description: 'Redis Cluster Endpoint',
    });

    new cdk.CfnOutput(this, 'PalacesTableName', {
      value: palacesTable.tableName,
      description: 'Palaces DynamoDB Table',
    });
  }
}

// ============================================
// App Instantiation
// ============================================
const app = new cdk.App();
new UnimatrixStack(app, 'UnimatrixStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});
