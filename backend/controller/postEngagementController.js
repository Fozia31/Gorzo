const PostEngagement = require("../models/post_engagement");
const Post = require("../models/post");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createPostEngagement = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["postId", "userId", "type"]);
	ensureValidObjectId(req.body.postId, "postId");
	ensureValidObjectId(req.body.userId, "userId");

	const post = await Post.findById(req.body.postId);
	if (!post) throw new ApiError(404, "Post not found");

	let engagement;
	try {
		engagement = await PostEngagement.create({
			postId: req.body.postId,
			userId: req.body.userId,
			type: req.body.type,
			reportReason: req.body.reportReason || "",
		});
	} catch (error) {
		if (error.code === 11000) {
			throw new ApiError(409, "This engagement already exists for this user and post");
		}
		throw error;
	}

	if (engagement.type === "Like") {
		await Post.findByIdAndUpdate(req.body.postId, { $inc: { likes: 1 } });
	} else if (engagement.type === "Repost") {
		await Post.findByIdAndUpdate(req.body.postId, { $inc: { reposts: 1 } });
	} else if (engagement.type === "Report") {
		await Post.findByIdAndUpdate(req.body.postId, { $inc: { reports: 1 } });
	}

	return res.status(201).json({ success: true, message: "Post engagement created", data: engagement });
});

const getPostEngagements = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.postId) {
		ensureValidObjectId(req.query.postId, "postId");
		filter.postId = req.query.postId;
	}
	if (req.query.userId) {
		ensureValidObjectId(req.query.userId, "userId");
		filter.userId = req.query.userId;
	}
	if (req.query.type) filter.type = req.query.type;

	const items = await PostEngagement.find(filter).sort({ createdAt: -1 });
	return res.status(200).json({ success: true, data: items });
});

const getPostEngagementById = asyncHandler(async (req, res) => {
	const engagementId = req.params.engagementId || req.params.id;
	ensureValidObjectId(engagementId, "engagement id");
	const item = await PostEngagement.findById(engagementId);
	if (!item) throw new ApiError(404, "Post engagement not found");
	return res.status(200).json({ success: true, data: item });
});

const updatePostEngagement = asyncHandler(async (req, res) => {
	const engagementId = req.params.engagementId || req.params.id;
	ensureValidObjectId(engagementId, "engagement id");
	const payload = {};
	if (req.body.reportReason !== undefined) payload.reportReason = req.body.reportReason;
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await PostEngagement.findByIdAndUpdate(engagementId, payload, {
		new: true,
		runValidators: true,
	});
	if (!updated) throw new ApiError(404, "Post engagement not found");
	return res.status(200).json({ success: true, message: "Post engagement updated", data: updated });
});

const deletePostEngagement = asyncHandler(async (req, res) => {
	const engagementId = req.params.engagementId || req.params.id;
	ensureValidObjectId(engagementId, "engagement id");
	const engagement = await PostEngagement.findByIdAndDelete(engagementId);
	if (!engagement) throw new ApiError(404, "Post engagement not found");

	if (engagement.type === "Like") {
		await Post.findByIdAndUpdate(engagement.postId, { $inc: { likes: -1 } });
	} else if (engagement.type === "Repost") {
		await Post.findByIdAndUpdate(engagement.postId, { $inc: { reposts: -1 } });
	} else if (engagement.type === "Report") {
		await Post.findByIdAndUpdate(engagement.postId, { $inc: { reports: -1 } });
	}

	return res.status(200).json({ success: true, message: "Post engagement deleted" });
});

module.exports = {
	createPostEngagement,
	getPostEngagements,
	getPostEngagementById,
	updatePostEngagement,
	deletePostEngagement,
};
