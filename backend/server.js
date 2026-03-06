const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const doctorAdviceRoutes = require("./routes/doctorAdviceRoutes");
const personalAssistanceRoutes = require("./routes/personalAssistanceRoutes");
const chatLogRoutes = require("./routes/chatLogRoutes");

dotenv.config();

const app = express();

app.use(
	cors({
		origin: process.env.FRONTEND_URL || "*",
	})
);
app.use(express.json());

app.get("/", (req, res) => {
	res.status(200).json({ message: "API is running" });
});

app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/doctor-advice", doctorAdviceRoutes);
app.use("/api/personal-assistance", personalAssistanceRoutes);
app.use("/api/chat-logs", chatLogRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const startServer = async () => {
	try {
		if (MONGO_URI) {
			await mongoose.connect(MONGO_URI);
			console.log("MongoDB connected");
		} else {
			console.log("MongoDB URI not found. Set MONGO_URI in .env");
		}

		app.listen(PORT, () => {
			console.log(`Server running on port http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error.message);
		process.exit(1);
	}
};

startServer();
