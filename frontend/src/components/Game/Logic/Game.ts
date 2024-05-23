import { Mesh, Scene } from "@babylonjs/core";
import { ArmyUnit } from "./Assets";

interface CollisionPairs {
    current: string;
    other: string;
}

export class Game {
    
    scene: Scene;
    pieces: Map<any, any>;


    constructor(scene: Scene) {
        this.scene = scene;
        
    }


    public checkCollisions(assets, currentPiece, currentPieceName): { collision: boolean, details: CollisionPairs } {
        const pieces = assets.pieces;
        const threatAreas = assets.piecesThreatAreas;
        const currentPieceThreatArea = threatAreas.get(currentPieceName);

        let collisionDetected = false;
        const collisionDetails: CollisionPairs = {
            current: "",
            other: ""
        };

        if (!currentPieceThreatArea) {
            console.log(`No threat area found for ${currentPieceName}`);
            return { collision: false, details: collisionDetails };
        }



        pieces.forEach((piece, name) => {
            // Ensure we're not checking the current piece against itself
            if (name !== currentPieceName) {
                if (currentPieceThreatArea.intersectsMesh(piece, true)) {
                    console.log(`Collision detected between ${currentPieceName} and ${name}`);
                    collisionDetected = true;
                    const otherPiece = assets.getLoyalPieceByName(name);  // Assuming this is a method to fetch the piece by name
                    if (otherPiece) {
                        collisionDetails.current = currentPiece.name;
                        collisionDetails.other = otherPiece.name
                        console.log('Current Piece:', currentPiece);
                        console.log('Other Piece:', otherPiece);
                    } else {
                        console.log(`No loyal piece found for ${name}`);
                    }
                }
            }
        });

        return { collision: collisionDetected, details: collisionDetails };
    }
    

    private UnitEngaging(assets,unitType: string) {
        let unitArray: ArmyUnit[];
    
        switch (unitType) {
            case "Cavalry":
                unitArray = assets.getCavalry();
                break;
            case "Infantry":
                unitArray = assets.getInfantry();
                break;
            case "Archers":
                unitArray = assets.getArchers();
                break;
            case "Artillery":
                unitArray = assets.getArtillery();
                break;
            default:
                return undefined;
        }
    
        return unitArray;
    }

    public processEngagements(assets,currentUnitName: string, otherUnitName: string){

        const currentUnit = assets.getUnit(currentUnitName);
        const otherUnit = assets.getEnemyUnit(otherUnitName);

        



        if (currentUnit && otherUnit) {

            const currentUnitStrength = currentUnit.strength;
            const otherUnitStrength = otherUnit.strength

            const getStrengths = () => {
                if (currentUnitStrength > otherUnitStrength) {
                    return { equal: false, strongest: currentUnitStrength };
                } else if (currentUnitStrength < otherUnitStrength) {
                    return { equal: false, strongest: otherUnitStrength };
                } else {
                    return { equal: true, strongest: currentUnitStrength };
                }
            };
            
            const { equal, strongest } = getStrengths()

            if(equal && strongest === currentUnitStrength){

                
                
                currentUnit.strength = 0;
                otherUnit.strength = 0;

                assets.updateUnit(currentUnitName,currentUnit)
                assets.updateEnemyUnit(otherUnitName,otherUnit)

            }else if ( !equal && strongest === currentUnitStrength){

                //console.log(assets.currentUnit)

                const result  = currentUnitStrength - otherUnitStrength

                currentUnit.strength = result;
                otherUnit.strength = 0;

                assets.updateUnit(currentUnitName,currentUnit)
                assets.updateEnemyUnit(otherUnitName,otherUnit)    

            }else if (!equal && strongest === otherUnitStrength){

                const result  = otherUnitStrength - currentUnitStrength;

                currentUnit.strength = 0;
                otherUnit.strength = result;

                assets.updateUnit(currentUnitName,currentUnit)
                assets.updateEnemyUnit(otherUnitName,otherUnit)
            }

        }
        

    }

    public isOpponent(assets,unitName: string): boolean {
            // Check if the unit name exists in the player's units map
            if (assets.piecesToUnit.has(unitName)) {
                return false; // It's a player's unit
            }
            // Check if the unit name exists in the enemy's units map
            if (assets.piecesToEnemyUnit.has(unitName)) {
                return true; // It's an opponent's unit
            }
            // If the unit name is not found in either map, throw an error
            throw new Error("Unit name does not exist in any collection.");
        }


}