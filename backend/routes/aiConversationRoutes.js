const express = require("express");
const {
	createAIConversation,
	getAIConversations,
	getAIConversationById,
	updateAIConversation,
	deleteAIConversation,
	geminiChat,
} = require("../controller/aiConversationController");

const router = express.Router();

router.post("/", createAIConversation);
router.get("/", getAIConversations);
// Gemini chatbot endpoint
router.post("/gemini", geminiChat);
router.get("/:conversationId", getAIConversationById);
router.put("/:conversationId", updateAIConversation);
router.delete("/:conversationId", deleteAIConversation);

module.exports = router;
