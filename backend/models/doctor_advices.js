const mongoose = require("mongoose");

const doctorAdviceSchema = new mongoose.Schema(
	{
		doctorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Doctor",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 180,
		},
		category: {
			type: String,
			required: true,
			trim: true,
		},
		contentType: {
			type: String,
			required: true,
			enum: ["Text", "VoiceURL"],
		},
		textContent: {
			type: String,
			trim: true,
			default: "",
		},
		voiceUrl: {
			type: String,
			trim: true,
			default: "",
		},
		audioDuration: {
			type: Number,
			min: 0,
			default: 0,
		},
		transcript: {
			type: String,
			trim: true,
			default: "",
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
		summary: {
			type: String,
			trim: true,
			maxlength: 500,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

doctorAdviceSchema.index({ doctorId: 1, createdAt: -1 });
doctorAdviceSchema.index({ category: 1, contentType: 1 });

module.exports = mongoose.model("DoctorAdvice", doctorAdviceSchema);
