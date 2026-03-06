const express = require("express");
const {
	createPostEngagement,
	getPostEngagements,
	getPostEngagementById,
	updatePostEngagement,
	deletePostEngagement,
} = require("../controller/postEngagementController");

const router = express.Router();

router.post("/", createPostEngagement);
router.get("/", getPostEngagements);
router.get("/:engagementId", getPostEngagementById);
router.put("/:engagementId", updatePostEngagement);
router.delete("/:engagementId", deletePostEngagement);

module.exports = router;
