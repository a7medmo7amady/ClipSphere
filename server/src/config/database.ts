import mongoose from "mongoose";
import config from "./env";

export async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri);
    // eslint-disable-next-line no-console
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to connect to MongoDB");
    if (config.env !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    process.exit(1);
  }
}

