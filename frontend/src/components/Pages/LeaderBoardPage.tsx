import React from 'react'
import Navbar from '../Navbar';
import '../../css/App.scss';
import Footer from '../Footer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import Leaderboard from '../LeaderBoard';
import { dummyPlayers } from '../../data/playerData';


const LeaderBoardPage = () => {
  return (
    <div>
    <Navbar />
      
      <Leaderboard />
     
    <Footer />
</div>
  )
}

export default LeaderBoardPage