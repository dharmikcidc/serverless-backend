#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessBackendStack } from '../lib/serverless-backend-stack';
import { CDKContext } from '../types';

export const getContext = async (app: cdk.App): Promise<CDKContext> => {
  return new Promise(async (resolve, reject) => {
    try {
      const environment = app.node
        .tryGetContext("environments")
      const globals = app.node.tryGetContext("globals");
      return resolve({ ...globals, ...environment });
    } catch (error) {
      console.error(error);
      return reject();
    }
  });
};
// Create Stacks
const createStacks = async () => {
  try {
    const app = new cdk.App();
    const context = await getContext(app);
    new ServerlessBackendStack(
      app,
      `${context.appName}-stack-${context.environment}`,
      context,
    );
  } catch (error) {
    console.error(error);
  }
};

createStacks();