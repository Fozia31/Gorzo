import { api } from "./api";

export const sendMessage = async (payload) => {
  try {
    const response = await api.post("/messages", payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMessagesByChat = async (chatId, params = {}) => {
  try {
    const response = await api.get(`/messages/chat/${chatId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markChatMessagesRead = async (chatId, readerRole = "Doctor") => {
  try {
    const response = await api.patch(`/messages/chat/${chatId}/read`, { readerRole });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMessageById = async (messageId) => {
  try {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
