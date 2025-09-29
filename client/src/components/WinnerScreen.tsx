
import React from 'react';
import { useGame } from '../contexts/GameContext.tsx';
import { motion } from 'framer-motion';
import { FaTrophy } from 'react-icons/fa';

const WinnerScreen: React.FC = () => {
  const { gameState } = useGame();
  const { winner } = gameState;

  if (!winner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl">Calculating winner...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-squid-dark p-4 overflow-hidden">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
        className="text-center"
      >
        <FaTrophy className="text-9xl text-yellow-400 mx-auto mb-4" />
        <h1 className="text-6xl font-pixel text-squid-green mb-4">WINNER!</h1>
        <p className="text-5xl font-bold text-squid-light mb-2">{winner.name}</p>
        <p className="text-3xl font-pixel text-squid-pink">SCORE: {winner.score}</p>
      </motion.div>

      {/* Confetti effect */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -10, opacity: 0 }}
          animate={{
            y: '100vh',
            x: `${Math.random() * 100}vw`,
            opacity: 1,
          }}
          transition={{
            duration: Math.random() * 2 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          className="absolute top-0 w-4 h-4 rounded-full"
          style={{
            backgroundColor: ['#FF007A', '#00B8A9', '#F5F5F5'][i % 3],
          }}
        />
      ))}
    </div>
  );
};

export default WinnerScreen;
