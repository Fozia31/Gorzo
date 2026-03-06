const express = require("express");
const { createChatLog, getChatLogs } = require("../controller/chatLogController");

const router = express.Router();

router.post("/", createChatLog);
router.get("/", getChatLogs);

module.exports = router;
