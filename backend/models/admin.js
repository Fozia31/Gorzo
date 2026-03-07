const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		createdDoctorsCount: {
			type: Number,
			default: 0,
			min: 0,
		},
		department: {
			type: String,
			trim: true,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Admin", adminSchema);
