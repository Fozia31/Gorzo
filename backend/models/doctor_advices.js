const mongoose = require("mongoose");

const doctorAdviceSchema = new mongoose.Schema(
	{
		advice_id: {
			type: String,
			trim: true,
			unique: true,
			index: true,
			default: () => `ADV-${new mongoose.Types.ObjectId().toString()}`,
		},
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
			enum: ["Text", "VoiceURL", "Mixed"],
			default: "Text",
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
		status: {
			type: String,
			enum: ["draft", "published"],
			default: "published",
		},
		summary: {
			type: String,
			trim: true,
			maxlength: 500,
			default: "",
		},
		viewsCount: {
			type: Number,
			min: 0,
			default: 0,
		},
		attachments: {
			type: [
				{
					name: { type: String, trim: true, required: true },
					url: { type: String, trim: true, required: true },
					mimeType: { type: String, trim: true, default: "application/octet-stream" },
					size: { type: Number, min: 0, default: 0 },
				},
			],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

doctorAdviceSchema.index({ doctorId: 1, createdAt: -1 });
doctorAdviceSchema.index({ category: 1, contentType: 1 });
doctorAdviceSchema.index({ doctorId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("DoctorAdvice", doctorAdviceSchema);
