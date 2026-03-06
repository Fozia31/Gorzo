const express = require("express");
const {
	createDoctorAdvice,
	getDoctorAdvice,
} = require("../controller/doctorAdviceController");

const router = express.Router();

router.post("/", createDoctorAdvice);
router.get("/", getDoctorAdvice);

module.exports = router;
