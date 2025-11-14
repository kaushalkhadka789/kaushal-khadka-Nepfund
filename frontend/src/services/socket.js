import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  return socketInstance;
}

export function ensureSocketConnected({ userId, role } = {}) {
  if (!socketInstance) {
    socketInstance = io('http://localhost:5000', {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });
  }

  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('identify', { userId, role });
  } else if (socketInstance) {
    socketInstance.on('connect', () => {
      socketInstance.emit('identify', { userId, role });
    });
  }

  return socketInstance;
}


