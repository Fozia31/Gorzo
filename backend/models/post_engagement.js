const mongoose = require("mongoose");

const postEngagementSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
			index: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["Like", "Report"],
		},
		reportReason: {
			type: String,
			trim: true,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

postEngagementSchema.index({ postId: 1, type: 1, createdAt: -1 });
postEngagementSchema.index({ postId: 1, userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("PostEngagement", postEngagementSchema);
