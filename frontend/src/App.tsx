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
          <Route path="/play" element={<Game />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/battle-room" element={<BattleRoomPage />} />
          <Route path="/leader-board" element={<LeaderBoardPage />} />
        </Routes>
      </>

  )
}

export default App


// link Content

// <div className="relative flex min-h-screen flex-col">
// <header className="sticky top-0 z-50 w-full p-2">
//   <div className="flex items-center justify-end">
//     <ConnectButton />
//   </div>
// </header>

// <main className="flex flex-1 flex-col items-center justify-between pt-10">
//   <LinkContractInteractions />
// </main>

// <div className="w-full py-2">
//   <Footer />
// </div>
// </div>