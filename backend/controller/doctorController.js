const Doctor = require("../models/doctors");
const Admin = require("../models/admin");
const User = require("../models/user");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createDoctor = asyncHandler(async (req, res) => {
	const adminId = req.params.adminId || req.body.adminId;
	if (!adminId) {
		throw new ApiError(400, "adminId is required in route params");
	}
	ensureValidObjectId(adminId, "adminId");
	ensureRequiredFields(req.body, ["displayName", "email", "password", "specialization"]);

	const admin = await Admin.findById(adminId);
	if (!admin) throw new ApiError(404, "Admin not found. Only admins can create doctors");

	const existingUser = await User.findOne({ email: req.body.email.toLowerCase().trim() });
	if (existingUser) throw new ApiError(409, "A user with this email already exists");

	const doctorUser = await User.create({
		displayName: req.body.displayName,
		email: req.body.email,
		password: req.body.password,
		role: "Doctor",
		isPremium: false,
	});

	const doctor = await Doctor.create({
		userId: doctorUser._id,
		specialization: req.body.specialization,
		verificationStatus: req.body.verificationStatus || "Pending",
		createdByAdminId: admin._id,
		bio: req.body.bio || "",
	});

	await Admin.findByIdAndUpdate(admin._id, { $inc: { createdDoctorsCount: 1 } });

	return res.status(201).json({ success: true, message: "Doctor onboarded by admin", data: { user: doctorUser, doctor } });
});

const getDoctors = asyncHandler(async (req, res) => {
	const page = Math.max(Number(req.query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
	const skip = (page - 1) * limit;
	const filter = {};
	if (req.query.specialization) filter.specialization = req.query.specialization;
	if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;

	const [items, total] = await Promise.all([
		Doctor.find(filter)
			.populate("userId")
			.populate({ path: "createdByAdminId", populate: { path: "userId" } })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit),
		Doctor.countDocuments(filter),
	]);

	return res.status(200).json({
		success: true,
		data: items,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
});

const getDoctorById = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");
	const doctor = await Doctor.findById(doctorId)
		.populate("userId")
		.populate({ path: "createdByAdminId", populate: { path: "userId" } });
	if (!doctor) throw new ApiError(404, "Doctor not found");
	return res.status(200).json({ success: true, data: doctor });
});

const updateDoctor = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");
	const allowed = ["specialization", "verificationStatus", "bio"];
	const payload = {};
	for (const field of allowed) {
		if (req.body[field] !== undefined) payload[field] = req.body[field];
	}
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const doctor = await Doctor.findByIdAndUpdate(doctorId, payload, {
		new: true,
		runValidators: true,
	}).populate("userId");
	if (!doctor) throw new ApiError(404, "Doctor not found");
	return res.status(200).json({ success: true, message: "Doctor updated", data: doctor });
});

const deleteDoctor = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");
	const doctor = await Doctor.findByIdAndDelete(doctorId);
	if (!doctor) throw new ApiError(404, "Doctor not found");
	await User.findByIdAndDelete(doctor.userId);
	return res.status(200).json({ success: true, message: "Doctor deleted" });
});

module.exports = {
	createDoctor,
	getDoctors,
	getDoctorById,
	updateDoctor,
	deleteDoctor,
};
