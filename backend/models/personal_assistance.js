const mongoose = require("mongoose");

const personalAssistanceSchema = new mongoose.Schema(
	{
		question_id: {
			type: String,
			unique: true,
			index: true,
			default: () => new mongoose.Types.ObjectId().toString(),
		},
		display_name: {
			type: String,
			trim: true,
			maxlength: 60,
			default: "Anonymous User",
		},
		category: {
			type: String,
			required: true,
			trim: true,
			enum: [
				"menstrual health",
				"contraception",
				"pregnancy",
				"stis",
				"fertility",
				"mental health",
				"sexual wellness",
				"general",
			],
			default: "general",
		},
		question: {
			type: String,
			required: true,
			trim: true,
			minlength: 5,
			maxlength: 2000,
		},
		response: {
			type: String,
			trim: true,
			maxlength: 3000,
			default:
				"Thank you for your question. This is a demo guidance response from a doctor. Please consult a licensed healthcare professional for personalized medical advice.",
		},
		is_answered: {
			type: Boolean,
			default: false,
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

personalAssistanceSchema.index({ category: 1, is_answered: 1, created_at: -1 });

module.exports = mongoose.model("PersonalAssistance", personalAssistanceSchema);
