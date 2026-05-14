import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { Construct } from 'constructs';
import { AppSyncStack } from './appsync-stack.js';

/**
 * Main Unimatrix stack that orchestrates all infrastructure
 */
export class UnimatrixStack extends cdk.Stack {
  public cognitoUserPool: cognito.UserPool;
  public cognitoUserPoolClient: cognito.UserPoolClient;
  public rdsDatabase: rds.DatabaseInstance;
  public vpc: ec2.Vpc;
  public redisCluster: elasticache.CfnCacheCluster;
  public appSyncStack: AppSyncStack;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC for RDS and ElastiCache
    this.vpc = new ec2.Vpc(this, 'UnimatrixVpc', {
      cidr: '10.0.0.0/16',
      maxAzs: 3,
      natGateways: 1,
    });

    // Set up Cognito Auth
    this.setupCognito();

    // Set up RDS PostgreSQL
    this.setupRDS();

    // Set up ElastiCache Redis
    this.setupRedis();

    // Set up AppSync GraphQL API
    this.setupAppSync();

    // Output important values
    this.outputStackValues();
  }

  /**
   * Set up Cognito User Pool with MFA
   */
  private setupCognito(): void {
    this.cognitoUserPool = new cognito.UserPool(this, 'UnimatrixUserPool', {
      userPoolName: 'unimatrix-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerifiedAttrs: {
        email: true,
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create user pool client for web/mobile apps
    this.cognitoUserPoolClient = new cognito.UserPoolClient(
      this,
      'UnimatrixUserPoolClient',
      {
        userPool: this.cognitoUserPool,
        clientName: 'unimatrix-client',
        authFlows: {
          userPassword: true,
          userSrp: true,
          adminUserPassword: true,
        },
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.PROFILE,
          ],
          callbackUrls: [
            'http://localhost:3000',
            'http://localhost:3000/auth/callback',
            'https://unimatrix.app/auth/callback',
          ],
          logoutUrls: [
            'http://localhost:3000',
            'https://unimatrix.app',
          ],
        },
        preventUserExistenceErrors: true,
        enableTokenRevocation: true,
      }
    );

    // Create a domain for Cognito (for OAuth)
    new cognito.UserPoolDomain(this, 'UnimatrixUserPoolDomain', {
      userPool: this.cognitoUserPool,
      cognitoDomain: {
        domainPrefix: 'unimatrix',
      },
    });
  }

  /**
   * Set up RDS PostgreSQL database
   */
  private setupRDS(): void {
    // Security group for RDS
    const rdsSecurityGroup = new ec2.SecurityGroup(
      this,
      'UnimatrixRDSSecurityGroup',
      {
        vpc: this.vpc,
        description: 'Security group for Unimatrix RDS',
        allowAllOutbound: true,
      }
    );

    // Allow connections from within VPC
    rdsSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidr),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from VPC'
    );

    // Create RDS instance
    this.rdsDatabase = new rds.DatabaseInstance(this, 'UnimatrixDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_1,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      credentials: rds.Credentials.fromGeneratedSecret('postgres', {
        secretName: 'unimatrix/rds/password',
      }),
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [rdsSecurityGroup],
      databaseName: 'unimatrix',
      allocatedStorage: 100, // GB
      storageType: rds.StorageType.GP3,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: false, // Set to true in production
      multiAz: false, // Set to true in production for high availability
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    });
  }

  /**
   * Set up ElastiCache Redis cluster
   */
  private setupRedis(): void {
    // Security group for ElastiCache
    const redisSecurityGroup = new ec2.SecurityGroup(
      this,
      'UnimatrixRedisSecurityGroup',
      {
        vpc: this.vpc,
        description: 'Security group for Unimatrix Redis',
        allowAllOutbound: true,
      }
    );

    // Allow connections from within VPC
    redisSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidr),
      ec2.Port.tcp(6379),
      'Allow Redis from VPC'
    );

    // Create subnet group for ElastiCache
    const subnetGroup = new elasticache.CfnSubnetGroup(
      this,
      'UnimatrixRedisSubnetGroup',
      {
        subnetIds: this.vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }).subnetIds,
        description: 'Subnet group for Unimatrix Redis',
      }
    );

    // Create Redis cluster
    this.redisCluster = new elasticache.CfnCacheCluster(
      this,
      'UnimatrixRedisCluster',
      {
        cacheNodeType: 'cache.t3.micro',
        engine: 'redis',
        numCacheNodes: 1,
        port: 6379,
        vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
        cacheSubnetGroupName: subnetGroup.ref,
        automaicFailoverEnabled: false, // Set to true for production
      }
    );
  }

  /**
   * Set up AppSync GraphQL API
   */
  private setupAppSync(): void {
    this.appSyncStack = new AppSyncStack(this, 'AppSyncStack', {
      env: this.node.root.node.tryGetContext('env'),
      userPool: this.cognitoUserPool,
      userPoolClient: this.cognitoUserPoolClient,
      description: 'Unimatrix AppSync GraphQL API with real-time subscriptions',
    });
  }

  /**
   * Output important stack values
   */
  private outputStackValues(): void {
    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: this.cognitoUserPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'UnimatrixCognitoUserPoolId',
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolClientId', {
      value: this.cognitoUserPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'UnimatrixCognitoClientId',
    });

    new cdk.CfnOutput(this, 'RDSEndpoint', {
      value: this.rdsDatabase.dbInstanceEndpointAddress,
      description: 'RDS PostgreSQL Endpoint',
      exportName: 'UnimatrixRDSEndpoint',
    });

    new cdk.CfnOutput(this, 'RDSPort', {
      value: String(this.rdsDatabase.dbInstanceEndpointPort),
      description: 'RDS PostgreSQL Port',
      exportName: 'UnimatrixRDSPort',
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: this.redisCluster.attrRedisEndpoint.address || '',
      description: 'ElastiCache Redis Endpoint',
      exportName: 'UnimatrixRedisEndpoint',
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: 'UnimatrixVpcId',
    });

    new cdk.CfnOutput(this, 'GraphQLEndpoint', {
      value: this.appSyncStack.apiEndpoint,
      description: 'AppSync GraphQL API Endpoint',
      exportName: 'UnimatrixGraphQLEndpoint',
    });
  }
}
