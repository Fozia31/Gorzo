const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
	{
		post_id: {
			type: String,
			default: () => new mongoose.Types.ObjectId().toString(),
			index: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 180,
		},
		content: {
			type: String,
			required: true,
			trim: true,
			minlength: 5,
			maxlength: 5000,
		},
		category: {
			type: String,
			required: true,
			trim: true,
		},
		isAnonymous: {
			type: Boolean,
			default: true,
		},
		likes: {
			type: Number,
			min: 0,
			default: 0,
		},
		reports: {
			type: Number,
			min: 0,
			default: 0,
		},
		reposts: {
			type: Number,
			min: 0,
			default: 0,
		},
		tags: {
			type: [String],
			default: [],
			set: (values) => values.map((value) => value.trim().toLowerCase()),
		},
	},
	{
		timestamps: true,
	}
);

postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model("Post", postSchema);
