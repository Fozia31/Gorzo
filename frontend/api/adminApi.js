import { api } from "./api";

export const getAdmins = async (params = {}) => {
  try {
    const response = await api.get("/admins", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
