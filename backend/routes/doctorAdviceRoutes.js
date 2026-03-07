const express = require("express");
const {
	createDoctorAdvice,
	getDoctorAdvice,
	getDoctorAdviceByDoctorId,
	getDoctorAdviceById,
	updateDoctorAdvice,
	deleteDoctorAdvice,
	incrementDoctorAdviceViews,
} = require("../controller/doctorAdviceController");

const router = express.Router();

router.post("/", createDoctorAdvice);
router.get("/", getDoctorAdvice);
router.get("/doctor/:doctorId", getDoctorAdviceByDoctorId);
router.patch("/:adviceId/views", incrementDoctorAdviceViews);
router.get("/:adviceId", getDoctorAdviceById);
router.put("/:adviceId", updateDoctorAdvice);
router.delete("/:adviceId", deleteDoctorAdvice);

module.exports = router;
