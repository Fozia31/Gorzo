const express = require("express");
const {
	createComment,
	getComments,
	getCommentById,
	updateComment,
	deleteComment,
} = require("../controller/commentController");

const router = express.Router();

router.post("/", createComment);
router.get("/", getComments);
router.get("/:commentId", getCommentById);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

module.exports = router;
