const AIConversation = require("../models/chat_ai");
const Post = require("../models/post");
const DoctorAdvice = require("../models/doctor_advices");
const Doctor = require("../models/doctors");
const asyncHandler = require("../utiles/asyncHandler");
const ApiError = require("../utiles/apiError");
const { generateGeminiText, getJsonFromGeminiText } = require("../utiles/geminiClient");
const { ensureRequiredFields, ensureValidObjectId } = require("../utiles/validation");

const MAX_HISTORY_CONTEXT = 8;

const getConversationContext = (conversation) => {
	if (!conversation || !Array.isArray(conversation.history)) return "";
	const recent = conversation.history.slice(-MAX_HISTORY_CONTEXT);
	if (recent.length === 0) return "";

	return recent
		.map((entry, index) => {
			return `Turn ${index + 1}\nUser: ${entry.prompt}\nAssistant: ${entry.summaryResponse}`;
		})
		.join("\n\n");
};

const trimTo = (text, maxLength) => {
	if (!text) return "";
	const safe = String(text).trim();
	if (safe.length <= maxLength) return safe;
	return `${safe.slice(0, Math.max(maxLength - 3, 0))}...`;
};

const getOrCreateConversation = async ({ userId, conversationId, sessionTitle }) => {
	if (conversationId) {
		ensureValidObjectId(conversationId, "conversationId");
		const existing = await AIConversation.findOne({ _id: conversationId, userId });
		if (!existing) throw new ApiError(404, "AI conversation not found for this user");
		return existing;
	}

	return AIConversation.create({
		userId,
		history: [],
		sessionTitle: sessionTitle || "Gemini assistant",
		isArchived: false,
	});
};

const appendConversationEntry = async ({ conversation, prompt, response }) => {
	conversation.history.push({
		prompt: trimTo(prompt, 3000),
		summaryResponse: trimTo(response, 5000),
	});
	await conversation.save();
};

const summarizePostWithAI = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId", "postId"]);
	ensureValidObjectId(req.body.userId, "userId");
	ensureValidObjectId(req.body.postId, "postId");

	const post = await Post.findById(req.body.postId).populate("userId", "displayName role");
	if (!post) throw new ApiError(404, "Post not found");

	const conversation = await getOrCreateConversation({
		userId: req.body.userId,
		conversationId: req.body.conversationId,
		sessionTitle: "Post summary",
	});

	const context = getConversationContext(conversation);
	const prompt = [
		"You are a supportive healthcare community assistant.",
		"Summarize the following user post into short, clear sections.",
		"Sections required: Main issue, Key details, Suggested next steps, Safety note.",
		"Keep it practical and easy to understand.",
		context ? `Previous conversation context:\n${context}` : "",
		"Post details:",
		`Title: ${post.title}`,
		`Category: ${post.category}`,
		`Tags: ${(post.tags || []).join(", ") || "none"}`,
		`Content: ${post.content}`,
	].filter(Boolean).join("\n\n");

	const summary = await generateGeminiText(prompt);
	await appendConversationEntry({
		conversation,
		prompt: `Summarize post: ${post.title}`,
		response: summary,
	});

	return res.status(200).json({
		success: true,
		message: "Post summary generated",
		data: {
			conversationId: conversation._id,
			postId: post._id,
			summary,
		},
	});
});

const summarizeArticleWithAI = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId", "articleId"]);
	ensureValidObjectId(req.body.userId, "userId");
	ensureValidObjectId(req.body.articleId, "articleId");

	const article = await DoctorAdvice.findById(req.body.articleId)
		.populate({
			path: "doctorId",
			populate: { path: "userId", select: "displayName" },
		})
		.lean();

	if (!article) throw new ApiError(404, "Article not found");

	const conversation = await getOrCreateConversation({
		userId: req.body.userId,
		conversationId: req.body.conversationId,
		sessionTitle: "Article summary",
	});

	const context = getConversationContext(conversation);
	const rawArticleText = [
		article.textContent,
		article.transcript,
		article.summary,
	].filter(Boolean).join("\n\n");

	if (!rawArticleText) throw new ApiError(400, "Article has no text content to summarize");

	const prompt = [
		"You are a healthcare content assistant.",
		"Summarize this doctor article for a regular user.",
		"Sections required: Core message, Actionable tips, Who should consult a doctor urgently.",
		"Use plain language and avoid jargon.",
		context ? `Previous conversation context:\n${context}` : "",
		"Article details:",
		`Title: ${article.title}`,
		`Category: ${article.category}`,
		`Doctor: ${article.doctorId?.userId?.displayName || "Unknown"}`,
		`Content: ${rawArticleText}`,
	].filter(Boolean).join("\n\n");

	const summary = await generateGeminiText(prompt);
	await appendConversationEntry({
		conversation,
		prompt: `Summarize article: ${article.title}`,
		response: summary,
	});

	return res.status(200).json({
		success: true,
		message: "Article summary generated",
		data: {
			conversationId: conversation._id,
			articleId: article._id,
			summary,
		},
	});
});

