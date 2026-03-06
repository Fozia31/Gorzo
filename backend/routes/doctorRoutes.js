const express = require("express");
const {
	createDoctor,
	getDoctors,
	getDoctorById,
	updateDoctor,
	deleteDoctor,
} = require("../controller/doctorController");

const router = express.Router();

router.post("/", createDoctor);
router.get("/", getDoctors);
router.get("/:doctorId", getDoctorById);
router.put("/:doctorId", updateDoctor);
router.delete("/:doctorId", deleteDoctor);

module.exports = router;
