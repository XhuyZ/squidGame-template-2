
import React from 'react';
import { useGame } from '../contexts/GameContext.tsx';
import JoinScreen from './JoinScreen.tsx';
import Lobby from './Lobby.tsx';
import Game1RedLight from './games/Game1RedLight.tsx';
import Game2TugOfWar from './games/Game2TugOfWar.tsx';
import Game3Solo from './games/Game3Solo.tsx';
import Leaderboard from './Leaderboard.tsx';
import WinnerScreen from './WinnerScreen.tsx';

const GameManager: React.FC = () => {
  const { gameState, playerId } = useGame();
  const player = gameState.players.find(p => p.id === playerId);

  if (!player) {
    return <JoinScreen />;
  }

  switch (gameState.gameName) {
    case 'lobby':
      return <Lobby />;
    case 'game1':
      return <Game1RedLight />;
    case 'game2':
      return <Game2TugOfWar />;
    case 'game3':
      return <Game3Solo />;
    case 'leaderboard':
      return <Leaderboard />;
    case 'winner':
      return <WinnerScreen />;
    default:
      return <div>Waiting for game...</div>;
  }
};

export default GameManager;
