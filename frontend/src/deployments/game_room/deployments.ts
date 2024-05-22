import GameRoomMainnetABI  from "../../../contracts/deployments/game_room/game_room.json"
import { address as gameRoomDevelopment } from "../../../contracts/deployments/game_room/development"
import { address as gameRoomPopNetwork } from "../../../contracts/deployments/game_room/pop-network"
import { address as gameRoomRococoNetwork } from "../../../contracts/deployments/game_room/rococo"


export enum ContractIds {
  GameRoom = "game_room",
}

export const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "development",
  abi: GameRoomMainnetABI,
  address: gameRoomDevelopment,
}

export const POP_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "pop-network-testnet",
  abi: GameRoomMainnetABI,
  address: gameRoomPopNetwork,
}

export const ROCOCO_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.GameRoom,
  networkId: "contracts",
  abi: GameRoomMainnetABI,
  address: gameRoomRococoNetwork,
}




