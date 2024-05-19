
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

  return (
        <>
        
          <Navbar />
          <section className='p-4 pb-24 text-white'>
                <div className='container max-w-screen-lg mx-auto overflow-hidden'>
                  <div className='flex flex-col items-center space-y-8'>
                     <PlayerProfile player={samplePlayer}/>
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