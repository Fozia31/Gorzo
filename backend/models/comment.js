const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
	{
		comment_id: {
			type: String,
			unique: true,
			index: true,
			default: () => new mongoose.Types.ObjectId().toString(),
		},
		post_id: {
			type: String,
			required: true,
			index: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		display_name: {
			type: String,
			trim: true,
			maxlength: 60,
			default: null,
		},
		content: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 1000,
		},
		is_anonymous: {
			type: Boolean,
			default: false,
		},
		status: {
			type: String,
			enum: ["active", "hidden", "deleted"],
			default: "active",
		},
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	}
);

commentSchema.index({ post_id: 1, created_at: 1 });

module.exports = mongoose.model("Comment", commentSchema);
