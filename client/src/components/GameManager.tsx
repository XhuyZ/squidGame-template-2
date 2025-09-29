
import React from 'react';
import { useGame } from '../contexts/GameContext';
import JoinScreen from './JoinScreen';
import Lobby from './Lobby';
import Game1RedLight from './games/Game1RedLight';
import Game2TugOfWar from './games/Game2TugOfWar';
import Game3Solo from './games/Game3Solo';
import Leaderboard from './Leaderboard';
import WinnerScreen from './WinnerScreen';

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
