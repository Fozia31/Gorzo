const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		user_id: {
			type: String,
			unique: true,
			index: true,
			default: () => new mongoose.Types.ObjectId().toString(),
		},
		display_name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 60,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password_hash: {
			type: String,
			required: true,
			minlength: 8,
		},
		role: {
			type: String,
			enum: ["user"],
			default: "user",
		},
		registered_by: {
			type: String,
			enum: ["self"],
			default: "self",
		},
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	}
);

userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
