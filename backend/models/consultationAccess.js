const mongoose = require("mongoose");

const consultationAccessSchema = new mongoose.Schema(
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
		paymentTransactionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "PaymentTransaction",
			required: true,
		},
		grantedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

consultationAccessSchema.index({ userId: 1, doctorKey: 1 }, { unique: true });

module.exports = mongoose.model("ConsultationAccess", consultationAccessSchema);
