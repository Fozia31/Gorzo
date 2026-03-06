const express = require("express");
const {
	createPost,
	getPosts,
	getPostById,
	updatePost,
	deletePost,
} = require("../controller/postController");

const router = express.Router();

router.post("/", createPost);
router.get("/", getPosts);
router.get("/:postId", getPostById);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

module.exports = router;
