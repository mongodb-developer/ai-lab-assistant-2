import OpenAI from 'openai';
import { LRUCache } from 'lru-cache';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create LRU cache with max size of 1000 items
const embeddingCache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

/**
 * Generate embedding for a given text using OpenAI's API
 * @param {string} text - The text to generate embedding for
 * @returns {Promise<number[]>} - The embedding vector
 */
export async function generateEmbedding(text) {
  // Check cache first
  const cachedEmbedding = embeddingCache.get(text);
  if (cachedEmbedding) {
    return cachedEmbedding;
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    const embedding = response.data[0].embedding;
    
    // Cache the result
    embeddingCache.set(text, embedding);
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} - Cosine similarity score
 */
export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));

  return dotProduct / (norm1 * norm2);
} 