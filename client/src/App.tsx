

import React from 'react';
import { GameProvider } from './contexts/GameContext.tsx';
import GameManager from './components/GameManager.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
// import SoundControls from './components/SoundControls.tsx';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Set to true for single-player mode which simulates the server locally
const IS_SINGLE_PLAYER_MODE = false;

function App() {
  return (
    <GameProvider isSinglePlayer={IS_SINGLE_PLAYER_MODE}>
      <BrowserRouter>
        <div className="bg-squid-dark min-h-screen font-display text-squid-light relative overflow-hidden">
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/*" element={<GameManager />} />
          </Routes>
          {/* <SoundControls /> */}
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
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
