const mongoose = require("mongoose");

const doctorRatingSchema = new mongoose.Schema(
	{
		doctorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Doctor",
			required: true,
			index: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
			trim: true,
			maxlength: 1500,
			default: "",
		},
		anonymous: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

doctorRatingSchema.index({ doctorId: 1, createdAt: -1 });
doctorRatingSchema.index({ doctorId: 1, rating: 1 });
doctorRatingSchema.index({ doctorId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("DoctorRating", doctorRatingSchema);
