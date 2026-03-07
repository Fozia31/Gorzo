import { api } from "./api";

export const createPostEngagement = async (engagementData) => {
  try {
    const response = await api.post('/post-engagements', engagementData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPostEngagements = async (params = {}) => {
  try {
    const response = await api.get('/post-engagements', { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePostEngagement = async (engagementId) => {
  try {
    const response = await api.delete(`/post-engagements/${engagementId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};