const suggestDoctorsWithAI = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId", "query"]);
	ensureValidObjectId(req.body.userId, "userId");

	const query = String(req.body.query || "").trim();
	if (!query) throw new ApiError(400, "query is required");

	const doctors = await Doctor.find({ verificationStatus: "Verified" })
		.populate("userId", "displayName")
		.sort({ consultationCount: -1, createdAt: -1 })
		.limit(25);

	if (doctors.length === 0) throw new ApiError(404, "No verified doctors are available right now");

	const conversation = await getOrCreateConversation({
		userId: req.body.userId,
		conversationId: req.body.conversationId,
		sessionTitle: "Doctor suggestions",
	});

	const context = getConversationContext(conversation);
	const doctorCatalog = doctors
		.map((doctor) => {
			return [
				`doctorId: ${doctor._id}`,
				`name: ${doctor.userId?.displayName || "Unknown"}`,
				`specialization: ${doctor.specialization}`,
				`consultationCount: ${doctor.consultationCount || 0}`,
				`bio: ${doctor.bio || "N/A"}`,
			].join(" | ");
		})
		.join("\n");

	const prompt = [
		"You are a medical support assistant for doctor matching.",
		"Based ONLY on the doctor list provided, suggest up to 5 doctors for the user's needs.",
		"Respond in JSON with this exact shape:",
		'{"summary":"string","suggestions":[{"doctorId":"string","name":"string","specialization":"string","reason":"string"}],"disclaimer":"string"}',
		"Do not invent doctor IDs or names.",
		context ? `Previous conversation context:\n${context}` : "",
		`User request: ${query}`,
		"Doctors:",
		doctorCatalog,
	].filter(Boolean).join("\n\n");

	const aiResponse = await generateGeminiText(prompt);
	const parsed = getJsonFromGeminiText(aiResponse) || {};

	const byId = new Map(doctors.map((doctor) => [String(doctor._id), doctor]));
	const normalizedSuggestions = Array.isArray(parsed.suggestions)
		? parsed.suggestions
				.map((item) => {
					if (!item || !item.doctorId || !byId.has(String(item.doctorId))) return null;
					const matchedDoctor = byId.get(String(item.doctorId));
					return {
						doctorId: String(matchedDoctor._id),
						name: matchedDoctor.userId?.displayName || item.name || "Unknown",
						specialization: matchedDoctor.specialization,
						reason: String(item.reason || "Recommended based on your request."),
					};
				})
				.filter(Boolean)
		: [];

	const fallbackSuggestions = doctors.slice(0, 3).map((doctor) => ({
		doctorId: String(doctor._id),
		name: doctor.userId?.displayName || "Unknown",
		specialization: doctor.specialization,
		reason: "This doctor is verified and matches common consultation needs.",
	}));

	const suggestions = normalizedSuggestions.length > 0 ? normalizedSuggestions : fallbackSuggestions;
	const summary = parsed.summary || "Here are doctors who may be a good fit for your needs.";
	const disclaimer = parsed.disclaimer || "This is not medical diagnosis. For emergencies, contact local emergency services immediately.";

	const responseText = [
		summary,
		"",
		...suggestions.map((item, index) => `${index + 1}. ${item.name} (${item.specialization}) - ${item.reason}`),
		"",
		disclaimer,
	].join("\n");

	await appendConversationEntry({
		conversation,
		prompt: `Suggest doctors for: ${query}`,
		response: responseText,
	});

	return res.status(200).json({
		success: true,
		message: "Doctor suggestions generated",
		data: {
			conversationId: conversation._id,
			summary,
			suggestions,
			disclaimer,
			rawResponse: aiResponse,
		},
	});
});

