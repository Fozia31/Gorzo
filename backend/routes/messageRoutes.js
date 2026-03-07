const express = require("express");
const {
	createMessage,
	getMessages,
	getMessageById,
	updateMessage,
	deleteMessage,
	getMessagesByChatId,
	markChatMessagesRead,
} = require("../controller/messageController");

const router = express.Router();

router.post("/", createMessage);
router.get("/", getMessages);
router.get("/chat/:chatId", getMessagesByChatId);
router.patch("/chat/:chatId/read", markChatMessagesRead);
router.get("/:messageId", getMessageById);
router.put("/:messageId", updateMessage);
router.delete("/:messageId", deleteMessage);

module.exports = router;
