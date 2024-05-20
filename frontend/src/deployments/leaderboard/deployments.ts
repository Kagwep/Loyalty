import { SubstrateDeployment } from "@scio-labs/use-inkathon"
import GameRoomMainnetABI  from "../../../contracts/deployments/game_room/game_room.json"
import MarketplaceABI from '../../../contracts/deployments/loyal_marketplace/loyalty_marketplace.json'
import { address as gameRoomDevelopment } from "../../../contracts/deployments/game_room/development"
import { address as gameRoomPopNetwork } from "../../../contracts/deployments/game_room/pop-network"
import { address as gameRoomRococoNetwork } from "../../../contracts/deployments/game_room/rococo"

import { address as marketplaceDevelopment } from "../../../contracts/deployments/loyal_marketplace/development"
import { address as marketplacePopNetwork } from "../../../contracts/deployments/loyal_marketplace/pop-network"
import { address as marketplaceRococoNetwork } from "../../../contracts/deployments/loyal_marketplace/rococo"

export enum ContractIds {
  GameRoom = "game_room",
  Markeplace = 'loyal_marketplace'
  
}

const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "development",
  abi: GameRoomMainnetABI,
  address: gameRoomDevelopment,
}

const POP_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "pop-network-testnet",
  abi: GameRoomMainnetABI,
  address: gameRoomPopNetwork,
}

const ROCOCO_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "contracts",
  abi: GameRoomMainnetABI,
  address: gameRoomRococoNetwork,
}




export const getDeployments = (): SubstrateDeployment[] => {
  const deployments: SubstrateDeployment[] = []

  deployments.push(POP_NETWORK_DEPLOYMENTS)
  deployments.push(DEVELOPMENT_DEPLOYMENTS)
  deployments.push(ROCOCO_NETWORK_DEPLOYMENTS)


  return deployments
}
