
# Squid Game Challenge

This project is a multiplayer web application simulating the popular "Squid Game" series. It features three mini-games, real-time player interaction via WebSockets, and a dark, cinematic theme.

## Features

- **Multiplayer & Single-Player Modes**: Play with friends in real-time or test your skills in a local single-player mode.
- **Three Mini-Games**:
    1.  **Red Light, Green Light**: Answer multiple-choice questions correctly to survive.
    2.  **Tug of War**: Team up to outsmart the opposing team over several rounds.
    3.  **Solo Final**: A final free-for-all where only one player can emerge victorious.
- **Real-time Leaderboard**: Track scores and player status throughout the games.
- **Thematic UI/UX**: Dark, high-contrast design with animations and sound effects to immerse you in the experience.
- **Responsive Design**: Playable on desktop and tablet devices.
- **Built with Modern Tech**: React, TypeScript, Tailwind CSS on the client, and Node.js with Express & Socket.IO on the server.

---

## Project Structure

The project is organized into two main parts: `client` and `server`.

```
/
├── client/         # React frontend application
└── server/         # Node.js + Socket.IO backend
```

---

## Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 1. Server Setup

Navigate to the server directory and install dependencies.

```bash
cd server
npm install
```

### 2. Client Setup

Navigate to the client directory and install dependencies.

```bash
cd client
npm install
```

---

## How to Run the Application

You need to run both the server and the client in separate terminal windows.

### 1. Start the Server

In the `server/` directory:

```bash
# This will start the server in development mode with auto-reloading
npm run dev
```

The server will start on `http://localhost:4000`.

### 2. Start the Client

In the `client/` directory:

```bash
npm start
```

The client application will open in your browser at `http://localhost:3000`.

---

## How to Play

### Multiplayer Mode (Default)

1.  Make sure the server is running.
2.  Open `http://localhost:3000` in multiple browser windows or tabs. Each window will act as a separate player.
3.  Enter a unique name for each player and click "Join Game".
4.  You will enter the lobby. The game will start automatically when at least 2 players have joined.

### Single-Player Mode (Local Fallback)

If you want to test the game flow without running the server, you can enable single-player mode.

1.  In the `client/src/App.tsx` file, find the following line:
    ```typescript
    const IS_SINGLE_PLAYER_MODE = false; // Set to true for single-player
    ```
2.  Change `false` to `true`.
3.  Restart the client application (`npm start`).

In this mode, the client simulates the server's logic, allowing you to play through all the games by yourself. You will play against a few "bot" players.

---

## Assets & Licensing

- **Images**: Most background and character images are placeholders or sourced from royalty-free sites like Pexels. They are used for demonstration purposes.
  - Doll Background: Stylized placeholder.
  - Guard Icons: Simple SVG/PNG placeholders.
- **Sounds**: Sound effects (gunshot, countdown, cheer) are sourced from free sound effect websites. They are included in the `public` directory.
- **Fonts**: Uses Google Fonts (`'Chakra Petch'`, `'Press Start 2P'`) for the thematic feel.

It is recommended to replace placeholder assets with your own licensed or custom-created assets for a production application.

---

## Technical Details

- **Client**:
  - Framework: React 18+ with TypeScript
  - Styling: Tailwind CSS
  - State Management: React Context API
  - Real-time Communication: `socket.io-client`

- **Server**:
  - Runtime: Node.js
  - Framework: Express
  - Real-time Communication: `socket.io`
  - Language: TypeScript (run with `ts-node-dev`)

### Socket.IO Events

- **Client -> Server**:
  - `join`: Player requests to join the game.
  - `submitAnswer`: Player submits an answer.
- **Server -> Client**:
  - `gameStateUpdate`: The primary event that broadcasts the entire current game state to all clients.
  - `notification`: Sends a toast-style notification message to the client.
  - `playSound`: Instructs the client to play a specific sound effect.
