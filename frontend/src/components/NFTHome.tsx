import React, { useEffect, useState } from 'react'
import NFTCardHome from './NFTCardHome'
import nfts from '@/data/nfts'
import { motion } from 'framer-motion'
import {
  SubstrateWalletPlatform,
  allSubstrateWallets,
  isWalletInstalled,
  useInkathon,
} from "@scio-labs/use-inkathon"
import { p } from 'node_modules/@scio-labs/use-inkathon/dist/getPSP22Balances-cJkeISx3'
import { encodeAddress } from '@polkadot/util-crypto'
import { truncateHash } from '@/utils/truncate-hash'

function NFTGrid({banners}:{banners:any}) {
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

  const [userEncodedAddress, setUserEncodedAddress] = useState("");
  const [filteredBanners, setFilteredBanners] = useState([]);

  const {
    activeChain,
    connect,
    disconnect,
    activeAccount,
    accounts,
    setActiveAccount,
  } = useInkathon()


    useEffect(() => {
      if (accounts){
          {(accounts || []).map((acc) => {
              const encodedAddress = encodeAddress(
                acc.address,
                activeChain?.ss58Prefix || 42,
              )
              setUserEncodedAddress(encodedAddress)
            })}
        }
  },[accounts])

  useEffect(() => {
    if (userEncodedAddress) {
      const filtered = banners.filter(banner => banner.seller === userEncodedAddress);
      setFilteredBanners(filtered);
    }
  }, [userEncodedAddress]);

  return (
    <>
      {activeAccount ? (
        <>
          {filteredBanners.map((banner, idx) => (
              <NFTCardHome
              img={banner.tokenUri}
              title={banner.title}
              price={banner.price}
            />
          ))}
        </>
      ) : (
        <p></p>
      )}
    </>
  );
  
}

export default NFTGrid
