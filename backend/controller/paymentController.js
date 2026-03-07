const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");
const Payment = require("../models/payment");
const PromoCode = require("../models/promoCode");
const User = require("../models/user");
const Doctor = require("../models/doctors");
const { initiateStkPush, isMockEnabled, normalizePhoneToE164 } = require("../utiles/mpesaClient");

const DEFAULT_CONSULTATION_FEE = Number(process.env.DEFAULT_CONSULTATION_FEE || 299);

const buildSummary = (payment) => ({
  paymentId: String(payment._id),
  status: payment.status,
  amount: payment.totalAmount,
  baseAmount: payment.baseAmount,
  discountAmount: payment.discountAmount,
  currency: payment.currency,
  promoCode: payment.promoCode,
  transactionId: payment.transactionId,
  checkoutRequestId: payment.checkoutRequestId,
  phoneNumber: payment.phoneNumber,
  failureReason: payment.failureReason,
  completedAt: payment.completedAt,
  expiresAt: payment.expiresAt,
});

const getPromoDiscount = async ({ code, amount, userId, doctorId }) => {
  if (!code) {
    return {
      promo: null,
      discountAmount: 0,
      finalAmount: amount,
      reason: null,
    };
  }

  const normalizedCode = String(code || "").trim().toUpperCase();
  const promo = await PromoCode.findOne({ code: normalizedCode });

  if (!promo) throw new ApiError(404, "Promo code not found");
  if (!promo.active) throw new ApiError(400, "Promo code is inactive");

  const now = new Date();
  if (promo.startsAt && promo.startsAt > now) throw new ApiError(400, "Promo code is not active yet");
  if (promo.expiresAt && promo.expiresAt < now) throw new ApiError(400, "Promo code has expired");

  if (promo.doctorId && String(promo.doctorId) !== String(doctorId)) {
    throw new ApiError(400, "Promo code is not valid for this doctor");
  }

  if (Array.isArray(promo.allowedUserIds) && promo.allowedUserIds.length > 0) {
    const isAllowed = promo.allowedUserIds.some((id) => String(id) === String(userId));
    if (!isAllowed) throw new ApiError(400, "Promo code is not valid for this user");
  }

  if (promo.minOrderAmount && amount < Number(promo.minOrderAmount)) {
    throw new ApiError(400, `Minimum amount for this promo is ${promo.minOrderAmount} ETB`);
  }

  if (promo.usageLimit !== null && promo.usageLimit !== undefined && promo.usedCount >= promo.usageLimit) {
    throw new ApiError(400, "Promo usage limit reached");
  }

  if (promo.usagePerUserLimit !== null && promo.usagePerUserLimit !== undefined) {
    const perUserUsed = await Payment.countDocuments({
      userId,
      promoCodeId: promo._id,
      status: "SUCCESS",
    });
    if (perUserUsed >= promo.usagePerUserLimit) {
      throw new ApiError(400, "You have already used this promo code the maximum allowed times");
    }
  }

  let discountAmount = 0;
  if (promo.discountType === "PERCENT") {
    discountAmount = (amount * Number(promo.discountValue || 0)) / 100;
    if (promo.maxDiscountAmount !== null && promo.maxDiscountAmount !== undefined) {
      discountAmount = Math.min(discountAmount, Number(promo.maxDiscountAmount));
    }
  } else {
    discountAmount = Number(promo.discountValue || 0);
  }

  discountAmount = Math.max(0, Math.min(amount, Math.round(discountAmount * 100) / 100));
  const finalAmount = Math.max(0, Math.round((amount - discountAmount) * 100) / 100);

  return {
    promo,
    discountAmount,
    finalAmount,
    reason: null,
  };
};

const markPaymentSuccess = async (payment, transactionId, providerReference, callbackPayload) => {
  payment.status = "SUCCESS";
  payment.transactionId = transactionId || payment.transactionId || `MP${Date.now()}`;
  payment.providerReference = providerReference || payment.providerReference;
  payment.callbackPayload = callbackPayload || payment.callbackPayload;
  payment.completedAt = new Date();
  payment.failureReason = null;
  payment.mockCompleteAt = null;
  await payment.save();

  if (payment.promoCodeId) {
    await PromoCode.findByIdAndUpdate(payment.promoCodeId, { $inc: { usedCount: 1 } });
  }

  await User.findByIdAndUpdate(payment.userId, { isPremium: true });
};

const syncMockStatusIfNeeded = async (payment) => {
  if (!payment || payment.status !== "PENDING") return payment;
  if (!isMockEnabled()) return payment;
  if (!payment.mockCompleteAt) return payment;
  if (payment.mockCompleteAt > new Date()) return payment;

  await markPaymentSuccess(
    payment,
    payment.transactionId || `MP${Date.now()}`,
    "MOCK_PROVIDER",
    { source: "mock-auto-complete" }
  );

  return payment;
};

const validatePromoCode = asyncHandler(async (req, res) => {
  ensureRequiredFields(req.body, ["code"]);
  const amount = Number(req.body.amount || DEFAULT_CONSULTATION_FEE);
  if (Number.isNaN(amount) || amount <= 0) throw new ApiError(400, "Invalid amount");

  const userId = req.body.userId;
  const doctorId = req.body.doctorId;

  if (userId) ensureValidObjectId(userId, "userId");
  if (doctorId) ensureValidObjectId(doctorId, "doctorId");

  const promoResult = await getPromoDiscount({
    code: req.body.code,
    amount,
    userId,
    doctorId,
  });

  return res.status(200).json({
    success: true,
    data: {
      code: promoResult.promo?.code || null,
      discountType: promoResult.promo?.discountType || null,
      discountValue: promoResult.promo?.discountValue || 0,
      discountAmount: promoResult.discountAmount,
      finalAmount: promoResult.finalAmount,
      baseAmount: amount,
      currency: "ETB",
    },
  });
});

