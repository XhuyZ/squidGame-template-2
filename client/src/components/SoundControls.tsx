
import React from 'react';
import { useGame } from '../contexts/GameContext.tsx';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SoundControls: React.FC = () => {
  const { isMuted, toggleMute } = useGame();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      className="fixed bottom-4 right-4 bg-squid-pink text-squid-dark p-3 rounded-full shadow-lg z-50"
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
    >
      {isMuted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
    </motion.button>
  );
};

export default SoundControls;
