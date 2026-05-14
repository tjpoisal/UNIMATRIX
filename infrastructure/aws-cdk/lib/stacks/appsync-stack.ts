import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AppSyncStack
 *
 * Sets up GraphQL API with:
 * - Cognito user pool auth
 * - Real-time subscriptions (WebSocket)
 * - DynamoDB resolvers for caching
 * - Lambda resolvers for complex logic
 * - CloudWatch logging
 */
export class AppSyncStack extends cdk.Stack {
  public readonly graphqlApi: appsync.GraphqlApi;
  public readonly apiEndpoint: string;
  public readonly apiKey: string;

  constructor(scope: Construct, id: string, props: cdk.StackProps & { userPool: cognito.UserPool; userPoolClient: cognito.UserPoolClient }) {
    super(scope, id, props);

    // Create GraphQL API with Cognito auth
    this.graphqlApi = new appsync.GraphqlApi(this, 'UnimatrixGraphQL', {
      name: 'unimatrix-api',
      schema: appsync.SchemaFile.fromAsset(
        path.join(__dirname, '../../lib/graphql/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.userPool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.API_KEY,
            apiKeyConfig: {
              expires: cdk.Duration.days(7),
            },
          },
        ],
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
        role: new iam.Role(this, 'AppSyncLogRole', {
          assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
          inlinePolicies: {
            allowLogs: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  actions: [
                    'logs:CreateLogDeliveryConfiguration',
                    'logs:GetLogDeliveryConfiguration',
                    'logs:UpdateLogDeliveryConfiguration',
                    'logs:DeleteLogDeliveryConfiguration',
                    'logs:ListLogDeliveryConfigurations',
                    'logs:PutResourcePolicy',
                    'logs:DescribeResourcePolicies',
                    'logs:DescribeLogGroups',
                  ],
                  resources: ['*'],
                }),
              ],
            }),
          },
        }),
      },
    });

    // Create DynamoDB tables for AppSync resolvers
    const palacesTable = this.createPalacesTable();
    const locationsTable = this.createLocationsTable();
    const memoriesTable = this.createMemoriesTable();
    const agentMetadataTable = this.createAgentMetadataTable();

    // Create data sources
    const palacesDatasource = this.graphqlApi.addDynamoDbDataSource(
      'PalacesDatasource',
      palacesTable
    );

    const locationsDatasource = this.graphqlApi.addDynamoDbDataSource(
      'LocationsDatasource',
      locationsTable
    );

    const memoriesDatasource = this.graphqlApi.addDynamoDbDataSource(
      'MemoriesDatasource',
      memoriesTable
    );

    const agentMetadataDatasource = this.graphqlApi.addDynamoDbDataSource(
      'AgentMetadataDatasource',
      agentMetadataTable
    );

    // Add resolvers for Query and Mutation types
    this.setupQueryResolvers(palacesDatasource, locationsDatasource, memoriesDatasource);
    this.setupMutationResolvers(palacesDatasource, locationsDatasource, memoriesDatasource, agentMetadataDatasource);
    this.setupSubscriptionResolvers();

    // Output API endpoint and key
    this.apiEndpoint = this.graphqlApi.apiEndpoint;

    new cdk.CfnOutput(this, 'GraphQLEndpoint', {
      value: this.apiEndpoint,
      exportName: 'UnimatrixGraphQLEndpoint',
    });

    new cdk.CfnOutput(this, 'GraphQLApiId', {
      value: this.graphqlApi.apiId,
      exportName: 'UnimatrixGraphQLApiId',
    });
  }

  private createPalacesTable(): dynamodb.Table {
    return new dynamodb.Table(this, 'PalacesTable', {
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'palaceId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamSpecification.NEW_AND_OLD_IMAGES,
      ttl: {
        attribute: 'expirationTime',
      },
    });
  }

  private createLocationsTable(): dynamodb.Table {
    return new dynamodb.Table(this, 'LocationsTable', {
      partitionKey: {
        name: 'palaceId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'locationId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamSpecification.NEW_AND_OLD_IMAGES,
      ttl: {
        attribute: 'expirationTime',
      },
    });
  }

  private createMemoriesTable(): dynamodb.Table {
    return new dynamodb.Table(this, 'MemoriesTable', {
      partitionKey: {
        name: 'locationId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'memoryId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamSpecification.NEW_AND_OLD_IMAGES,
      ttl: {
        attribute: 'expirationTime',
      },
      globalSecondaryIndexes: [
        {
          indexName: 'userIdIndex',
          partitionKey: {
            name: 'userId',
            type: dynamodb.AttributeType.STRING,
          },
          sortKey: {
            name: 'createdAt',
            type: dynamodb.AttributeType.NUMBER,
          },
          projectionType: dynamodb.ProjectionType.ALL,
        },
      ],
    });
  }

  private createAgentMetadataTable(): dynamodb.Table {
    return new dynamodb.Table(this, 'AgentMetadataTable', {
      partitionKey: {
        name: 'agentId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'palaceId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamSpecification.NEW_AND_OLD_IMAGES,
    });
  }

  private setupQueryResolvers(
    palacesDatasource: appsync.DynamoDbDataSource,
    locationsDatasource: appsync.DynamoDbDataSource,
    memoriesDatasource: appsync.DynamoDbDataSource
  ): void {
    // Query.getPalaces
    palacesDatasource.createResolver('GetPalacesResolver', {
      typeName: 'Query',
      fieldName: 'getPalaces',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($userId = $ctx.identity.sub)
        {
          "version" : "2018-05-29",
          "operation" : "Query",
          "index" : "userIdIndex",
          "query" : {
            "expression" : "userId = :userId",
            "expressionValues" : {
              ":userId" : $util.dynamodb.toDynamoDBJson($userId)
            }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    // Query.getMemoriesByLocation
    memoriesDatasource.createResolver('GetMemoriesByLocationResolver', {
      typeName: 'Query',
      fieldName: 'getMemoriesByLocation',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($locationId = $ctx.args.locationId)
        {
          "version" : "2018-05-29",
          "operation" : "Query",
          "key" : {
            "locationId" : $util.dynamodb.toDynamoDBJson($locationId)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    // Query.searchMemories
    memoriesDatasource.createResolver('SearchMemoriesResolver', {
      typeName: 'Query',
      fieldName: 'searchMemories',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($userId = $ctx.identity.sub)
        #set($query = $ctx.args.query)
        {
          "version" : "2018-05-29",
          "operation" : "Scan",
          "filter" : {
            "expression" : "userId = :userId AND contains(content, :query)",
            "expressionValues" : {
              ":userId" : $util.dynamodb.toDynamoDBJson($userId),
              ":query" : $util.dynamodb.toDynamoDBJson($query)
            }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
  }

  private setupMutationResolvers(
    palacesDatasource: appsync.DynamoDbDataSource,
    locationsDatasource: appsync.DynamoDbDataSource,
    memoriesDatasource: appsync.DynamoDbDataSource,
    agentMetadataDatasource: appsync.DynamoDbDataSource
  ): void {
    // Mutation.createPalace
    palacesDatasource.createResolver('CreatePalaceResolver', {
      typeName: 'Mutation',
      fieldName: 'createPalace',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($userId = $ctx.identity.sub)
        #set($palaceId = $util.autoId())
        #set($timestamp = $util.time.nowEpochSeconds())
        {
          "version" : "2018-05-29",
          "operation" : "PutItem",
          "key" : {
            "userId" : $util.dynamodb.toDynamoDBJson($userId),
            "palaceId" : $util.dynamodb.toDynamoDBJson($palaceId)
          },
          "attributeValues" : {
            "name" : $util.dynamodb.toDynamoDBJson($ctx.args.input.name),
            "description" : $util.dynamodb.toDynamoDBJson($ctx.args.input.description),
            "isPublic" : $util.dynamodb.toDynamoDBJson($ctx.args.input.isPublic),
            "createdAt" : $util.dynamodb.toDynamoDBJson($timestamp),
            "updatedAt" : $util.dynamodb.toDynamoDBJson($timestamp)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    // Mutation.createMemory
    memoriesDatasource.createResolver('CreateMemoryResolver', {
      typeName: 'Mutation',
      fieldName: 'createMemory',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($memoryId = $util.autoId())
        #set($timestamp = $util.time.nowEpochSeconds())
        #set($userId = $ctx.identity.sub)
        {
          "version" : "2018-05-29",
          "operation" : "PutItem",
          "key" : {
            "locationId" : $util.dynamodb.toDynamoDBJson($ctx.args.input.locationId),
            "memoryId" : $util.dynamodb.toDynamoDBJson($memoryId)
          },
          "attributeValues" : {
            "content" : $util.dynamodb.toDynamoDBJson($ctx.args.input.content),
            "tags" : $util.dynamodb.toDynamoDBJson($ctx.args.input.tags),
            "llmProvider" : $util.dynamodb.toDynamoDBJson($ctx.args.input.llmProvider),
            "llmModel" : $util.dynamodb.toDynamoDBJson($ctx.args.input.llmModel),
            "userId" : $util.dynamodb.toDynamoDBJson($userId),
            "createdAt" : $util.dynamodb.toDynamoDBJson($timestamp),
            "updatedAt" : $util.dynamodb.toDynamoDBJson($timestamp)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    // Mutation.updateMemory
    memoriesDatasource.createResolver('UpdateMemoryResolver', {
      typeName: 'Mutation',
      fieldName: 'updateMemory',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($timestamp = $util.time.nowEpochSeconds())
        {
          "version" : "2018-05-29",
          "operation" : "UpdateItem",
          "key" : {
            "locationId" : $util.dynamodb.toDynamoDBJson($ctx.args.input.locationId),
            "memoryId" : $util.dynamodb.toDynamoDBJson($ctx.args.input.memoryId)
          },
          "update" : {
            "expression" : "SET #content = :content, #tags = :tags, updatedAt = :timestamp",
            "expressionNames" : {
              "#content" : "content",
              "#tags" : "tags"
            },
            "expressionValues" : {
              ":content" : $util.dynamodb.toDynamoDBJson($ctx.args.input.content),
              ":tags" : $util.dynamodb.toDynamoDBJson($ctx.args.input.tags),
              ":timestamp" : $util.dynamodb.toDynamoDBJson($timestamp)
            }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    // Mutation.deleteMemory
    memoriesDatasource.createResolver('DeleteMemoryResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteMemory',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version" : "2018-05-29",
          "operation" : "DeleteItem",
          "key" : {
            "locationId" : $util.dynamodb.toDynamoDBJson($ctx.args.input.locationId),
            "memoryId" : $util.dynamodb.toDynamoDBJson($ctx.args.input.memoryId)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });
  }

  private setupSubscriptionResolvers(): void {
    // Subscription resolvers are automatically created for mutations
    // onCreateMemory, onUpdateMemory, onDeleteMemory subscriptions
    // are handled by AppSync real-time subscriptions
  }
}
