const express = require("express");
const { createPost, getPosts } = require("../controller/postController");

const router = express.Router();

router.post("/", createPost);
router.get("/", getPosts);

module.exports = router;
