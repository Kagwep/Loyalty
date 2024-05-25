import React,{useState,useEffect,useCallback} from 'react';
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
import { ContractIds } from "@/deployments/game_room/deployments";
import CreateRoomModal from './CreateRoomModal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Players } from '@/utils/commonGame';
import Canvas from "@/components/Game/Logic/Loyalty";
import socket from '@/socket';
import BannersSet from './BannersSet';

// Define TypeScript interface for a Battle Room
interface BattleRoom {
    id: number;           // Unique identifier for the battle room
    name: string;         // Name of the battle room
    status: string;  // Status of the battle room, limited to 'Active' or 'Waiting'
    players: number;      // Current number of players in the room
    maxPlayers: number;   // Maximum number of players the room can accommodate
    description: string;  // Description of the battle room
    roomId:string;
    participants:string[];
}

interface BattleRoomProps {

}

const BattleRoomList: React.FC<BattleRoomProps> = () => {

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

     // console.log(ContractIds)

      const { contract } = useRegisteredContract(ContractIds.GameRoom)
     // console.log(contract)

      const [isModalOpen, setModalOpen] = useState(false);
      const [isModalBannersOpen, setModalBannersOpen] = useState(false);
      const [rooms, setRooms] = useState<BattleRoom[]>()
      const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
      const [bannersSet, setBannersSet] = useState(false);
      const [bannersToPlay, setBannersToPlay] = useState([])
      const [opponentBannersToPlay, setOpponentBannersToPlay] = useState([])
      const [opponentJoined, setOpponentJoined] = useState(false);

      const [username, setUsername] = useState("musa");
      const [usernameSubmitted, setUsernameSubmitted] = useState(false);
    
      const [room, setRoom] = useState("");
      const [orientation, setOrientation] = useState("");
      const [players, setPlayers] = useState<Players[]>([]);
      const [players_identity, setPlayersIdentity] = useState<string>("");
      const [roomError, setRoomError] = useState('');

      const cleanup = useCallback(() => {
        setRoom("");
        setOrientation("");
        setPlayers([]);
        setPlayersIdentity("");
      }, []);

       if (accounts){
            
        const account = accounts[0];

        //console.log(account)

       // console.log("gfffg",activeAccount)
       }

       const testCall = async () => {

        if (!contract || !api ||  !activeAccount) return

        const flipperOutcome = await contractQuery(
            api,
            activeAccount?.address,
            contract,
            "flip",
            undefined,
     
          )

          const shortenResult = decodeOutput(flipperOutcome, contract, "flip")

          if (flipperOutcome.result.isErr && flipperOutcome.result.asErr.isModule) {
            const { docs, method, section } = api.registry.findMetaError(
                flipperOutcome.result.asErr.asModule,
            )
    
            shortenResult.decodedOutput = `${section}.${method}: ${docs.join(" ")}`
          }

          console.log(shortenResult)
    
          
       }


       const fetchRooms= async () => {

        console.log(contract)
        if (!contract || !api) return
    
        setFetchIsLoading(true)
        try {
          const result = await contractQuery(api, '', contract, 'getAllRooms')
          const { output, isError, decodedOutput } = decodeOutput(result, contract, 'getAllRooms')
          if (isError) throw new Error(decodedOutput)
            console.log(output)
          setRooms(output)
    
          // NOTE: Currently disabled until `typechain-polkadot` dependencies are upted to support ink! v5
          // Alternatively: Fetch it with typed contract instance
          // const typedResult = await typedContract.query.greet()
          // console.log('Result from typed contract: ', typedResult.value)
        } catch (e) {
          console.error(e)
          toast.error('Error while fetching Rooms. Try again…', {
            style: {
                color: '#000', // White text color
                fontSize:10
            }
          });
          setRooms([])
        } finally {
          setFetchIsLoading(false)
          setModalBannersOpen(false);
        }
      }
      useEffect(() => {
        fetchRooms()
      }, [contract])

      useEffect(() => {
        socket.on("opponentJoined", (roomData) => {
            console.log("Opponent joined, data:", roomData);
            setOpponentBannersToPlay(roomData.newPlayerTokenUris); // Update opponent's banners here
            setPlayers(roomData.players);
            setOpponentJoined(true);
        });
    }, [opponentJoined]);

      useEffect(() => {
        if(bannersToPlay.length >= 4){
          setBannersSet(true)
          setModalBannersOpen(false)
        }
      },[bannersSet,bannersToPlay])

      //console.log(rooms)

      const handleSetBanner = (bannerUrl:string) => {
          console.log(bannerUrl);

          setBannersToPlay(prevBanners => [...prevBanners, bannerUrl]);
      }

      const handleJoin = (roomId) => {
       // if (!roomInput) return; // if given room input is valid, do nothing.
       const banners =bannersToPlay.slice(0, 4);

        socket.emit("joinRoom", { roomId, banners }, (r: { error: any; message: React.SetStateAction<string>; roomId: React.SetStateAction<string>; opponentTokenUris: string[], players: React.SetStateAction<Players[]>; }) => {
          // r is the response from the server
          if (r.error) return setRoomError(r.message); // if an error is returned in the response set roomError to the error message and exit
          console.log("response:", r);
          setRoom(r?.roomId); // set room to the room ID
          setPlayers(r?.players); // set players array to the array of players in the room
          setOrientation("black"); // set orientation as black
          setPlayersIdentity('player_two')
          setOpponentBannersToPlay(r?.opponentTokenUris)
          setOpponentJoined(true)
        });

        console.log("called")
      
      }
      
    return (
      <>
      {room ? (
      opponentJoined ? (
        <Canvas
          room={room}
          orientation={orientation}
          username={username}
          players={players}
          player_identity={players_identity}
          tokenUris={bannersToPlay.slice(0, 4)}
          opponentTokenUris={opponentBannersToPlay.slice(0, 4)}
          cleanup={cleanup}
        />
      ) : (
        <div className="waiting-screen relative w-full h-screen overflow-hidden">
          <img src="https://res.cloudinary.com/dydj8hnhz/image/upload/v1716636727/ombnlh431ffj3tagh7bo.webp" alt="Waiting" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl font-bold text-white">Waiting for Opponent...</h2>
            <p className="mt-2 text-xl text-white">Room ID: {room}</p>
            <button className="mt-4 bg-purple-950 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-20 w-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#663399" strokeWidth="4"></circle>
              <path className="opacity-75" fill="#ffff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
              Loading...
            </button>
          </div>
        </div>

      )
      ):(
        <div className="max-w-screen-lg mx-auto  shadow-lg rounded-lg p-4">
            <h2 className="text-xl font-bold text-slate-100 mb-4 ">Battle Rooms</h2>
            <div> 
                <button className="bg-purple-950 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-2xl mx-2" onClick={() => setModalBannersOpen(true)}>Select Banners</button>
   
                  <button
                      className="bg-purple-950 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-2xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={() => setModalOpen(true)}
                      disabled={!bannersSet}
                  >
                      Create Room
                  </button>

                <CreateRoomModal
                  isOpen={isModalOpen}
                  onClose={() => setModalOpen(false)}
                  fetchRooms={fetchRooms}
                  setRoom={setRoom}
                  setOrientation={setOrientation}
                  setPlayers={setPlayers}
                  setPlayersIdentity={setPlayersIdentity} 
                  banners={bannersToPlay.slice(0, 4)}
                  />
                 <BannersSet
                  isOpen={isModalBannersOpen}
                  onClose={() => setModalBannersOpen(false)}
                  handleSetBanner={handleSetBanner}
                  />
            </div>
            <div className="bg-cover bg-center" style={{ backgroundImage: 'url("https://res.cloudinary.com/dydj8hnhz/image/upload/v1714890212/hggdym2eguf38jws7lib.jpg")' }}>
                {rooms?.map((room) => (
                    <div key={room.id} className="p-4 bg-white bg-opacity-80 rounded-md my-2 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-2xl ">{room.name}</h3>
                            <p className='text-2xl'>Status: <span className={`text-${room.status === 'Active' ? 'green' : 'yellow'}-500`}>{room.status}</span></p>
                            <p className='text-2xl'>Players: {room.players}</p>
                            <p className='text-2xl text-purple-950'> {room.description}</p>
                            <p className='text-2xl text-red-600'> <span className='text-blue-700'>Max players</span> {room.maxPlayers}</p>
                        </div>
                          <button className="px-4 py-2 bg-slate-950 text-white rounded hover:bg-slate-600 transition duration-300 text-2xl disabled:cursor-not-allowed" disabled={!bannersSet} onClick={() => handleJoin(room.roomId)}>
                              Join Room
                          </button>
                    </div>
                ))}
            </div>
        </div>

      )};
      </>
    );
};

export default BattleRoomList;
