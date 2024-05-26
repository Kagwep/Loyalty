
# Loyalty

Welcome to Loyalty, your gateway to immersive medieval strategy gaming with a twist of modern technology. Loyalty is built on three key pillars: strategic gameplay, NFT integration, and real-time leaderboards. This README will guide you through the unique features and gameplay mechanics of Loyalty.

![Loyalty Overview](https://res.cloudinary.com/dufdzujik/image/upload/v1714286395/loyalty_overview.png)

# Overview

Loyalty is a strategic 3D game that  blends blockchain technology with classic medieval strategy gameplay. Players engage in turn-based battles, manage resources, and compete on leaderboards. The game  incorporates NFTs, allowing players to own, mint, and trade digital assets such as banners created by artists. These banners not only serve as a strategic element within the game but also as collectible artwork that can be sold or owned.

Players who rank high on the leaderboards gain the opportunity to earn proceeds from the game’s marketplace. This economic model rewards top players for their strategic prowess and contributes to a dynamic, player-driven economy. Loyalty promotes interaction among players and artists, creating a vibrant community centered around competition, strategy, and artistic expression within a medieval fantasy setting.

## Game Features

- **NFT Integration**: integration of NFTs that players can earn, trade, and use within the game play.
- **Dynamic Leaderboard**: Compete with other players for top rankings and rewards distributed based on leaderboard standings.
- **Game Rooms**: Join or create game rooms to challenge other players in  match-ups.
- **Strategic Gameplay**: Deep strategic elements that require thoughtful planning and tactical execution, including unit management and resource allocation.

## Technologies Used

- **Ink! Smart Contracts**: Solid and secure smart contracts for handling game logic and transactions.
- **use-Inkathon**: Framework for frontend and backend integration, ensuring a cohesive gameplay experience.
- **Vite**: Frontend tooling for faster and leaner development cycles.
- **Babylon.js**: Engine for creating immersive 3D gaming environments.
- **Deployed on POP Network**: Ensuring wide accessibility and robust performance.

# Setting Up Your Game

Before you dive into the battles and strategies of **Loyalty**, follow these steps to set up your game effectively:

- **Connect Your Digital Wallet**: Ensure your Polkadot-enabled  wallet (e.g., Polkadot{.js}) is connected to the game on the POP Network testnet. This connection is crucial as you will need to acquire some POS tokens to manage transactions and handle your in-game assets, including NFTs.

- **Create Your Game Profile**: Visit the  Loyalty platform and create your game profile. This involves setting up your  initial units banners are nft tokens, which are essential for your  gameplay.

- **Select Your Game Room and Banners**: Choose a game room to join or create a new one, and remember to select your banners first. These banners are NFTs that you’ve either minted or purchased, and they represent your units on the battlefield. Game rooms are where the strategic battles take place and where you can challenge other players.

## Gameplay Instructions

Engage in the world of **Loyalty** by following these gameplay steps:

- **Deploy Your Units**: Your units will be marked by different colors, with your NFT banners displayed prominently. All opponent pieces are red, making them easily distinguishable. Each unit type—be it cavalry, infantry, archers, or artillery—has unique abilities and strategic advantages.

- **Manage Resources**: Throughout the game, manage your resources wisely to maintain your army and defenses. Resource management is crucial for survival and victory.

- **Engage in Battles**: Use tactical planning and strategic maneuvers to engage with enemy units. Victory in battles depends on your ability to outsmart and outmaneuver your opponent.

- **Climb the Leaderboards**: Success in battles will help you climb the leaderboards, where top players are rewarded. Leaderboard standings are based on your win/loss record, the strategic effectiveness of your battles, and the overall growth of your empire.

## Earning and Rewards

**Loyalty** offers various ways to earn rewards and profits through strategic gameplay:

- **Win Battles and Tournaments**: Regularly participating in and winning battles or tournaments can yield substantial in-game rewards, including exclusive NFTs and game currency.

- **Trade in the Marketplace**: Engage with the Loyalty marketplace to buy, sell, or trade units, banners, and other strategic assets. Smart trading can enhance your strategic options and provide another revenue stream.

- **Achieve Leaderboard Success**: Players who rank high on the leaderboards may receive additional rewards and recognition within the game community, including special access to new content and events.


## Future Enhancements

- **In-Game Economy Mechanics**: Further development of the game’s economic system to provide more depth and player engagement.
- **Gameplay Mechanics**: Refinement of capture mechanics and unit reinforcements to add complexity and variety.
- **World Building**: Continuous improvements to the game world to enhance visual appeal and immersion.

## Getting Started Locally

To run Loyalty on your local machine, follow these instructions:

### Prerequisites

Make sure you have `pnpm` installed on your system. If not, you can install it via npm:

```bash
npm install -g pnpm
```

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/Kagwep/loyalty-game.git
    cd loyalty-game
    ```

2. **Install dependencies**:

    ```bash
    pnpm install
    ```

3. **Deploy Contracts**:

    Deploy the necessary smart contracts to a local node to set up the game environment. This includes deploying the `Game Room Contract`, the `Marketplace Contract`, the `Leaderboard Contract`, and the `ERC-721 Contract` for handling NFT tokens associated with the game. After deployment, update the contract addresses in the respective deployment folders located under `src/frontend/contracts`.

    - **Testing the Contracts**:
      - For the `Game Room Contract` and the `Leaderboard Contract`, navigate to the game directory and run unit tests with the following command:
        ```bash
        cd game_room
        cargo contract test
        ```
        ```bash
        cd leaderboard
        cargo contract test
        ```
      - For the `Marketplace Contract`, perform end-to-end tests by running:
        ```bash
        cd loyalty_marketplace
        cargo test --features e2e-tests
        ```
        This command executes tests that are enabled by the `e2e-tests` feature flag, ensuring comprehensive testing of marketplace functionalities.

    - **Building the Contracts**:
        - To compile all the smart contracts and ensure they are ready for deployment, run the following command from the root of your contracts directory:
            ```bash
            cargo contract build
            ```
        - This command compiles the contracts in release mode, optimizing them for performance and efficiency in a production environment.


4. **Start the Development Server**:

    ```bash
    pnpm dev
    ```

    This will launch the game interface on `http://localhost:5173`.

## Live Deployment

Loyalty is live on the POP Network testnet. Ensure you have PAS tokens for interacting with the contracts effectively.

![Game Interface](https://res.cloudinary.com/dufdzujik/image/upload/v1714320837/loyalty_game_ui.png)
