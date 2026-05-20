const mongoose = require("mongoose");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");
const PaymentTransaction = require("../models/paymentTransaction");
const ConsultationAccess = require("../models/consultationAccess");
const {
	normalizePhoneNumber,
	generateExternalReference,
	initiateStkPush,
	parseCallbackPayload,
} = require("../services/paymentService");

const grantConsultationAccess = async ({ userId, doctorKey, paymentTransactionId }) => {
	await ConsultationAccess.findOneAndUpdate(
		{ userId, doctorKey },
		{
			$set: {
				paymentTransactionId,
				grantedAt: new Date(),
			},
		},
		{ upsert: true, new: true, setDefaultsOnInsert: true }
	);
};

const finalizeMockPaymentAsync = (transactionId) => {
	setTimeout(async () => {
		try {
			const tx = await PaymentTransaction.findById(transactionId);
			if (!tx || tx.status !== "pending") return;
			tx.status = "success";
			tx.resultCode = 0;
			tx.resultDescription = "Mock payment success";
			await tx.save();
			await grantConsultationAccess({
				userId: tx.userId,
				doctorKey: tx.doctorKey,
				paymentTransactionId: tx._id,
			});
		} catch (error) {
			console.error("Failed to finalize mock payment:", error.message);
		}
	}, 3500);
};

const initiatePayment = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId", "doctorId", "phoneNumber", "amount"]);
	ensureValidObjectId(req.body.userId, "user id");

	const userId = req.body.userId;
	const doctorKey = String(req.body.doctorId).trim();
	const amount = Number(req.body.amount);
	const phoneNumber = normalizePhoneNumber(req.body.phoneNumber);

	if (!doctorKey) throw new ApiError(400, "Invalid doctor id");
	if (!Number.isFinite(amount) || amount <= 0) throw new ApiError(400, "Invalid amount");
	if (!phoneNumber) throw new ApiError(400, "Invalid Ethiopian phone number");

	const externalReference = generateExternalReference();
	const tx = await PaymentTransaction.create({
		userId,
		doctorKey,
		phoneNumber,
		amount,
		externalReference,
		status: "pending",
	});

	const mockMode = String(process.env.MPESA_MOCK_MODE || "").toLowerCase() === "true";
	if (mockMode) {
		finalizeMockPaymentAsync(tx._id);
		return res.status(202).json({
			success: true,
			message: "Mock payment initiated",
			data: {
				transactionId: tx._id,
				status: tx.status,
				externalReference: tx.externalReference,
				phoneNumber: tx.phoneNumber,
				isMock: true,
			},
		});
	}

	try {
		const { requestPayload, responsePayload } = await initiateStkPush({
			amount,
			phoneNumber,
			externalReference,
		});

		tx.providerResponse = {
			requestPayload,
			responsePayload,
		};
		tx.merchantRequestId =
			responsePayload.MerchantRequestID || responsePayload.MerchantRequestId || "";
		tx.checkoutRequestId =
			responsePayload.CheckoutRequestID || responsePayload.CheckoutRequestId || "";
		await tx.save();

		return res.status(202).json({
			success: true,
			message: "Payment initiated",
			data: {
				transactionId: tx._id,
				status: tx.status,
				externalReference: tx.externalReference,
				checkoutRequestId: tx.checkoutRequestId,
				merchantRequestId: tx.merchantRequestId,
				phoneNumber: tx.phoneNumber,
			},
		});
	} catch (error) {
		tx.status = "failed";
		tx.resultCode = -1;
		tx.resultDescription = error.message;
		await tx.save();
		throw new ApiError(502, error.message);
	}
});

const paymentCallback = asyncHandler(async (req, res) => {
	const callbackPayload = req.body || {};
	const parsed = parseCallbackPayload(callbackPayload);

	let tx = null;
	if (parsed.checkoutRequestId) {
		tx = await PaymentTransaction.findOne({ checkoutRequestId: parsed.checkoutRequestId });
	}
	if (!tx && parsed.merchantRequestId) {
		tx = await PaymentTransaction.findOne({ merchantRequestId: parsed.merchantRequestId });
	}

	if (!tx) {
		return res.status(200).json({ success: true, message: "Callback accepted, transaction not found" });
	}

	tx.callbackPayload = callbackPayload;
	tx.resultCode = Number.isNaN(parsed.resultCode) ? -1 : parsed.resultCode;
	tx.resultDescription = parsed.resultDescription;

	if (parsed.resultCode === 0) {
		tx.status = "success";
	} else if (parsed.resultCode === 1032) {
		tx.status = "cancelled";
	} else if (parsed.resultCode === 1037) {
		tx.status = "timeout";
	} else {
		tx.status = "failed";
	}

	await tx.save();

	if (tx.status === "success") {
		await grantConsultationAccess({
			userId: tx.userId,
			doctorKey: tx.doctorKey,
			paymentTransactionId: tx._id,
		});
	}

	return res.status(200).json({ success: true, message: "Callback processed" });
});

const getPaymentStatus = asyncHandler(async (req, res) => {
	const transactionId = req.params.transactionId;
	if (!mongoose.Types.ObjectId.isValid(transactionId)) {
		throw new ApiError(400, "Invalid transaction id");
	}

	const tx = await PaymentTransaction.findById(transactionId);
	if (!tx) throw new ApiError(404, "Transaction not found");

	return res.status(200).json({
		success: true,
		data: {
			transactionId: tx._id,
			status: tx.status,
			resultCode: tx.resultCode,
			resultDescription: tx.resultDescription,
			doctorId: tx.doctorKey,
			amount: tx.amount,
			phoneNumber: tx.phoneNumber,
			updatedAt: tx.updatedAt,
		},
	});
});

const getConsultationAccess = asyncHandler(async (req, res) => {
	const userId = req.query.userId;
	const doctorKey = String(req.params.doctorId || "").trim();
	ensureRequiredFields({ userId, doctorId: doctorKey }, ["userId", "doctorId"]);
	ensureValidObjectId(userId, "user id");

	const access = await ConsultationAccess.findOne({ userId, doctorKey });
	return res.status(200).json({
		success: true,
		data: {
			hasAccess: Boolean(access),
			doctorId: doctorKey,
			grantedAt: access?.grantedAt || null,
		},
	});
});

module.exports = {
	initiatePayment,
	paymentCallback,
	getPaymentStatus,
	getConsultationAccess,
};
