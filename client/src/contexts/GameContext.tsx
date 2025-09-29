
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import type { GameState, GameContextType, SoundType } from '../types';
import { createMockServer, MockServer } from '../services/mockServer';

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const playSound = (sound: SoundType) => {
  try {
    const audio = document.getElementById(`sound-${sound}`) as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  } catch (error) {
    console.error(`Error playing sound: ${sound}`, error);
  }
};

const initialState: GameState = {
  gameName: 'lobby',
  players: [],
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

  useEffect(() => {
    let newSocket: Socket | MockServer;
    if (isSinglePlayer) {
      newSocket = createMockServer(setGameState, playSound);
    } else {
      const socketIo = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:4000');
      newSocket = socketIo;
      
      socketIo.on('connect', () => {
        setPlayerId(socketIo.id);
      });
    }

    newSocket.on('gameStateUpdate', (newState: GameState) => {
      setGameState(newState);
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

  const joinGame = useCallback((name: string) => {
    socket?.emit('join', { name });
  }, [socket]);

  const submitAnswer = useCallback((answer: string) => {
    socket?.emit('submitAnswer', { answer });
  }, [socket]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <GameContext.Provider value={{ gameState, playerId, joinGame, submitAnswer, isMuted, toggleMute }}>
      {children}
    </GameContext.Provider>
  );
};
