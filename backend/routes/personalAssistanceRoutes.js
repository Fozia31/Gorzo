const express = require("express");
const {
	createQuestion,
	getQuestions,
	getQuestionById,
	updateQuestion,
	deleteQuestion,
} = require("../controller/personalAssistanceController");

const router = express.Router();

router.post("/", createQuestion);
router.get("/", getQuestions);
router.get("/:assistanceId", getQuestionById);
router.put("/:assistanceId", updateQuestion);
router.delete("/:assistanceId", deleteQuestion);

module.exports = router;
