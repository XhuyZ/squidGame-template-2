
import React from 'react';
import type { Player } from '../types';
import PlayerCard from './PlayerCard.tsx';

interface PlayerGridProps {
    players: Player[];
}

const PlayerGrid: React.FC<PlayerGridProps> = ({ players }) => {
    return (
        <div className="bg-squid-gray bg-opacity-80 p-4 rounded-lg">
            <h3 className="text-2xl font-bold text-center mb-4 font-pixel text-squid-pink">PLAYERS</h3>
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {players.map(player => (
                    <PlayerCard key={player.id} player={player} />
                ))}
            </div>
        </div>
    );
};

export default PlayerGrid;
