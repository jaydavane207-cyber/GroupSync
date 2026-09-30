import http from 'http';
import app from './src/index.js';
import { Server } from 'socket.io';
import { ENV } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join_channel', (channel) => {
    socket.join(channel);
    logger.info(`Socket ${socket.id} joined channel ${channel}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = ENV.PORT || 4000;
server.listen(PORT, () => {
  logger.info(`GroupSync API Server running on port ${PORT}`);
});
