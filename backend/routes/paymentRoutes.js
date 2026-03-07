const express = require("express");
const {
  validatePromoCode,
  initiateMpesaPayment,
  getPaymentStatus,
  mpesaCallback,
  checkDoctorAccess,
} = require("../controller/paymentController");

const router = express.Router();

router.post("/promo/validate", validatePromoCode);
router.post("/mpesa/initiate", initiateMpesaPayment);
router.post("/mpesa/callback", mpesaCallback);
router.get("/access", checkDoctorAccess);
router.get("/:paymentId/status", getPaymentStatus);

module.exports = router;
