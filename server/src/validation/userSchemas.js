const { z } = require("zod");

const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    bio: z.string().trim().max(240).optional(),
  })
  .strict();

// Metadata-only avatar endpoint: store MinIO object name (no file upload yet).
const updateAvatarSchema = z
  .object({
    objectName: z.string().trim().min(1).max(512),
  })
  .strict();

module.exports = {
  updateMeSchema,
  updateAvatarSchema,
};

