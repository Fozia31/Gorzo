const Message = require("../models/message");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createMessage = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["chatId", "senderId", "messageText"]);
	ensureValidObjectId(req.body.chatId, "chatId");
	ensureValidObjectId(req.body.senderId, "senderId");

	const message = await Message.create({
		chatId: req.body.chatId,
		senderId: req.body.senderId,
		messageText: req.body.messageText,
		isRead: Boolean(req.body.isRead),
	});

	return res.status(201).json({ success: true, message: "Message sent", data: message });
});

const getMessages = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.chatId) {
		ensureValidObjectId(req.query.chatId, "chatId");
		filter.chatId = req.query.chatId;
	}

	const items = await Message.find(filter).populate("senderId").sort({ createdAt: 1 });
	return res.status(200).json({ success: true, data: items });
});

const getMessageById = asyncHandler(async (req, res) => {
	const messageId = req.params.messageId || req.params.id;
	ensureValidObjectId(messageId, "message id");
	const message = await Message.findById(messageId).populate("senderId");
	if (!message) throw new ApiError(404, "Message not found");
	return res.status(200).json({ success: true, data: message });
});

const updateMessage = asyncHandler(async (req, res) => {
	const messageId = req.params.messageId || req.params.id;
	ensureValidObjectId(messageId, "message id");
	const payload = {};
	if (req.body.messageText !== undefined) payload.messageText = req.body.messageText;
	if (req.body.isRead !== undefined) payload.isRead = req.body.isRead;
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await Message.findByIdAndUpdate(messageId, payload, { new: true, runValidators: true });
	if (!updated) throw new ApiError(404, "Message not found");
	return res.status(200).json({ success: true, message: "Message updated", data: updated });
});

const deleteMessage = asyncHandler(async (req, res) => {
	const messageId = req.params.messageId || req.params.id;
	ensureValidObjectId(messageId, "message id");
	const deleted = await Message.findByIdAndDelete(messageId);
	if (!deleted) throw new ApiError(404, "Message not found");
	return res.status(200).json({ success: true, message: "Message deleted" });
});

module.exports = {
	createMessage,
	getMessages,
	getMessageById,
	updateMessage,
	deleteMessage,
};
