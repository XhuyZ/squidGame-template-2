
import React from 'react';
import { useGame } from '../../contexts/GameContext.tsx';
import QuestionCard from '../QuestionCard.tsx';
import { motion } from 'framer-motion';
import { FaUserFriends } from 'react-icons/fa';
import GameOverlay from '../GameOverlay.tsx';

const TeamPanel: React.FC<{ team: 'red' | 'blue', players: any[], title: string }> = ({ team, players, title }) => (
    <div className={`w-full p-4 rounded-lg border-4 ${team === 'red' ? 'border-red-500 bg-red-900 bg-opacity-50' : 'border-blue-500 bg-blue-900 bg-opacity-50'}`}>
        <h3 className={`text-3xl font-pixel text-center mb-4 ${team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>{title}</h3>
        <div className="grid grid-cols-2 gap-2">
            {players.map(p => (
                <div key={p.id} className={`p-2 rounded ${p.status === 'out' ? 'bg-gray-700 opacity-50' : 'bg-squid-gray'}`}>
                    <p className="font-bold truncate">{p.name}</p>
                    <p className="text-sm">{p.status === 'alive' ? `HP: ${p.hp}` : 'ELIMINATED'}</p>
                </div>
            ))}
        </div>
    </div>
);

const Game2TugOfWar: React.FC = () => {
    const { gameState, playerId } = useGame();
    const me = gameState.players.find(p => p.id === playerId);
    const { teams, tugOfWar } = gameState;

    if (!teams || !tugOfWar) return <div>Loading Tug of War...</div>;

    const ropePosition = tugOfWar.position * 10; // position from -5 to 5, mapping to -50% to 50%

    return (
        <div 
          className="min-h-screen flex flex-col items-center justify-between p-4 bg-cover bg-center"
          style={{backgroundImage: `url('https://picsum.photos/seed/squidgame2/1920/1080')`}}
        >
            <div className="absolute inset-0 bg-black bg-opacity-80"></div>
            <GameOverlay 
                gameName="Game 2" 
                title="Tug of War"
                countdown={gameState.countdown}
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto flex-grow flex flex-col justify-center">
                {/* Teams Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <TeamPanel team="red" players={teams.red} title="Red Team" />
                    <TeamPanel team="blue" players={teams.blue} title="Blue Team" />
                </div>

                {/* Rope Visual */}
                <div className="w-full h-12 bg-squid-gray rounded-full my-4 flex items-center justify-center relative overflow-hidden">
                    <div className="w-full h-2 bg-yellow-900 absolute"></div>
                    <motion.div 
                        animate={{ x: `${ropePosition}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center"
                    >
                        <FaUserFriends className="text-4xl text-black" />
                    </motion.div>
                </div>

                {/* Question Card */}
                <div className="mt-8">
                    {me?.status === 'alive' && gameState.currentQuestion ? (
                        <QuestionCard question={gameState.currentQuestion} />
                    ) : (
                        <div className="text-center p-8 bg-squid-gray rounded-lg">
                            <h2 className="text-4xl font-pixel text-squid-pink">
                                {me?.status === 'out' ? "YOU ARE ELIMINATED" : "WAITING FOR NEXT ROUND"}
                            </h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Game2TugOfWar;
