import { Scene, AbstractMesh } from '@babylonjs/core';
import { AdvancedDynamicTexture, Control, Image, TextBlock, Button, Rectangle, StackPanel } from '@babylonjs/gui/2D';
import { ArmyUnit } from './Assets';
import { text } from 'node:stream/consumers';

export interface LeaderboardEntry {
    id: number;
    leader_account: string;
    points: number;
    games: number;
    number_crowned: number;
    loyals: number;
    minutes: number;
}

export class GUI {
    private scene: Scene;
    private advancedTexture: AdvancedDynamicTexture;
    private tokenUris: string[] = [];
    
    private playerStatsTextBlocks: TextBlock[] = [];
    private opponentStatsTextBlocks: TextBlock[] = [];
    private activeUnitPanel: StackPanel;
    private activeUnitTextBlocks: { [key: string]: TextBlock } = {};

    private leaderboardPanel: Rectangle;
    private leaderboardStackPanel: StackPanel;

    private mapPanel: Rectangle;
    private mapImage: Image;

    constructor(scene: Scene, tokenUris: string[], playerColors: string[], opponentColors: string[]) {
        this.scene = scene;
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.tokenUris = tokenUris;
  
        this.createSidePanel();
        this.createRightPanel(playerColors, opponentColors);
        this.createBottomMenu();
        this.createActiveUnitPanel();
        this.createLeaderboardPanel();
        this.createMapPanel();
    }

    createSidePanel() {
        const sidePanel = new StackPanel();
        sidePanel.width = "150px";
        sidePanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        sidePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.advancedTexture.addControl(sidePanel);

        const units = ["Cavalry", "Infantry", "Archers", "Artillery"];
        units.forEach((unit, index) => {
            const container = new Rectangle();
            container.width = "100px";
            container.height = "120px"; // Increased height to accommodate the image and the button
            container.thickness = 0;
            container.paddingBottom = "10px";
            sidePanel.addControl(container);

            // Create an image placeholder
            const image = new Image(`${unit}_img`, `${this.tokenUris[index]}`);
            image.width = "80px";
            image.height = "80px";
            image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            container.addControl(image);

            // Create a button
            const button = Button.CreateSimpleButton(unit, unit);
            button.width = "100px";
            button.height = "40px";
            button.color = "white";
            button.background = "gray";
            button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            container.addControl(button);
        });
    }

    createRightPanel(playerColors: string[], opponentColors: string[]) {
        const rightPanel = new StackPanel();
        rightPanel.width = 0.20;
        rightPanel.height = 0.40;
        rightPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rightPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.advancedTexture.addControl(rightPanel);

        const playerStats = ["Total Strength: 160", "Captured Assets: 0", "Resources: 10 Gold", "Banners: 16 NFTs"];
        playerStats.forEach((stat, index) => {
            const container = new Rectangle();
            container.width = "100%";
            container.height = "40px";
            container.thickness = 2;
            container.cornerRadius = 5;
            container.color = "goldenrod"; // Medieval styled color
            container.background = "rgba(0, 0, 0, 0.5)"; // Semi-transparent background
            rightPanel.addControl(container);

            const textBlock = new TextBlock();
            textBlock.text = stat;
            textBlock.color = playerColors[index] || "white"; // Set dynamic color
            textBlock.height = "30px";
            container.addControl(textBlock);
            this.playerStatsTextBlocks.push(textBlock);
        });

        // Similar panel for opponent's stats
        const opponentStats = ["Opponent Strength: 9876", "Captured Assets: 3", "Resources: 800 Gold"];
        opponentStats.forEach((stat, index) => {
            const container = new Rectangle();
            container.width = "100%";
            container.height = "40px";
            container.thickness = 2;
            container.cornerRadius = 5;
            container.color = "goldenrod"; // Medieval styled color
            container.background = "rgba(0, 0, 0, 0.5)"; // Semi-transparent background
            rightPanel.addControl(container);

            const textBlock = new TextBlock();
            textBlock.text = stat;
            textBlock.color = opponentColors[index] || "white"; // Set dynamic color
            textBlock.height = "30px";
            container.addControl(textBlock);
            this.opponentStatsTextBlocks.push(textBlock);
        });
    }

    createBottomMenu() {
        const bottomMenu = new StackPanel();
        bottomMenu.width = "100%";
        bottomMenu.height = "50px";
        bottomMenu.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        bottomMenu.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        bottomMenu.isVertical = false;
        this.advancedTexture.addControl(bottomMenu);

        const menuItems = ["Map", "Army", "Assets", "Leaderboard"];
        menuItems.forEach(item => {
            const button = Button.CreateSimpleButton(item, item);
            button.width = "100px";
            button.height = "50px";
            button.color = "white";
            button.background = "black";
            button.onPointerUpObservable.add(() => this.onMenuItemClick(item));
            bottomMenu.addControl(button);
        });
    }


