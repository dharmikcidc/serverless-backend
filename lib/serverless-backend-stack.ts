import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from 'constructs';
import { CDKContext } from '../types';
import { UserPool, UserPoolClient, UserPoolOperation } from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ServerlessBackendStack extends cdk.Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  constructor(scope: Construct, id: string,context: CDKContext, props?: cdk.StackProps) {
    super(scope, id, props);
    // Cognito Pool
    const userPool = new UserPool(this, "userPool", {
      userPoolName: `${context.appName}-${context.environment}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
        },
        familyName: {
          mutable: true,
          required: true,
        },
        givenName: {
          mutable: true,
          required: true,
        },
      }
    });
    this.userPool = userPool;
    // App Client for user pool
    const userPoolClient = new UserPoolClient(this, "userPoolClient", {
      userPool: userPool,
      userPoolClientName: `${context.appName}-client-${context.environment}`,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });
    this.userPoolClient = userPoolClient;
    const customMessageLambda = new NodejsFunction(
      this,
      `CustomMessageLambda`,
      {
        entry: `lambda-handlers/message.handler.ts`,
        runtime: lambda.Runtime.NODEJS_18_X,
      }
    );
    // Grant permissions for Cognito to invoke the Lambda function
    customMessageLambda.addPermission("InvokePermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: userPool.userPoolArn,
    });
    // Add a Lambda trigger for custom messages and post confirmation
    userPool.addTrigger(UserPoolOperation.CUSTOM_MESSAGE, customMessageLambda);
  }
}
