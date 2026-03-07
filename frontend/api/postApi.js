import { api } from "./api";

// fetch posts with optional query params (category, userId, etc.)
export const getPosts = async (params = {}) => {
  try {
    const response = await api.get("/posts", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await api.post("/posts", postData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getModerationQueuePosts = async (params = {}) => {
  try {
    const response = await api.get("/posts/moderation/queue", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePost = async (postId, payload) => {
  try {
    const response = await api.put(`/posts/${postId}`, payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
