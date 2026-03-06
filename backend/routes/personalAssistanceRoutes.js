const express = require("express");
const {
	createQuestion,
	getQuestions,
} = require("../controller/personalAssistanceController");

const router = express.Router();

router.post("/", createQuestion);
router.get("/", getQuestions);

module.exports = router;
