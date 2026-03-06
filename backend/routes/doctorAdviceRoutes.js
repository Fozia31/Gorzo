const express = require("express");
const {
	createDoctorAdvice,
	getDoctorAdvice,
	getDoctorAdviceById,
	updateDoctorAdvice,
	deleteDoctorAdvice,
} = require("../controller/doctorAdviceController");

const router = express.Router();

router.post("/", createDoctorAdvice);
router.get("/", getDoctorAdvice);
router.get("/:adviceId", getDoctorAdviceById);
router.put("/:adviceId", updateDoctorAdvice);
router.delete("/:adviceId", deleteDoctorAdvice);

module.exports = router;
