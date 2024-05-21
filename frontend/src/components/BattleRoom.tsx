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
      const [rooms, setRooms] = useState<BattleRoom[]>()
      const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

      const [username, setUsername] = useState("musa");
      const [usernameSubmitted, setUsernameSubmitted] = useState(false);
    
      const [room, setRoom] = useState("dsfdsvcewf");
      const [orientation, setOrientation] = useState("");
      const [players, setPlayers] = useState<Players[]>([]);
      const [players_identity, setPlayersIdentity] = useState<string>("");

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
        }
      }
      useEffect(() => {
        fetchRooms()
      }, [contract])

      useEffect(() => {  
        socket.on("opponentJoined", (roomData: { players: React.SetStateAction<Players[]>; }) => {
          console.log("roomData", roomData)
          setPlayers(roomData.players);
        });
      }, []);

      //console.log(rooms)
      
    return (
      <>
      {room ? (
       <>
            <Canvas
              room={room}
              orientation={orientation}
              username={username}
              players={players}
              player_identity={players_identity}
              // the cleanup function will be used by Game to reset the state when a game is over
              cleanup={cleanup}
            />
       </>
      ):(
        <div className="max-w-screen-lg mx-auto  shadow-lg rounded-lg p-4">
            <h2 className="text-xl font-bold text-slate-100 mb-4 ">Battle Rooms</h2>
            <div>
                <button className="bg-purple-950 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-2xl" onClick={() => setModalOpen(true)}>Create Room </button>
                <CreateRoomModal
                  isOpen={isModalOpen}
                  onClose={() => setModalOpen(false)}
                  fetchRooms={fetchRooms}
                  setRoom={setRoom}
                  setOrientation={setOrientation}
                  setPlayers={setPlayers}
                  setPlayersIdentity={setPlayersIdentity} 
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
                        <Link to={`/play/${room.roomId}`}>
                          <button className="px-4 py-2 bg-slate-950 text-white rounded hover:bg-slate-600 transition duration-300 text-2xl" >
                              Join Room
                          </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>

      )};
      </>
    );
};

export default BattleRoomList;
