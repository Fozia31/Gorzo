import { api } from "./api";

export const chatWithGemini = async (payload) => {
	try {
		const response = await api.post("/ai-conversations/chat", payload);
		return response.data.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

export const summarizePostWithGemini = async (payload) => {
	try {
		const response = await api.post("/ai-conversations/summarize/post", payload);
		return response.data.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

export const summarizeArticleWithGemini = async (payload) => {
	try {
		const response = await api.post("/ai-conversations/summarize/article", payload);
		return response.data.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

export const suggestDoctorsWithGemini = async (payload) => {
	try {
		const response = await api.post("/ai-conversations/suggest-doctors", payload);
		return response.data.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};
