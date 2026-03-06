const Post = require("../models/post");

const createPost = async (req, res) => {
  try {
    const { display_name, content, category, is_anonymous, user_id } = req.body;

    if (!content || !category) {
      return res.status(400).json({
        success: false,
        message: "content and category are required",
      });
    }

    const post = await Post.create({
      display_name,
      content,
      category,
      is_anonymous,
      user_id,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create post",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = { status: "active" };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: posts,
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
      message: error.message || "Failed to fetch posts",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
};
