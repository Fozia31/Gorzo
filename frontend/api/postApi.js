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
