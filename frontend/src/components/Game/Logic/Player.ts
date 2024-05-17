import { ArmyUnit } from "./Assets";

interface PlayerDetails {
    id: number;
    username: string;
    address: string;
    accountId: string;
}

interface Banners {
    id: number;
    token_uri: string;
    type: ArmyUnit;
}

export class Player {
    public playerAssets: any[];  // Replace 'any' with the actual type if known
    public playerStrength: number;
    public playerCaptured: any[];  // Replace 'any' with the actual type if known
    public lostAssets: any[];  // Replace 'any' with the actual type if known
    public playerDetails: PlayerDetails;
    public playerBanners: Banners[];

    constructor(playerDetails: PlayerDetails, playerBanners: Banners[], playerAssets:any[],playerStrength:number) {
        this.playerDetails = playerDetails;
        this.playerBanners = playerBanners;
        this.playerAssets = playerAssets;
        this.playerStrength = playerStrength;
        this.playerCaptured = [];
        this.lostAssets = [];
    }

    // Getter methods
    getPlayerDetails(): PlayerDetails {
        return this.playerDetails;
    }

    getPlayerBanners(): Banners[] {
        return this.playerBanners;
    }

    getPlayerAssets(): any[] {  // Replace 'any' with the actual type if known
        return this.playerAssets;
    }

    getPlayerStrength(): number {
        return this.playerStrength;
    }

    getPlayerCaptured(): any[] {  // Replace 'any' with the actual type if known
        return this.playerCaptured;
    }

    getLostAssets(): any[] {  // Replace 'any' with the actual type if known
        return this.lostAssets;
    }

    // Update methods
    updatePlayerDetails(newDetails: Partial<PlayerDetails>): void {
        this.playerDetails = { ...this.playerDetails, ...newDetails };
    }

    updatePlayerBanners(newBanners: Banners[]): void {
        this.playerBanners = newBanners;
    }

    addPlayerAsset(asset: any): void {  // Replace 'any' with the actual type if known
        this.playerAssets.push(asset);
    }

    updatePlayerStrength(newStrength: number): void {
        this.playerStrength = newStrength;
    }

    addPlayerCaptured(captured: any): void {  // Replace 'any' with the actual type if known
        this.playerCaptured.push(captured);
    }

    addLostAsset(asset: any): void {  // Replace 'any' with the actual type if known
        this.lostAssets.push(asset);
    }
}
