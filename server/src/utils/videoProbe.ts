import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";

// Use require for untyped library to avoid augmentation errors
const ffprobeStatic = require("ffprobe-static");

// Set ffprobe path globally
ffmpeg.setFfprobePath(ffprobeStatic.path);

/**
 * Probes the duration of a video file from a buffer.
 * @param buffer - The video file binary buffer.
 * @returns - A promise that resolves with the duration in seconds.
 */
export function getVideoDuration(buffer: Buffer): Promise<number> {
  return new Promise((resolve, reject) => {
    // Create a readable stream from the buffer
    const stream = Readable.from(buffer);

    // Call ffprobe on the stream
    // Cast stream to any because the types might be strict, but ffprobe supports it
    ffmpeg.ffprobe(stream as any, (err, metadata) => {
      if (err) {
        console.error("FFprobe error:", err);
        return reject(new Error("Failed to probe video duration."));
      }

      const duration = metadata.format.duration;
      if (duration === undefined) {
        return reject(new Error("Unable to determine video duration."));
      }

      resolve(duration);
    });
  });
}