const initiateMpesaPayment = asyncHandler(async (req, res) => {
  ensureRequiredFields(req.body, ["userId", "doctorId", "phoneNumber"]);

  const { userId, doctorId, phoneNumber, promoCode } = req.body;
  ensureValidObjectId(userId, "userId");
  ensureValidObjectId(doctorId, "doctorId");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const normalizedPhone = normalizePhoneToE164(phoneNumber);
  if (!normalizedPhone) throw new ApiError(400, "Invalid Ethiopian phone number");

  const requestedAmount = Number(req.body.amount || DEFAULT_CONSULTATION_FEE);
  if (Number.isNaN(requestedAmount) || requestedAmount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  const promoResult = await getPromoDiscount({
    code: promoCode,
    amount: requestedAmount,
    userId,
    doctorId,
  });

  const payment = await Payment.create({
    userId,
    doctorId,
    phoneNumber: normalizedPhone,
    baseAmount: requestedAmount,
    discountAmount: promoResult.discountAmount,
    totalAmount: promoResult.finalAmount,
    promoCode: promoResult.promo?.code || null,
    promoCodeId: promoResult.promo?._id || null,
    status: "PENDING",
    expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  });

  try {
    const mpesaResponse = await initiateStkPush({
      amount: promoResult.finalAmount,
      phoneNumber: normalizedPhone,
      reference: `CONSULT-${String(payment._id).slice(-6).toUpperCase()}`,
      description: "Doctor consultation payment",
    });

    payment.checkoutRequestId = mpesaResponse.checkoutRequestId;
    payment.merchantRequestId = mpesaResponse.merchantRequestId;
    payment.providerPayload = mpesaResponse.raw;

    if (isMockEnabled()) {
      payment.mockCompleteAt = new Date(Date.now() + 10 * 1000);
    }

    await payment.save();

    return res.status(201).json({
      success: true,
      message: mpesaResponse.customerMessage || "M-Pesa request sent",
      data: {
        paymentId: String(payment._id),
        checkoutRequestId: payment.checkoutRequestId,
        status: payment.status,
        amount: payment.totalAmount,
        discountAmount: payment.discountAmount,
        currency: payment.currency,
        phoneNumber: payment.phoneNumber,
      },
    });
  } catch (error) {
    payment.status = "FAILED";
    payment.failureReason = error.message || "Failed to initiate payment";
    await payment.save();
    throw error;
  }
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const paymentId = req.params.paymentId;
  ensureValidObjectId(paymentId, "paymentId");

  let payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, "Payment not found");

  payment = await syncMockStatusIfNeeded(payment);
  if (payment.status === "PENDING" && payment.expiresAt && payment.expiresAt < new Date()) {
    payment.status = "EXPIRED";
    payment.failureReason = "Payment request expired";
    payment.mockCompleteAt = null;
    await payment.save();
  }

  return res.status(200).json({
    success: true,
    data: buildSummary(payment),
  });
});

const mpesaCallback = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const body = payload?.Body?.stkCallback || payload?.stkCallback || payload;
  const checkoutRequestId = body?.CheckoutRequestID || body?.checkoutRequestId;

  if (!checkoutRequestId) {
    return res.status(200).json({ success: true, message: "Callback ignored: missing CheckoutRequestID" });
  }

  const payment = await Payment.findOne({ checkoutRequestId });
  if (!payment) {
    return res.status(200).json({ success: true, message: "Callback received for unknown payment" });
  }

  const resultCode = Number(body?.ResultCode || body?.resultCode || 1);
  const resultDesc = body?.ResultDesc || body?.resultDesc || "Payment failed";

  if (resultCode === 0) {
    const metadata = body?.CallbackMetadata?.Item || body?.callbackMetadata?.item || [];
    const receiptItem = metadata.find((item) => item?.Name === "MpesaReceiptNumber" || item?.name === "MpesaReceiptNumber");
    const receiptNumber = receiptItem?.Value || receiptItem?.value || `MP${Date.now()}`;

    await markPaymentSuccess(payment, receiptNumber, "MPESA_CALLBACK", payload);
  } else {
    payment.status = "FAILED";
    payment.failureReason = resultDesc;
    payment.callbackPayload = payload;
    payment.mockCompleteAt = null;
    await payment.save();
  }

  return res.status(200).json({ success: true, message: "Callback processed" });
});

const checkDoctorAccess = asyncHandler(async (req, res) => {
  const { userId, doctorId } = req.query;
  ensureRequiredFields(req.query, ["userId", "doctorId"]);
  ensureValidObjectId(userId, "userId");
  ensureValidObjectId(doctorId, "doctorId");

  const paid = await Payment.findOne({
    userId,
    doctorId,
    status: "SUCCESS",
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: {
      hasAccess: Boolean(paid),
      paymentId: paid ? String(paid._id) : null,
      transactionId: paid?.transactionId || null,
      paidAt: paid?.completedAt || null,
      amount: paid?.totalAmount || null,
      currency: paid?.currency || "ETB",
    },
  });
});

module.exports = {
  validatePromoCode,
  initiateMpesaPayment,
  getPaymentStatus,
  mpesaCallback,
  checkDoctorAccess,
};
