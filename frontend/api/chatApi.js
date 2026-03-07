import { api } from "./api";

export async function sendMessage(payload) {
  const res = await api.post("/messages", payload);
  return res.data;
}

export async function getMessages(chatId) {
  const res = await api.get(`/messages/chat/${chatId}`);
  return res.data;
}

export async function sendGeminiMessage({ userId, prompt }) {
  const res = await api.post("/ai-conversations/gemini", { userId, prompt });
  return res.data;
}

export async function getDoctorChatQueue(doctorId) {
  const res = await api.get(`/chats/doctor/${doctorId}/queue`);
  return res.data?.data || [];
}

export async function getOrCreateDoctorChat({ doctorId, userId }) {
  const existing = await api.get("/chats", { params: { doctorId, userId } });
  const current = existing.data?.data;
  if (Array.isArray(current) && current.length > 0) {
    return current[0];
  }

  const created = await api.post("/chats", { doctorId, userId });
  return created.data?.data;
}

export async function getChats(params = {}) {
  const res = await api.get("/chats", { params });
  return res.data?.data || [];
}
