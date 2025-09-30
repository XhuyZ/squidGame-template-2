// ...existing code...
// server/gameController.ts
import { Server } from "socket.io";
import { GameState, Player, Question, SoundType } from "./types";
import { questionsGame1, questionsGame2, questionsGame3 } from "./questions";

const MIN_PLAYERS_TO_START = 2;
const LOBBY_COUNTDOWN_SECONDS = 5;
const QUESTION_TIME_SECONDS = 15;
const LEADERBOARD_TIME_SECONDS = 8;
const GAME_ROUNDS = 10;

export class GameController {
  private io: Server;
  private gameState: GameState = {
    gameName: "lobby",
    players: [],
    adminStats: {
      // Initialize adminStats
      totalPlayers: 0,
      alivePlayers: 0,
      eliminatedPlayers: 0,
      game1Scores: [],
      game2Scores: [],
      game3Scores: [],
    },
  };
  private timers: { [key: string]: ReturnType<typeof setTimeout> } = {};

  constructor(io: Server) {
    this.io = io;
  }

  // --- Player Management ---
  public addPlayer(id: string, name: string, isAdmin: boolean): void {
    if (isAdmin) {
      // Do not add admin to the players array
      this.updateAdminStats();
      this.broadcastGameState();
      return;
    }
    const sanitizedName = name.trim().slice(0, 15);
    if (this.gameState.players.some((p) => p.id === id)) return;
    const newPlayer: Player = {
      id,
      name: sanitizedName,
      hp: 3,
      score: 0,
      status: "alive",
      answered: false,
    };
    this.gameState.players.push(newPlayer);
    this.updateAdminStats();
    this.broadcastGameState();
  }

  public removePlayer(id: string): void {
    const playerIndex = this.gameState.players.findIndex((p) => p.id === id);
    if (playerIndex !== -1) {
      const player = this.gameState.players[playerIndex];
      if (
        this.gameState.gameName !== "lobby" &&
        this.gameState.gameName !== "winner"
      ) {
        player.status = "out";
      } else {
        this.gameState.players.splice(playerIndex, 1);
      }
      this.checkGameStatus();
      this.updateAdminStats(); // Update stats
      this.broadcastGameState();
    }
  }

  // --- Admin Actions ---
  public adminStartGame(): void {
    if (this.gameState.gameName === "lobby") {
      this.clearTimers();
      this.startGameCountdown(() => this.startGame1());
    } else {
      this.io.emit("notification", "Game already in progress or not in lobby.");
    }
  }

  public adminStartNextGame(): void {
    this.clearTimers();
    if (this.gameState.gameName === "game1") {
      this.startGameCountdown(() => this.startGame2());
    } else if (this.gameState.gameName === "game2") {
      this.startGameCountdown(() => this.startGame3());
    } else if (this.gameState.gameName === "game3") {
      if (this.gameState.round! < GAME_ROUNDS - 1) {
        this.nextQuestion();
      } else {
        this.endCurrentGame();
      }
    } else if (this.gameState.gameName === "leaderboard") {
      if (this.lastFinishedGame === "game1") {
        this.startGameCountdown(() => this.startGame2());
      } else if (this.lastFinishedGame === "game2") {
        this.startGameCountdown(() => this.startGame3());
      } else if (this.lastFinishedGame === "game3") {
        this.endGame();
      }
    } else if (this.gameState.gameName === "lobby") {
      this.startGameCountdown(() => this.startGame1());
    }
  }
  // Countdown before starting a game (10 seconds)
  private startGameCountdown(callback: () => void): void {
    const COUNTDOWN_SECONDS = 10;
    let count = COUNTDOWN_SECONDS;
    this.gameState.countdown = count;
    this.broadcastGameState();
    this.timers.gameCountdown = setInterval(() => {
      count--;
      this.gameState.countdown = count;
      this.broadcastGameState();
      if (count <= 0) {
        clearInterval(this.timers.gameCountdown);
        delete this.timers.gameCountdown;
        this.gameState.countdown = undefined;
        this.broadcastGameState();
        callback();
      }
    }, 1000);
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
    this.gameState.gameName = "game1";
    this.gameState.round = -1;
    this.resetPlayersForNewGame(3);
    // Clear previous scores for the dashboard
    this.gameState.adminStats.game1Scores = [];
    this.nextQuestion();
    this.io.emit("notification", "Game 1: Red Light, Green Light begins!");
  }

