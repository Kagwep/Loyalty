import React, { useEffect, useRef } from 'react';
import { GameScene } from './sceneSetup';
import { Players } from '@/utils/commonGame';
import "./style.css"

export interface CanvasProps {
  players:Players[];
  room:string;
  orientation?:string;
  cleanup?:() => void;
  username:string;
  player_identity:string;
  tokenUris: string[];
  opponentTokenUris: string [];
}


const Canvas:React.FC<CanvasProps> = ({ players, room,username,player_identity,cleanup,tokenUris,opponentTokenUris}) => {

  console.log(players)


  const canvasRef = useRef<HTMLCanvasElement>(null);

      useEffect(() => {
        console.log('useEffect called');
        if (canvasRef.current) {
            console.log('Canvas element found');
            const game = new GameScene(canvasRef.current,tokenUris,opponentTokenUris,player_identity,room);
            game.renderLoop();
        } else {
            console.log('Canvas element not found');
        }
    }, []);


  return (
    <>

        <canvas ref={canvasRef} id="renderCanvas" className='canvas rounded-md'  ></canvas>

    </>
  )
}

export default Canvas