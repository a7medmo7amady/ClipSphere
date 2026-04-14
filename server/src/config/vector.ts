const parsedEmbeddingVectorLength = Number(
  process.env.VIDEO_EMBEDDING_VECTOR_LENGTH ?? "768"
);

export const VIDEO_EMBEDDING_VECTOR_LENGTH =
  Number.isInteger(parsedEmbeddingVectorLength) && parsedEmbeddingVectorLength > 0
    ? parsedEmbeddingVectorLength
    : 768;
