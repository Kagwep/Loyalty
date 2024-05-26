import React, {useState} from 'react'
import { AiOutlineClockCircle, AiFillHeart } from 'react-icons/ai'
import { FaCoins } from 'react-icons/fa'
import { encodeAddress } from "@polkadot/util-crypto"
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
import { motion } from 'framer-motion'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

function NFTCardHome({ img, title, price,index,currentlyListed }:{ img:string, title:string, price:string, index:number, currentlyListed:boolean }) {

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


  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

  const { contract } = useRegisteredContract(ContractIds.Marketplace);

  const updateListing = async (listingId: number) => {

    // console.log(contract)
    if (!contract || !api) return

    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…', {
          style: {
              color: '#000', // White text color
              fontSize:10
          }
        })
      return
    }



    try {
      let response = await contractTxWithToast(api, activeAccount.address, contract, 'update_listing', {}, [listingId])

      const { dryResult, result: responseResult, ...rest } = response;

      if (dryResult.result.isOk) {
          
      } 
      
    } catch (e) {
      console.error(e)
    } finally {
      setFetchIsLoading(false)
    }
  }

  return (
    <>
      <div className='flex group flex-col space-y-10 rounded-lg overflow-hidden border border-slate-400/10 pb-8 hover:shadow-xl duration-500 ease-in-out hover:shadow-white/5 relative' key={index}>
        {/* Image & Counter */}
        <div className='flex flex-col items-start relative'>
          <img src={img} alt='NFT' className='object-cover' />

        </div>
        {/* Content */}
        <div className='px-6 flex flex-col space-y-3'>
          {/* Title */}
          <h1 className='text-2xl'>{title}</h1>
          {/* Price & Like */}
          <div className='flex justify-between'>
            {/* Price */}
            <div className='flex space-x-2 text-indigo-600 items-center'>
              <FaCoins size={18} />
              <p className='text-2xl font-semibold'>{price} PAS</p>
            </div>
          </div>
        </div>
        {/* Hover */}
        <div className='absolute hidden top-1/4 left-1/3 md:left-1/4 group-hover:flex animate-bounce transition-all ease-in-out duration-1000'>
           { currentlyListed ? (<><p></p></>):(
            <button className='text-sm px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 duration-200 ease-in-out' onClick={() => updateListing(index)}>
              List
            </button>
           )}

        </div>
      </div>
    </>
  )
}

export default NFTCardHome
