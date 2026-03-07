const express = require("express");
const cors = require("cors");
const path = require("path");
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
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

const parseAllowedOrigins = () => {
  const origins = new Set(["http://localhost:3000"]);

  const single = process.env.FRONTEND_URL;
  if (single) origins.add(single.trim());

  const list = process.env.FRONTEND_URLS;
  if (list) {
    for (const item of list.split(",")) {
      const trimmed = item.trim();
      if (trimmed) origins.add(trimmed);
    }
  }

  return origins;
};

const allowedOrigins = parseAllowedOrigins();
const allowVercelPreview = process.env.ALLOW_VERCEL_PREVIEW === "true";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      if (allowVercelPreview && origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(new Error("CORS policy: origin not allowed"));
    },
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => {
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
app.use("/api/payments", paymentRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});

module.exports = app;