const chatWithGemini = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId", "message"]);
	ensureValidObjectId(req.body.userId, "userId");

	const message = String(req.body.message || "").trim();
	if (!message) throw new ApiError(400, "message is required");

	const conversation = await getOrCreateConversation({
		userId: req.body.userId,
		conversationId: req.body.conversationId,
		sessionTitle: "Gemini chat",
	});

	const context = getConversationContext(conversation);
	const prompt = [
		"You are a friendly healthcare chatbot inside a community app.",
		"You can: summarize posts, summarize doctor articles, suggest suitable doctors, and answer user questions.",
		"Give concise, empathetic guidance. Do not provide definitive diagnosis.",
		"Always include a short safety reminder if symptoms seem serious.",
		context ? `Conversation context:\n${context}` : "",
		`User message: ${message}`,
	].filter(Boolean).join("\n\n");

	const answer = await generateGeminiText(prompt);
	await appendConversationEntry({
		conversation,
		prompt: message,
		response: answer,
	});

	return res.status(200).json({
		success: true,
		message: "AI response generated",
		data: {
			conversationId: conversation._id,
			response: answer,
		},
	});
});

const createAIConversation = asyncHandler(async (req, res) => {
	ensureRequiredFields(req.body, ["userId"]);
	ensureValidObjectId(req.body.userId, "userId");

	const history = Array.isArray(req.body.history) ? req.body.history : [];
	const item = await AIConversation.create({
		userId: req.body.userId,
		history,
		sessionTitle: req.body.sessionTitle || "",
		isArchived: Boolean(req.body.isArchived),
	});

	return res.status(201).json({ success: true, message: "AI conversation created", data: item });
});

const getAIConversations = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.userId) {
		ensureValidObjectId(req.query.userId, "userId");
		filter.userId = req.query.userId;
	}
	if (typeof req.query.isArchived === "string") filter.isArchived = req.query.isArchived === "true";

	const items = await AIConversation.find(filter).populate("userId").sort({ updatedAt: -1 });
	return res.status(200).json({ success: true, data: items });
});

const getAIConversationById = asyncHandler(async (req, res) => {
	const conversationId = req.params.conversationId || req.params.id;
	ensureValidObjectId(conversationId, "conversation id");
	const item = await AIConversation.findById(conversationId).populate("userId");
	if (!item) throw new ApiError(404, "AI conversation not found");
	return res.status(200).json({ success: true, data: item });
});

const updateAIConversation = asyncHandler(async (req, res) => {
	const conversationId = req.params.conversationId || req.params.id;
	ensureValidObjectId(conversationId, "conversation id");

	const payload = {};
	if (req.body.sessionTitle !== undefined) payload.sessionTitle = req.body.sessionTitle;
	if (req.body.isArchived !== undefined) payload.isArchived = req.body.isArchived;
	if (Array.isArray(req.body.history)) payload.history = req.body.history;

	if (Object.keys(payload).length === 0) throw new ApiError(400, "No valid fields to update");

	const updated = await AIConversation.findByIdAndUpdate(conversationId, payload, {
		new: true,
		runValidators: true,
	});
	if (!updated) throw new ApiError(404, "AI conversation not found");
	return res.status(200).json({ success: true, message: "AI conversation updated", data: updated });
});

const deleteAIConversation = asyncHandler(async (req, res) => {
	const conversationId = req.params.conversationId || req.params.id;
	ensureValidObjectId(conversationId, "conversation id");
	const deleted = await AIConversation.findByIdAndDelete(conversationId);
	if (!deleted) throw new ApiError(404, "AI conversation not found");
	return res.status(200).json({ success: true, message: "AI conversation deleted" });
});

module.exports = {
	createAIConversation,
	getAIConversations,
	getAIConversationById,
	updateAIConversation,
	deleteAIConversation,
	summarizePostWithAI,
	summarizeArticleWithAI,
	suggestDoctorsWithAI,
	chatWithGemini,
};
