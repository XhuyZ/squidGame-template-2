
import React from 'react';
import { useGame } from '../../contexts/GameContext';
import QuestionCard from '../QuestionCard';
import { motion } from 'framer-motion';
import { FaUserSecret } from 'react-icons/fa';
import GameOverlay from '../GameOverlay';

const Game3Solo: React.FC = () => {
    const { gameState, playerId } = useGame();
    const me = gameState.players.find(p => p.id === playerId);
    const alivePlayers = gameState.players.filter(p => p.status === 'alive');

    const radius = 150; // Radius of the circle

    return (
        <div 
          className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
          style={{backgroundImage: `url('https://picsum.photos/seed/squidgame3/1920/1080')`}}
        >
            <div className="absolute inset-0 bg-black bg-opacity-80"></div>
            <GameOverlay 
                gameName="Final Game" 
                title="Last One Standing"
                countdown={gameState.countdown}
            />

            <div className="relative z-10 w-full flex flex-col items-center justify-center gap-8">
                {/* Player Circle */}
                <div className="relative w-96 h-96 my-8">
                    <div className="absolute inset-0 border-4 border-dashed border-squid-pink rounded-full"></div>
                    {alivePlayers.map((player, index) => {
                        const angle = (index / alivePlayers.length) * 2 * Math.PI;
                        const x = radius * Math.cos(angle);
                        const y = radius * Math.sin(angle);

                        return (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0 }}
                                animate={{ 
                                    opacity: 1, 
                                    x: `calc(50% - 2rem + ${x}px)`, 
                                    y: `calc(50% - 2rem + ${y}px)`
                                }}
                                transition={{ type: 'spring' }}
                                className="absolute w-16 h-16"
                            >
                                <div className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center ${player.id === playerId ? 'bg-squid-green' : 'bg-squid-gray'}`}>
                                    <FaUserSecret className="text-2xl" />
                                    <p className="text-xs font-bold truncate">{player.name}</p>
                                    <p className="text-xs">HP: {player.hp}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Question */}
                <div className="w-full max-w-3xl">
                    {me?.status === 'alive' && gameState.currentQuestion ? (
                        <QuestionCard question={gameState.currentQuestion} />
                    ) : (
                        <div className="text-center p-8 bg-squid-gray rounded-lg">
                            <h2 className="text-4xl font-pixel text-squid-pink">
                                {me?.status === 'out' ? "YOU HAVE BEEN ELIMINATED" : "SURVIVE!"}
                            </h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Game3Solo;
