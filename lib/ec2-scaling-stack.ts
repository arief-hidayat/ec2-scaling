import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';

interface Ec2ScalingStackProps extends cdk.StackProps {
  vpcName: string
  domainName: string
}
export class Ec2ScalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2ScalingStackProps) {
    super(scope, id, props);
    const vpc = ec2.Vpc.fromLookup(this, 'dev-vpc', {vpcName: props.vpcName});


    const namespace = new servicediscovery.PrivateDnsNamespace(this, 'Namespace', {
      name: props.domainName,
      vpc,
    });

    const loadbalancer = new elbv2.ApplicationLoadBalancer(this, 'LB',
        { vpc, internetFacing: false });

    const serviceA = namespace.createService('ServiceA', {
      name: "service-a",
      dnsRecordType: servicediscovery.DnsRecordType.A_AAAA,
      dnsTtl: cdk.Duration.seconds(30),
      loadBalancer: true,
    });
    serviceA.registerLoadBalancer('lb-a', loadbalancer);

    const serviceB = namespace.createService('ServiceB', {
      name: "service-b",
      dnsRecordType: servicediscovery.DnsRecordType.A_AAAA,
      dnsTtl: cdk.Duration.seconds(30),
      loadBalancer: true,
    });
    serviceB.registerLoadBalancer('lb-b', loadbalancer);


    // const arnService = namespace.createService('ArnService', {
    //   discoveryType: servicediscovery.DiscoveryType.API,
    // });
    //
    // arnService.registerNonIpInstance('NonIpInstance', {
    //   customAttributes: { arn: 'arn://' },
    // });

  }
}
