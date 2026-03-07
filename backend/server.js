const http = require("http");
const dotenv = require("dotenv");
const app = require("./app");
const { connectToMongo } = require("./lib/mongo");
const { initWebSocket } = require("./websocket");

dotenv.config();

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToMongo();
    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    initWebSocket(server);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