    createLeaderboardPanel() {
        this.leaderboardPanel = new Rectangle();
        this.leaderboardPanel.width = "400px";
        this.leaderboardPanel.height = "600px";
        this.leaderboardPanel.background = "rgba(0, 0, 0, 0.8)";
        this.leaderboardPanel.color = "white";
        this.leaderboardPanel.thickness = 2;
        this.leaderboardPanel.cornerRadius = 10;
        this.leaderboardPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.leaderboardPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.leaderboardPanel.isVisible = false;
        this.advancedTexture.addControl(this.leaderboardPanel);

        this.leaderboardStackPanel = new StackPanel();
        this.leaderboardPanel.addControl(this.leaderboardStackPanel);

        const cancelButton = Button.CreateSimpleButton("cancel", "Close");
        cancelButton.width = "100px";
        cancelButton.height = "50px";
        cancelButton.color = "white";
        cancelButton.background = "red";
        cancelButton.onPointerUpObservable.add(() => {
            this.leaderboardPanel.isVisible = false;
        });
        this.leaderboardStackPanel.addControl(cancelButton);
    }


    createMapPanel() {
        this.mapPanel = new Rectangle();
        this.mapPanel.width = "80%";
        this.mapPanel.height = "80%";
        this.mapPanel.background = "rgba(0, 0, 0, 0.8)";
        this.mapPanel.color = "white";
        this.mapPanel.thickness = 2;
        this.mapPanel.cornerRadius = 10;
        this.mapPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.mapPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.mapPanel.isVisible = false;
        this.advancedTexture.addControl(this.mapPanel);

        this.mapImage = new Image("mapImage", "https://res.cloudinary.com/dydj8hnhz/image/upload/v1716355738/lysgh6rcox3pzruayzyf.png");
        this.mapImage.width = "100%";
        this.mapImage.height = "100%";
        this.mapPanel.addControl(this.mapImage);

        const cancelButton = Button.CreateSimpleButton("cancel", "Close");
        cancelButton.width = "100px";
        cancelButton.height = "50px";
        cancelButton.color = "white";
        cancelButton.background = "red";
        cancelButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        cancelButton.onPointerUpObservable.add(() => {
            this.mapPanel.isVisible = false;
        });
        this.mapPanel.addControl(cancelButton);
    }
    createActiveUnitPanel() {
        this.activeUnitPanel = new StackPanel();
        this.activeUnitPanel.width = "100%";
        this.activeUnitPanel.height = "100px";
        this.activeUnitPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.activeUnitPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.activeUnitPanel.isVertical = false; // Align elements in a row
        this.advancedTexture.addControl(this.activeUnitPanel);

        const colors = ['purple','blue','green','yellow'];

        // Create containers for each property of the ArmyUnit with medieval styling
        ["unit", "name", "army", "strength"].forEach((property, index) => {
            const container = new Rectangle();
            container.width = "150px";
            container.height = "50px";
            container.thickness = 2;
            container.cornerRadius = 5;
            container.color = "goldenrod"; // Medieval styled color
            container.background = "rgba(0, 0, 0, 0.7)"; // Semi-transparent background
            this.activeUnitPanel.addControl(container);

            const textBlock = new TextBlock();
            textBlock.text = `${property}: `;
            textBlock.fontSize = "18px"
            textBlock.color = colors[index]; // Default color
            textBlock.height = "50px";
            textBlock.width = "150px";
            textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            textBlock.paddingLeft = "10px"; // Padding for better visual appearance
            container.addControl(textBlock);
            this.activeUnitTextBlocks[property] = textBlock;
        });
    }

    // Method to update player stats
    updatePlayerStat(index: number, newValue: string, color: string = "white") {
        if (index >= 0 && index < this.playerStatsTextBlocks.length) {
            this.playerStatsTextBlocks[index].text = newValue;
            this.playerStatsTextBlocks[index].color = color;
        }
    }

    // Method to update opponent stats
    updateOpponentStat(index: number, newValue: string, color: string = "white") {
        if (index >= 0 && index < this.opponentStatsTextBlocks.length) {
            this.opponentStatsTextBlocks[index].text = newValue;
            this.opponentStatsTextBlocks[index].color = color;
        }
    }

    // Method to update the active unit panel
    updateActiveUnit(unit: ArmyUnit) {
        this.activeUnitTextBlocks["unit"].text = `unit: ${unit.unitId}`;
        this.activeUnitTextBlocks["name"].text = `name: ${unit.name}`;
        this.activeUnitTextBlocks["army"].text = `army: ${unit.army_type}`;
        this.activeUnitTextBlocks["strength"].text = `strength: ${unit.strength}`;
    }

    onMenuItemClick(item: string) {
        if (item === "Leaderboard") {
            this.leaderboardPanel.isVisible = !this.leaderboardPanel.isVisible;
        }
        if (item === "Map") {
            this.mapPanel.isVisible = !this.mapPanel.isVisible;
        }
    }

    updateLeaderboard(data: LeaderboardEntry[]) {
        // Clear existing entries except the cancel button
        this.leaderboardStackPanel.children
            .filter(child => child !== this.leaderboardStackPanel.children[this.leaderboardStackPanel.children.length - 1])
            .forEach(child => this.leaderboardStackPanel.removeControl(child));

        data.forEach(entry => {
            const textBlock = new TextBlock();
            textBlock.text = `ID: ${entry.id}, Account: ${entry.leader_account}, Points: ${entry.points}, Games: ${entry.games}, Crowned: ${entry.number_crowned}, Loyals: ${entry.loyals}, Minutes: ${entry.minutes}`;
            textBlock.color = "white";
            textBlock.height = "50px";
            this.leaderboardStackPanel.addControl(textBlock);
        });
    }
}