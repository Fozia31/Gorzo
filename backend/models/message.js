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
		senderRole: {
			type: String,
			enum: ["User", "Doctor", "Admin"],
			default: "User",
		},
		messageType: {
			type: String,
			enum: ["text", "voice"],
			default: "text",
		},
		messageText: {
			type: String,
			required: function requiredMessageText() {
				return this.messageType === "text";
			},
			trim: true,
			maxlength: 3000,
			default: "",
		},
		voiceUrl: {
			type: String,
			trim: true,
			default: "",
		},
		durationSec: {
			type: Number,
			min: 0,
			default: 0,
		},
		transcript: {
			type: String,
			trim: true,
			default: "",
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
messageSchema.index({ chatId: 1, isRead: 1, senderRole: 1 });

module.exports = mongoose.model("Message", messageSchema);
