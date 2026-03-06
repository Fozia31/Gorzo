const PersonalAssistance = require("../models/personal_assistance");

const createQuestion = async (req, res) => {
	try {
		const { display_name, category, question, response, is_answered } = req.body;

		if (!category || !question) {
			return res.status(400).json({
				success: false,
				message: "category and question are required",
			});
		}

		const payload = {
			display_name,
			category,
			question,
		};

		if (typeof response === "string") {
			payload.response = response;
		}
		if (typeof is_answered === "boolean") {
			payload.is_answered = is_answered;
		}

		const item = await PersonalAssistance.create(payload);

		return res.status(201).json({
			success: true,
			message: "Question submitted successfully",
			data: item,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to submit question",
		});
	}
};

const getQuestions = async (req, res) => {
	try {
		const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
		const skip = (page - 1) * limit;

		const filter = { status: "active" };
		if (req.query.category) {
			filter.category = req.query.category;
		}
		if (typeof req.query.is_answered === "string") {
			filter.is_answered = req.query.is_answered.toLowerCase() === "true";
		}

		const [items, total] = await Promise.all([
			PersonalAssistance.find(filter)
				.sort({ created_at: -1 })
				.skip(skip)
				.limit(limit),
			PersonalAssistance.countDocuments(filter),
		]);

		return res.status(200).json({
			success: true,
			data: items,
			pagination: {
				page,
				limit,
				total,
				total_pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch questions",
		});
	}
};

module.exports = {
	createQuestion,
	getQuestions,
};
