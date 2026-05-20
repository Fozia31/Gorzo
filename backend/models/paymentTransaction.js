const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		doctorKey: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			trim: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 1,
		},
		status: {
			type: String,
			enum: ["pending", "success", "failed", "cancelled", "timeout"],
			default: "pending",
			index: true,
		},
		externalReference: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		merchantRequestId: {
			type: String,
			default: "",
			index: true,
		},
		checkoutRequestId: {
			type: String,
			default: "",
			index: true,
		},
		resultCode: {
			type: Number,
			default: null,
		},
		resultDescription: {
			type: String,
			default: "",
		},
		providerResponse: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
		callbackPayload: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
	},
	{ timestamps: true }
);

paymentTransactionSchema.index({ userId: 1, doctorKey: 1, createdAt: -1 });

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
