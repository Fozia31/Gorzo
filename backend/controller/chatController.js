const Chat = require("../models/chat");
const Message = require("../models/message");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const formatTimeAgo = (date) => {
	if (!date) return "N/A";
	const diffMs = Date.now() - new Date(date).getTime();
	const minutes = Math.floor(diffMs / (1000 * 60));
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
};

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

const getDoctorChatQueue = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId;
	ensureValidObjectId(doctorId, "doctorId");

	const chats = await Chat.find({ doctorId, sessionStatus: "Active" })
		.populate("userId", "displayName isPremium")
		.sort({ updatedAt: -1 })
		.lean();

	if (chats.length === 0) {
		return res.status(200).json({ success: true, data: [] });
	}

	const chatIds = chats.map((chat) => chat._id);
	const [latestMessages, unreadByChat] = await Promise.all([
		Message.aggregate([
			{ $match: { chatId: { $in: chatIds } } },
			{ $sort: { createdAt: -1 } },
			{
				$group: {
					_id: "$chatId",
					lastMessage: { $first: "$messageText" },
					lastType: { $first: "$messageType" },
					lastMessageAt: { $first: "$createdAt" },
				},
			},
		]),
		Message.aggregate([
			{ $match: { chatId: { $in: chatIds }, isRead: false, senderRole: "User" } },
			{ $group: { _id: "$chatId", unread: { $sum: 1 } } },
		]),
	]);

	const latestMap = new Map(latestMessages.map((item) => [String(item._id), item]));
	const unreadMap = new Map(unreadByChat.map((item) => [String(item._id), item.unread]));

	const queue = chats.map((chat) => {
		const latest = latestMap.get(String(chat._id));
		const unread = unreadMap.get(String(chat._id)) || 0;
		const lastMessage = latest
			? latest.lastType === "voice"
				? "[Voice note]"
				: latest.lastMessage || ""
			: "";

		return {
			id: chat._id,
			chatId: chat._id,
			userId: chat.userId?._id,
			username: chat.userId?.displayName || "Unknown",
			tier: chat.userId?.isPremium ? "premium" : "free",
			priority: unread >= 2 ? "high" : "normal",
			unread,
			lastMessage,
			lastMessageTime: formatTimeAgo(latest?.lastMessageAt || chat.updatedAt),
			lastMessageAt: latest?.lastMessageAt || chat.updatedAt,
		};
	});

	return res.status(200).json({ success: true, data: queue });
});

module.exports = {
	createChat,
	getChats,
	getChatById,
	updateChat,
	deleteChat,
	getDoctorChatQueue,
};
