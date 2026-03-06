const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
	{
		doctor_id: {
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
		specialization: {
			type: String,
			required: true,
			trim: true,
			enum: [
				"gynecologist",
				"reproductive health",
				"mental health",
				"general",
			],
			default: "general",
		},
		created_by_admin_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
			required: true,
		},
		role: {
			type: String,
			enum: ["doctor"],
			default: "doctor",
		},
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	}
);

doctorSchema.index({ email: 1 });
doctorSchema.index({ specialization: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
