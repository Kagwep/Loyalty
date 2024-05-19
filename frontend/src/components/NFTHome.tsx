import React from 'react'
import NFTCardHome from './NFTCardHome'
import nfts from '@/data/nfts'
import { motion } from 'framer-motion'
function NFTGrid() {
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
  return (
    <>

        {nfts.map((nft, idx) => {
            return (
            <motion.div variants={childVariants} key={idx}>
                <NFTCardHome
                key={nft.title}
                img={nft.img}
                title={nft.title}
                price={nft.price}
                likes={nft.likes}
                sale={nft.sale}
                />
            </motion.div>
            )
        })}

    </>
  )
}

export default NFTGrid
