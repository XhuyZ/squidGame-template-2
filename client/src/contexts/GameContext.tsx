// contexts/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import type { GameState, GameContextType, SoundType } from '../types';
import { createMockServer, MockServer } from '../services/mockServer.ts';

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const playSound = (sound: SoundType) => {
  const audio = document.getElementById(`sound-${sound}`) as HTMLAudioElement | null;

  if (!audio) {
    console.warn(`Audio element not found: sound-${sound}`);
    return;
  }

  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.currentTime = 0;

  clone.play().catch(err => {
    console.warn(`Autoplay blocked or play interrupted for: ${sound}`, err);
  });
};


const initialState: GameState = {
  gameName: 'lobby',
  players: [],
  // Add a placeholder for admin statistics
  adminStats: {
    totalPlayers: 0,
    alivePlayers: 0,
    eliminatedPlayers: 0,
    game1Scores: [],
    game2Scores: [],
    game3Scores: [],
  }
};

interface GameProviderProps {
  children: ReactNode;
  isSinglePlayer?: boolean;
}

export const GameProvider = ({ children, isSinglePlayer = false }: GameProviderProps) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [socket, setSocket] = useState<Socket | MockServer | null>(null);

  // Derived value: non-admin players
  const nonAdminPlayers = gameState.players.filter(p => !p.isAdmin);

  useEffect(() => {
    let newSocket: Socket | MockServer;
    if (isSinglePlayer) {
      newSocket = createMockServer(setGameState, playSound);
    } else {
      const socketIo = io(process.env.REACT_APP_SERVER_URL || 'https://mln.xhuyz.me:4000');
      newSocket = socketIo;
      
      socketIo.on('connect', () => {
        setPlayerId(socketIo.id);
      });
    }

    newSocket.on('gameStateUpdate', (newState: GameState) => {
      setGameState(newState);
    });

    // New event for admin-specific data
    newSocket.on('adminStatsUpdate', (stats: typeof initialState.adminStats) => {
      setGameState(prevState => ({
        ...prevState,
        adminStats: stats
      }));
    });

    newSocket.on('notification', (message: string) => {
      toast(message);
    });
    
    newSocket.on('playSound', (sound: SoundType) => {
      if (!isMuted) {
        playSound(sound);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isSinglePlayer, isMuted]);

  // Modified joinGame to accept isAdmin
  const joinGame = useCallback((name: string, isAdmin?: boolean) => {
    socket?.emit('join', { name, isAdmin: !!isAdmin });
  }, [socket]);

  const submitAnswer = useCallback((answer: string) => {
    socket?.emit('submitAnswer', { answer });
  }, [socket]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);


  // Admin actions
  const adminStartGame = useCallback(() => {
    socket?.emit('admin:startGame', {});
  }, [socket]);

  const adminStartNextGame = useCallback(() => {
    socket?.emit('admin:startNextGame', {});
  }, [socket]);

  const adminResetGame = useCallback(() => {
    socket?.emit('admin:resetGame', {});
  }, [socket]);

  // You might need more admin controls, like ending a game,
  // or forcing a player status. Add them here as needed.

  return (
    <GameContext.Provider value={{ 
      gameState, 
      playerId, 
      joinGame, 
      submitAnswer, 
      isMuted, 
      toggleMute,
      adminStartGame, // Provide admin actions
      adminStartNextGame,
      adminResetGame,
      nonAdminPlayers, // Add non-admin players for consumers
    }}>
      {children}
    </GameContext.Provider>
  );
};
