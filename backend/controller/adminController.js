const Admin = require("../models/admin");
const User = require("../models/user");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createAdmin = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["displayName", "email", "password"]);

	const existingUser = await User.findOne({ email: req.body.email.toLowerCase().trim() });
	if (existingUser) throw new ApiError(409, "A user with this email already exists");

	const user = await User.create({
		displayName: req.body.displayName,
		email: req.body.email,
		password: req.body.password,
		role: "Admin",
		isPremium: false,
	});

	const admin = await Admin.create({
		userId: user._id,
		department: req.body.department || "",
	});

	return res.status(201).json({ success: true, message: "Admin created", data: { user, admin } });
});

const getAdmins = asyncHandler(async (req, res) => {
	const page = Math.max(Number(req.query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
	const skip = (page - 1) * limit;

	const [items, total] = await Promise.all([
		Admin.find().populate("userId").sort({ createdAt: -1 }).skip(skip).limit(limit),
		Admin.countDocuments(),
	]);

	return res.status(200).json({
		success: true,
		data: items,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
});

const getAdminById = asyncHandler(async (req, res) => {
	const adminId = req.params.adminId || req.params.id;
	ensureValidObjectId(adminId, "admin id");
	const admin = await Admin.findById(adminId).populate("userId");
	if (!admin) throw new ApiError(404, "Admin not found");
	return res.status(200).json({ success: true, data: admin });
});

const updateAdmin = asyncHandler(async (req, res) => {
	const adminId = req.params.adminId || req.params.id;
	ensureValidObjectId(adminId, "admin id");
	const payload = {};
	if (req.body.department !== undefined) payload.department = req.body.department;
	if (req.body.createdDoctorsCount !== undefined) payload.createdDoctorsCount = req.body.createdDoctorsCount;
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await Admin.findByIdAndUpdate(adminId, payload, {
		new: true,
		runValidators: true,
	}).populate("userId");
	if (!updated) throw new ApiError(404, "Admin not found");

	return res.status(200).json({ success: true, message: "Admin updated", data: updated });
});

const deleteAdmin = asyncHandler(async (req, res) => {
	const adminId = req.params.adminId || req.params.id;
	ensureValidObjectId(adminId, "admin id");
	const admin = await Admin.findByIdAndDelete(adminId);
	if (!admin) throw new ApiError(404, "Admin not found");
	await User.findByIdAndDelete(admin.userId);
	return res.status(200).json({ success: true, message: "Admin deleted" });
});

module.exports = {
	createAdmin,
	getAdmins,
	getAdminById,
	updateAdmin,
	deleteAdmin,
};
