import path from 'path';
import { Fn, TerraformAsset, TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { NetworkInterface } from '@cdktf/provider-azurerm/lib/network-interface/index.js';
import { ResourceGroup } from '@cdktf/provider-azurerm/lib/resource-group/index.js';
import { PublicIp } from '@cdktf/provider-azurerm/lib/public-ip/index.js';
import { LinuxVirtualMachine } from '@cdktf/provider-azurerm/lib/linux-virtual-machine/index.js';
import { Subnet } from '@cdktf/provider-azurerm/lib/subnet/index.js';
import { DataAzurermPublicIp } from '@cdktf/provider-azurerm/lib/data-azurerm-public-ip/index.js';
import { VirtualMachineExtension } from '@cdktf/provider-azurerm/lib/virtual-machine-extension/index.js';
import currentDir from '../../utils/current-dir.js';

class SimpleLinuxVm extends Construct {
  private rg: ResourceGroup;

  private linuxVm: LinuxVirtualMachine;

  private tags: { [key: string]: string };

  public nic: NetworkInterface | undefined;

  constructor(scope: Construct, name: string, options: {
    resourceGroup: ResourceGroup,
    adminSshPublicKeyPath: string,
    adminSshUsername: string,
    adminUsername: string,
    tags: { [key: string]: string },
  }) {
    super(scope, name);
    this.rg = options.resourceGroup;
    this.tags = options.tags;

    this.linuxVm = new LinuxVirtualMachine(this, 'mtc-vm', {
      adminSshKey: [
        {
          publicKey: Fn.file(options.adminSshPublicKeyPath),
          username: options.adminSshUsername,
        },
      ],
      adminUsername: 'adminuser',
      location: this.rg.location,
      name: 'mtc-vm',
      networkInterfaceIds: [],
      osDisk: {
        caching: 'ReadWrite',
        storageAccountType: 'Standard_LRS',
      },
      resourceGroupName: this.rg.name,
      size: 'Standard_B1s',
      sourceImageReference: {
        offer: 'UbuntuServer',
        publisher: 'Canonical',
        sku: '18.04-LTS',
        version: 'latest',
      },
      tags: this.tags,
    });
  }

  addNicWithPublicIp(pip: PublicIp, subnet: Subnet) {
    this.nic = new NetworkInterface(this, 'mtc-nic', {
      ipConfiguration: [
        {
          name: 'internal',
          privateIpAddressAllocation: 'Dynamic',
          publicIpAddressId: pip.id,
          subnetId: subnet.id,
        },
      ],
      location: this.rg.location,
      name: 'mtc-nic',
      resourceGroupName: this.rg.name,
      tags: {
        environment: 'dev',
      },
    });
    this.linuxVm.networkInterfaceIds = [this.nic.id];
  }

  addVsCodeRemoteProvisoner(user: string, identityfile: string) {
    const addPublicIpToVsCodeRemoteAsset = new TerraformAsset(this, 'add-public-ip-to-vs-code-remote-asset', {
      path: path.resolve(currentDir(import.meta.url), `${process.platform === 'win32' ? 'windows' : 'linux'}-ssh-script.template`),
    });

    this.linuxVm.provisioners = [
      {
        type: 'local-exec',
        command: Fn.templatefile(
          addPublicIpToVsCodeRemoteAsset.path,
          {
            hostname: this.linuxVm.publicIpAddress,
            user,
            identityfile,
          },
        ),
        interpreter: process.platform === 'win32' ? ['powershell'] : ['bash', '-c'],
      },
    ];
  }

  outputPublicIpData(pip: PublicIp) {
    const dataAzurermPublicIpLinuxVmData = new DataAzurermPublicIp(this, 'mtc-ip-data', {
      dependsOn: [this.linuxVm],
      name: pip.name,
      resourceGroupName: this.rg.name,
    });

    new TerraformOutput(this, 'public_ip_address', {
      value: `${this.linuxVm.name}: ${dataAzurermPublicIpLinuxVmData.ipAddress}`,
    });
  }

  addDockerExtension() {
    // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/virtual_machine_extension
    // az vm extension image list --location eastus -o table
    new VirtualMachineExtension(this, 'linux-vm-docker-extension', {
      name: 'mtc-vm-docker-extension',
      virtualMachineId: this.linuxVm.id,
      publisher: 'Microsoft.Azure.Extensions',
      type: 'DockerExtension',
      typeHandlerVersion: '1.2',
      autoUpgradeMinorVersion: true,
      dependsOn: [this.linuxVm],
      tags: this.tags,
    });
  }
}

export default SimpleLinuxVm;
