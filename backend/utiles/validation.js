const mongoose = require("mongoose");
const ApiError = require("./apiError");

const ensureRequiredFields = (payload, fields) => {
	const missingFields = fields.filter((field) => {
		const value = payload[field];
		return value === undefined || value === null || value === "";
	});

	if (missingFields.length > 0) {
		throw new ApiError(400, `Missing required field(s): ${missingFields.join(", ")}`);
	}
};

const ensureValidObjectId = (id, fieldName = "id") => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, `Invalid ${fieldName}`);
	}
};

module.exports = {
	ensureRequiredFields,
	ensureValidObjectId,
};