  private startGame2(): void {
    this.clearTimers();
    this.gameState.gameName = "game2";
    this.gameState.round = -1;
    this.resetPlayersForNewGame(3);

    const alivePlayers = this.gameState.players.filter(
      (p) => p.status === "alive",
    );
    const shuffled = [...alivePlayers].sort(() => 0.5 - Math.random());
    const mid = Math.ceil(shuffled.length / 2);
    const red = shuffled.slice(0, mid);
    const blue = shuffled.slice(mid);
    red.forEach((p) => (p.team = "red"));
    blue.forEach((p) => (p.team = "blue"));
    this.gameState.teams = { red, blue };
    this.gameState.tugOfWar = { position: 0 };

    // Clear previous scores for the dashboard
    this.gameState.adminStats.game2Scores = [];
    this.nextQuestion();
    this.io.emit("notification", "Game 2: Tug of War begins!");
  }

  private startGame3(): void {
    this.clearTimers();
    this.gameState.gameName = "game3";
    this.gameState.round = -1;
    this.resetPlayersForNewGame(5);
    // Clear previous scores for the dashboard
    this.gameState.adminStats.game3Scores = [];
    this.nextQuestion();
    this.io.emit("notification", "Final Game: Last One Standing begins!");
  }

  private nextQuestion(): void {
    this.clearTimers();

    const round = (this.gameState.round ?? -1) + 1;

    // Exclude admins from active game play
    const activePlayers = this.gameState.players.filter(
      (p) => p.status === "alive" && !p.isAdmin,
    );

    if (round >= GAME_ROUNDS || activePlayers.length <= 1) {
      this.endCurrentGame();
      return;
    }

    this.gameState.round = round;
    this.gameState.players.forEach((p) => (p.answered = false)); // Reset answered status for all players

    let questions: Question[] = [];
    if (this.gameState.gameName === "game1") questions = questionsGame1;
    if (this.gameState.gameName === "game2") questions = questionsGame2;
    if (this.gameState.gameName === "game3") questions = questionsGame3;

    this.gameState.currentQuestion = questions[round];
    this.broadcastGameState();

    this.timers.question = setTimeout(() => {
      this.handleTimeUp();
    }, QUESTION_TIME_SECONDS * 1000);
  }

  private endCurrentGame(): void {
    this.clearTimers();
    this.calculateScores();

    const aliveCount = this.gameState.players.filter(
      (p) => p.status === "alive" && !p.isAdmin,
    ).length;
    if (aliveCount <= 1) {
      this.endGame();
      return;
    }

    // Track which game just finished for correct next step
    this.lastFinishedGame = this.gameState.gameName;
    this.gameState.gameName = "leaderboard";
    this.gameState.currentQuestion = undefined;
    this.broadcastGameState();
    // Wait for admin to start next game
  }
  // Track which game just finished for next game logic
  private lastFinishedGame?: string;

  private endGame(): void {
    this.clearTimers();
    this.gameState.gameName = "winner";
    // Determine winner from non-admin alive players
    const potentialWinners = this.gameState.players.filter(
      (p) => p.status === "alive" && !p.isAdmin,
    );
    if (potentialWinners.length > 0) {
      this.gameState.winner = [...potentialWinners].sort(
        (a, b) => b.score - a.score,
      )[0];
    } else if (this.gameState.players.length > 0) {
      // If no alive non-admins, pick highest score from all non-admins
      this.gameState.winner = [
        ...this.gameState.players.filter((p) => !p.isAdmin),
      ].sort((a, b) => b.score - a.score)[0];
    }
    this.broadcastSound("cheer");
    this.broadcastGameState();
    this.io.emit(
      "notification",
      `${this.gameState.winner?.name || "No one"} wins the Squid Game!`,
    );
  }

