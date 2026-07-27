import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env';

export async function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
}
