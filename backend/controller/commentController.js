const Comment = require("../models/comment");
const Post = require("../models/post");

const createComment = async (req, res) => {
	try {
		const { post_id, display_name, content, is_anonymous, user_id } = req.body;

		if (!post_id || !content) {
			return res.status(400).json({
				success: false,
				message: "post_id and content are required",
			});
		}

		const post = await Post.findOne({ post_id, status: "active" });
		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post not found",
			});
		}

		const comment = await Comment.create({
			post_id,
			display_name,
			content,
			is_anonymous,
			user_id,
		});

		await Post.updateOne({ post_id }, { $inc: { comments_count: 1 } });

		return res.status(201).json({
			success: true,
			message: "Comment added successfully",
			data: comment,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to add comment",
		});
	}
};

const getCommentsByPost = async (req, res) => {
	try {
		const { post_id } = req.params;
		const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
		const skip = (page - 1) * limit;

		if (!post_id) {
			return res.status(400).json({
				success: false,
				message: "post_id is required",
			});
		}

		const filter = { post_id, status: "active" };
		const [comments, total] = await Promise.all([
			Comment.find(filter).sort({ created_at: 1 }).skip(skip).limit(limit),
			Comment.countDocuments(filter),
		]);

		return res.status(200).json({
			success: true,
			data: comments,
			pagination: {
				page,
				limit,
				total,
				total_pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch comments",
		});
	}
};

module.exports = {
	createComment,
	getCommentsByPost,
};
