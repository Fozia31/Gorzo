import { api } from "./api";

export const getDoctorChatQueue = async (doctorId) => {
  try {
    const response = await api.get(`/chats/doctor/${doctorId}/queue`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getChats = async (params = {}) => {
  try {
    const response = await api.get("/chats", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createChat = async (payload) => {
  try {
    const response = await api.post("/chats", payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getOrCreateDoctorChat = async ({ doctorId, userId }) => {
  const existing = await getChats({ doctorId, userId, sessionStatus: "Active" });
  if (Array.isArray(existing) && existing.length > 0) {
    return existing[0];
  }

  return createChat({ doctorId, userId, sessionStatus: "Active" });
};