  // --- Answer Handling ---
  public handleAnswer(id: string, answer: string): void {
    const player = this.gameState.players.find((p) => p.id === id);
    const question = this.gameState.currentQuestion;
    if (
      !player ||
      player.status === "out" ||
      player.answered ||
      !question ||
      player.isAdmin
    )
      return; // Admins don't answer

    player.answered = true;
    const isCorrect = answer === question.answer;

    if (!isCorrect) {
      player.hp -= 1;
      this.broadcastSound("gunshot", player.id); // Send gunshot to the player who got hit
      if (player.hp <= 0) {
        player.status = "out";
        this.broadcastSound("eliminated", player.id); // Send eliminated sound to player
        this.io.emit("notification", `${player.name} has been eliminated!`);
      }
    } else {
      this.broadcastSound("correct", player.id);
    }

    this.checkRoundCompletion();
    this.updateAdminStats(); // Update stats
    this.broadcastGameState();
  }

  private handleTimeUp(): void {
    this.gameState.players.forEach((p) => {
      if (p.status === "alive" && !p.answered && !p.isAdmin) {
        // Only affect non-admin active players
        p.hp -= 1;
        if (p.hp <= 0) {
          p.status = "out";
          this.io.emit(
            "notification",
            `${p.name} has been eliminated (time up)!`,
          );
        }
      }
    });
    this.broadcastSound("gunshot"); // Generic gunshot for time up
    this.checkRoundCompletion();
    this.updateAdminStats(); // Update stats
    this.broadcastGameState();
  }

  // --- State & Utility ---
  private checkRoundCompletion(): void {
    // Only consider non-admin alive players for round completion
    const activePlayers = this.gameState.players.filter(
      (p) => p.status === "alive" && !p.isAdmin,
    );
    const allAnswered = activePlayers.every((p) => p.answered);

    if (allAnswered || activePlayers.length === 0) {
      // If all active players answered or no active players left
      if (this.gameState.gameName === "game2") {
        this.resolveTugOfWarRound();
      }
      // Give a short delay before next question or end game
      setTimeout(() => this.nextQuestion(), 2000);
    }
  }

  private checkGameStatus(): void {
    if (
      this.gameState.gameName !== "lobby" &&
      this.gameState.gameName !== "winner"
    ) {
      const aliveCount = this.gameState.players.filter(
        (p) => p.status === "alive" && !p.isAdmin,
      ).length; // Only non-admin players
      if (aliveCount <= 1) {
        this.endCurrentGame();
      }
    }
  }

  private resolveTugOfWarRound(): void {
    if (
      !this.gameState.teams ||
      !this.gameState.tugOfWar ||
      !this.gameState.currentQuestion
    )
      return;

    const redCorrect = this.gameState.teams.red.filter(
      (p) =>
        p.answered &&
        p.status === "alive" &&
        p.id !== undefined &&
        this.gameState.currentQuestion?.answer ===
          questionsGame2[this.gameState.round!].answer,
    ).length;
    const blueCorrect = this.gameState.teams.blue.filter(
      (p) =>
        p.answered &&
        p.status === "alive" &&
        p.id !== undefined &&
        this.gameState.currentQuestion?.answer ===
          questionsGame2[this.gameState.round!].answer,
    ).length;

    if (redCorrect > blueCorrect) {
      this.gameState.tugOfWar.position -= 1;
      this.gameState.tugOfWar.lastRoundWinner = "red";
      this.io.emit("notification", "Red Team pulled ahead in Tug of War!");
    } else if (blueCorrect > redCorrect) {
      this.gameState.tugOfWar.position += 1;
      this.gameState.tugOfWar.lastRoundWinner = "blue";
      this.io.emit("notification", "Blue Team pulled ahead in Tug of War!");
    } else {
      this.gameState.tugOfWar.lastRoundWinner = "tie";
      this.io.emit("notification", "Tug of War round was a tie!");
    }
  }

  // server/gameController.ts (continued)

