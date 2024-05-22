import { Mesh, Scene } from "@babylonjs/core";


export class Game {
    
    scene: Scene;
    pieces: Map<any, any>;

    constructor(scene: Scene) {
        this.scene = scene;
        
    }


    public checkCollisions(assets,currentPiece, currentPieceName) {

        const pieces = assets.pieces;

        const threatAreas = assets.piecesThreatAreas;

        const currentPieceThreatArea = threatAreas.get(currentPieceName);

       // const currentPieceBoundingBox = currentPieceThreatArea.getBoundingInfo().boundingBox;

        pieces.forEach((piece, name) => {
            // Ensure we're not checking the current piece against itself
            if (name !== currentPieceName) {
                // const otherPieceThreatArea: Mesh = threatAreas.get(name);
                // const otherPieceBoundingBox = piece.getBoundingInfo().boundingBox;
                // const pointToIntersect =  piece.position.clone()
    
                if (currentPieceThreatArea.intersectsMesh(piece,true)) {
                    console.log(`Collision detected between ${currentPieceName} and ${name}`);
                    const otherPiece = assets.getLoyalPieceByName(name);  // Assuming this is a method to fetch the piece by name
                    console.log('Current Piece:', currentPiece);
                    console.log('Other Piece:', otherPiece);
                }

            }
        });
    }
}