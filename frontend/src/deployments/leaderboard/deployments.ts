
import leaderBoardMainnetABI  from "../../../contracts/deployments/leaderboard/leaderboard.json"
import { address as leaderBoardDevelopment } from "../../../contracts/deployments/leaderboard/development"
import { address as leaderBoardPopNetwork } from "../../../contracts/deployments/leaderboard/pop-network"
import { address as leaderBoardRococoNetwork } from "../../../contracts/deployments/leaderboard/rococo"



export enum ContractIds {
  leaderBoard = "leaderboard",
  
}

export const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.leaderBoard,
  networkId: "development",
  abi: leaderBoardMainnetABI,
  address: leaderBoardDevelopment,
}

export const POP_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.leaderBoard,
  networkId: "pop-network-testnet",
  abi: leaderBoardMainnetABI,
  address: leaderBoardPopNetwork,
}

export const ROCOCO_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.leaderBoard,
  networkId: "contracts",
  abi: leaderBoardMainnetABI,
  address: leaderBoardRococoNetwork,
}



