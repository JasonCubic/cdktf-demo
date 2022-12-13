import { AzurermProviderConfig } from '@cdktf/provider-azurerm/lib/provider/index.js';
import { Construct } from 'constructs';

import { provider } from '@cdktf/provider-azurerm';

// All of the classes and types are available in @cdktf/provider-azurerm
// this modifies the AzurermProviderConfig type to require that OIDC be set to true
interface AzurermOidcProviderConfig extends AzurermProviderConfig { useOidc: true }

class AzurermOidcProvider extends Construct {
  constructor(scope: Construct, name: string, options: AzurermOidcProviderConfig) {
    super(scope, name);
    new provider.AzurermProvider(this, 'azurerm', options);
  }
}

export default AzurermOidcProvider;
