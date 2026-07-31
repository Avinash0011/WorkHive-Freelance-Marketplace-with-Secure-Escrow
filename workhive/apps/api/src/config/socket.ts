import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../lib/env';
import { authenticateSocket } from '../middleware/socket-auth.middleware';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  const allowedOrigins = [
    env.FRONTEND_URL,
    env.FRONTEND_URL.replace(/\/$/, ''),
  ];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: any) {
  const socketIO = getIO();
  socketIO.to(`user:${userId}`).emit(event, data);
}
