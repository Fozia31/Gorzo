const AIConversation = require("../models/chat_ai");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createAIConversation = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId"]);
	ensureValidObjectId(req.body.userId, "userId");

	const history = Array.isArray(req.body.history) ? req.body.history : [];
	const item = await AIConversation.create({
		userId: req.body.userId,
		history,
		sessionTitle: req.body.sessionTitle || "",
		isArchived: Boolean(req.body.isArchived),
	});

	return res.status(201).json({ success: true, message: "AI conversation created", data: item });
});

const getAIConversations = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.userId) {
		ensureValidObjectId(req.query.userId, "userId");
		filter.userId = req.query.userId;
	}
	if (typeof req.query.isArchived === "string") filter.isArchived = req.query.isArchived === "true";

	const items = await AIConversation.find(filter).populate("userId").sort({ updatedAt: -1 });
	return res.status(200).json({ success: true, data: items });
});

const getAIConversationById = asyncHandler(async (req, res) => {
	const conversationId = req.params.conversationId || req.params.id;
	ensureValidObjectId(conversationId, "conversation id");
	const item = await AIConversation.findById(conversationId).populate("userId");
	if (!item) throw new ApiError(404, "AI conversation not found");
	return res.status(200).json({ success: true, data: item });
});

const updateAIConversation = asyncHandler(async (req, res) => {
	const conversationId = req.params.conversationId || req.params.id;
	ensureValidObjectId(conversationId, "conversation id");

	const payload = {};
	if (req.body.sessionTitle !== undefined) payload.sessionTitle = req.body.sessionTitle;
	if (req.body.isArchived !== undefined) payload.isArchived = req.body.isArchived;
	if (Array.isArray(req.body.history)) payload.history = req.body.history;

	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await AIConversation.findByIdAndUpdate(conversationId, payload, {
		new: true,
		runValidators: true,
	});
	if (!updated) throw new ApiError(404, "AI conversation not found");
	return res.status(200).json({ success: true, message: "AI conversation updated", data: updated });
});

const deleteAIConversation = asyncHandler(async (req, res) => {
	const conversationId = req.params.conversationId || req.params.id;
	ensureValidObjectId(conversationId, "conversation id");
	const deleted = await AIConversation.findByIdAndDelete(conversationId);
	if (!deleted) throw new ApiError(404, "AI conversation not found");
	return res.status(200).json({ success: true, message: "AI conversation deleted" });
});

module.exports = {
	createAIConversation,
	getAIConversations,
	getAIConversationById,
	updateAIConversation,
	deleteAIConversation,
};
