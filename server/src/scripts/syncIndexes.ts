import mongoose from "mongoose";
import { connectDatabase } from "../config/database";

// import ALL models so Mongoose knows about their indexes
import "../models/Follower";
import "../models/Review";
import "../models/User";
import "../models/Video";

async function sync() {
  await connectDatabase();

  await mongoose.connection.syncIndexes();

  console.log("Indexes synced");
  process.exit(0);
}

sync();