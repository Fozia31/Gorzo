const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		doctorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Doctor",
			required: true,
			index: true,
		},
		sessionStatus: {
			type: String,
			enum: ["Active", "Closed"],
			default: "Active",
		},
		startedAt: {
			type: Date,
			default: Date.now,
		},
		endedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

chatSchema.index({ userId: 1, doctorId: 1, createdAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);
