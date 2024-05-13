import React, { useEffect } from 'react';
import Button from './Button';
import '../css/ContentHero.scss';



const ContentHero = () => {

    const button_info = {
        text: 'Play now',
        link_text: '/battle-room', 
        type: 'price-button' 
    }


    return (
        <div 
            data-aos="fade-up"
        > 
            <div className="hero-content">
                <h1 className="hero-content__title-1 glitch-overlay" data-content="SURVIVE AT ALL COSTS">
                    <span className=''>
                        In Lands of Legends, Every Crown Has a Story
                    </span>
                </h1>
                {/* <h1 className="hero-content__title-1">
                    SURVIVE AT ALL COSTS
                </h1> */}
                <h4 className="hero-content__title-2">Empower your moves, outsmart your opponents, and stay focused on the ultimate goal of <span className='text-purple-950'>Loyalty</span>.</h4>
                <Button {...button_info}/>
            </div>
        </div>
    )
}

export default ContentHero;