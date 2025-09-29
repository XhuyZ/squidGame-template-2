
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOverlayProps {
  gameName: string;
  title: string;
  countdown?: number;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ gameName, title, countdown }) => {
  return (
    <>
      <div className="relative z-10 text-center mb-8">
        <p className="text-2xl font-pixel text-squid-green">{gameName}</p>
        <h1 className="text-6xl font-pixel text-squid-pink">{title}</h1>
      </div>
      <AnimatePresence>
        {countdown !== undefined && countdown > 0 && (
          <motion.div
            key="countdown"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <h2 className="text-4xl font-pixel text-squid-light mb-4">GET READY</h2>
              <p className="text-9xl font-pixel text-squid-pink">{countdown}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameOverlay;
