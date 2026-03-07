const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["MPESA"],
      default: "MPESA",
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "ETB",
      trim: true,
    },
    promoCode: {
      type: String,
      trim: true,
      default: null,
    },
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    checkoutRequestId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    merchantRequestId: {
      type: String,
      trim: true,
      default: null,
    },
    transactionId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    providerReference: {
      type: String,
      trim: true,
      default: null,
    },
    failureReason: {
      type: String,
      trim: true,
      default: null,
    },
    callbackPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    providerPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    mockCompleteAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ userId: 1, doctorId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
