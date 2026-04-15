import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import User from "../models/User";
import WatchHistory from "../models/WatchHistory";
import AppError from "../utils/AppError";
import { computeUserEmbeddingFromWatchHistory } from "../services/recommendationService";

const limit = Number(process.env.USER_EMBEDDINGS_RECOMPUTE_LIMIT ?? "100");
const historyLimit = Number(process.env.USER_EMBEDDINGS_HISTORY_LIMIT ?? "50");

async function getCandidateUserIds(maxUsers: number) {
  const safeLimit = Number.isFinite(maxUsers) && maxUsers > 0 ? maxUsers : 100;

  const rows = await WatchHistory.aggregate<{
    _id: mongoose.Types.ObjectId;
    lastWatchedAt: Date;
    count: number;
  }>([
    { $sort: { watchedAt: -1 } },
    {
      $group: {
        _id: "$user",
        lastWatchedAt: { $first: "$watchedAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { lastWatchedAt: -1 } },
    { $limit: safeLimit },
  ]);

  return rows.map((row) => row._id.toString());
}

async function run() {
  await connectDatabase();

  const candidates = await getCandidateUserIds(limit);

  let updated = 0;
  let pending = 0;
  let failed = 0;

  for (const userId of candidates) {
    const user = await User.findById(userId).select(
      "+recommendationEmbedding +recommendationEmbeddingStatus +recommendationEmbeddingLastError +recommendationEmbeddingUpdatedAt"
    );

    if (!user) continue;

    try {
      const embedding = await computeUserEmbeddingFromWatchHistory(userId, {
        historyLimit,
      });

      user.recommendationEmbedding = embedding;
      user.recommendationEmbeddingUpdatedAt = new Date();
      user.recommendationEmbeddingStatus = "ready";
      user.recommendationEmbeddingLastError = undefined;
      await user.save();

      updated += 1;
    } catch (error) {
      const errorText = error instanceof Error ? error.stack || error.message : String(error);

      if (error instanceof AppError && error.statusCode === 409) {
        user.recommendationEmbedding = undefined;
        user.recommendationEmbeddingUpdatedAt = new Date();
        user.recommendationEmbeddingStatus = "pending";
        user.recommendationEmbeddingLastError = errorText.slice(0, 2000);
        await user.save();

        pending += 1;
        continue;
      }

      user.recommendationEmbeddingStatus = "failed";
      user.recommendationEmbeddingLastError = errorText.slice(0, 2000);
      user.recommendationEmbeddingUpdatedAt = new Date();
      await user.save();

      failed += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        scanned: candidates.length,
        updated,
        pending,
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
