const mongoose = require("mongoose");

const aiConversationEntrySchema = new mongoose.Schema(
	{
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
	},
	{
		_id: false,
		timestamps: true,
	}
);

const aiConversationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		history: {
			type: [aiConversationEntrySchema],
			default: [],
		},
		sessionTitle: {
			type: String,
			trim: true,
			default: "",
		},
		isArchived: {
			type: Boolean,
			default: false,
		},
		lastPrompt: {
			type: String,
			trim: true,
			default: "",
		},
		lastSummaryResponse: {
			type: String,
			trim: true,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

aiConversationSchema.pre("save", function updateConversationSummary() {
	if (this.history.length > 0) {
		const latest = this.history[this.history.length - 1];
		this.lastPrompt = latest.prompt;
		this.lastSummaryResponse = latest.summaryResponse;
	}
});

aiConversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("AIConversation", aiConversationSchema);
