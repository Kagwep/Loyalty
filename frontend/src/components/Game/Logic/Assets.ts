import { AbstractMesh, Scene, AssetsManager, MeshAssetTask, Sound, StandardMaterial,Color3,Mesh, MeshBuilder,SceneLoader, Vector3,Texture } from "@babylonjs/core";

export interface ArmyUnit {
    name: string,
    army_type: string,
    strength: number,
    model: AbstractMesh
}

export interface LoyaltyAssets {
    mesh_name: string,
    index: number,
    mesh: AbstractMesh
}



export class Assets {

    public cavalry: ArmyUnit[] = [];
    public infantry: ArmyUnit[] = [];
    public archers: ArmyUnit[] = [];
    public artillery: ArmyUnit[] = [];

    public infantryMaterial: StandardMaterial | undefined;
    public cavalryMaterial: StandardMaterial | undefined;
    public archersMaterial: StandardMaterial | undefined;
    public artilleryMaterial: StandardMaterial | undefined;

    public loyalGameplayAssets: AbstractMesh[] = [];

    public loyalGameplayAssetsHome: Map<string, AbstractMesh> = new Map();

    public infantryThreatArea: Mesh | undefined;
    public cavalryThreatArea: Mesh | undefined;
    public archersThreatArea: Mesh | undefined;
    public artilleryThreatArea: Mesh | undefined;

    private _cavalry_model: AbstractMesh | undefined;
    private _infantry_model: AbstractMesh | undefined;
    private _archers_model: AbstractMesh | undefined;
    private _artillery_model: AbstractMesh | undefined;

    public materialsAvailable: boolean= false;

    public meshNameToIndex: Map<string, LoyaltyAssets> = new Map();


    public sounds: Map<string, Sound> | undefined;

    public pieces:Map<string,  Mesh> = new Map();

    
    private scene: Scene;
    private assetsManager: AssetsManager;
    private soundAssetsManager: AssetsManager;

    public token_uris: string[] = [];

    constructor(scene: Scene) {

        this.scene = scene;
        this.assetsManager = new AssetsManager(scene);
        this.soundAssetsManager = new AssetsManager(scene);


        this.sounds = new Map<string, Sound>();

        this.setLoyalPieces();

        
        this.assetsManager = new AssetsManager(scene);
        this.soundAssetsManager = new AssetsManager(scene);
        this.setupSoundAssetTasks();
        
        this.createMaterials(scene);

        this.checkMaterialsAvailabiility();

        this.initializeThreatAreas(scene);

        

    }

    public setLoyalPieces(){

        const units = ["Cavalry", "Infantry", "Archers", "Artillery"];

        units.forEach((unit) => {


            for (let i = 1; i <= 4; i++) {
                const meshName = `${unit}Piece${i}`;
                const sphere = MeshBuilder.CreateSphere(meshName, { diameter: 2 }, this.scene) as Mesh;
                sphere.position.x = -20 + i * 5;  // Adjusting position for demo purposes
                sphere.position.y = 4;

                const threatMaterialSphere = new StandardMaterial("threatMaterialSphere", this.scene);
                threatMaterialSphere.diffuseColor = new Color3(1, 0, 0); // Red
                threatMaterialSphere.alpha = 0.5; // Semi-transparent

                sphere.material = threatMaterialSphere;


                this.pieces.set(meshName, sphere);
            }

           
        });

    }

    public getLoyalPieceByName(name: string): Mesh | undefined {
        return this.pieces.get(name);
    }

    public async setupAssetTasks() {
        await this.createAssetTask("armybanner.glb", "cavalry");
        await this.createAssetTask("armybanner.glb", "infantry");
        await this.createAssetTask("armybanner.glb", "archers");
        await this.createAssetTask("armybanner.glb", "artillery");
    }

    private setupSoundAssetTasks() {
        this.createSoundAssetTask("battle.mp3", "soundBattle");
        this.createSoundAssetTask("march.mp3", "soundMarch");
        this.createSoundAssetTask("victory.mp3", "soundVictory");
        this.createSoundAssetTask("defeat.mp3", "soundDefeat");
        this.createSoundAssetTask("ambient.mp3", "soundAmbient");
        this.createSoundAssetTask("charge.mp3", "soundCharge");
        this.createSoundAssetTask("retreat.mp3", "soundRetreat");
        this.createSoundAssetTask("siege.mp3", "soundSiege");
        this.createSoundAssetTask("rally.mp3", "soundRally");
        this.createSoundAssetTask("stand.mp3", "soundStand");
    }

