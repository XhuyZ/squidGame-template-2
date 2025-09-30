
// ...existing code...
// server/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameController } from './gameController';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity
    methods: ["GET", "POST"]
  }
});

const gameController = new GameController(io);

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Modified join event to accept isAdmin flag
  socket.on('join', ({ name, isAdmin = false }: { name: string; isAdmin?: boolean }) => {
    gameController.addPlayer(socket.id, name, isAdmin);
    // If the joining player is an admin, immediately send them the current stats
    if (isAdmin) {
        // This is a direct call to simulate sending current stats
        // In a real scenario, the GameController should have a method to get current stats
        // and send to a specific socket. For simplicity, we'll re-trigger the broadcast.
        // A better approach would be: gameController.sendAdminStatsTo(socket.id);
        (gameController as any).updateAdminStats(); // Force an update to send initial stats
    }
  });

  socket.on('submitAnswer', ({ answer }: { answer: string }) => {
    gameController.handleAnswer(socket.id, answer);
  });

  // Admin-specific events (no authorization, anyone can trigger)
  socket.on('admin:startGame', () => {
    gameController.adminStartGame();
  });

  socket.on('admin:startNextGame', () => {
    gameController.adminStartNextGame();
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameController.removePlayer(socket.id);
  });

  socket.on('admin:resetGame', () => {
    gameController.adminResetGame();
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});