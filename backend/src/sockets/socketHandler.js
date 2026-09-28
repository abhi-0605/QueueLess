import { logger } from '../utils/logger.js';

let ioInstance = null;

export const initSockets = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id }, 'Socket connected');

    socket.on('join:room', (data) => {
      const room = typeof data === 'string' ? data : data?.room;
      if (room) {
        socket.join(room);
        logger.debug({ socketId: socket.id, room }, 'Socket joined room');
      }
    });

    socket.on('leave:room', (data) => {
      const room = typeof data === 'string' ? data : data?.room;
      if (room) {
        socket.leave(room);
        logger.debug({ socketId: socket.id, room }, 'Socket left room');
      }
    });

    socket.on('disconnect', () => {
      logger.debug({ socketId: socket.id }, 'Socket disconnected');
    });
  });
};

export const socketEmitter = {
  broadcastQueueUpdate: (serviceId, payload) => {
    if (!ioInstance) return;
    ioInstance.to(`service:${serviceId}`).emit('queue:update', payload);
  },

  notifyTokenCalled: (serviceId, payload) => {
    if (!ioInstance) return;
    ioInstance.to(`service:${serviceId}`).emit('token:called', payload);
    if (payload.userId) {
      ioInstance.to(`user:${payload.userId}`).emit('token:called', payload);
    }
  },

  notifyTokenCancelled: (serviceId, payload) => {
    if (!ioInstance) return;
    ioInstance.to(`service:${serviceId}`).emit('token:cancelled', payload);
    if (payload.userId) {
      ioInstance.to(`user:${payload.userId}`).emit('token:cancelled', payload);
    }
  },

  notifyPositionChanged: (userId, payload) => {
    if (!ioInstance) return;
    ioInstance.to(`user:${userId}`).emit('position:changed', payload);
  }
};