    private createSoundAssetTask(soundFile: string, soundName: string) {
        const task = this.soundAssetsManager.addBinaryFileTask(soundName, "./sounds/" + soundFile);
        task.onSuccess = (task) => {
            if (this.sounds){
                this.sounds.set(soundName, new Sound(soundName, task.data, this.scene, null, { autoplay: false, loop: false }));
            }
    
        };
    }

    private async createAssetTask( modelFile: string, assetKey: string) {

        const banners = await this.loadAsset(modelFile);


            switch (assetKey) {
                case "cavalry":
                    this._cavalry_model = banners[0];
                    this._cavalry_model.isPickable = true;
                    const cavalryMaterial = this.setTokenUriToUnit(assetKey);
                    this._cavalry_model.getChildMeshes(false, (node) => {
                        if (node instanceof Mesh) {
                            node.material = cavalryMaterial;
                            return true;  
                        }
                        return false;  
                    });
                    break;

                case "infantry":
                    this._infantry_model = banners[0];
                    this._infantry_model.isPickable = true;
                    const infantryMaterial = this.setTokenUriToUnit(assetKey);
                    this._infantry_model.getChildMeshes(false, (node) => {
                        if (node instanceof Mesh) {
                            node.material = infantryMaterial;
                            return true;  
                        }
                        return false;  
                    });
                    break;

                case "archers":
                    this._archers_model = banners[0];
                    this._archers_model.isPickable =true;
                    const archersMaterial = this.setTokenUriToUnit(assetKey);
                    this._archers_model.getChildMeshes(false, (node) => {
                        if (node instanceof Mesh) {
                            node.material = archersMaterial;
                            return true;  
                        }
                        return false;  
                    });
                    break;

                case "artillery":
                    this._artillery_model = banners[0];
                    this._artillery_model.isPickable = true
                    const artilleryMaterial = this.setTokenUriToUnit(assetKey);
                    this._artillery_model.getChildMeshes(false, (node) => {
                        if (node instanceof Mesh) {
                            node.material = artilleryMaterial;
                            return true;  
                        }
                        return false;  
                    });
                    break;

                default:
                    console.error("Unknown asset key:", assetKey);
            }
        
    }

    async initialize() {
        return new Promise<void>((resolve, reject) => {
            this.assetsManager.onFinish = (tasks) => {
                this.createUnits(this._cavalry_model, this.cavalry, "Cavalry", 4);
                this.createUnits(this._infantry_model, this.infantry, "Infantry", 3);
                this.createUnits(this._archers_model, this.archers, "Archers", 2);
                this.createUnits(this._artillery_model, this.artillery, "Artillery", 1);
                resolve();
            };

     

            this.assetsManager.load();
            this.soundAssetsManager.load();
        });
    }

    private createUnits(baseMesh: AbstractMesh | undefined, unitArray: ArmyUnit[], type: string, strength: number) {

        if (baseMesh) {
            
            for (let i = 1; i <= 4; i++) {
                const newBaseMesh = baseMesh.clone(`${type}Unit${i}`, null, false) as AbstractMesh
                const meshName = `${type}Piece${i}`;
                const baseMeshParent = this.getLoyalPieceByName(meshName);
                // const assetKey = type.toLocaleLowerCase()
                // const unitMaterial = this.setTokenUriToUnit(assetKey);
                // newBaseMesh.material = unitMaterial;
                if (baseMeshParent){
                    newBaseMesh.position = new Vector3(0, 0, 0);
                    newBaseMesh.rotation = new Vector3(0, 0, 0);
                    newBaseMesh.scaling = new Vector3(1, 1, 1);
                    newBaseMesh.computeWorldMatrix(true);
                    newBaseMesh.parent = baseMeshParent;

                }

                unitArray.push({
                    name: `${type} Unit ${i}`,
                    army_type: type,
                    strength: strength,
                    model: newBaseMesh,
                });
            }
        }
    }

    private checkMaterialsAvailabiility = () => {
            if (this.infantryMaterial && this.cavalryMaterial && this.archersMaterial && this.artilleryMaterial) {
                this.materialsAvailable = true;
            }
        }

