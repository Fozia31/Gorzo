const { GoogleGenerativeAI } = require("@google/generative-ai");
const ApiError = require("./apiError");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const getGeminiModel = () => {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new ApiError(500, "GEMINI_API_KEY is not configured on the server");
	}

	const client = new GoogleGenerativeAI(apiKey);
	return client.getGenerativeModel({ model: GEMINI_MODEL });
};

const generateGeminiText = async (prompt) => {
	if (!prompt || !String(prompt).trim()) {
		throw new ApiError(400, "Prompt is required for Gemini request");
	}

	try {
		const model = getGeminiModel();
		const result = await model.generateContent(prompt);
		const text = result.response.text();

		if (!text || !String(text).trim()) {
			throw new ApiError(502, "Gemini returned an empty response");
		}
		return text.trim();
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new ApiError(502, `Gemini request failed: ${error.message}`);
	}
};

const getJsonFromGeminiText = (text) => {
	if (!text) return null;
	const trimmed = String(text).trim();

	try {
		return JSON.parse(trimmed);
	} catch (_error) {
		// Try extracting JSON from a fenced code block or mixed text.
	}

	const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (codeBlockMatch?.[1]) {
		try {
			return JSON.parse(codeBlockMatch[1].trim());
		} catch (_error) {
			// Fall through to heuristic extraction.
		}
	}

	const firstBrace = trimmed.indexOf("{");
	const lastBrace = trimmed.lastIndexOf("}");
	if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
		const candidate = trimmed.slice(firstBrace, lastBrace + 1);
		try {
			return JSON.parse(candidate);
		} catch (_error) {
			return null;
		}
	}

	return null;
};

module.exports = {
	generateGeminiText,
	getJsonFromGeminiText,
};
