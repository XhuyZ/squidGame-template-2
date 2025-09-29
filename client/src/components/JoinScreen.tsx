
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { motion } from 'framer-motion';
import { GiOctopus } from 'react-icons/gi';

const JoinScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { joinGame } = useGame();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      joinGame(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-squid-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-squid-gray p-8 rounded-lg shadow-2xl border-2 border-squid-pink"
      >
        <div className="text-center mb-8">
          <GiOctopus className="text-6xl text-squid-pink mx-auto mb-4" />
          <h1 className="text-4xl font-bold font-pixel text-squid-light">SQUID GAME</h1>
          <p className="text-squid-green mt-2">ARE YOU READY TO PLAY?</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ENTER YOUR NAME"
            className="w-full bg-squid-dark border-2 border-squid-green p-4 rounded-md text-center text-xl font-pixel text-squid-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-squid-pink focus:border-transparent"
            maxLength={15}
            aria-label="Enter your name"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!name.trim()}
            className="w-full mt-6 bg-squid-pink text-squid-dark font-bold py-4 rounded-md text-2xl font-pixel hover:bg-opacity-80 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            JOIN GAME
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinScreen;
