#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ec2ScalingStack } from '../lib/ec2-scaling-stack';

const app = new cdk.App();

new Ec2ScalingStack(app, 'Ec2ScalingStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  vpcName: 'AriefhInfraStack/dev-vpc',
  domainName: 'ariefh.com',
  privateAlbSubnetIds: ['', ''],
});