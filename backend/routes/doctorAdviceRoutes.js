const express = require("express");
const {
	createDoctorAdvice,
	getDoctorAdvice,
	getDoctorAdviceByDoctorId,
	getDoctorAdviceById,
	updateDoctorAdvice,
	deleteDoctorAdvice,
	incrementDoctorAdviceViews,
	upload,
	uploadDoctorAdviceFiles,
	uploadDoctorAdviceAudio,
} = require("../controller/doctorAdviceController");

const router = express.Router();

router.post("/", createDoctorAdvice);
router.post("/upload/files", upload.array("files", 10), uploadDoctorAdviceFiles);
router.post("/upload/audio", upload.single("audio"), uploadDoctorAdviceAudio);
router.get("/", getDoctorAdvice);
router.get("/doctor/:doctorId", getDoctorAdviceByDoctorId);
router.patch("/:adviceId/views", incrementDoctorAdviceViews);
router.get("/:adviceId", getDoctorAdviceById);
router.put("/:adviceId", updateDoctorAdvice);
router.delete("/:adviceId", deleteDoctorAdvice);

module.exports = router;
