import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import {
  provider,
  resourceGroup,
  // virtualNetwork,
  // networkSecurityGroup,
  // networkSecurityRule,
  // publicIp,
  // subnet,
  // subnetNetworkSecurityGroupAssociation,
  // networkInterface,
  // linuxVirtualMachine,
  // dataAzurermPublicIp,
} from '@cdktf/provider-azurerm';
// import { AwsProvider } from "./.gen/providers/aws/provider";
// import { Instance } from "./.gen/providers/aws/instance";

class MyStack extends TerraformStack {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(scope: Construct, id: string) {
    super(scope, id);
    console.log('made it');
    // const tenantId = new TerraformVariable(this, 'TF_VAR_tenantId', { type: 'string' });
    // const subscriptionId = new TerraformVariable(this, 'TF_VAR_subscriptionId', { type: 'string' });
    // const clientId = new TerraformVariable(this, 'TF_VAR_clientId', { type: 'string' });
    // const clientSecret = new TerraformVariable(this, 'TF_VAR_clientSecret', { type: 'string', sensitive: true });

    new provider.AzurermProvider(this, 'azurerm', {
      // // https://stackoverflow.com/questions/45661109/are-azure-subscription-id-aad-tenant-id-and-aad-app-client-id-considered-secre
      // tenantId: '',
      // subscriptionId: '',
      features: {},
    });

    // const azurermResourceGroupMtcRg =
    new resourceGroup.ResourceGroup(
      this,
      'mtc2-rg',
      {
        location: 'eastus',
        name: 'mtc2-resources',
        tags: {
          environment: 'dev',
        },
      },
    );

    // tenant_id       = var.tenant_id       # Optional, could get this from ARM_TENANT_ID Environment Variable
    // subscription_id = var.subscription_id # Optional, could get this from ARM_SUBSCRIPTION_ID Environment Variable
    // client_id       = var.client_id       # Optional, could get this from ARM_CLIENT_ID Environment Variable
    // client_secret   = var.client_secret   # Optional, could get this from ARM_CLIENT_SECRET Environment Variable

    // new AwsProvider(this, 'aws', {
    //   region: 'us-east-1',
    // });

    // new Instance(this, 'Hello', {
    //   ami: 'ami-2757f631',
    //   instanceType: 't2.micro',
    // });
  }
}

// const app = new App();

// app.synth();

export default (app: App, stackName: string) => new MyStack(app, stackName);

// export default MyStack;
