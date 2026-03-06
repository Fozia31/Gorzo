const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
	{
		log_id: {
			type: String,
			unique: true,
			index: true,
			default: () => new mongoose.Types.ObjectId().toString(),
		},
		user_input: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 3000,
		},
		bot_response: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 5000,
		},
		topic: {
			type: String,
			trim: true,
			enum: [
				"menstrual health",
				"contraception",
				"pregnancy",
				"stis",
				"fertility",
				"mental health",
				"sexual wellness",
				"general",
			],
			default: "general",
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
		session_id: {
			type: String,
			trim: true,
			default: null,
		},
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	}
);

chatLogSchema.index({ topic: 1, timestamp: -1 });

module.exports = mongoose.model("ChatLog", chatLogSchema);
