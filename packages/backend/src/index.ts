import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import encountersRouter from './routes/encounters';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:19006",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from machinaka API!' });
});

// Mount routers
app.use('/api/users', usersRouter);
app.use('/api/encounters', encountersRouter);

// Socket.io for real-time communication
const connectedUsers = new Map<string, string>(); // userId -> socketId mapping

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ユーザーIDとソケットIDを関連付け
  socket.on('user-register', (userId: string) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user-${userId}`);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    // ソケット切断時にマッピングを削除
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });

  // すれ違い検知のリアルタイム通知
  socket.on('proximity-detected', (data: { userId: string; nearbyUsers: string[]; location: any }) => {
    console.log('Proximity detected:', data);
    
    // 近くのユーザーに通知を送信
    data.nearbyUsers.forEach(nearbyUserId => {
      const nearbySocketId = connectedUsers.get(nearbyUserId);
      if (nearbySocketId) {
        io.to(nearbySocketId).emit('encounter-notification', {
          type: 'proximity',
          fromUserId: data.userId,
          timestamp: new Date().toISOString(),
          location: data.location
        });
      }
    });
  });

  // マッチング通知
  socket.on('match-notification', (data: { userId1: string; userId2: string; encounterId: string }) => {
    console.log('Match notification:', data);
    
    [data.userId1, data.userId2].forEach(userId => {
      const socketId = connectedUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit('match-success', {
          encounterId: data.encounterId,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});