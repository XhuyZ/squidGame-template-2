
import React from 'react';
import { useGame } from '../../contexts/GameContext.tsx';
import QuestionCard from '../QuestionCard.tsx';
import PlayerGrid from '../PlayerGrid.tsx';
import GameOverlay from '../GameOverlay.tsx';

const Game1RedLight: React.FC = () => {
  const { gameState, playerId } = useGame();
  const me = gameState.players.find(p => p.id === playerId);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center" 
      style={{backgroundImage: `url('https://picsum.photos/seed/squidgame1/1920/1080')`}}
    >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <GameOverlay 
            gameName="Game 1" 
            title="Red Light, Green Light" 
            countdown={gameState.countdown}
        />
        
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-start justify-center gap-8 px-4">
            <div className="w-full lg:w-2/3">
                {me?.status === 'alive' && gameState.currentQuestion ? (
                    <QuestionCard question={gameState.currentQuestion} />
                ) : (
                    <div className="text-center p-8 bg-squid-gray rounded-lg">
                        <h2 className="text-4xl font-pixel text-squid-pink">
                            {me?.status === 'out' ? "YOU ARE ELIMINATED" : "WAITING FOR NEXT QUESTION"}
                        </h2>
                    </div>
                )}
            </div>
            <div className="w-full lg:w-1/3">
                <PlayerGrid players={gameState.players} />
            </div>
        </div>
    </div>
  );
};

export default Game1RedLight;
