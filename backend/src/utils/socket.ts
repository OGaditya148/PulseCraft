import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

let io: SocketIOServer;
let onlineUsersCount = 0;

export const initSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    onlineUsersCount++;
    io.emit('presence_update', { activeUsers: onlineUsersCount });

    socket.on('disconnect', () => {
      onlineUsersCount = Math.max(0, onlineUsersCount - 1);
      io.emit('presence_update', { activeUsers: onlineUsersCount });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io instance not initialized');
  return io;
};