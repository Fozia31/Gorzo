const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
	{
		admin_id: {
			type: String,
			unique: true,
			index: true,
			default: () => new mongoose.Types.ObjectId().toString(),
		},
		full_name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 80,
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
			enum: ["admin"],
			default: "admin",
		},
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	}
);

adminSchema.index({ email: 1 });

module.exports = mongoose.model("Admin", adminSchema);
