const mongoose = require("mongoose");

const doctorAdviceSchema = new mongoose.Schema(
	{
		advice_id: {
			type: String,
			unique: true,
			index: true,
			default: () => new mongoose.Types.ObjectId().toString(),
		},
		doctor_name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 80,
		},
		specialization: {
			type: String,
			required: true,
			trim: true,
			enum: [
				"gynecologist",
				"reproductive health",
				"mental health",
				"sexual health educator",
				"general",
			],
		},
		topic: {
			type: String,
			required: true,
			trim: true,
			enum: [
				"contraception",
				"menstrual health",
				"stis",
				"pregnancy",
				"fertility",
				"mental health",
				"general",
			],
		},
		audio_url: {
			type: String,
			required: true,
			trim: true,
			validate: {
				validator: (value) => /^(https?:\/\/|gs:\/\/).+/.test(value),
				message: "audio_url must be a valid http(s) or gs:// URL",
			},
		},
		description: {
			type: String,
			trim: true,
			maxlength: 500,
			default: null,
		},
		status: {
			type: String,
			enum: ["active", "archived"],
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

doctorAdviceSchema.index({ topic: 1, specialization: 1, created_at: -1 });

module.exports = mongoose.model("DoctorAdvice", doctorAdviceSchema);
