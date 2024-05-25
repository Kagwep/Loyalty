import React, { useState,useEffect } from 'react';
import {
    SubstrateWalletPlatform,
    allSubstrateWallets,
    isWalletInstalled,
    useInkathon,
    contractQuery,
    decodeOutput,
    useRegisteredContract,
  } from "@scio-labs/use-inkathon"
  import { ContractIds } from "@/deployments/loyalty_marketplace/deployments";
import toast from 'react-hot-toast';
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'
import { Players } from '@/utils/commonGame';
import socket from '@/socket';
import { motion } from 'framer-motion'
import BannerNFTGrid from './BannersSelectHome';
import {
    parentNFTVariants,
    parentVariants,
    childVariants,
  } from '../animations/banners'

interface Props {
    isOpen: boolean;
    onClose: () => void;
    handleSetBanner: (bannerUrl:string) => void;

}

const BannersSet: React.FC<Props> = ({ isOpen, onClose,handleSetBanner}) => {

    const {
        activeChain,
        connect,
        disconnect,
        activeAccount,
        accounts,
        setActiveAccount,
        api,
        isConnected,
        activeSigner 
      } = useInkathon()

     // console.log(ContractIds)

      const { contract } = useRegisteredContract(ContractIds.Marketplace)
      //onsole.log(contract)

      const [isModalOpen, setModalOpen] = useState(false);
      const [banners, setBanners] = useState([]);
      const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

       if (accounts){
            
        const account = accounts[0];

        //console.log(account)

       // console.log("gfffg",activeAccount)
       }
       
       const fetchBaners= async () => {

        console.log(contract)
        if (!contract || !api) return
      
        setFetchIsLoading(true)
        try {
          const result = await contractQuery(api, '', contract, 'get_all_listings')
          const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_listings')
          if (isError) throw new Error(decodedOutput)
            console.log(output)
          setBanners(output)
      
          // NOTE: Currently disabled until `typechain-polkadot` dependencies are upted to support ink! v5
          // Alternatively: Fetch it with typed contract instance
          // const typedResult = await typedContract.query.greet()
          // console.log('Result from typed contract: ', typedResult.value)
        } catch (e) {
          console.error(e)
          toast.error('Error while fetching banners. Try again…', {
            style: {
                color: '#000', // White text color
                fontSize:10
            }
          });
          setBanners([])
        } finally {
          setFetchIsLoading(false)
        }
      }
      useEffect(() => {
        fetchBaners()
      }, [contract])

    if (!isOpen) return null;

    return (
         <>
          { activeAccount ? 
          (
            <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle max-w-screen-xl">
                    <p className='text-green-800 text-2xl p-3'> Select banners in this order:  <span className='text-blue-800'> Cavalry - Infantry - Archers - Artillery </span></p>
                    <motion.div
                      variants={parentNFTVariants}
                      initial='hidden'
                      whileInView='show'
                      viewport={{ once: true }}
                      className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8'
                    >
                      {/* Card 1 */}
                      <BannerNFTGrid  banners={banners} handleSetBanner={handleSetBanner} />

                    </motion.div>
                    <button type="button" className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-red-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-4xl" onClick={onClose}>
                            Cancel
                    </button>
                </div>
            </div>
        </div>
          ) : (
            <p className='text-green-700 text-2xl'> Please connect your wallet to proceed </p>
          )
          }
         </>
    );
};

export default BannersSet;
