const express = require("express");
const {
	createChat,
	getChats,
	getChatById,
	updateChat,
	deleteChat,
} = require("../controller/chatController");

const router = express.Router();

router.post("/", createChat);
router.get("/", getChats);
router.get("/:chatId", getChatById);
router.put("/:chatId", updateChat);
router.delete("/:chatId", deleteChat);

module.exports = router;
