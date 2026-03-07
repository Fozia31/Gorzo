const mongoose = require("mongoose");

const personalAssistanceSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		prompt: {
			type: String,
			required: true,
			trim: true,
			maxlength: 3000,
		},
		summaryResponse: {
			type: String,
			required: true,
			trim: true,
			maxlength: 5000,
		},
		category: {
			type: String,
			trim: true,
			default: "general",
		},
	},
	{
		timestamps: true,
	}
);

personalAssistanceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("PersonalAssistance", personalAssistanceSchema);
