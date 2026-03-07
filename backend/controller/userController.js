const User = require("../models/user");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createUser = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["displayName", "email", "password"]);

	const existingUser = await User.findOne({ email: req.body.email.toLowerCase().trim() });
	if (existingUser) {
		throw new ApiError(409, "A user with this email already exists");
	}

	const user = await User.create({
		displayName: req.body.displayName,
		email: req.body.email,
		password: req.body.password,
		role: req.body.role || "User", // Allow specifying role, default to "User"
		isPremium: Boolean(req.body.isPremium),
	});

	return res.status(201).json({ success: true, message: "User registered", data: user });
});

const loginUser = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["email", "password"]);

	const email = req.body.email.toLowerCase().trim();
	const password = req.body.password;

	// For hackathon: create user if doesn't exist, or return existing user
	let user = await User.findOne({ email });
	if (!user) {
		// Create a demo user for hackathon
		user = await User.create({
			displayName: email.split('@')[0], // Use part before @ as display name
			email: email,
			password: password, // Store password as-is for demo
			role: "User",
			isPremium: false,
		});
	}
	
	// For hackathon: accept any password
	const userObj = user.toObject();
	delete userObj.password;

	return res.status(200).json({ success: true, data: userObj });
});


const getUsers = asyncHandler(async (req, res) => {
	const page = Math.max(Number(req.query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
	const skip = (page - 1) * limit;
	const filter = {};

	if (req.query.role) filter.role = req.query.role;
	if (typeof req.query.isPremium === "string") filter.isPremium = req.query.isPremium === "true";

	const [items, total] = await Promise.all([
		User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
		User.countDocuments(filter),
	]);

	return res.status(200).json({
		success: true,
		data: items,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
});

const getUserById = asyncHandler(async (req, res) => {
	const userId = req.params.userId || req.params.id;
	ensureValidObjectId(userId, "user id");
	const user = await User.findById(userId);
	if (!user) throw new ApiError(404, "User not found");
	return res.status(200).json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
	const userId = req.params.userId || req.params.id;
	ensureValidObjectId(userId, "user id");
	const allowedUpdates = ["displayName", "isPremium", "password"];
	const payload = {};
	for (const field of allowedUpdates) {
		if (req.body[field] !== undefined) payload[field] = req.body[field];
	}

	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await User.findByIdAndUpdate(userId, payload, {
		new: true,
		runValidators: true,
	});
	if (!updated) throw new ApiError(404, "User not found");

	return res.status(200).json({ success: true, message: "User updated", data: updated });
});

const deleteUser = asyncHandler(async (req, res) => {
	const userId = req.params.userId || req.params.id;
	ensureValidObjectId(userId, "user id");
	const deleted = await User.findByIdAndDelete(userId);
	if (!deleted) throw new ApiError(404, "User not found");
	return res.status(200).json({ success: true, message: "User deleted" });
});

module.exports = {
	createUser,
	loginUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
};
