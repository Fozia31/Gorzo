const ChatLog = require("../models/chat_logs");

const createChatLog = async (req, res) => {
	try {
		const { user_input, bot_response, topic, timestamp, session_id } = req.body;

		if (!user_input || !bot_response) {
			return res.status(400).json({
				success: false,
				message: "user_input and bot_response are required",
			});
		}

		const item = await ChatLog.create({
			user_input,
			bot_response,
			topic,
			timestamp,
			session_id,
		});

		return res.status(201).json({
			success: true,
			message: "Chat log saved successfully",
			data: item,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to save chat log",
		});
	}
};

const getChatLogs = async (req, res) => {
	try {
		const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
		const skip = (page - 1) * limit;

		const filter = {};
		if (req.query.topic) {
			filter.topic = req.query.topic;
		}
		if (req.query.session_id) {
			filter.session_id = req.query.session_id;
		}

		const [items, total] = await Promise.all([
			ChatLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
			ChatLog.countDocuments(filter),
		]);

		return res.status(200).json({
			success: true,
			data: items,
			pagination: {
				page,
				limit,
				total,
				total_pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch chat logs",
		});
	}
};

module.exports = {
	createChatLog,
	getChatLogs,
};
