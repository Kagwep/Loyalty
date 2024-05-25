import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, AbstractMesh, Animation, SceneLoader, RecastJSPlugin, Material,Texture } from '@babylonjs/core';
import "@babylonjs/loaders";
import Recast from "recast-detour";
import { Assets } from './Assets';
import { GUI } from './GUI';
import { Game } from './Game';
import { ArmyUnit } from './Assets';
import socket from '@/socket';
import { playerT } from './GameState';

interface Move {
    selectedPieceName:string;
    selectedPoint:Vector3;
  }

export class GameScene {
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private selectedMesh: Mesh | null = null;
    private navigation!: RecastJSPlugin;
    private navMesh: Mesh | null = null;
    recast: any;
    public unitTokenUris: string[] = [];
    public assets!: Assets;
    public game: Game;
    public playerColors = ["purple", "green", "blue", "yellow"];
    public  opponentColors = ["red", "red", "red"];
    private gui: GUI;
    private units = ["Cavalry", "Infantry", "Archers", "Artillery"];
    public playerIdentity:string;
    public opponnetTokenUris:string [] = [];
    public playerTurn = "player_one"
    public room:string;


    constructor(canvasElement:  HTMLCanvasElement,tokenUris: string[], opponentTokenUris: string [], playerIdentity:string,room:string) {

        this.canvas = canvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this. unitTokenUris = tokenUris;
        this.opponnetTokenUris = opponentTokenUris;
        this.room = room;
        

        this.playerIdentity = playerIdentity;

        this.initRecast().then(() => {
            this.createCamera();
            this.createLight();
            this.createObjects();
            this.addListeners();
        });

        this.initializeSocketListeners();

    }

    private initializeSocketListeners() {
        socket.on('turnChange', (turnChange) => {
            console.log("It's now the opponent's turn.");
            this.playerTurn = this.playerTurn === 'player_one' ? 'player_two' : 'player_one'
        });

        socket.on("move", (move) => {
            this.handleopponentMove(move);
          });
    }

