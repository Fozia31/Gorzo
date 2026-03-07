import axios from 'axios';

export async function sendMessage({ chatId, senderId, messageText }) {
	return axios.post('/api/messages', { chatId, senderId, messageText });
}

export async function getMessages(chatId) {
	const res = await axios.get(`/api/messages?chatId=${chatId}`);
	return res.data;
}
