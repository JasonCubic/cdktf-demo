import { AzurermProviderConfig } from '@cdktf/provider-azurerm/lib/provider/index.js';
import { Construct } from 'constructs';

import { provider } from '@cdktf/provider-azurerm';

// forces the use of OIDC
interface AzurermOidcProviderConfig extends AzurermProviderConfig { useOidc: true }

class AzurermOidcProvider extends Construct {
  constructor(scope: Construct, name: string, options: AzurermOidcProviderConfig) {
    super(scope, name);
    new provider.AzurermProvider(this, 'azurerm', options);
  }
}

export default AzurermOidcProvider;
