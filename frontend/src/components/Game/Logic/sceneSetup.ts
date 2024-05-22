import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, AbstractMesh, Animation, SceneLoader, RecastJSPlugin, Material,Texture } from '@babylonjs/core';
import "@babylonjs/loaders";
import Recast from "recast-detour";
import { Assets } from './Assets';
import { GUI } from './GUI';
import { Game } from './Game';
import { ArmyUnit } from './Assets';

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


    constructor(canvasElement:  HTMLCanvasElement) {

        this.canvas = canvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        

        this.initRecast().then(() => {
            this.createCamera();
            this.createLight();
            this.createObjects();
            this.addListeners();
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

        this. unitTokenUris = [
            'https://hambre.infura-ipfs.io/ipfs/QmWjuQ5fitcQzmvJ2zYbg9Ey8arMCAkwbzaofhRKr7ewSM',
            'https://hambre.infura-ipfs.io/ipfs/QmZoczszkuFaxjufK9yKPdA6JPsw6nyeM46ghmMW1htLvi',
            'https://hambre.infura-ipfs.io/ipfs/QmYJaPth7s83t3URg4PM9SUFAqBrrKMTzSWa3xchDcEjT4',
            'https://hambre.infura-ipfs.io/ipfs/QmW1EP1AkVZ82GfeKsY9b1211w5a5nhXMSAGQUU6JsbY6E'
        ]

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

        assets.setPiecesStartingPositions({identity:'player_one'});

        assets.cavalry[0].model.isPickable = false;

        this.game = new Game(this.scene);


        gameGUI.updatePlayerStat(0, `Total Strength: ${assets.getFirstFourStrength()}`, "purple");
        console.log("Player strenth Total",assets.getLastFourStrength())

        // console.log("Player pieces",assets.pieces)
        console.log("Player units",assets.getAllUnits())
        console.log("Player units",assets.getAllEnemyUnits())



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

    private addListeners(): void {
        this.scene.onPointerDown = (evt, pickResult) => {
            //console.log(pickResult.pickedMesh);
            if (pickResult.hit && pickResult.pickedMesh &&  this.assets.pieces.has(pickResult.pickedMesh.name)) {
                this.selectedMesh = pickResult.pickedMesh as Mesh;
                const { unitType, unitNumber } = this.parseMeshName(pickResult.pickedMesh.name);

                const activeUnit = this.findUnit.call(this, unitType, unitNumber);

                console.log(activeUnit);

                this.gui.updateActiveUnit(activeUnit);
            } else if (pickResult.hit && pickResult.pickedMesh === this.navMesh && this.selectedMesh) {
                //console.log(pickResult.pickedPoint!)
                this.navigateMeshToPosition(pickResult.pickedPoint!);


            }
        };
    }

        private navigateMeshToPosition(targetPosition: Vector3): void {
           // console.log(this.selectedMesh)
            if (!this.selectedMesh) return;
        
            // Synchronously compute the path
            const path: Vector3[] = this.navigation.computePath(this.selectedMesh.position, targetPosition);
        
            // Check if a valid path was returned and animate the mesh along this path
            if (path && path.length > 0) {
                
                this.animateMeshAlongPath(this.selectedMesh, path);
            }
        }
        
        
    

    private animateMeshAlongPath(mesh: Mesh, path: Vector3[]): void {
        let currentPointIndex = 0;
        mesh.position = path[currentPointIndex]; // Start position
        

        const goToNextPoint = () => {
            currentPointIndex++;
            if (currentPointIndex < path.length) {
                Animation.CreateAndStartAnimation('moveToPoint', mesh, 'position', 30, 60, mesh.position, path[currentPointIndex], Animation.ANIMATIONLOOPMODE_CONSTANT, undefined, () => {
                    goToNextPoint();
                });
            }else {
                console.log("Reached the last point in the path.");

                this.game.checkCollisions(this.assets,mesh, mesh.name);

      



            }
        };

        goToNextPoint();
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
