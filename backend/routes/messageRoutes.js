const express = require("express");
const {
	createMessage,
	getMessages,
	getMessageById,
	updateMessage,
	deleteMessage,
} = require("../controller/messageController");

const router = express.Router();

router.post("/", createMessage);
router.get("/", getMessages);
router.get("/:messageId", getMessageById);
router.put("/:messageId", updateMessage);
router.delete("/:messageId", deleteMessage);

module.exports = router;
