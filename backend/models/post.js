const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
	{
		post_id: {
			type: String,
			unique: true,
			index: true,
			default: () => new mongoose.Types.ObjectId().toString(),
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
			minlength: 5,
			maxlength: 2000,
		},
		category: {
			type: String,
			required: true,
			trim: true,
			enum: [
				"menstrual health",
				"contraception",
				"pregnancy",
				"mental health",
				"sexual wellness",
				"fertility",
				"pcos",
				"sti/std",
				"general",
			],
			default: "general",
		},
		likes: {
			type: Number,
			min: 0,
			default: 0,
		},
		comments_count: {
			type: Number,
			min: 0,
			default: 0,
		},
		is_anonymous: {
			type: Boolean,
			default: true,
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

postSchema.index({ category: 1, created_at: -1 });

module.exports = mongoose.model("Post", postSchema);
