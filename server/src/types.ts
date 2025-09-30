
export interface Player {
    id: string;
    name: string;
    avatar?: string;
    hp: number;
    score: number;
    team?: 'red' | 'blue';
    status: 'alive' | 'out';
    answered: boolean;
    isAdmin?: boolean; // Add this line
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    answer: string;
}

export type GameName = 'lobby' | 'game1' | 'game2' | 'game3' | 'leaderboard' | 'winner';

export interface GameState {
    gameName: GameName;
    players: Player[];
    currentQuestion?: Question;
    round?: number;
    teams?: {
        red: Player[];
        blue: Player[];
    };
    tugOfWar?: {
        position: number;
        lastRoundWinner?: 'red' | 'blue' | 'tie';
    };
    winner?: Player;
    countdown?: number;
    // New admin-specific statistics
    adminStats: {
        totalPlayers: number;
        alivePlayers: number;
        eliminatedPlayers: number;
        game1Scores: { name: string; score: number }[];
        game2Scores: { name: string; score: number }[];
        game3Scores: { name: string; score: number }[];
    };
}

export type SoundType = 'gunshot' | 'countdown' | 'cheer' | 'eliminated' | 'correct';
