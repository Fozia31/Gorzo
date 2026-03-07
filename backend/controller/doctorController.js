const Doctor = require("../models/doctors");
const Admin = require("../models/admin");
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const DoctorAdvice = require("../models/doctor_advices");
const DoctorRating = require("../models/doctor_ratings");
const mongoose = require("mongoose");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const normalizeAvailability = (rawAvailability) => {
	if (!rawAvailability) return [];

	let entries = [];
	if (Array.isArray(rawAvailability)) {
		entries = rawAvailability;
	} else if (typeof rawAvailability === "object") {
		entries = Object.keys(rawAvailability).map((day) => ({ day, ...(rawAvailability[day] || {}) }));
	}

	const normalized = entries.map((entry) => {
		const day = String(entry.day || "").trim();
		if (!DAYS_ORDER.includes(day)) {
			throw new ApiError(400, `Invalid availability day: ${day}`);
		}

		const enabled = Boolean(entry.enabled);
		const slots = Array.isArray(entry.slots)
			? entry.slots.map((slot) => {
				if (!slot || !slot.start || !slot.end) {
					throw new ApiError(400, `Invalid slot for ${day}. start and end are required`);
				}
				return {
					start: String(slot.start).trim(),
					end: String(slot.end).trim(),
				};
			})
			: [];

		return { day, enabled, slots };
	});

	normalized.sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day));
	return normalized;
};

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

const getDoctorByUserId = asyncHandler(async (req, res) => {
	const userId = req.params.userId;
	ensureValidObjectId(userId, "user id");

	const doctor = await Doctor.findOne({ userId })
		.populate("userId")
		.populate({ path: "createdByAdminId", populate: { path: "userId" } });

	if (!doctor) throw new ApiError(404, "Doctor not found for this user");
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

const getDoctorDashboardSummary = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");

	const doctor = await Doctor.findById(doctorId);
	if (!doctor) throw new ApiError(404, "Doctor not found");

	const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

	const [patientCountResult, unreadResult, articlesCount, ratingResult] = await Promise.all([
		Chat.aggregate([
			{ $match: { doctorId: doctorObjectId } },
			{ $group: { _id: "$userId" } },
			{ $count: "total" },
		]),
		Message.aggregate([
			{
				$lookup: {
					from: "chats",
					localField: "chatId",
					foreignField: "_id",
					as: "chat",
				},
			},
			{ $unwind: "$chat" },
			{ $match: { "chat.doctorId": doctorObjectId, isRead: false, senderRole: "User" } },
			{ $count: "total" },
		]),
		DoctorAdvice.countDocuments({ doctorId: doctorObjectId, status: "published" }),
		DoctorRating.aggregate([
			{ $match: { doctorId: doctorObjectId } },
			{ $group: { _id: null, average: { $avg: "$rating" }, total: { $sum: 1 } } },
		]),
	]);

	return res.status(200).json({
		success: true,
		data: {
			patients: patientCountResult[0]?.total || 0,
			unreadMessages: unreadResult[0]?.total || 0,
			publishedArticles: articlesCount,
			rating: {
				average: Number((ratingResult[0]?.average || 0).toFixed(1)),
				total: ratingResult[0]?.total || 0,
			},
		},
	});
});

const getDoctorPatients = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");

	const page = Math.max(Number(req.query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
	const search = String(req.query.search || "").trim().toLowerCase();

	const chats = await Chat.find({ doctorId })
		.populate("userId", "displayName isPremium createdAt")
		.sort({ createdAt: -1 })
		.lean();

	if (chats.length === 0) {
		return res.status(200).json({
			success: true,
			data: [],
			pagination: { page, limit, total: 0, totalPages: 0 },
		});
	}

	const chatIds = chats.map((chat) => chat._id);
	const [lastMessageByChat, unreadByChat] = await Promise.all([
		Message.aggregate([
			{ $match: { chatId: { $in: chatIds } } },
			{ $sort: { createdAt: -1 } },
			{ $group: { _id: "$chatId", lastMessageAt: { $first: "$createdAt" } } },
		]),
		Message.aggregate([
			{ $match: { chatId: { $in: chatIds }, isRead: false, senderRole: "User" } },
			{ $group: { _id: "$chatId", unread: { $sum: 1 } } },
		]),
	]);

	const lastMessageMap = new Map(lastMessageByChat.map((item) => [String(item._id), item.lastMessageAt]));
	const unreadMap = new Map(unreadByChat.map((item) => [String(item._id), item.unread]));
	const patientMap = new Map();

	for (const chat of chats) {
		if (!chat.userId) continue;
		const userId = String(chat.userId._id);
		const lastMessageAt = lastMessageMap.get(String(chat._id));
		const unread = unreadMap.get(String(chat._id)) || 0;
		const lastVisitTime = lastMessageAt || chat.updatedAt || chat.createdAt;

		if (!patientMap.has(userId)) {
			patientMap.set(userId, {
				id: userId,
				username: chat.userId.displayName,
				tier: chat.userId.isPremium ? "premium" : "free",
				consultations: 0,
				unreadMessages: 0,
				lastVisitAt: lastVisitTime,
				joinedDate: chat.userId.createdAt,
			});
		}

		const item = patientMap.get(userId);
		item.consultations += 1;
		item.unreadMessages += unread;
		if (!item.lastVisitAt || new Date(lastVisitTime) > new Date(item.lastVisitAt)) {
			item.lastVisitAt = lastVisitTime;
		}
	}

	let patients = Array.from(patientMap.values()).map((item) => {
		const lastVisitDate = new Date(item.lastVisitAt || item.joinedDate || Date.now());
		const status = Date.now() - lastVisitDate.getTime() <= 7 * 24 * 60 * 60 * 1000 ? "active" : "inactive";
		return { ...item, status };
	});

	if (search) {
		patients = patients.filter((item) => item.username.toLowerCase().includes(search));
	}

	patients.sort((a, b) => new Date(b.lastVisitAt) - new Date(a.lastVisitAt));
	const total = patients.length;
	const start = (page - 1) * limit;
	const data = patients.slice(start, start + limit);

	return res.status(200).json({
		success: true,
		data,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
});

const getDoctorAvailability = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");

	const doctor = await Doctor.findById(doctorId).select("availability");
	if (!doctor) throw new ApiError(404, "Doctor not found");

	return res.status(200).json({ success: true, data: doctor.availability || [] });
});

