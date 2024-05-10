import React from 'react'
import SliderAbout from './SliderAbout';
import '../css/About.scss';



const About = () => {
    return (
        <section className="about-section" id="about">
            <div className="about-section__left">
                <h4 className="display-2">WHAT IS Loyalty?</h4>
                <h1 className="display-1 glitch-overlay" data-content="SOCIAL BATTLE">
                    <span>A Strategy Game</span>
                </h1>
                <hr className="line-separator"/>
                <div className="text-container">
                    <p className="about-text-info">
                    <p><strong>"Loyalty"</strong> is a web-based 3D immersive strategy game that lets players command their own kingdoms and armies, engaging in dynamic battles to control various strategic assets. Developed using <em>Babylon.js</em>, the game features stunning 3D graphics and offers players the ability to mint and trade NFTs representing army banners.</p>
                     <p>Each player starts with a kingdom and must strategically manage resources and deploy forces across cavalry, infantry, archers, and artillery to capture critical assets like castles, trade routes, and royal palaces. The game includes a competitive leaderboard, and players can earn through activities such as minting and trading banners. "<strong>Loyalty</strong>" offers a community platform for strategy discussions and trading, enhancing the multiplayer experience.</p>

                    </p>
                </div>
            </div>
            <div className="about-section__right">
                <SliderAbout/>
            </div>
        </section>
    )
}

export default About