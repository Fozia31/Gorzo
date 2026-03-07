const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const doctorAdviceRoutes = require("./routes/doctorAdviceRoutes");
const postEngagementRoutes = require("./routes/postEngagementRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const aiConversationRoutes = require("./routes/aiConversationRoutes");
const personalAssistanceRoutes = require("./routes/personalAssistanceRoutes");

dotenv.config();

const app = express();

// Configure CORS to allow the frontend(s) used during development and production
const allowedOrigins = [];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
// always allow localhost for dev
allowedOrigins.push("http://localhost:3000");

app.use(
	cors({
		origin: (origin, callback) => {
			// allow requests with no origin (e.g. mobile apps, curl)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			callback(new Error("CORS policy: origin not allowed"));
		},
	})
);
app.use(express.json());

app.get("/", (req, res) => {
	res.status(200).json({ message: "API is running" });
});

app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/doctor-advice", doctorAdviceRoutes);
app.use("/api/post-engagements", postEngagementRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai-conversations", aiConversationRoutes);
app.use("/api/personal-assistance", personalAssistanceRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const startServer = async () => {
    try {
        if (!MONGO_URI) {
            console.error("❌ MongoDB URI not found. Set MONGO_URI in .env");
            process.exit(1);
        }

        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully to Her_Hackton");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
