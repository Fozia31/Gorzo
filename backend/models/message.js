const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		chatId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Chat",
			required: true,
			index: true,
		},
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		messageText: {
			type: String,
			required: true,
			trim: true,
			maxlength: 3000,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

messageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
