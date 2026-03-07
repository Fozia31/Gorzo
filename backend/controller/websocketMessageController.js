// backend/controllers/websocketMessageController.js
const Message = require('../models/message');

async function savePremiumMessage({ chatId, senderId, messageText }) {
  const message = new Message({ chatId, senderId, messageText });
  await message.save();
  return message;
}

module.exports = { savePremiumMessage };