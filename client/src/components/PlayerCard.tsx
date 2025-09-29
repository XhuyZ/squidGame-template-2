
import React, { useEffect, useState } from 'react';
import type { Player } from '../types';
import { motion } from 'framer-motion';
import { FaHeart, FaHeartBroken, FaQuestion } from 'react-icons/fa';
import { useGame } from '../contexts/GameContext';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const { playerId } = useGame();
  const [hit, setHit] = useState(false);
  const isMe = player.id === playerId;

  useEffect(() => {
    setHit(true);
    const timer = setTimeout(() => setHit(false), 500); // Animation duration
    return () => clearTimeout(timer);
  }, [player.hp]);

  const animation = hit ? {
    scale: [1, 1.1, 1],
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.5 },
    boxShadow: '0 0 20px #FF007A',
  } : {};

  return (
    <motion.div
      animate={animation}
      className={`p-3 rounded-lg flex items-center justify-between transition-all duration-300
        ${isMe ? 'border-2 border-squid-green' : 'border border-squid-gray'}
        ${player.status === 'out' ? 'bg-red-900 bg-opacity-40' : 'bg-squid-gray'}
      `}
    >
      <div className="flex-1 overflow-hidden">
        <p className={`font-bold truncate ${player.status === 'out' ? 'line-through text-gray-400' : 'text-squid-light'}`}>
          {player.name} {isMe && '(You)'}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {player.status === 'alive' ? (
            Array.from({ length: player.hp }).map((_, i) => <FaHeart key={i} className="text-squid-pink" />)
          ) : (
            <FaHeartBroken className="text-gray-500" />
          )}
        </div>
      </div>
      {player.status === 'alive' && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
          ${player.answered ? 'bg-squid-green' : 'bg-gray-500'}
        `}>
          {!player.answered && <FaQuestion className="text-squid-dark" />}
        </div>
      )}
    </motion.div>
  );
};

export default PlayerCard;