    private async initRecast(): Promise<void> {
        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), this.scene);
        camera.attachControl(this.canvas, true);
        const recast = await new Recast();
        const navigationPlugin = new RecastJSPlugin(recast);
        navigationPlugin.setWorkerURL("frontend/src/workers/navMeshWorker.js");
        this.navigation = navigationPlugin;
    }

    private createCamera(): void {
        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), this.scene);
        camera.attachControl(this.canvas, true);
    }

    private createLight(): void {
        new HemisphericLight("light", new Vector3(1, 1, 0), this.scene);
    }

    private async createObjects(): Promise<void> {
        let unitpositionZ = 0;
        let unitpositionX = 0;

        
        const gameGUI = new GUI(this.scene, this.unitTokenUris, this.playerColors, this.opponentColors);
        this.gui = gameGUI;

        const box = MeshBuilder.CreateBox("box", { size: 0.05 }, this.scene) as Mesh;
        box.position.x = 1.5;
        box.position.y = 0.1;
        box.name = "box";



        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, this.scene) as Mesh;
        sphere.position.x = -20;
        sphere.position.y = 4;
  
        sphere.name = "sphere";

        //const ground = MeshBuilder.CreateGround("ground", { width: 5, height: 10 }, this.scene);

        const threatMaterialSphere = new StandardMaterial("threatMaterialSphere", this.scene);
        threatMaterialSphere.diffuseColor = new Color3(1, 0, 0); // Red
        threatMaterialSphere.alpha = 0.5; // Semi-transparent

        const threatMaterialBox = new StandardMaterial("threatMaterialBox", this.scene);
        threatMaterialBox.diffuseColor = new Color3(0, 0, 1); // Blue
        threatMaterialBox.alpha = 0.5; // Semi-transparent

        const sphereThreatArea = MeshBuilder.CreateDisc("sphereThreatArea", {radius: 5, tessellation: 0}, this.scene);
        sphereThreatArea.position = sphere.position; // Assume 'sphere' is your existing mesh
        sphereThreatArea.material = threatMaterialSphere;
        sphereThreatArea.rotation.x = Math.PI / 2; // Rotate to lay flat on the ground
        
        const boxThreatArea =MeshBuilder.CreateDisc("boxThreatArea", {radius: 0.3, tessellation: 0}, this.scene);
        boxThreatArea.position = box.position; // Assume 'box' is your existing mesh
        boxThreatArea.material = threatMaterialBox;
        boxThreatArea.rotation.x = Math.PI / 2; // Rotate to lay flat on the ground

        
        const transparentMaterial = new StandardMaterial("navMaterial", this.scene);
        transparentMaterial.diffuseColor = new Color3(0, 1, 0); // Example: Green color
        transparentMaterial.alpha = 0; // Set transparency



        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/', 'loyalty.glb');



        const outpost = meshes.find(mesh => mesh.name === "outpost");
        
        if (outpost){
            outpost.isPickable = false;
            outpost.material = transparentMaterial;
        }

       // console.log(meshes)
        this.navMesh = meshes.find(mesh => mesh.name === "NavMesh" && mesh instanceof Mesh) as Mesh;
        //console.log(this.navMesh)
        
        const assets = new Assets(this.scene);

        assets.setUnitUris(this.unitTokenUris);

        await assets.setupAssetTasks();

        await assets.initialize();

        if (meshes){
            assets.setAssetsMeshNameToIndex(meshes);
        }

        const opponetsTokenUris = this.opponnetTokenUris;

        assets.setPiecesStartingPositions({identity:this.playerIdentity },opponetsTokenUris);

        assets.cavalry[0].model.isPickable = false;

        this.game = new Game(this.scene);


        gameGUI.updatePlayerStat(0, `Total Strength: ${assets.calculateUnitsTotalStrength()}`, "purple");
       

        // console.log("Player pieces",assets.pieces)

        // console.log("pieces one",assets.getAllUnits())
        // console.log("pieces two",assets.getAllEnemyUnits())
        



        // console.log("Player strenth Total",assets.getFirstFourStrength())
  

        const calvaryThreatAreaUnitOne = assets.cavalryThreatArea?.clone("calvaryThreatAreaUnitOne",null,false)

        calvaryThreatAreaUnitOne!.position.z = assets.cavalry[0].model.position.z;

        const isArmuUnitInOpponentsAsset = (unit: Mesh | undefined, asset: AbstractMesh | undefined) => {

            if (!asset || !unit) return;

            var position = unit.position.clone(); // Clone the position to avoid modifying the original
    
            // Check if the position of mesh1 is inside the bounding box of mesh2
            var isInside = asset.getBoundingInfo().boundingBox.intersectsPoint(position);
            
            if (isInside) {
                console.log("is Inside")
            }

        }

        this.assets = assets;
          

        this.scene.onBeforeRenderObservable.add(() => {
            sphereThreatArea.position.x = sphere.position.x;
            sphereThreatArea.position.z = sphere.position.z; // Adjust Y if your sphere moves up or down
            sphereThreatArea.position.y = sphere.position.y;
            
            calvaryThreatAreaUnitOne!.position.x = sphere.position.x;
            calvaryThreatAreaUnitOne!.position.z = sphere.position.z;

           //console.log(assets.cavalry[0].model)
        
            boxThreatArea.position.x = box.position.x;
            boxThreatArea.position.z = box.position.z; // Adjust Y if your box moves up or down

            isArmuUnitInOpponentsAsset(calvaryThreatAreaUnitOne,outpost);
        });
    
 

       

        if (this.navMesh) {
            this.navMesh.material = transparentMaterial;
            this.navigation.createNavMesh([this.navMesh], {
                cs: 0.2,
                ch: 0.2,
                walkableSlopeAngle: 90,
                walkableHeight: 1.0,
                walkableClimb: 1,
                walkableRadius: 1,
                maxEdgeLen: 12.,
                maxSimplificationError: 1.3,
                minRegionArea: 8,
                mergeRegionArea: 20,
                maxVertsPerPoly: 6,
                detailSampleDist: 6,
                detailSampleMaxError: 1,
            });
        } else {
            console.error("NavMesh not found or is not a Mesh instance.");
        }
    }

    private incrementLastChar(str) {
        // Get the last character
        const lastChar = str.charAt(str.length - 1);
        
        let incrementedNumber = parseInt(lastChar) + 4; // Increment the number by 4

        const newStr = str.slice(0, -1) + incrementedNumber;
    
        return newStr;
    }

    private handleopponentMove = (move:Move) => {

        if (this.playerIdentity !== this.playerTurn) {
            const newSelectedMeshName = this.incrementLastChar(move.selectedPieceName);
            this.selectedMesh = this.assets.pieces.get(newSelectedMeshName);
            const newTargetPosition  = new Vector3(move.selectedPoint._x, move.selectedPoint._y, move.selectedPoint._z);
            this.opponentNavigateMeshToPosition(newTargetPosition);
        }



    } 

    private  parseMeshName(meshName: string): { unitType: string | null, unitNumber: number | null } {
        for (let unit of this.units) {
            const regex = new RegExp(`${unit}\\D*(\\d+)`, 'i');
            const match = meshName.match(regex);
            if (match) {
                return {
                    unitType: unit,
                    unitNumber: parseInt(match[1], 10)
                };
            }
        }
        return {
            unitType: null,
            unitNumber: null
        };
    }

    private findUnit(unitType: string, unitNumber: number): ArmyUnit | undefined {
        let unitArray: ArmyUnit[];
    
        switch (unitType) {
            case "Cavalry":
                unitArray = this.assets.getCavalry();
                break;
            case "Infantry":
                unitArray = this.assets.getInfantry();
                break;
            case "Archers":
                unitArray = this.assets.getArchers();
                break;
            case "Artillery":
                unitArray = this.assets.getArtillery();
                break;
            default:
                return undefined;
        }
    
        return unitArray[unitNumber-1];
    }

    public checkWinCondition(): number {
        const myUnitsStrength = this.assets.calculateUnitsTotalStrength();
        const enemyUnitsStrength = this.assets.calculateEnemyUnitsTotalStrength();
    
        if (myUnitsStrength <= 0 && enemyUnitsStrength > 0) {
            return 2; // Loss: Player's units are zero and enemy units are above zero.
        } else if (enemyUnitsStrength <= 0 && myUnitsStrength > 0) {
            return 1; // Win: Enemy units are zero and player's units are above zero.
        } else if (myUnitsStrength <= 0 && enemyUnitsStrength <= 0) {
            return 0; // Draw: Both sides have units zero or below.
        } else {
            return 0; // Continue the game as no sides have lost yet, can be considered a draw state.
        }
    }
    

    private addListeners(): void {
        this.scene.onPointerDown = (evt, pickResult) => {

            console.log("player turn", this.playerTurn)

            //console.log(pickResult.pickedMesh);
            if (pickResult.hit && pickResult.pickedMesh &&  (this.assets.pieces.has(pickResult.pickedMesh.name)  && this.playerTurn === this.playerIdentity)) {

                let isplayerPiece: boolean = this.assets.piecesToUnit.has(pickResult.pickedMesh.name) ? true : false;
                
                if(isplayerPiece){
                    this.selectedMesh = pickResult.pickedMesh as Mesh;
                    const { unitType, unitNumber } = this.parseMeshName(pickResult.pickedMesh.name);
    
                    const activeUnit = this.findUnit.call(this, unitType, unitNumber);
    
                    console.log(activeUnit);
    
                    this.gui.updateActiveUnit(activeUnit);
                }
                  
            } else if (pickResult.hit && pickResult.pickedMesh === this.navMesh && this.selectedMesh && (this.playerTurn === this.playerIdentity)) {
                console.log(pickResult.pickedPoint!)
                this.navigateMeshToPosition(pickResult.pickedPoint!);
                const move: Move = {
                    selectedPieceName:this.selectedMesh.name,
                    selectedPoint:pickResult.pickedPoint,
                  };
                  socket.emit("move", { // <- 3 emit a move event.
                    move,
                    room:this.room,
                  }); // this event will be transmitted to the opponent via the server

            }
        };
    }

    private opponentNavigateMeshToPosition(targetPosition: Vector3): void {
        // console.log(this.selectedMesh)
         if (!this.selectedMesh) return;

         console.log(this.selectedMesh.position, targetPosition)
     
         // Synchronously compute the path
         const path: Vector3[] = this.navigation.computePath(this.selectedMesh.position, targetPosition);

         console.log("reached here")

         console.log(path)
     
         // Check if a valid path was returned and animate the mesh along this path
         if (path && path.length > 0) {

             console.log("also reached here")
             
             this.opponentAnimateMeshAlongPath(this.selectedMesh, path);
         }
     }


     private opponentAnimateMeshAlongPath(mesh: Mesh, path: Vector3[]): void {
        let currentPointIndex = 0;
        mesh.position = path[currentPointIndex]; // Start position

        console.log(currentPointIndex)

        let energyUsed = 0
        

        const goToNextPoint = () => {
            currentPointIndex++;
            if (currentPointIndex < path.length) {
                Animation.CreateAndStartAnimation('moveToPoint', mesh, 'position', 30, 60, mesh.position, path[currentPointIndex], Animation.ANIMATIONLOOPMODE_CONSTANT, undefined, () => {
                    goToNextPoint();
                });
                energyUsed += 0.001;
            }else {
                console.log("Reached the last point in the path.");

                if (this.assets.piecesToUnit.has(mesh.name)) {
                    const unit = this.assets.piecesToUnit.get(mesh.name)
                    this.assets.piecesToUnit.set(mesh.name, unit);
                } else if (this.assets.piecesToEnemyUnit.has(mesh.name)) {
                    const unit = this.assets.piecesToEnemyUnit.get(mesh.name)
                    this.assets.piecesToEnemyUnit.set(mesh.name, unit);
                } else {
                    console.log("Piece name not found in any map");
                }

                const collisionResult = this.game.checkCollisions(this.assets,mesh, mesh.name);
                

                if (collisionResult.collision) {
                    
                    console.log(collisionResult.details.current);

        

                    const collidedWithOpponent = this.game.isOpponent(this.assets,collisionResult.details.other)

                    if (collidedWithOpponent){
                        this.game.processEngagements(this.assets,collisionResult.details.current,collisionResult.details.other);
                        this.gui.updatePlayerStat(0, `Total Strength: ${this.assets.calculateUnitsTotalStrength()}`, "purple");

                        console.log(this.assets.calculateUnitsTotalStrength())
                    }

                } else {
                    // Handle no collision case
                    console.log("No collisions detected for this movement.");
                    // Continue with normal game flow
                    this.selectedMesh = null;
                }
            }
        };

        goToNextPoint();

        const winLossDraw = this.checkWinCondition()

        if (winLossDraw === 1){

        }else if(winLossDraw === 0){

        }else{
            
        }
        
    }


        private navigateMeshToPosition(targetPosition: Vector3): void {
           // console.log(this.selectedMesh)
            if (!this.selectedMesh) return;

            console.log(this.selectedMesh.position, targetPosition)
        
            // Synchronously compute the path
            const path: Vector3[] = this.navigation.computePath(this.selectedMesh.position, targetPosition);

            console.log("reached here")

            console.log(path)
        
            // Check if a valid path was returned and animate the mesh along this path
            if (path && path.length > 0) {

                console.log("also reached here")
                
                this.animateMeshAlongPath(this.selectedMesh, path);
            }
        }
        
        private endTurn() {
            const newTurnData = {
              room: this.room,        // The room ID where this game is taking place
              turnChange: true,  // Additional data indicating the nature of the turn change
            };
            socket.emit('turnChange', newTurnData);
          }
    

    private animateMeshAlongPath(mesh: Mesh, path: Vector3[]): void {
        let currentPointIndex = 0;
        mesh.position = path[currentPointIndex]; // Start position

        console.log(currentPointIndex)

        let energyUsed = 0
        

        const goToNextPoint = () => {
            currentPointIndex++;
            if (currentPointIndex < path.length) {
                Animation.CreateAndStartAnimation('moveToPoint', mesh, 'position', 30, 60, mesh.position, path[currentPointIndex], Animation.ANIMATIONLOOPMODE_CONSTANT, undefined, () => {
                    goToNextPoint();
                });
                energyUsed += 0.001;
            }else {
                console.log("Reached the last point in the path.");

                if (this.assets.piecesToUnit.has(mesh.name)) {
                    const unit = this.assets.piecesToUnit.get(mesh.name)
                    this.assets.piecesToUnit.set(mesh.name, unit);
                } else if (this.assets.piecesToEnemyUnit.has(mesh.name)) {
                    const unit = this.assets.piecesToEnemyUnit.get(mesh.name)
                    this.assets.piecesToEnemyUnit.set(mesh.name, unit);
                } else {
                    console.log("Piece name not found in any map");
                }

                const collisionResult = this.game.checkCollisions(this.assets,mesh, mesh.name);
                

                if (collisionResult.collision) {
                    
                    console.log(collisionResult.details.current);

        

                    const collidedWithOpponent = this.game.isOpponent(this.assets,collisionResult.details.other)

                    if (collidedWithOpponent){
                        this.game.processEngagements(this.assets,collisionResult.details.current,collisionResult.details.other);
                        this.gui.updatePlayerStat(0, `Total Strength: ${this.assets.calculateUnitsTotalStrength()}`, "purple");

                        console.log(this.assets.calculateUnitsTotalStrength())
                    }

                } else {
                    // Handle no collision case
                    console.log("No collisions detected for this movement.");
                    // Continue with normal game flow
                }

                this.playerTurn = this.playerTurn === 'player_one' ? 'player_two' : 'player_one'

                this.endTurn();
            }
        };

        goToNextPoint();

        const winLossDraw = this.checkWinCondition()

        if (winLossDraw === 1){

        }else if(winLossDraw === 0){

        }else{
            
        }
        
    }


    public renderLoop(): void {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
