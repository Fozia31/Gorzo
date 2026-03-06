const Post = require("../models/post");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createPost = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId", "title", "content", "category"]);
	ensureValidObjectId(req.body.userId, "userId");

	const post = await Post.create({
		userId: req.body.userId,
		title: req.body.title,
		content: req.body.content,
		category: req.body.category,
		isAnonymous: req.body.isAnonymous !== undefined ? req.body.isAnonymous : true,
		tags: Array.isArray(req.body.tags) ? req.body.tags : [],
	});

	return res.status(201).json({ success: true, message: "Post created", data: post });
});

const getPosts = asyncHandler(async (req, res) => {
	const page = Math.max(Number(req.query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
	const skip = (page - 1) * limit;
	const filter = {};

	if (req.query.category) filter.category = req.query.category;
	if (typeof req.query.isAnonymous === "string") filter.isAnonymous = req.query.isAnonymous === "true";
	if (req.query.userId) {
		ensureValidObjectId(req.query.userId, "userId");
		filter.userId = req.query.userId;
	}
	if (req.query.tag) filter.tags = req.query.tag.toLowerCase().trim();

	const [items, total] = await Promise.all([
		Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
		Post.countDocuments(filter),
	]);

	return res.status(200).json({
		success: true,
		data: items,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
});

const getPostById = asyncHandler(async (req, res) => {
	const postId = req.params.postId || req.params.id;
	ensureValidObjectId(postId, "post id");
	const post = await Post.findById(postId);
	if (!post) throw new ApiError(404, "Post not found");
	return res.status(200).json({ success: true, data: post });
});

const updatePost = asyncHandler(async (req, res) => {
	const postId = req.params.postId || req.params.id;
	ensureValidObjectId(postId, "post id");
	const allowedFields = ["title", "content", "category", "isAnonymous", "tags"];
	const payload = {};
	for (const field of allowedFields) if (req.body[field] !== undefined) payload[field] = req.body[field];
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await Post.findByIdAndUpdate(postId, payload, {
		new: true,
		runValidators: true,
	});
	if (!updated) throw new ApiError(404, "Post not found");
	return res.status(200).json({ success: true, message: "Post updated", data: updated });
});

const deletePost = asyncHandler(async (req, res) => {
	const postId = req.params.postId || req.params.id;
	ensureValidObjectId(postId, "post id");
	const deleted = await Post.findByIdAndDelete(postId);
	if (!deleted) throw new ApiError(404, "Post not found");
	return res.status(200).json({ success: true, message: "Post deleted" });
});

module.exports = {
	createPost,
	getPosts,
	getPostById,
	updatePost,
	deletePost,
};
