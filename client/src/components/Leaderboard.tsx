
import React from 'react';
import { useGame } from '../contexts/GameContext.tsx';
import { motion } from 'framer-motion';
import { FaTrophy } from 'react-icons/fa';

const Leaderboard: React.FC = () => {
    const { nonAdminPlayers, gameState } = useGame();
    const sortedPlayers = [...nonAdminPlayers].sort((a, b) => b.score - a.score);

    const getTrophyColor = (index: number) => {
        if (index === 0) return 'text-yellow-400';
        if (index === 1) return 'text-gray-400';
        if (index === 2) return 'text-yellow-600';
        return 'text-transparent';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-squid-dark p-4">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-squid-gray p-8 rounded-lg shadow-2xl border-2 border-squid-green"
            >
                <h1 className="text-5xl font-pixel text-squid-pink text-center mb-8">LEADERBOARD</h1>
                {typeof gameState.countdown === 'number' && (
                  <div className="flex flex-col items-center mb-8">
                    <span className="text-2xl text-squid-green font-pixel mb-2">Next game in</span>
                    <span className="text-7xl font-pixel text-squid-pink animate-pulse">{gameState.countdown}</span>
                  </div>
                )}
                <div className="space-y-4">
                    {sortedPlayers.map((player, index) => (
                        <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center justify-between p-4 rounded-lg ${player.status === 'out' ? 'bg-red-900 bg-opacity-50' : 'bg-squid-dark'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold w-8">{index + 1}</span>
                                <FaTrophy className={`text-3xl ${getTrophyColor(index)}`} />
                                <div>
                                    <p className={`text-xl font-bold ${player.status === 'out' ? 'line-through' : ''}`}>
                                        {player.name}
                                    </p>
                                    <p className="text-sm text-gray-400">{player.status === 'out' ? 'ELIMINATED' : 'ALIVE'}</p>
                                </div>
                            </div>
                            <span className="text-3xl font-pixel text-squid-green">{player.score}</span>
                        </motion.div>
                    ))}
                </div>
                <p className="text-center mt-8 text-xl text-squid-light animate-pulse">Next game starting soon...</p>
            </motion.div>
        </div>
    );
};

export default Leaderboard;
