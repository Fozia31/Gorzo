const DoctorAdvice = require("../models/doctor_advices");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createDoctorAdvice = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["doctorId", "title", "category", "contentType"]);
	ensureValidObjectId(req.body.doctorId, "doctorId");

	const contentType = req.body.contentType;
	const textContent = req.body.textContent || "";
	const voiceUrl = req.body.voiceUrl || "";

	if (!["Text", "VoiceURL", "Mixed"].includes(contentType)) {
		throw new ApiError(400, "contentType must be Text, VoiceURL, or Mixed");
	}
	if (contentType === "Text" && !textContent) {
		throw new ApiError(400, "textContent is required for Text contentType");
	}
	if (contentType === "VoiceURL" && !voiceUrl) {
		throw new ApiError(400, "voiceUrl is required for VoiceURL contentType");
	}
	if (contentType === "Mixed" && !textContent && !voiceUrl) {
		throw new ApiError(400, "Either textContent or voiceUrl is required for Mixed contentType");
	}

	const status = req.body.status || (req.body.isPublished === false ? "draft" : "published");

	const payload = {
		doctorId: req.body.doctorId,
		title: req.body.title,
		category: req.body.category,
		contentType,
		textContent,
		voiceUrl,
		audioDuration: req.body.audioDuration || 0,
		transcript: req.body.transcript || "",
		summary: req.body.summary || "",
		status,
		isPublished: status === "published",
		viewsCount: req.body.viewsCount || 0,
	};

	const item = await DoctorAdvice.create(payload);
	return res.status(201).json({ success: true, message: "Article/Lesson created", data: item });
});

const getDoctorAdvice = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.doctorId) {
		ensureValidObjectId(req.query.doctorId, "doctorId");
		filter.doctorId = req.query.doctorId;
	}
	if (req.query.category) filter.category = req.query.category;
	if (req.query.contentType) filter.contentType = req.query.contentType;
	if (req.query.status) filter.status = req.query.status;
	if (typeof req.query.isPublished === "string") filter.isPublished = req.query.isPublished === "true";

	const items = await DoctorAdvice.find(filter).sort({ createdAt: -1 });
	return res.status(200).json({ success: true, data: items });
});

const getDoctorAdviceByDoctorId = asyncHandler(async (req, res) => {
	const doctorId = req.params.doctorId;
	ensureValidObjectId(doctorId, "doctorId");

	const filter = { doctorId };
	if (req.query.category) filter.category = req.query.category;
	if (req.query.contentType) filter.contentType = req.query.contentType;
	if (req.query.status) filter.status = req.query.status;
	if (typeof req.query.isPublished === "string") filter.isPublished = req.query.isPublished === "true";

	const items = await DoctorAdvice.find(filter).sort({ createdAt: -1 });
	return res.status(200).json({ success: true, data: items });
});

const getDoctorAdviceById = asyncHandler(async (req, res) => {
	const adviceId = req.params.adviceId || req.params.id;
	ensureValidObjectId(adviceId, "article id");
	const item = await DoctorAdvice.findById(adviceId);
	if (!item) throw new ApiError(404, "Article/Lesson not found");
	return res.status(200).json({ success: true, data: item });
});

const updateDoctorAdvice = asyncHandler(async (req, res) => {
	const adviceId = req.params.adviceId || req.params.id;
	ensureValidObjectId(adviceId, "article id");
	const allowed = [
		"title",
		"category",
		"contentType",
		"textContent",
		"voiceUrl",
		"audioDuration",
		"transcript",
		"summary",
		"isPublished",
	];
	const payload = {};
	for (const field of allowed) if (req.body[field] !== undefined) payload[field] = req.body[field];
	if (req.body.status !== undefined) {
		payload.status = req.body.status;
		payload.isPublished = req.body.status === "published";
	}
	if (req.body.isPublished !== undefined && req.body.status === undefined) {
		payload.status = req.body.isPublished ? "published" : "draft";
	}
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await DoctorAdvice.findByIdAndUpdate(adviceId, payload, {
		new: true,
		runValidators: true,
	});
	if (!updated) throw new ApiError(404, "Article/Lesson not found");
	return res.status(200).json({ success: true, message: "Article/Lesson updated", data: updated });
});

const deleteDoctorAdvice = asyncHandler(async (req, res) => {
	const adviceId = req.params.adviceId || req.params.id;
	ensureValidObjectId(adviceId, "article id");
	const deleted = await DoctorAdvice.findByIdAndDelete(adviceId);
	if (!deleted) throw new ApiError(404, "Article/Lesson not found");
	return res.status(200).json({ success: true, message: "Article/Lesson deleted" });
});

const incrementDoctorAdviceViews = asyncHandler(async (req, res) => {
	const adviceId = req.params.adviceId || req.params.id;
	ensureValidObjectId(adviceId, "article id");

	const item = await DoctorAdvice.findByIdAndUpdate(
		adviceId,
		{ $inc: { viewsCount: 1 } },
		{ new: true }
	);
	if (!item) throw new ApiError(404, "Article/Lesson not found");

	return res.status(200).json({ success: true, message: "View count updated", data: item });
});

module.exports = {
	createDoctorAdvice,
	getDoctorAdvice,
	getDoctorAdviceByDoctorId,
	getDoctorAdviceById,
	updateDoctorAdvice,
	deleteDoctorAdvice,
	incrementDoctorAdviceViews,
};
