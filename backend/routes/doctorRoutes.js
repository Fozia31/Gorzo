const express = require("express");
const {
	createDoctor,
	getDoctors,
	getDoctorById,
	getDoctorByUserId,
	updateDoctor,
	deleteDoctor,
	getDoctorDashboardSummary,
	getDoctorPatients,
	getDoctorAvailability,
	upsertDoctorAvailability,
	upsertDoctorRating,
	getDoctorRatings,
	getDoctorRatingStats,
} = require("../controller/doctorController");

const router = express.Router();

router.post("/admin/:adminId", createDoctor);
router.post("/:adminId", createDoctor);
router.get("/", getDoctors);
router.get("/:doctorId/dashboard/summary", getDoctorDashboardSummary);
router.get("/:doctorId/patients", getDoctorPatients);
router.get("/:doctorId/availability", getDoctorAvailability);
router.put("/:doctorId/availability", upsertDoctorAvailability);
router.post("/:doctorId/ratings", upsertDoctorRating);
router.get("/:doctorId/ratings", getDoctorRatings);
router.get("/:doctorId/ratings/stats", getDoctorRatingStats);
router.get("/user/:userId", getDoctorByUserId);
router.get("/:doctorId", getDoctorById);
router.put("/:doctorId", updateDoctor);
router.delete("/:doctorId", deleteDoctor);

module.exports = router;
