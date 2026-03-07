import axios from 'axios';

export async function sendMessage({ chatId, senderId, messageText }) {
	return axios.post('/api/messages', { chatId, senderId, messageText });
}

export async function getMessages(chatId) {
	const res = await axios.get(`/api/messages?chatId=${chatId}`);
	return res.data;
}

// Gemini chatbot API call
export async function sendGeminiMessage({ userId, prompt }) {
	// Adjust backend URL if needed
	const res = await axios.post('/api/ai-conversations/gemini', { userId, prompt });
	return res.data;
}
