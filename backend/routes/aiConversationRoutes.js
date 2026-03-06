const express = require("express");
const {
	createAIConversation,
	getAIConversations,
	getAIConversationById,
	updateAIConversation,
	deleteAIConversation,
} = require("../controller/aiConversationController");

const router = express.Router();

router.post("/", createAIConversation);
router.get("/", getAIConversations);
router.get("/:conversationId", getAIConversationById);
router.put("/:conversationId", updateAIConversation);
router.delete("/:conversationId", deleteAIConversation);

module.exports = router;
