import { api } from "./api";

export const getComments = async (params = {}) => {
  try {
    const response = await api.get("/comments", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createComment = async (commentData) => {
  try {
    const response = await api.post("/comments", commentData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
