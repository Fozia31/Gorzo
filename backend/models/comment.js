const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
	{
		// legacy index for comments created earlier – keep field to satisfy DB
		comment_id: {
			type: String,
			default: () => new mongoose.Types.ObjectId().toString(),
		},
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
		displayName: {
			type: String,
			required: true,
			trim: true,
			maxlength: 60,
		},
		content: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 1000,
		},
		isReported: {
			type: Boolean,
			default: false,
		},
	},

	{
		timestamps: true,
	}
);

commentSchema.index({ postId: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);
