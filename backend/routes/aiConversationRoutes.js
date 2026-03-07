const express = require("express");
const {
	createAIConversation,
	getAIConversations,
	getAIConversationById,
	updateAIConversation,
	deleteAIConversation,
	summarizePostWithAI,
	summarizeArticleWithAI,
	suggestDoctorsWithAI,
	chatWithGemini,
} = require("../controller/aiConversationController");

const router = express.Router();

router.post("/", createAIConversation);
router.post("/chat", chatWithGemini);
router.post("/summarize/post", summarizePostWithAI);
router.post("/summarize/article", summarizeArticleWithAI);
router.post("/suggest-doctors", suggestDoctorsWithAI);
router.get("/", getAIConversations);
router.get("/:conversationId", getAIConversationById);
router.put("/:conversationId", updateAIConversation);
router.delete("/:conversationId", deleteAIConversation);

module.exports = router;
