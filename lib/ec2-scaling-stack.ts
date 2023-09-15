import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';

interface Ec2ScalingStackProps extends cdk.StackProps {
  vpcName: string
  domainName: string
  privateAlbSubnetIds: string[]
  loadBalancedServices: LoadBalancedService[]
}

interface LoadBalancedService {
  lbName: string
  services: string[]
}

export class Ec2ScalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2ScalingStackProps) {
    super(scope, id, props);
    const vpc = ec2.Vpc.fromLookup(this, 'dev-vpc', {vpcName: props.vpcName});
    const privateAlbSubnets = props.privateAlbSubnetIds.map( (subnetId) => ec2.Subnet.fromSubnetId(this, subnetId, subnetId))
    const namespace = new servicediscovery.PrivateDnsNamespace(this, 'Namespace', {
      name: props.domainName,
      vpc,
    });

    for(var i=0; i< props.loadBalancedServices.length; i++) {
      const lbSvc = props.loadBalancedServices[i]
      const loadbalancer = new elbv2.ApplicationLoadBalancer(this, 'lb'+ i,
          { loadBalancerName: lbSvc.lbName, vpc, internetFacing: false, vpcSubnets: {subnets: privateAlbSubnets}});

      for(var j=0;j <lbSvc.services.length; j++) {
        const svc = namespace.createService('lb'+ i + '-svc'+j, {
          name: lbSvc.services[j],
          dnsRecordType: servicediscovery.DnsRecordType.A_AAAA,
          dnsTtl: cdk.Duration.seconds(30),
          loadBalancer: true,
        });
        svc.registerLoadBalancer('lb'+ i + '-svc-inst'+j, loadbalancer);
      }
    }
  }
}
