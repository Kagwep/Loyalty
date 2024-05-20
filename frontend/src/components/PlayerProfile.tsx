import React, {useState} from 'react';
import { Player } from './LeaderBoard';
import CreateBanner from './CreateBaner';
import { createIcon } from '@download/blockies';
// Define the props interface using the Player interface
interface PlayerProfileProps {
    player: Player;
    fetchBanners: () => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player,fetchBanners }) => {

    const [isModalOpen, setModalOpen] = useState(false);

    const addressIcon = createIcon({
        seed: player.name.toLowerCase(),
      }).toDataURL();

    return (
        <div className="bg-purple-950 text-white p-4 rounded-lg shadow-lg flex flex-col w-full items-center z-index-10">
            <img
            src={addressIcon}
            alt="Generated address icon"
            className="size-12 rounded-full"
            />
            <h2 className="text-xl font-bold mt-2">{player.name}</h2>
            <p className="text-purple-300 text-xl">Points: {player.points}</p>

            <div className="flex flex-col w-full mt-4 items-center space-y-2">
                <div className="flex justify-between items-center w-full max-w-xs px-4 py-2 bg-purple-800 rounded text-xl">
                    <span>Balance:</span>
                    <strong className='text-xl'>{player.points} Points</strong>
                </div>
                <button className="w-full max-w-xs px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded text-center font-bold text-xl">
                    Withdraw
                </button>
                <button className="w-full max-w-xs px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center font-bold text-xl"  onClick={() => setModalOpen(true)}>
                    Create Banner
                </button>
            </div>
            {isModalOpen && <CreateBanner closeModal={() => setModalOpen(false)} fetchBanners={fetchBanners}/>}
        </div>
    );
};

export default PlayerProfile;
