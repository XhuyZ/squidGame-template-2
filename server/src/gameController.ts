import { Server } from 'socket.io';
import { GameState, Player, Question, SoundType } from './types';
import { questionsGame1, questionsGame2, questionsGame3 } from './questions';

const MIN_PLAYERS_TO_START = 2;
const LOBBY_COUNTDOWN_SECONDS = 5;
const QUESTION_TIME_SECONDS = 15;
const LEADERBOARD_TIME_SECONDS = 8;
const GAME_ROUNDS = 5;

export class GameController {
    private io: Server;
    private gameState: GameState = {
        gameName: 'lobby',
        players: [],
    };
    // FIX: Use ReturnType<typeof setTimeout> for broader compatibility instead of NodeJS.Timeout.
    private timers: { [key: string]: ReturnType<typeof setTimeout> } = {};

    constructor(io: Server) {
        this.io = io;
    }

    // --- Player Management ---
    public addPlayer(id: string, name: string): void {
        const sanitizedName = name.trim().slice(0, 15);
        if (this.gameState.players.some(p => p.id === id)) return;
        
        const newPlayer: Player = {
            id, name: sanitizedName, hp: 3, score: 0, status: 'alive', answered: false
        };
        this.gameState.players.push(newPlayer);
        this.broadcastGameState();

        if (this.gameState.gameName === 'lobby' && this.gameState.players.length >= MIN_PLAYERS_TO_START && !this.timers.lobby) {
            this.startLobbyCountdown();
        }
    }

    public removePlayer(id: string): void {
        const playerIndex = this.gameState.players.findIndex(p => p.id === id);
        if (playerIndex !== -1) {
            const player = this.gameState.players[playerIndex];
            if (this.gameState.gameName !== 'lobby' && this.gameState.gameName !== 'winner') {
                 player.status = 'out';
            } else {
                this.gameState.players.splice(playerIndex, 1);
            }
            this.checkGameStatus();
            this.broadcastGameState();
        }
    }

    // --- Game Flow ---
    private startLobbyCountdown(): void {
        let count = LOBBY_COUNTDOWN_SECONDS;
        this.gameState.countdown = count;
        this.broadcastGameState();

        this.timers.lobby = setInterval(() => {
            count--;
            this.gameState.countdown = count;
            this.broadcastGameState();
            if (count <= 0) {
                clearInterval(this.timers.lobby);
                delete this.timers.lobby;
                this.startGame1();
            }
        }, 1000);
    }
    
    private startGame1(): void {
        this.clearTimers();
        this.gameState.gameName = 'game1';
        this.gameState.round = -1;
        this.resetPlayersForNewGame(3);
        this.nextQuestion();
    }
    
    private startGame2(): void {
        this.clearTimers();
        this.gameState.gameName = 'game2';
        this.gameState.round = -1;
        this.resetPlayersForNewGame(3);
        
        const alivePlayers = this.gameState.players.filter(p => p.status === 'alive');
        const shuffled = [...alivePlayers].sort(() => 0.5 - Math.random());
        const mid = Math.ceil(shuffled.length / 2);
        const red = shuffled.slice(0, mid);
        const blue = shuffled.slice(mid);
        red.forEach(p => p.team = 'red');
        blue.forEach(p => p.team = 'blue');
        this.gameState.teams = { red, blue };
        this.gameState.tugOfWar = { position: 0 };
        
        this.nextQuestion();
    }
    
    private startGame3(): void {
        this.clearTimers();
        this.gameState.gameName = 'game3';
        this.gameState.round = -1;
        this.resetPlayersForNewGame(5);
        this.nextQuestion();
    }

    private nextQuestion(): void {
        this.clearTimers();
        
        const round = (this.gameState.round ?? -1) + 1;
        if (round >= GAME_ROUNDS || this.gameState.players.filter(p => p.status === 'alive').length <= 1) {
            this.endCurrentGame();
            return;
        }

        this.gameState.round = round;
        this.gameState.players.forEach(p => p.answered = false);
        
        let questions: Question[] = [];
        if (this.gameState.gameName === 'game1') questions = questionsGame1;
        if (this.gameState.gameName === 'game2') questions = questionsGame2;
        if (this.gameState.gameName === 'game3') questions = questionsGame3;

        this.gameState.currentQuestion = questions[round];
        this.broadcastGameState();

        this.timers.question = setTimeout(() => {
            this.handleTimeUp();
        }, QUESTION_TIME_SECONDS * 1000);
    }

    private endCurrentGame(): void {
        this.clearTimers();
        this.calculateScores();
        
        const aliveCount = this.gameState.players.filter(p => p.status === 'alive').length;
        if (aliveCount <= 1) {
            this.endGame();
            return;
        }

        this.gameState.gameName = 'leaderboard';
        this.gameState.currentQuestion = undefined;
        this.broadcastGameState();

        this.timers.leaderboard = setTimeout(() => {
            if (this.gameState.gameName === 'leaderboard') { // after game 1
                 this.startGame2();
            } else { // after game 2
                 this.startGame3();
            }
        }, LEADERBOARD_TIME_SECONDS * 1000);
    }

