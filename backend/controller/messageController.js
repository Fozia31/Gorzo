const Message = require("../models/message");
const User = require("../models/user");
const Chat = require("../models/chat");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createMessage = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["chatId", "senderId"]);
	ensureValidObjectId(req.body.chatId, "chatId");
	ensureValidObjectId(req.body.senderId, "senderId");

	const chat = await Chat.findById(req.body.chatId).select("_id");
	if (!chat) throw new ApiError(404, "Chat not found");

	const sender = await User.findById(req.body.senderId).select("role");
	if (!sender) throw new ApiError(404, "Sender not found");

	const messageType = req.body.messageType || "text";
	if (!["text", "voice"].includes(messageType)) {
		throw new ApiError(400, "messageType must be text or voice");
	}
	if (messageType === "text" && !String(req.body.messageText || "").trim()) {
		throw new ApiError(400, "messageText is required for text messages");
	}
	if (messageType === "voice" && !String(req.body.voiceUrl || "").trim()) {
		throw new ApiError(400, "voiceUrl is required for voice messages");
	}

	const message = await Message.create({
		chatId: req.body.chatId,
		senderId: req.body.senderId,
		senderRole: req.body.senderRole || sender.role,
		messageType,
		messageText: req.body.messageText || "",
		voiceUrl: req.body.voiceUrl || "",
		durationSec: req.body.durationSec || 0,
		transcript: req.body.transcript || "",
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

const getMessagesByChatId = asyncHandler(async (req, res) => {
	const chatId = req.params.chatId;
	ensureValidObjectId(chatId, "chatId");

	const page = Math.max(Number(req.query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
	const skip = (page - 1) * limit;

	const [items, total] = await Promise.all([
		Message.find({ chatId }).populate("senderId", "displayName role").sort({ createdAt: 1 }).skip(skip).limit(limit),
		Message.countDocuments({ chatId }),
	]);

	return res.status(200).json({
		success: true,
		data: items,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
});

const markChatMessagesRead = asyncHandler(async (req, res) => {
	const chatId = req.params.chatId;
	ensureValidObjectId(chatId, "chatId");

	const readerRole = req.body.readerRole || "Doctor";
	if (!["User", "Doctor", "Admin"].includes(readerRole)) {
		throw new ApiError(400, "readerRole must be User, Doctor, or Admin");
	}

	const result = await Message.updateMany(
		{ chatId, isRead: false, senderRole: { $ne: readerRole } },
		{ $set: { isRead: true } }
	);

	return res.status(200).json({
		success: true,
		message: "Messages marked as read",
		data: { modifiedCount: result.modifiedCount || 0 },
	});
});

module.exports = {
	createMessage,
	getMessages,
	getMessageById,
	updateMessage,
	deleteMessage,
	getMessagesByChatId,
	markChatMessagesRead,
};