    private createMaterials(scene: Scene): void {
        // Infantry Material
        this.infantryMaterial = new StandardMaterial("infantryMaterial", scene);
        this.infantryMaterial.diffuseColor = new Color3(0.4, 0.4, 0.6); // A dull blue color
        this.infantryMaterial.alpha = 0.5; // Semi-transparent

        // Cavalry Material
        this.cavalryMaterial = new StandardMaterial("cavalryMaterial", scene);
        this.cavalryMaterial.diffuseColor = new Color3(1, 0, 0); // A light brown color
        this.cavalryMaterial.alpha = 0.5; // Semi-transparent

        // Archers Material
        this.archersMaterial = new StandardMaterial("archersMaterial", scene);
        this.archersMaterial.diffuseColor = new Color3(0.3, 0.5, 0.2); // A forest green color
        this.archersMaterial.alpha = 0.5; // Semi-transparent

        // Artillery Material
        this.artilleryMaterial = new StandardMaterial("artilleryMaterial", scene);
        this.artilleryMaterial.diffuseColor = new Color3(0.5, 0.3, 0.3); // A rusty red color
        this.artilleryMaterial.alpha = 0.5; // Semi-transparent
    }


    private initializeThreatAreas(scene: Scene): void {
        // Initialize infantry threat area
        if  (this.infantryMaterial && this.cavalryMaterial && this.archersMaterial && this.artilleryMaterial){
            
            this.infantryThreatArea = this.createThreatArea(scene,3, "infantryThreatArea", this.infantryMaterial);
            // Initialize cavalry threat area
            this.cavalryThreatArea = this.createThreatArea(scene,4, "cavalryThreatArea", this.cavalryMaterial);
            // Initialize archers threat area
            this.archersThreatArea = this.createThreatArea(scene,5, "archersThreatArea", this.archersMaterial);
            // Initialize artillery threat area
            this.artilleryThreatArea = this.createThreatArea(scene,7, "artilleryThreatArea", this.artilleryMaterial);
        }

    }

    private createThreatArea(scene:Scene,radius: number, name: string, material: StandardMaterial): Mesh {
        const options = {
            radius: radius,
            tessellation: 64,
            arc: 1,
            
        };

        const threatArea = MeshBuilder.CreateDisc(name, options, scene);
        threatArea.material = material;
        threatArea.rotation.x = Math.PI / 2; // Rotate to lay flat

        return threatArea;
    }
    private async loadAsset(model_name: string): Promise<AbstractMesh[]> {
        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/', model_name);
        return meshes;
    }

    public setAssetsMeshNameToIndex(meshes: AbstractMesh[]) {
        meshes.forEach((mesh, index) => {
            const asset = { mesh_name: mesh.name, index: index ,mesh: mesh};
            this.meshNameToIndex?.set(mesh.name, asset);
        });
        this.loyalGameplayAssets = meshes;
        this.disableSpecificMeshes();


    }

     private disableSpecificMeshes() {
        const namesToDisable = [
            'loyalpalace', 'farmhouse1', 'farm1', 'palace1', 'bridge1', 'memorial', 'church', 'highlands',
            'ruinspalace', 'whitepalace', 'darkpalace', 'fortvillage', 'fort', 'plains', 'highlandstopl'
        ];

        const startingPositionsReferceAssets = ['farm1', 'palace1', 'memorial', 'church', 'whitepalace', 'darkpalace', 'fortvillage', 'plains']

       
        this.loyalGameplayAssets.forEach(mesh => {
            if (namesToDisable.includes(mesh.name)) {
                mesh.isVisible = false;
                mesh.isPickable = false; // Ensure it's not pickable

                if (startingPositionsReferceAssets.includes(mesh.name)){
                    this.loyalGameplayAssetsHome.set(mesh.name, mesh)
                }
            }
        });
    }

    public getLoyalGameplayAssetsPositions(meshName:string){

        const Assetmesh = this.meshNameToIndex.get(meshName)

        if (Assetmesh){
            return Assetmesh.mesh.absolutePosition
        }

        return null

        
    }