  private calculateScores(): void {
    // Collect scores before resetting for next game/leaderboard
    const currentAlivePlayers = this.gameState.players.filter(
      (p) => p.status === "alive" && !p.isAdmin,
    );

    if (this.gameState.gameName === "game1") {
      currentAlivePlayers.sort((a, b) => b.hp - a.hp);
      currentAlivePlayers.forEach((p, index) => {
        let points = 0;
        if (index === 0) points = 15;
        else if (index === 1) points = 10;
        else points = 5;
        p.score += points;
        this.gameState.adminStats.game1Scores.push({
          name: p.name,
          score: points,
        });
      });
      this.gameState.adminStats.game1Scores.sort((a, b) => b.score - a.score); // Sort for display
    } else if (this.gameState.gameName === "game2") {
      if ((this.gameState.tugOfWar?.position ?? 0) > 0) {
        // blue won
        this.gameState.teams?.blue.forEach((p) => {
          if (p.status === "alive" && !p.isAdmin) {
            p.score += 10;
            this.gameState.adminStats.game2Scores.push({
              name: p.name,
              score: 10,
            });
          }
        });
        this.io.emit("notification", "Blue Team wins Tug of War!");
      } else if ((this.gameState.tugOfWar?.position ?? 0) < 0) {
        // red won
        this.gameState.teams?.red.forEach((p) => {
          if (p.status === "alive" && !p.isAdmin) {
            p.score += 10;
            this.gameState.adminStats.game2Scores.push({
              name: p.name,
              score: 10,
            });
          }
        });
        this.io.emit("notification", "Red Team wins Tug of War!");
      } else {
        this.io.emit("notification", "Tug of War is a draw!");
      }
      this.gameState.adminStats.game2Scores.sort((a, b) => b.score - a.score); // Sort for display
    } else if (this.gameState.gameName === "game3") {
      // For game 3, all remaining alive players get a score based on their HP or just participation
      currentAlivePlayers.forEach((p) => {
        const points = p.hp * 5; // Example: 5 points per HP
        p.score += points;
        this.gameState.adminStats.game3Scores.push({
          name: p.name,
          score: points,
        });
      });
      this.gameState.adminStats.game3Scores.sort((a, b) => b.score - a.score); // Sort for display
    }
  }

  private resetPlayersForNewGame(hp: number): void {
    this.gameState.players.forEach((p) => {
      // Only reset non-admin players for game stats
      if (p.status === "alive" && !p.isAdmin) {
        p.hp = hp;
        p.answered = false;
        p.team = undefined;
      } else if (p.isAdmin) {
        // Ensure admin players are always 'alive' for the dashboard perspective
        p.status = "alive";
      }
    });
    this.updateAdminStats(); // Update stats after resetting players
  }

  private updateAdminStats(): void {
    const nonAdminPlayers = this.gameState.players.filter((p) => !p.isAdmin);
    this.gameState.adminStats = {
      ...this.gameState.adminStats, // Keep existing game scores
      totalPlayers: nonAdminPlayers.length,
      alivePlayers: nonAdminPlayers.filter((p) => p.status === "alive").length,
      eliminatedPlayers: nonAdminPlayers.filter((p) => p.status === "out")
        .length,
      // game1Scores, game2Scores, game3Scores are updated in calculateScores
    };
    this.io.emit("adminStatsUpdate", this.gameState.adminStats); // Emit specific update for admin
  }

  private broadcastGameState(): void {
    this.io.emit("gameStateUpdate", this.gameState);
  }

  private broadcastSound(sound: SoundType, to?: string): void {
    if (to) {
      this.io.to(to).emit("playSound", sound);
    } else {
      this.io.emit("playSound", sound);
    }
  }

  private clearTimers(): void {
    Object.values(this.timers).forEach((timer) => clearTimeout(timer)); // Use clearTimeout
    this.timers = {};
  }

  public adminResetGame(): void {
    this.clearTimers();
    this.gameState = {
      gameName: "lobby",
      players: [],
      adminStats: {
        totalPlayers: 0,
        alivePlayers: 0,
        eliminatedPlayers: 0,
        game1Scores: [],
        game2Scores: [],
        game3Scores: [],
      },
    };
    this.broadcastGameState();
    this.io.emit(
      "notification",
      "Game has been reset. Waiting for players to join.",
    );
  }
}

