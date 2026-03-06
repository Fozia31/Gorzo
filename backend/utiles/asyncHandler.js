module.exports = (handler) => async (req, res) => {
	try {
		await handler(req, res);
	} catch (error) {
		const statusCode = error.statusCode || 500;
		return res.status(statusCode).json({
			success: false,
			message: error.message || "Internal server error",
			error: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
};
