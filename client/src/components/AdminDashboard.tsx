// components/AdminDashboard.tsx
import React from 'react';
import { useGame } from '../contexts/GameContext.tsx';
import { motion } from 'framer-motion';



const AdminDashboard: React.FC = () => {
  const { gameState, adminStartGame, adminStartNextGame, adminResetGame } = useGame();

  // Filter out admin from player list
  const nonAdminPlayers = gameState.players.filter(p => !p.isAdmin);
  const { gameName, countdown, adminStats } = gameState;

  const totalPlayers = adminStats?.totalPlayers ?? 0;
  const alivePlayers = adminStats?.alivePlayers ?? 0;
  const eliminatedPlayers = adminStats?.eliminatedPlayers ?? 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black text-squid-light">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-squid-gray p-8 rounded-lg shadow-2xl border-4 border-squid-green"
      >
        <h1 className="text-5xl font-pixel text-squid-pink text-center mb-8">ADMIN DASHBOARD</h1>

        {/* Game State Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-squid-dark p-4 rounded-lg text-center border border-squid-green">
            <p className="text-xl text-gray-400">Current Game</p>
            <p className="text-3xl font-pixel text-squid-light uppercase">{gameName}</p>
          </div>
          <div className="bg-squid-dark p-4 rounded-lg text-center border border-squid-pink">
            <p className="text-xl text-gray-400">Countdown</p>
            <p className="text-3xl font-pixel text-squid-light">{countdown !== undefined ? countdown : 'N/A'}</p>
          </div>
          <div className="bg-squid-dark p-4 rounded-lg text-center border border-squid-green">
            <p className="text-xl text-gray-400">Total Players</p>
            <p className="text-3xl font-pixel text-squid-light">{totalPlayers}</p>
          </div>
        </div>

        {/* Player Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-squid-dark p-4 rounded-lg text-center border border-blue-400">
                <p className="text-xl text-gray-400">Alive Players</p>
                <p className="text-3xl font-pixel text-blue-400">{alivePlayers}</p>
            </div>
            <div className="bg-squid-dark p-4 rounded-lg text-center border border-red-400">
                <p className="text-xl text-gray-400">Eliminated Players</p>
                <p className="text-3xl font-pixel text-red-400">{eliminatedPlayers}</p>
            </div>
        </div>

        {/* Admin Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={adminStartGame}
            className="bg-squid-pink text-squid-dark font-pixel py-3 px-6 rounded-md text-xl hover:bg-opacity-80 transition-colors"
          >
            START GAME (Lobby)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={adminStartNextGame}
            className="bg-squid-green text-squid-dark font-pixel py-3 px-6 rounded-md text-xl hover:bg-opacity-80 transition-colors"
          >
            START NEXT GAME/ROUND
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={adminResetGame}
            className="bg-squid-dark text-squid-pink border border-squid-pink font-pixel py-3 px-6 rounded-md text-xl hover:bg-opacity-80 transition-colors"
          >
            RESET GAME
          </motion.button>
        </div>

        {/* Player List */}
        <h2 className="text-3xl font-pixel text-squid-light mb-4">Players ({nonAdminPlayers.length})</h2>
        <div className="max-h-80 overflow-y-auto bg-squid-dark p-4 rounded-lg border border-squid-green">
          {nonAdminPlayers.length === 0 ? (
            <p className="text-center text-gray-500">No players connected.</p>
          ) : (
            <ul className="space-y-2">
              {nonAdminPlayers.map((p) => (
                <li key={p.id} className="flex justify-between items-center p-2 bg-gray-800 rounded-md">
                  <span className={`text-lg ${p.status === 'out' ? 'line-through text-gray-500' : 'text-squid-light'}`}>
                    {p.name}
                  </span>
                  <span className="font-pixel text-squid-green">Score: {p.score} | HP: {p.hp} | Status: {p.status.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Game Scores Dashboard */}
        <h2 className="text-3xl font-pixel text-squid-light mt-8 mb-4">Game Scores Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScorePanel title="Game 1 Scores" scores={adminStats?.game1Scores ?? []} />
            <ScorePanel title="Game 2 Scores" scores={adminStats?.game2Scores ?? []} />
            <ScorePanel title="Game 3 Scores" scores={adminStats?.game3Scores ?? []} />
        </div>

      </motion.div>
    </div>
  );
};

// Helper component for score panels
const ScorePanel: React.FC<{ title: string; scores: { name: string; score: number }[] }> = ({ title, scores }) => (
    <div className="bg-squid-dark p-4 rounded-lg border border-squid-pink max-h-64 overflow-y-auto">
        <h3 className="text-xl font-pixel text-squid-pink mb-2 text-center">{title}</h3>
        {scores.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">No scores yet.</p>
        ) : (
            <ul className="space-y-1">
                {scores.map((s, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                        <span>{s.name}</span>
                        <span className="font-pixel text-squid-green">{s.score}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default AdminDashboard;