import { SubstrateDeployment } from "@scio-labs/use-inkathon"
import MarketplaceABI from '../../../contracts/deployments/loyal_marketplace/loyalty_marketplace.json'

import { address as marketplaceDevelopment } from "../../../contracts/deployments/loyal_marketplace/development"
import { address as marketplacePopNetwork } from "../../../contracts/deployments/loyal_marketplace/pop-network"
import { address as marketplaceRococoNetwork } from "../../../contracts/deployments/loyal_marketplace/rococo"

export enum ContractIds {
  Marketplace = 'loyalty_marketplace',
}

export const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.Marketplace,
  networkId: "development",
  abi: MarketplaceABI,
  address: marketplaceDevelopment,
}

export const POP_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.Marketplace,
  networkId: "pop-network-testnet",
  abi: MarketplaceABI,
  address: marketplacePopNetwork ,
}

export const ROCOCO_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.Marketplace,
  networkId: "contracts",
  abi: MarketplaceABI,
  address: marketplaceRococoNetwork,
}


