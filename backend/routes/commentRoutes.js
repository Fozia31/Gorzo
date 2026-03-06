const express = require("express");
const {
	createComment,
	getCommentsByPost,
} = require("../controller/commentController");

const router = express.Router();

router.post("/", createComment);
router.get("/:post_id", getCommentsByPost);

module.exports = router;