    public setPiecesStartingPositions(player:any){

        const meshesToReferenceSetOne = [
            'whitepalace', 'darkpalace', 'fortvillage', 'plains'
        ];

        const meshesToReferenceSetTwo = [
           'farm1', 'palace1', 'memorial', 'church', 
        ];

        const units = ["Cavalry", "Infantry", "Archers", "Artillery"];

        const gridSize = 4; // Number of pieces per row and column
        const pieceSpacing = 2; // Distance between pieces
        console.log("the len ",  this.pieces)


        units.forEach((unit,index) => {
            for (let i = 1; i <= 4; i++) {

                const row = Math.floor(index / gridSize);
                const col = index % gridSize;

                const meshName = `${unit}Piece${i}`;
                
                const piece = this.getLoyalPieceByName(meshName);

                const startPositionMesh = this.loyalGameplayAssetsHome.get(
                    player.identity === 'player_one' ? meshesToReferenceSetTwo[i-1] : meshesToReferenceSetOne[i-1]
                  );
                  
                  if (startPositionMesh && piece) {
                    
                    piece.position = startPositionMesh.absolutePosition.clone();
                    piece.position.x = startPositionMesh.absolutePosition.x + col * pieceSpacing;
                    piece.position.z = startPositionMesh.absolutePosition.z + row * pieceSpacing;
                    piece.position.y = 5;
                  }
                  
            }
        })

        


    }

    public setUnitUris(token_uris: string[]){
        this.token_uris = token_uris;
    }

   
    public setTokenUriToUnit(pieceName:string): StandardMaterial {

        const unitMaterial = new StandardMaterial(`${pieceName}`, this.scene);

        let textureUri:string = '';

        switch (pieceName) {
            case "cavalry":
                 textureUri =  this.token_uris[0];
                break;

            case "infantry":
                textureUri =  this.token_uris[1];
                break;
            case "archers":
                textureUri =  this.token_uris[2];
                break;
            case "artillery":
                textureUri =  this.token_uris[3];
                break;
            default:
                console.error("Unknown asset key:", pieceName);
        }

        const unitTexture = new Texture(`${textureUri}`, this.scene);

        unitTexture.vScale = -1;
        unitTexture.uScale = -2;

        // Set the diffuse texture using a URL
        unitMaterial.diffuseTexture = unitTexture;

        console.log(unitMaterial)

        return unitMaterial

    }

  

}




// import { AbstractMesh, Scene, SceneLoader,Sound } from "@babylonjs/core";

// interface ArmyUnit {
//     name: string,
//     army_type: string,
//     strength: number,
//     model: AbstractMesh
// }

// export class Assets {
//     public cavalry: ArmyUnit[] = [];
//     public infantry: ArmyUnit[] = [];
//     public archers: ArmyUnit[] = [];
//     public artillery: ArmyUnit[] = [];
//     private cavalry_model: AbstractMesh[] | undefined;
//     private infantry_model: AbstractMesh[] | undefined;
//     private archers_model: AbstractMesh[] | undefined;
//     private artillery_model: AbstractMesh[] | undefined;

//     constructor(scene: Scene) {
//         // Constructor remains synchronous
//     }

//     async initialize() {
//         this.cavalry_model = await this.loadAsset("cavalry.glb");
//         this.infantry_model = await this.loadAsset("infantry.glb");
//         this.archers_model = await this.loadAsset("archers.glb");
//         this.artillery_model = await this.loadAsset("artillery.glb");

//         this.createUnits(this.cavalry_model, this.cavalry, "Cavalry", 4);
//         this.createUnits(this.infantry_model, this.infantry, "Infantry", 3);
//         this.createUnits(this.archers_model, this.archers, "Archers", 2);
//         this.createUnits(this.artillery_model, this.artillery, "Artillery", 1);
//     }

//     private async loadAsset(model_name: string): Promise<AbstractMesh[]> {
//         const { meshes } = await SceneLoader.ImportMeshAsync('', './models/', model_name);
//         return meshes;
//     }

//     private createUnits(modelArray: AbstractMesh[] | undefined, unitArray: ArmyUnit[], type: string, strength: number) {
//         if (modelArray && modelArray.length > 0) {
//             for (let i = 1; i <= 4; i++) {
//                 unitArray.push({
//                     name: `${type} Unit ${i}`,
//                     army_type: type,
//                     strength: strength,
//                     model: modelArray[0].clone(`${type}Unit${i}`, null, true) as AbstractMesh
//                 });
//             }
//         }
//     }
// }
