const Comment = require("../models/comment");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const createComment = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["postId", "userId", "displayName", "content"]);
	ensureValidObjectId(req.body.postId, "postId");
	ensureValidObjectId(req.body.userId, "userId");

	const comment = await Comment.create({
		postId: req.body.postId,
		userId: req.body.userId,
		displayName: req.body.displayName,
		content: req.body.content,
		isReported: Boolean(req.body.isReported),
	});

	return res.status(201).json({ success: true, message: "Comment created", data: comment });
});

const getComments = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.postId) {
		ensureValidObjectId(req.query.postId, "postId");
		filter.postId = req.query.postId;
	}
	if (req.query.userId) {
		ensureValidObjectId(req.query.userId, "userId");
		filter.userId = req.query.userId;
	}
	if (typeof req.query.isReported === "string") filter.isReported = req.query.isReported === "true";

	const items = await Comment.find(filter).sort({ createdAt: -1 });
	return res.status(200).json({ success: true, data: items });
});

const getCommentById = asyncHandler(async (req, res) => {
	const commentId = req.params.commentId || req.params.id;
	ensureValidObjectId(commentId, "comment id");
	const comment = await Comment.findById(commentId);
	if (!comment) throw new ApiError(404, "Comment not found");
	return res.status(200).json({ success: true, data: comment });
});

const updateComment = asyncHandler(async (req, res) => {
	const commentId = req.params.commentId || req.params.id;
	ensureValidObjectId(commentId, "comment id");
	const payload = {};
	if (req.body.content !== undefined) payload.content = req.body.content;
	if (req.body.isReported !== undefined) payload.isReported = req.body.isReported;
	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await Comment.findByIdAndUpdate(commentId, payload, { new: true, runValidators: true });
	if (!updated) throw new ApiError(404, "Comment not found");
	return res.status(200).json({ success: true, message: "Comment updated", data: updated });
});

const deleteComment = asyncHandler(async (req, res) => {
	const commentId = req.params.commentId || req.params.id;
	ensureValidObjectId(commentId, "comment id");
	const deleted = await Comment.findByIdAndDelete(commentId);
	if (!deleted) throw new ApiError(404, "Comment not found");
	return res.status(200).json({ success: true, message: "Comment deleted" });
});

module.exports = {
	createComment,
	getComments,
	getCommentById,
	updateComment,
	deleteComment,
};
