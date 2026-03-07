const Chat = require("../models/chat");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createChat = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId", "doctorId"]);
	ensureValidObjectId(req.body.userId, "userId");
	ensureValidObjectId(req.body.doctorId, "doctorId");

	const chat = await Chat.create({
		userId: req.body.userId,
		doctorId: req.body.doctorId,
		sessionStatus: req.body.sessionStatus || "Active",
		startedAt: req.body.startedAt || undefined,
		endedAt: req.body.endedAt || null,
	});

	return res.status(201).json({ success: true, message: "Chat session created", data: chat });
});

const getChats = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.userId) {
		ensureValidObjectId(req.query.userId, "userId");
		filter.userId = req.query.userId;
	}
	if (req.query.doctorId) {
		ensureValidObjectId(req.query.doctorId, "doctorId");
		filter.doctorId = req.query.doctorId;
	}
	if (req.query.sessionStatus) filter.sessionStatus = req.query.sessionStatus;

	const items = await Chat.find(filter).populate("userId").populate("doctorId").sort({ createdAt: -1 });
	return res.status(200).json({ success: true, data: items });
});

const getChatById = asyncHandler(async (req, res) => {
	const chatId = req.params.chatId || req.params.id;
	ensureValidObjectId(chatId, "chat id");
	const chat = await Chat.findById(chatId).populate("userId").populate("doctorId");
	if (!chat) throw new ApiError(404, "Chat not found");
	return res.status(200).json({ success: true, data: chat });
});

const updateChat = asyncHandler(async (req, res) => {
	const chatId = req.params.chatId || req.params.id;
	ensureValidObjectId(chatId, "chat id");
	const allowed = ["sessionStatus", "startedAt", "endedAt"];
	const payload = {};
	for (const field of allowed) if (req.body[field] !== undefined) payload[field] = req.body[field];
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await Chat.findByIdAndUpdate(chatId, payload, { new: true, runValidators: true });
	if (!updated) throw new ApiError(404, "Chat not found");
	return res.status(200).json({ success: true, message: "Chat updated", data: updated });
});

const deleteChat = asyncHandler(async (req, res) => {
	const chatId = req.params.chatId || req.params.id;
	ensureValidObjectId(chatId, "chat id");
	const deleted = await Chat.findByIdAndDelete(chatId);
	if (!deleted) throw new ApiError(404, "Chat not found");
	return res.status(200).json({ success: true, message: "Chat deleted" });
});

module.exports = {
	createChat,
	getChats,
	getChatById,
	updateChat,
	deleteChat,
};
