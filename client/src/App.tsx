
import React from 'react';
import { GameProvider } from './contexts/GameContext.tsx';
import GameManager from './components/GameManager.tsx';
import SoundControls from './components/SoundControls.tsx';
import { Toaster } from 'react-hot-toast';

// Set to true for single-player mode which simulates the server locally
const IS_SINGLE_PLAYER_MODE = false;

function App() {
  return (
    <GameProvider isSinglePlayer={IS_SINGLE_PLAYER_MODE}>
      <div className="bg-squid-dark min-h-screen font-display text-squid-light relative overflow-hidden">
        <GameManager />
        <SoundControls />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </div>
    </GameProvider>
  );
}

export default App;
