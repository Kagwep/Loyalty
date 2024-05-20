
import Navbar from '../Navbar';
import '../../css/App.scss';
import ProfileHeader from '../ProfileHeader';
import Footer from '../Footer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import NFTGrid from '../NFTHome';
import sampleNFTs from '@/utils/commonGame';
import { motion } from 'framer-motion'
import PlayerProfile from '../PlayerProfile';
import {
  parentNFTVariants,
  parentVariants,
  childVariants,
} from '../../animations/banners'
import { Player } from '../LeaderBoard';
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




const ProfilesPage = () => {

  const user = {
    name: 'Johnte',
    bio: 'Musa',
  }

  const samplePlayer: Player = {
    id: 1,
    name: "John Doe",
    points: 120,
    avatarUrl: "https://example.com/avatar.jpg"
};

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

  return (
        <>
        
          <Navbar />
          <section className='p-4 pb-24 text-white'>
                <div className='container max-w-screen-lg mx-auto overflow-hidden'>
                  <div className='flex flex-col items-center space-y-8'>
                     <PlayerProfile player={samplePlayer} fetchBanners={fetchBaners}/>
                    <motion.div
                      variants={parentNFTVariants}
                      initial='hidden'
                      whileInView='show'
                      viewport={{ once: true }}
                      className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8'
                    >
                      {/* Card 1 */}
                      <NFTGrid  />

                    </motion.div>
          
                </div>
              </div>
            </section>

          <Footer />
        </>
  );
}

export default ProfilesPage;