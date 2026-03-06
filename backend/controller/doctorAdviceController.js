const DoctorAdvice = require("../models/doctor_advices");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createDoctorAdvice = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["doctorId", "title", "category", "contentType"]);
	ensureValidObjectId(req.body.doctorId, "doctorId");

	const payload = {
		doctorId: req.body.doctorId,
		title: req.body.title,
		category: req.body.category,
		contentType: req.body.contentType,
		textContent: req.body.textContent || "",
		voiceUrl: req.body.voiceUrl || "",
		audioDuration: req.body.audioDuration || 0,
		transcript: req.body.transcript || "",
		summary: req.body.summary || "",
		isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
	};

	if (payload.contentType === "Text" && !payload.textContent) {
		throw new ApiError(400, "textContent is required for Text contentType");
	}
	if (payload.contentType === "VoiceURL" && !payload.voiceUrl) {
		throw new ApiError(400, "voiceUrl is required for VoiceURL contentType");
	}

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

module.exports = {
	createDoctorAdvice,
	getDoctorAdvice,
	getDoctorAdviceById,
	updateDoctorAdvice,
	deleteDoctorAdvice,
};