const upsertDoctorAvailability = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");
	ensureRequiredFields(req.body, ["availability"]);

	const availability = normalizeAvailability(req.body.availability);

	const doctor = await Doctor.findByIdAndUpdate(
		doctorId,
		{ $set: { availability } },
		{ new: true, runValidators: true }
	).select("availability");

	if (!doctor) throw new ApiError(404, "Doctor not found");

	return res.status(200).json({
		success: true,
		message: "Availability updated",
		data: doctor.availability,
	});
});

const upsertDoctorRating = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");
	ensureRequiredFields(req.body, ["userId", "rating"]);
	ensureValidObjectId(req.body.userId, "userId");

	const doctor = await Doctor.findById(doctorId).select("_id");
	if (!doctor) throw new ApiError(404, "Doctor not found");

	const rating = await DoctorRating.findOneAndUpdate(
		{ doctorId, userId: req.body.userId },
		{
			$set: {
				rating: req.body.rating,
				comment: req.body.comment || "",
				anonymous: Boolean(req.body.anonymous),
			},
		},
		{ upsert: true, new: true, runValidators: true }
	);

	return res.status(200).json({ success: true, message: "Rating submitted", data: rating });
});

const getDoctorRatings = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");

	const page = Math.max(Number(req.query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
	const skip = (page - 1) * limit;

	const [items, total] = await Promise.all([
		DoctorRating.find({ doctorId })
			.populate("userId", "displayName")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		DoctorRating.countDocuments({ doctorId }),
	]);

	const data = items.map((item) => ({
		id: item._id,
		rating: item.rating,
		comment: item.comment,
		anonymous: item.anonymous,
		user: item.anonymous ? "Anonymous User" : item.userId?.displayName || "Unknown User",
		date: item.createdAt,
	}));

	return res.status(200).json({
		success: true,
		data,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
});

const getDoctorRatingStats = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId || req.params.id;
	ensureValidObjectId(doctorId, "doctor id");

	const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
	const now = new Date();
	const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

	const [aggregateStats, distributionRaw, thisMonth, lastMonth] = await Promise.all([
		DoctorRating.aggregate([
			{ $match: { doctorId: doctorObjectId } },
			{ $group: { _id: null, average: { $avg: "$rating" }, total: { $sum: 1 } } },
		]),
		DoctorRating.aggregate([
			{ $match: { doctorId: doctorObjectId } },
			{ $group: { _id: "$rating", count: { $sum: 1 } } },
		]),
		DoctorRating.countDocuments({ doctorId, createdAt: { $gte: thisMonthStart } }),
		DoctorRating.countDocuments({ doctorId, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
	]);

	const total = aggregateStats[0]?.total || 0;
	const byStars = new Map(distributionRaw.map((item) => [item._id, item.count]));
	const distribution = [5, 4, 3, 2, 1].map((stars) => {
		const count = byStars.get(stars) || 0;
		return {
			stars,
			count,
			percentage: total === 0 ? 0 : Math.round((count / total) * 100),
		};
	});

	return res.status(200).json({
		success: true,
		data: {
			average: Number((aggregateStats[0]?.average || 0).toFixed(1)),
			total,
			distribution,
			thisMonth,
			lastMonth,
		},
	});
});

module.exports = {
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
};
