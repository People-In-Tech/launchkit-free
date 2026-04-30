// @ts-nocheck
/**
 * LaunchKit RAG — Embedding functions
 * Uses OpenAI text-embedding-3-small (1536 dims, cheap, fast)
 */
import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const EMBEDDING_MODEL = openai.embedding("text-embedding-3-small");

/** Embed a single string → number[] */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: text.trim().slice(0, 8000), // respect token limit
  });
  return embedding;
}

/** Embed multiple strings in one API call (batched) */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: texts.map((t) => t.trim().slice(0, 8000)),
  });
  return embeddings;
}

/**
 * Chunk long text into overlapping segments for better retrieval.
 * @param text     Full text to chunk
 * @param size     Approximate chars per chunk (default 1200)
 * @param overlap  Overlap between chunks in chars (default 200)
 */
export function chunkText(
  text: string,
  size = 1200,
  overlap = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start += size - overlap;
  }

  return chunks.filter((c) => c.length > 20); // drop tiny trailing chunks
}
