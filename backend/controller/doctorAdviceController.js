const DoctorAdvice = require("../models/doctor_advices");

const createDoctorAdvice = async (req, res) => {
	try {
		const { doctor_name, specialization, topic, audio_url, description } = req.body;

		if (!doctor_name || !specialization || !topic || !audio_url) {
			return res.status(400).json({
				success: false,
				message:
					"doctor_name, specialization, topic and audio_url are required",
			});
		}

		const advice = await DoctorAdvice.create({
			doctor_name,
			specialization,
			topic,
			audio_url,
			description,
		});

		return res.status(201).json({
			success: true,
			message: "Doctor advice created successfully",
			data: advice,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to create doctor advice",
		});
	}
};

const getDoctorAdvice = async (req, res) => {
	try {
		const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
		const skip = (page - 1) * limit;

		const filter = { status: "active" };
		if (req.query.specialization) {
			filter.specialization = req.query.specialization;
		}
		if (req.query.topic) {
			filter.topic = req.query.topic;
		}

		const [items, total] = await Promise.all([
			DoctorAdvice.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
			DoctorAdvice.countDocuments(filter),
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
			message: error.message || "Failed to fetch doctor advice",
		});
	}
};

module.exports = {
	createDoctorAdvice,
	getDoctorAdvice,
};
