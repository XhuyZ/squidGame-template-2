import { GameState, SoundType, Player } from '../types';
import { questionsGame1, questionsGame2, questionsGame3 } from '../data/questions.ts';

// This is a client-side simulation of the server for single-player mode.
// It mimics the socket.io interface.

export interface MockServer {
  on: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, data: any) => void;
  disconnect: () => void;
}

export const createMockServer = (
    onStateUpdate: (state: GameState) => void,
    onPlaySound: (sound: SoundType) => void
): MockServer => {
    let gameState: GameState = {
        gameName: 'lobby',
        players: [],
    };
    let player: Player | null = null;
    // FIX: Use ReturnType<typeof setTimeout> for broader compatibility instead of NodeJS.Timeout.
    let questionTimeout: ReturnType<typeof setTimeout> | null = null;

    const emitStateUpdate = () => {
        onStateUpdate(JSON.parse(JSON.stringify(gameState)));
    };
    
    const listeners: { [key: string]: ((...args: any[]) => void)[] } = {};

    const server: MockServer = {
        on: (event, callback) => {
            if (!listeners[event]) {
                listeners[event] = [];
            }
            listeners[event].push(callback);
        },
        emit: (event, data) => {
            handleClientEvent(event, data);
        },
        disconnect: () => {
            if (questionTimeout) clearTimeout(questionTimeout);
        },
    };

    const addBots = () => {
        const botNames = ['Bot Alice', 'Bot Bob', 'Bot Charlie'];
        botNames.forEach((name, index) => {
            gameState.players.push({
                id: `bot-${index}`,
                name,
                hp: 3,
                score: 0,
                status: 'alive',
                answered: false,
            });
        });
    }

    const resetPlayersForNewGame = (hp: number) => {
        gameState.players.forEach(p => {
            if (p.status === 'alive') {
                p.hp = hp;
                p.answered = false;
            }
        });
    }

    const startNextQuestion = () => {
        if (questionTimeout) clearTimeout(questionTimeout);
        
        let questions: any[] = [];
        if (gameState.gameName === 'game1') questions = questionsGame1;
        if (gameState.gameName === 'game2') questions = questionsGame2;
        if (gameState.gameName === 'game3') questions = questionsGame3;

        const round = (gameState.round ?? -1) + 1;
        if (round >= 5) { // Each game has 5 questions/rounds
            endCurrentGame();
            return;
        }

        gameState.round = round;
        gameState.currentQuestion = questions[round];
        gameState.players.forEach(p => p.answered = false);
        emitStateUpdate();

        questionTimeout = setTimeout(() => {
            handleTimeUp();
            startNextQuestion();
        }, 15000); // 15 second timer per question
    }

    const endCurrentGame = () => {
        if(questionTimeout) clearTimeout(questionTimeout);
        
        // Award points
        if(gameState.gameName === 'game1') {
            const alivePlayers = gameState.players.filter(p => p.status === 'alive');
            alivePlayers.sort((a,b) => b.hp - a.hp);
            if(alivePlayers[0]) alivePlayers[0].score += 15;
            if(alivePlayers[1]) alivePlayers[1].score += 10;
            for(let i = 2; i < alivePlayers.length; i++) {
                alivePlayers[i].score += 5;
            }
        } else if (gameState.gameName === 'game2') {
             if((gameState.tugOfWar?.position ?? 0) > 0) { // blue won
                gameState.teams?.blue.forEach(p => { if(p.status === 'alive') p.score += 10; });
             } else if ((gameState.tugOfWar?.position ?? 0) < 0) { // red won
                gameState.teams?.red.forEach(p => { if(p.status === 'alive') p.score += 10; });
             }
        }
        
        gameState.gameName = 'leaderboard';
        gameState.currentQuestion = undefined;
        gameState.round = undefined;
        emitStateUpdate();

        setTimeout(() => {
            startNextGame();
        }, 5000);
    }

    const startNextGame = () => {
        if (gameState.players.filter(p => p.status === 'alive').length <= 1) {
            gameState.gameName = 'winner';
            gameState.winner = gameState.players.find(p => p.status === 'alive');
            onPlaySound('cheer');
            emitStateUpdate();
            return;
        }

        let nextGameState: GameState['gameName'] = 'game2';
        if(gameState.gameName === 'leaderboard') { // after game 1
            nextGameState = 'game2';
        } else if(gameState.gameName === 'game2') { // logic after leaderboard of game 2
            nextGameState = 'game3';
        }

        if(nextGameState === 'game2'){
            gameState.gameName = 'game2';
            resetPlayersForNewGame(3);
            // Create teams
            const alivePlayers = gameState.players.filter(p => p.status === 'alive');
            const shuffled = [...alivePlayers].sort(() => 0.5 - Math.random());
            const mid = Math.ceil(shuffled.length / 2);
            const red = shuffled.slice(0, mid);
            const blue = shuffled.slice(mid);
            red.forEach(p => p.team = 'red');
            blue.forEach(p => p.team = 'blue');
            gameState.teams = { red, blue };
            gameState.tugOfWar = { position: 0 };
            startNextQuestion();
        } else if (nextGameState === 'game3'){
            gameState.gameName = 'game3';
            resetPlayersForNewGame(5);
            startNextQuestion();
        }

    }

    const handleAnswer = (playerId: string, answer: string) => {
        const p = gameState.players.find(p => p.id === playerId);
        const q = gameState.currentQuestion;
        if (!p || p.status === 'out' || p.answered || !q) return;

        p.answered = true;
        const isCorrect = answer === q.answer;

        if (isCorrect) {
            onPlaySound('correct');
        } else {
            p.hp -= 1;
            onPlaySound('gunshot');
            if (p.hp <= 0) {
                p.status = 'out';
                onPlaySound('eliminated');
            }
        }
        
        emitStateUpdate();
        
        // In Tug of War, we wait for all answers
        if(gameState.gameName !== 'game2') {
             if (gameState.players.filter(p => p.status === 'alive' && !p.answered).length === 0) {
                setTimeout(() => startNextQuestion(), 2000);
             }
        }
    }

    const handleTimeUp = () => {
        gameState.players.forEach(p => {
            if (p.status === 'alive' && !p.answered) {
                p.hp -= 1;
                if(p.id === player?.id) onPlaySound('gunshot');
                if (p.hp <= 0) {
                    p.status = 'out';
                    if(p.id === player?.id) onPlaySound('eliminated');
                }
            }
        });
        emitStateUpdate();
    }
    
    const handleClientEvent = (event: string, data: any) => {
        if (event === 'join') {
            player = { id: 'player1', name: data.name, hp: 3, score: 0, status: 'alive', answered: false };
            gameState.players.push(player);
            addBots();
            emitStateUpdate();
            setTimeout(() => {
                gameState.gameName = 'game1';
                startNextQuestion();
            }, 3000);
        } else if (event === 'submitAnswer') {
            if(player) handleAnswer(player.id, data.answer);

            // Simulate bot answers
            gameState.players.forEach(p => {
                if(p.id.startsWith('bot-') && p.status === 'alive' && !p.answered){
                    const isCorrect = Math.random() > 0.4; // Bots have a 60% chance of being correct
                    handleAnswer(p.id, isCorrect ? gameState.currentQuestion!.answer : 'wrong');
                }
            })
        }
    };
    
    // Simulate game state updates for listeners
    const originalUpdate = onStateUpdate;
    onStateUpdate = (newState) => {
        originalUpdate(newState);
        if (listeners['gameStateUpdate']) {
            listeners['gameStateUpdate'].forEach(cb => cb(newState));
        }
    }
    
    const originalPlaySound = onPlaySound;
    onPlaySound = (sound) => {
        originalPlaySound(sound);
         if (listeners['playSound']) {
            listeners['playSound'].forEach(cb => cb(sound));
        }
    }


    return server;
};