    private endGame(): void {
        this.clearTimers();
        this.gameState.gameName = 'winner';
        this.gameState.winner = this.gameState.players.find(p => p.status === 'alive');
        if (!this.gameState.winner && this.gameState.players.length > 0) {
            this.gameState.winner = [...this.gameState.players].sort((a,b) => b.score - a.score)[0];
        }
        this.broadcastSound('cheer');
        this.broadcastGameState();
    }


    // --- Answer Handling ---
    public handleAnswer(id: string, answer: string): void {
        const player = this.gameState.players.find(p => p.id === id);
        const question = this.gameState.currentQuestion;
        if (!player || player.status === 'out' || player.answered || !question) return;

        player.answered = true;
        const isCorrect = answer === question.answer;

        if (!isCorrect) {
            player.hp -= 1;
            this.broadcastSound('gunshot');
            if (player.hp <= 0) {
                player.status = 'out';
                this.broadcastSound('eliminated');
            }
        } else {
            this.broadcastSound('correct', id);
        }

        this.checkRoundCompletion();
        this.broadcastGameState();
    }

    private handleTimeUp(): void {
        this.gameState.players.forEach(p => {
            if (p.status === 'alive' && !p.answered) {
                p.hp -= 1;
                if (p.hp <= 0) {
                    p.status = 'out';
                }
            }
        });
        this.broadcastSound('gunshot');
        this.checkRoundCompletion();
        this.broadcastGameState();
    }

    // --- State & Utility ---
    private checkRoundCompletion(): void {
        const alivePlayers = this.gameState.players.filter(p => p.status === 'alive');
        const allAnswered = alivePlayers.every(p => p.answered);

        if (allAnswered) {
             if (this.gameState.gameName === 'game2') {
                this.resolveTugOfWarRound();
            }
            setTimeout(() => this.nextQuestion(), 2000);
        }
    }
    
    private checkGameStatus(): void {
        if(this.gameState.gameName !== 'lobby' && this.gameState.gameName !== 'winner') {
            const aliveCount = this.gameState.players.filter(p => p.status === 'alive').length;
            if (aliveCount <= 1) {
                this.endCurrentGame();
            }
        }
    }

    private resolveTugOfWarRound(): void {
        if (!this.gameState.teams || !this.gameState.tugOfWar) return;

        const redCorrect = this.gameState.teams.red.filter(p => p.answered && questionsGame2[this.gameState.round!].answer === this.gameState.currentQuestion!.answer).length;
        const blueCorrect = this.gameState.teams.blue.filter(p => p.answered && questionsGame2[this.gameState.round!].answer === this.gameState.currentQuestion!.answer).length;
        
        if (redCorrect > blueCorrect) {
            this.gameState.tugOfWar.position -= 1;
            this.gameState.tugOfWar.lastRoundWinner = 'red';
        } else if (blueCorrect > redCorrect) {
            this.gameState.tugOfWar.position += 1;
            this.gameState.tugOfWar.lastRoundWinner = 'blue';
        } else {
            this.gameState.tugOfWar.lastRoundWinner = 'tie';
        }
    }
    
    private calculateScores(): void {
        if (this.gameState.gameName === 'game1') {
            const alivePlayers = this.gameState.players.filter(p => p.status === 'alive');
            alivePlayers.sort((a,b) => b.hp - a.hp);
            if(alivePlayers[0]) alivePlayers[0].score += 15;
            if(alivePlayers[1]) alivePlayers[1].score += 10;
            for(let i = 2; i < alivePlayers.length; i++) {
                alivePlayers[i].score += 5;
            }
        } else if (this.gameState.gameName === 'game2') {
            if((this.gameState.tugOfWar?.position ?? 0) > 0) {
               this.gameState.teams?.blue.forEach(p => { if(p.status === 'alive') p.score += 10; });
               this.io.emit('notification', 'Blue Team wins Tug of War!');
            } else if ((this.gameState.tugOfWar?.position ?? 0) < 0) {
               this.gameState.teams?.red.forEach(p => { if(p.status === 'alive') p.score += 10; });
               this.io.emit('notification', 'Red Team wins Tug of War!');
            } else {
               this.io.emit('notification', 'Tug of War is a draw!');
            }
        }
    }

    private resetPlayersForNewGame(hp: number): void {
        this.gameState.players.forEach(p => {
            if (p.status === 'alive') {
                p.hp = hp;
                p.answered = false;
                p.team = undefined;
            }
        });
    }

    private broadcastGameState(): void {
        this.io.emit('gameStateUpdate', this.gameState);
    }
    
    private broadcastSound(sound: SoundType, to?: string): void {
        if (to) {
            this.io.to(to).emit('playSound', sound);
        } else {
            this.io.emit('playSound', sound);
        }
    }

    private clearTimers(): void {
        Object.values(this.timers).forEach(clearTimeout);
        this.timers = {};
    }
}