const PersonalAssistance = require("../models/personal_assistance");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createQuestion = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId", "prompt", "summaryResponse"]);
	ensureValidObjectId(req.body.userId, "userId");

	const item = await PersonalAssistance.create({
		userId: req.body.userId,
		prompt: req.body.prompt,
		summaryResponse: req.body.summaryResponse,
		category: req.body.category || "general",
	});

	return res.status(201).json({ success: true, message: "AI assistance saved", data: item });
});

const getQuestions = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.userId) {
		ensureValidObjectId(req.query.userId, "userId");
		filter.userId = req.query.userId;
	}
	if (req.query.category) filter.category = req.query.category;

	const items = await PersonalAssistance.find(filter).sort({ createdAt: -1 });
	return res.status(200).json({ success: true, data: items });
});

const getQuestionById = asyncHandler(async (req, res) => {
	const assistanceId = req.params.assistanceId || req.params.id;
	ensureValidObjectId(assistanceId, "assistance id");
	const item = await PersonalAssistance.findById(assistanceId);
	if (!item) throw new ApiError(404, "Assistance record not found");
	return res.status(200).json({ success: true, data: item });
});

const updateQuestion = asyncHandler(async (req, res) => {
	const assistanceId = req.params.assistanceId || req.params.id;
	ensureValidObjectId(assistanceId, "assistance id");
	const payload = {};
	if (req.body.prompt !== undefined) payload.prompt = req.body.prompt;
	if (req.body.summaryResponse !== undefined) payload.summaryResponse = req.body.summaryResponse;
	if (req.body.category !== undefined) payload.category = req.body.category;
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await PersonalAssistance.findByIdAndUpdate(assistanceId, payload, {
		new: true,
		runValidators: true,
	});
	if (!updated) throw new ApiError(404, "Assistance record not found");
	return res.status(200).json({ success: true, message: "Assistance updated", data: updated });
});

const deleteQuestion = asyncHandler(async (req, res) => {
	const assistanceId = req.params.assistanceId || req.params.id;
	ensureValidObjectId(assistanceId, "assistance id");
	const deleted = await PersonalAssistance.findByIdAndDelete(assistanceId);
	if (!deleted) throw new ApiError(404, "Assistance record not found");
	return res.status(200).json({ success: true, message: "Assistance deleted" });
});

module.exports = {
	createQuestion,
	getQuestions,
	getQuestionById,
	updateQuestion,
	deleteQuestion,
};
