import { SubstrateDeployment } from "@scio-labs/use-inkathon"
import MarketplaceAB  from "../../../contracts/deployments/game_room/game_room.json"
import MarketplaceABI from '../../../contracts/deployments/loyal_marketplace/loyalty_marketplace.json'

import { address as marketplaceDevelopment } from "../../../contracts/deployments/loyal_marketplace/development"
import { address as marketplacePopNetwork } from "../../../contracts/deployments/loyal_marketplace/pop-network"
import { address as marketplaceRococoNetwork } from "../../../contracts/deployments/loyal_marketplace/rococo"

export enum ContractIds {
  Markeplace = 'loyal_marketplace'
}

const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.Markeplace,
  networkId: "development",
  abi: MarketplaceABI,
  address: marketplaceDevelopment,
}

const POP_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.Markeplace,
  networkId: "pop-network-testnet",
  abi: MarketplaceAB,
  address: marketplacePopNetwork ,
}

const ROCOCO_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.Markeplace,
  networkId: "contracts",
  abi: MarketplaceAB,
  address: marketplaceRococoNetwork,
}




export const getDeployments = (): SubstrateDeployment[] => {
  const deployments: SubstrateDeployment[] = []

  deployments.push(POP_NETWORK_DEPLOYMENTS)
  deployments.push(DEVELOPMENT_DEPLOYMENTS)
  deployments.push(ROCOCO_NETWORK_DEPLOYMENTS)


  return deployments
}
