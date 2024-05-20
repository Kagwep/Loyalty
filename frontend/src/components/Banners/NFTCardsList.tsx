import React,{useState,useEffect,useCallback} from 'react';
import { AiOutlineClockCircle, AiFillHeart } from 'react-icons/ai'

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
import { ContractIds } from "@/deployments//loyal_marketplace/deployments";
import toast from 'react-hot-toast';
import NFTCard from './NFTCard'
import nfts from '../../data/nfts'
import { motion } from 'framer-motion'


function NFTCardsList() {
  const parentVariants = {
    hidden: {
      x: -100,
      opacity: 0,
    },
    show: {
      x: 0,
      opacity: 1,
      transition: { when: 'beforeChildren', staggerChildren: 0.1 },
    },
  }
  const childVariants = {
    hidden: {
      x: 100,
      opacity: 0,
    },
    show: {
      x: 0,
      opacity: 1,
      // transition: { delay: 0.1 },
    },
  }

  const [banners, setBanners] = useState([]);
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

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

  const { contract } = useRegisteredContract(ContractIds.Markeplace)


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
      toast.error('Error while fetching Rooms. Try again…', {
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

  //console.log('banners',banners)

  return (
    <>
      {nfts.map((nft, idx) => {
        return (
          <motion.div variants={childVariants} key={idx}>
            <NFTCard
              key={nft.title}
              img={nft.img}
              title={nft.title}
              price={nft.price}
            />
          </motion.div>
        )
      })}
    </>
  )
}

export default NFTCardsList
