// socket.js
import { io } from 'socket.io-client';

let socket;
const noopSocket = {
  connect: () => {},
  disconnect: () => {},
  emit: () => {},
  on: () => {},
  off: () => {},
};

export function getSocket() {
  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000");

    if (!socketUrl) {
      socket = noopSocket;
      return socket;
    }

    socket = io(socketUrl, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}
