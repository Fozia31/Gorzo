const express = require("express");
const {
	initiatePayment,
	paymentCallback,
	getPaymentStatus,
	getConsultationAccess,
} = require("../controller/paymentController");

const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/callback", paymentCallback);
router.get("/:transactionId/status", getPaymentStatus);
router.get("/consultation-access/:doctorId", getConsultationAccess);

module.exports = router;
