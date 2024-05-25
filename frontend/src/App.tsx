import { useMemo } from "react"
import { ConnectButton } from "./components/web3/connect-button"
import { Footer } from "./components/web3/footer"
import { LinkContractInteractions } from "./components/web3/link-contract-interactions"
import { Resolve } from "./components/web3/resolve"

import { BrowserRouter,Route,Routes } from 'react-router-dom'
import HomePage from './components/Pages/Index'
import Game from "./Game";
import ProfilesPage from './components/Pages/ProfilePages';
import MarketplacePage from './components/Pages/MarketplacePage';
import BattleRoomPage from './components/Pages/BattleRoomPage';
import LeaderBoardPage from './components/Pages/LeaderBoardPage';
import HowToPlayPage from "./components/Pages/HowToPlayPage"
import { Content } from "@radix-ui/react-dropdown-menu"


function App() {

  // const path = useMemo(() => {
  //   return window.location.pathname.split("/")[1]
  // }, [])

  // if (path) {
  //   return <Resolve slug={path} />
  // }

  return (

      <>
        <Routes>
          <Route path="/"  element={<HomePage />} />
          <Route path="/play/:id" element={<Game />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/battle-room" element={<BattleRoomPage />} />
          <Route path="/leader-board" element={<LeaderBoardPage />} />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
        </Routes>
      </>

  )
}

export default App


