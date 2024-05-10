import React,{useState} from 'react';
import { encodeAddress } from "@polkadot/util-crypto"
import {
  SubstrateWalletPlatform,
  allSubstrateWallets,
  isWalletInstalled,
  useInkathon,
  contractQuery,
  decodeOutput,
  useRegisteredContract,
} from "@scio-labs/use-inkathon"
import { ContractIds } from "@/deployments/deployments";
import CreateRoomModal from './CreateRoomModal';

// Define TypeScript interface for a Battle Room
interface BattleRoom {
    id: number;           // Unique identifier for the battle room
    name: string;         // Name of the battle room
    status: string;  // Status of the battle room, limited to 'Active' or 'Waiting'
    players: number;      // Current number of players in the room
    maxPlayers: number;   // Maximum number of players the room can accommodate
    description: string;  // Description of the battle room
}

interface BattleRoomProps {
    rooms: BattleRoom[];
}

const BattleRoomList: React.FC<BattleRoomProps> = ({ rooms }) => {

    const {
        activeChain,
        connect,
        disconnect,
        activeAccount,
        accounts,
        setActiveAccount,
        api,
        isConnected 
      } = useInkathon()

      console.log(ContractIds)

      const { contract } = useRegisteredContract(ContractIds.Flipper)
      console.log(contract)

      const [isModalOpen, setModalOpen] = useState(false);

       if (accounts){
            
        const account = accounts[0];

        //console.log(account)

        console.log("gfffg",activeAccount)
       }

       const testCall = async () => {

        if (!contract || !api ||  !activeAccount) return

        const flipperOutcome = await contractQuery(
            api,
            activeAccount?.address,
            contract,
            "flip",
            undefined,
            [false],
          )

          const shortenResult = decodeOutput(flipperOutcome, contract, "shorten")

          if (flipperOutcome.result.isErr && flipperOutcome.result.asErr.isModule) {
            const { docs, method, section } = api.registry.findMetaError(
                flipperOutcome.result.asErr.asModule,
            )
    
            shortenResult.decodedOutput = `${section}.${method}: ${docs.join(" ")}`
          }

          console.log(shortenResult)
    
          
       }
      
    return (
        <div className="max-w-screen-lg mx-auto  shadow-lg rounded-lg p-4">
            <h2 className="text-xl font-bold text-slate-100 mb-4 ">Battle Rooms</h2>
            <div>
                <button className="bg-purple-950 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-2xl" onClick={() => setModalOpen(true)}>Create Room </button>
                <CreateRoomModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
            </div>
            <div className="bg-cover bg-center" style={{ backgroundImage: 'url("https://res.cloudinary.com/dydj8hnhz/image/upload/v1714890212/hggdym2eguf38jws7lib.jpg")' }}>
                {rooms.map((room) => (
                    <div key={room.id} className="p-4 bg-white bg-opacity-80 rounded-md my-2 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-2xl ">{room.name}</h3>
                            <p className='text-2xl'>Status: <span className={`text-${room.status === 'Active' ? 'green' : 'yellow'}-500`}>{room.status}</span></p>
                            <p className='text-2xl'>Players: {room.players}</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-950 text-white rounded hover:bg-slate-600 transition duration-300 text-2xl" onClick={testCall}>
                            Join Room
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BattleRoomList;
