import { SubstrateDeployment } from "@scio-labs/use-inkathon"
import abi from "../../contracts/deployments/game_room/game_room.json"
import { address as linkDevelopment } from "../../contracts/deployments/game_room/development"
import { address as linkPopNetwork } from "../../contracts/deployments/game_room/pop-network"
import { address as linkRococoNetwork } from "../../contracts/deployments/game_room/rococo"

export enum ContractIds {
  GameRoom = "game_room",
}

const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "development",
  abi: abi,
  address: linkDevelopment,
}

const POP_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "pop-network-testnet",
  abi: abi,
  address: linkPopNetwork,
}

const ROCOCO_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "contracts",
  abi: abi,
  address: linkRococoNetwork,
}




export const getDeployments = (): SubstrateDeployment[] => {
  const deployments: SubstrateDeployment[] = []

  deployments.push(POP_NETWORK_DEPLOYMENTS)
  deployments.push(DEVELOPMENT_DEPLOYMENTS)
  deployments.push(ROCOCO_NETWORK_DEPLOYMENTS)


  return deployments
}
