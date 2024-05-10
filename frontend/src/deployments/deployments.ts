import { SubstrateDeployment } from "@scio-labs/use-inkathon"
import abi from "contracts/deployments/flipper/flipper.json"
import { address as linkDevelopment } from "contracts/deployments/flipper/development"
import { address as linkPopNetwork } from "contracts/deployments/flipper/pop-network"

export enum ContractIds {
  Flipper = "flipper",
}

const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.Flipper,
  networkId: "development",
  abi: abi,
  address: linkDevelopment,
}

const POP_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.Flipper,
  networkId: "pop-network-testnet",
  abi: abi,
  address: linkPopNetwork,
}



export const getDeployments = (): SubstrateDeployment[] => {
  const deployments: SubstrateDeployment[] = []

  deployments.push(POP_NETWORK_DEPLOYMENTS)
  deployments.push(DEVELOPMENT_DEPLOYMENTS)


  return deployments
}
