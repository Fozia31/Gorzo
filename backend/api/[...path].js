const dotenv = require("dotenv");
const app = require("../app");
const { connectToMongo } = require("../lib/mongo");

dotenv.config();

module.exports = async (req, res) => {
  try {
    await connectToMongo();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to initialize API",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
