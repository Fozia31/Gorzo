const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
	{
		start: {
			type: String,
			required: true,
			trim: true,
		},
		end: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ _id: false }
);

const availabilitySchema = new mongoose.Schema(
	{
		day: {
			type: String,
			required: true,
			enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		},
		enabled: {
			type: Boolean,
			default: false,
		},
		slots: {
			type: [timeSlotSchema],
			default: [],
		},
	},
	{ _id: false }
);

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
		availability: {
			type: [availabilitySchema],
			default: [],
		},
		consultationCount: {
			type: Number,
			min: 0,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
