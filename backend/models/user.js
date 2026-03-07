const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		displayName: {
			type: String,
			required: true,
			trim: true,
			maxlength: 60,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
		role: {
			type: String,
			enum: ["Admin", "Doctor", "User"],
			default: "User",
		},
		isPremium: {
			type: Boolean,
			default: false,
		},
		avatar: {
			type: String,
			trim: true,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("User", userSchema);
