// socket.js
import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000', {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}
