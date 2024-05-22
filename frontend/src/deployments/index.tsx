import { SubstrateDeployment } from "@scio-labs/use-inkathon"

import {POP_NETWORK_DEPLOYMENTS as gameRoomPopNetwork } from './game_room/deployments'
import {DEVELOPMENT_DEPLOYMENTS as gameRoomDevelopmentNetwork} from './game_room/deployments'
import {ROCOCO_NETWORK_DEPLOYMENTS as gameRoomRococoNetwork} from './game_room/deployments'

import {POP_NETWORK_DEPLOYMENTS as marketplacePopNetwork } from './loyalty_marketplace/deployments'
import {DEVELOPMENT_DEPLOYMENTS as marketplaceDevelopmentNetwork} from './loyalty_marketplace/deployments'
import {ROCOCO_NETWORK_DEPLOYMENTS as marketplaceRococoNetwork} from './loyalty_marketplace/deployments'



import {POP_NETWORK_DEPLOYMENTS as leaderboardPopNetwork } from './leaderboard/deployments'
import {DEVELOPMENT_DEPLOYMENTS as leaderboardDevelopmentNetwork} from './leaderboard/deployments'
import {ROCOCO_NETWORK_DEPLOYMENTS as leaderboardRococoNetwork} from './leaderboard/deployments'

export const getDeployments = (): SubstrateDeployment[] => {
    const deployments: SubstrateDeployment[] = []
  
    deployments.push(gameRoomPopNetwork)
    deployments.push(gameRoomDevelopmentNetwork)
    deployments.push(gameRoomRococoNetwork)
    deployments.push(marketplaceRococoNetwork)
    deployments.push(marketplacePopNetwork)
    deployments.push(marketplaceDevelopmentNetwork)
    deployments.push(leaderboardDevelopmentNetwork)
    deployments.push(leaderboardPopNetwork)
    deployments.push(leaderboardRococoNetwork)
    
  
    return deployments
  }
  