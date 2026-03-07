// websocket.js
const { Server } = require('socket.io');

let io;

function initWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('WebSocket client connected:', socket.id);

    // Example: join premium room
    socket.on('joinPremium', (userId) => {
      socket.join('premium');
      socket.data.userId = userId;
    });


    // Example: handle premium message
    socket.on('premiumMessage', async (data) => {
      // Save message to DB
      try {
        const { chatId, senderId, messageText, senderType } = data;
        const { savePremiumMessage } = require('./controller/websocketMessageController');
        const saved = await savePremiumMessage({ chatId, senderId, messageText });
        io.to('premium').emit('premiumMessage', { ...data, senderType, _id: saved._id, createdAt: saved.createdAt });
      } catch (err) {
        socket.emit('error', { message: 'Failed to save message', error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('WebSocket not initialized!');
  return io;
}

module.exports = { initWebSocket, getIO };