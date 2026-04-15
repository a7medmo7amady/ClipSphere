import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import Video from "../models/Video";
import {
  ACTIVE_VIDEO_EMBEDDING_MODEL,
  generateVideoEmbedding,
} from "../services/embeddingService";

const limit = Number(process.env.EMBEDDINGS_RETRY_LIMIT ?? "50");

async function run() {
  await connectDatabase();

  const now = new Date();
  const candidates = await Video.find({
    $or: [
      { embeddingStatus: "failed", embeddingNextRetryAt: { $lte: now } },
      { embeddingStatus: "pending" },
    ],
  })
    .sort({ embeddingNextRetryAt: 1, createdAt: -1 })
    .limit(Number.isFinite(limit) && limit > 0 ? limit : 50);

  let updated = 0;
  let failed = 0;

  for (const video of candidates) {
    try {
      const embedding = await generateVideoEmbedding({
        title: video.title,
        description: video.description,
        tags: video.tags,
        duration: video.duration,
      });

      video.embedding = embedding;
      video.embeddingUpdatedAt = new Date();
      video.embeddingModel = ACTIVE_VIDEO_EMBEDDING_MODEL;
      video.embeddingStatus = "ready";
      video.embeddingLastError = undefined;
      video.embeddingNextRetryAt = undefined;
      await video.save();

      updated += 1;
    } catch (error) {
      const errorText = error instanceof Error ? error.stack || error.message : String(error);
      video.embeddingStatus = "failed";
      video.embeddingLastError = errorText.slice(0, 2000);
      video.embeddingRetryCount = (video.embeddingRetryCount ?? 0) + 1;
      video.embeddingNextRetryAt = new Date(Date.now() + 5 * 60_000);
      await video.save();

      failed += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        scanned: candidates.length,
        updated,
        failed,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
