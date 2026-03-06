const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		specialization: {
			type: String,
			required: true,
			trim: true,
		},
		verificationStatus: {
			type: String,
			enum: ["Pending", "Verified", "Rejected"],
			default: "Pending",
		},
		createdByAdminId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
			required: true,
		},
		bio: {
			type: String,
			trim: true,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
