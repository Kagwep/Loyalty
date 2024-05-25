import React from 'react'
import Navbar from '../Navbar';
import '../../css/App.scss';
import Footer from '../Footer'

const HowToPlayPage = () => {
  return (

    <>
    <Navbar />
    <section className='p-4 pb-24 text-white'>
                <div className='container max-w-screen-lg mx-auto overflow-hidden '>
                                <div className="p-6 bg-gray-800 text-white text-xl rounded">
                                        <h1 className="text-xl font-bold mb-4">How to Play Loyalty</h1>

                                        {/* Game Overview */}
                                        <section>
                                            <h2 className="font-semibold text-2xl p-2">Game Overview</h2>
                                            <p className='italic text-xl'>"Loyalty" is a 3D immersive strategy game that challenges players to manage resources, deploy units, and conquer their opponents. Set in a mythical world, players command armies made up of various unit types—each with unique abilities. What makes "Loyalty" unique is its blend of dynamic battles, NFT integration, and a competitive leaderboard system, offering a deep strategic experience.</p>
                                        </section>

                                        {/* Basic Rules */}
                                        <section className="mt-4">
                                            <h2 className="font-semibold text-2xl p-2">Basic Rules</h2>
                                            <p className='italic text-xl'>To start a game in "Loyalty", select the banners for your units and either create a room or join an existing one. The game supports two players and is turn-based, starting with the player who created the room.</p>
                                        </section>

                                        {/* Gameplay Mechanics */}
                                        <section className="mt-4">
                                            <h2 className="font-semibold text-2xl p-2">Gameplay Mechanics</h2>
                                            <p className='italic text-xl'>The game features two sides: Player One (room creator) and Player Two (joiner). Each player commands army units including cavalry, infantry, archers, and artillery. Each unit type has different strengths (cavalry - 4, infantry - 3, archers - 2, artillery - 1) and it's crucial to manage these units wisely. Players engage by moving their units so that their "threat area" touches or collides with an opponent unit, reducing their strength based on the engagement outcome.</p>
                                        </section>

                                        {/* Winning Conditions */}
                                        <section className="mt-4">
                                            <h2 className="font-semibold text-2xl p-2">Winning Conditions</h2>
                                            <p className='italic text-xl'>The game is won by the player who first reduces the opponent's total strength to zero.</p>
                                        </section>

                                        {/* FAQs and other sections can be added similarly */}
                                    </div>
             </div>
        </section>
    <Footer />
    </>
  )
}

export default HowToPlayPage