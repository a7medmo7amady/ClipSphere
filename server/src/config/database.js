const mongoose = require("mongoose");
const config = require("./env");

async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri);
    // eslint-disable-next-line no-console
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to connect to MongoDB");
    // In production we avoid logging full error stack here
    if (config.env !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    process.exit(1);
  }
}

module.exports = { connectDatabase };

