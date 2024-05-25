// Import React and necessary hooks
import React, {useState,useEffect} from 'react';
import { encodeAddress } from "@polkadot/util-crypto"
import { FaCrown } from 'react-icons/fa';
import {
  SubstrateWalletPlatform,
  allSubstrateWallets,
  isWalletInstalled,
  useInkathon,
  contractQuery,
  decodeOutput,
  useRegisteredContract,
} from "@scio-labs/use-inkathon"
import { ContractIds } from "@/deployments/leaderboard/deployments";
import toast from 'react-hot-toast';
import { truncateHash } from "@/utils/truncate-hash"

export interface PlayerStats {
    leader_account: string;
    id: number;
    leaderAccount: AccountId;
    points: bigint;
    games: number;
    numberCrowned: number;
    loyals: bigint;
    minutes: bigint;
}

// Assuming AccountId is another type you have defined, perhaps like this:
type AccountId = string;  // or whatever type AccountId should be, based on your application's context


// The Leaderboard Component
const Leaderboard = () => {

    const {
        activeChain,
        connect,
        disconnect,
        activeAccount,
        accounts,
        setActiveAccount,
        api,
        isConnected 
      } = useInkathon()

     // console.log(ContractIds)

      const { contract } = useRegisteredContract(ContractIds.leaderBoard);

      const [players, setPlayers] = useState<PlayerStats[]>([])
      const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

      const fetchPlayerStats = async () => {

        console.log(contract)
        if (!contract || !api) return
    
        setFetchIsLoading(true)
        try {
          const result = await contractQuery(api, '', contract, 'get_all_leaders')
          const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_leaders')
          if (isError) throw new Error(decodedOutput)
            console.log(output)

          const updatedPlayers = output.map((player: PlayerStats) => ({
            ...player,
            leader_account: truncateHash(player.leaderAccount, 10)  // Truncate leader_account
        }));

        setPlayers(updatedPlayers);

          // NOTE: Currently disabled until `typechain-polkadot` dependencies are upted to support ink! v5
          // Alternatively: Fetch it with typed contract instance
          // const typedResult = await typedContract.query.greet()
          // console.log('Result from typed contract: ', typedResult.value)
        } catch (e) {
          console.error(e)
          toast.error('Error while fetching Rooms. Try again…', {
            style: {
                color: '#000', // White text color
                fontSize:10
            }
          });
          setPlayers([])
        } finally {
          setFetchIsLoading(false)
        }
      }
      useEffect(() => {
        fetchPlayerStats()
      }, [contract])

      console.log(players)

    return (
        <div className="max-w-screen-lg my-10 mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gray-800 text-white text-lg font-semibold p-4">Leaderboard</div>
            <ul className="divide-y divide-gray-300">
                {players.map((player) => (
                    <li key={player.id} className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="ml-4 font-medium text-2xl text-purple-500">{player.leader_account}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="ml-4 font-medium text-2xl">{player.minutes.toString()} minutes</span>
                        </div>
                        <div className="flex items-center">
                            <span className="ml-4 font-medium text-2xl text-orange-600 px-2">{player.numberCrowned.toString()}</span> <FaCrown size={16} color='gold'/>
                        </div>
                        <div className="flex items-center">
                            <span className="ml-4 font-medium text-2xl text-purple-900">{player.loyals.toString()} Loyals</span>
                        </div>
                        <span className="font-medium text-green-600 text-2xl">{player.points.toString()} pts</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
