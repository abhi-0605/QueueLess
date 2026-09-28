import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('/', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });
  }
  return socket;
};

export const joinRoom = (roomName) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('join:room', { room: roomName });
  } else {
    s.once('connect', () => {
      s.emit('join:room', { room: roomName });
    });
  }
};

export const leaveRoom = (roomName) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('leave:room', { room: roomName });
  }
};
