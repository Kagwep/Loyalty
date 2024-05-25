import React, {useEffect, useState} from 'react';
import CreateBanner from './CreateBaner';
import { createIcon } from '@download/blockies';
import { addressToEvm, encodeAddress } from "@polkadot/util-crypto"
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
import { PlayerStats } from './LeaderBoard';
import { InjectedAccount } from '@polkadot/extension-inject/types';

// Define the props interface using the Player interface
interface PlayerProfileProps {
    fetchBanners: () => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ fetchBanners }) => {

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

    const { contract } = useRegisteredContract(ContractIds.leaderBoard);

    const [isModalOpen, setModalOpen] = useState(false);
    const [truncatedEncodedAddress,setTruncatedEncodedAddress] = useState('');
    const [address, setAddress] = useState<string>("");
    const [player, setPlayer] = useState<PlayerStats>();
    const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

    const addressIcon = createIcon({
        seed: address,
      }).toDataURL();

        useEffect(() => {
            if (accounts){
                {(accounts || []).map((acc) => {
                    const encodedAddress = encodeAddress(
                      acc.address,
                      activeChain?.ss58Prefix || 42,
                    )
                   setAddress(acc.address)
                    const truncatedEncodedAddress = truncateHash(encodedAddress, 10)
                    setTruncatedEncodedAddress(truncatedEncodedAddress)
                  })}
              }
        },[accounts,address])

        const fetchPlayerStats = async (address) => {

            console.log(contract)
            if (!contract || !api) return

        
            setFetchIsLoading(true)
            try {
              const result = await contractQuery(api, '', contract, 'get_leader',undefined,[address])
              const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_leader')
              if (isError) throw new Error(decodedOutput)
                console.log(output)
    
            setPlayer(output);
    
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
            } finally {
              setFetchIsLoading(false)
            }
          }

          useEffect(() => {
            if(address && address !== ''){

                fetchPlayerStats(address)
            }
          }, [contract,address])

          console.log(player)

    return (

        <>
        
        {activeAccount ? 
        (
            <div className="bg-purple-950 text-white p-4 rounded-lg shadow-lg flex flex-col w-full items-center z-index-10">
                <img
                src={addressIcon}
                alt="Generated address icon"
                className="size-12 rounded-full"
                />
                <h2 className="text-xl font-bold mt-2">{truncatedEncodedAddress}</h2>

                <div className="flex flex-row">
                    <p className="text-purple-300 text-xl px-2">Points: {player?.points.toString()}</p>
                    <p className="text-purple-300 text-xl px-2">Minutes: {player?.minutes.toString()}</p>
                </div>

                <div className="flex flex-col w-full mt-4 items-center space-y-2">
                    <div className="flex justify-between items-center w-full max-w-xs px-4 py-2 bg-purple-800 rounded text-xl">
                        <span>Balance:</span>
                        <strong className='text-xl'>{player?.loyals.toString()} Loyals</strong>
                    </div>
                    <button className="w-full max-w-xs px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded text-center font-bold text-xl" disabled >
                        Withdraw
                    </button>
                    <button className="w-full max-w-xs px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center font-bold text-xl"  onClick={() => setModalOpen(true)}>
                        Create Banner
                    </button>
                </div>
                {isModalOpen && <CreateBanner closeModal={() => setModalOpen(false)} fetchBanners={fetchBanners}/>}
            </div>
        
            ): (
                <h2 className="text-xl font-bold mt-2 text-green-500"> Connect your wallet to continue</h2>
            )}
        </>

    );
};

export default PlayerProfile;
