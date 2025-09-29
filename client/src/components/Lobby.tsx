
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa';

const Lobby: React.FC = () => {
  const { gameState } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-squid-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl text-center"
      >
        <h1 className="text-6xl font-pixel text-squid-pink mb-4">LOBBY</h1>
        <p className="text-2xl text-squid-green mb-8">WAITING FOR PLAYERS...</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {gameState.players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-squid-gray p-4 rounded-lg flex flex-col items-center justify-center border-2 border-squid-green"
              >
                <FaUserCircle className="text-4xl text-squid-light mb-2" />
                <p className="text-lg font-bold truncate">{player.name}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {gameState.countdown !== undefined && (
          <div className="mt-12">
            <h2 className="text-4xl font-pixel text-squid-light">GAME STARTING IN</h2>
            <p className="text-9xl font-pixel text-squid-pink mt-4">{gameState.countdown}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Lobby;
