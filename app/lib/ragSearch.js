import { generateEmbedding } from './embeddings';
import RagDocument from '../models/RagDocument';
import RagChunk from '../models/RagChunk';
import RagQuery from '../models/RagQuery';

const MAX_CHUNKS = 5;
const SIMILARITY_THRESHOLD = 0.7;

/**
 * Performs hybrid search (vector + text) on RAG chunks
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @returns {Promise<Array<{chunk: Object, score: number}>>} Retrieved chunks with scores
 */
export async function searchRagDocuments(query, options = {}) {
  const {
    maxChunks = MAX_CHUNKS,
    similarityThreshold = SIMILARITY_THRESHOLD,
    category,
    tags
  } = options;

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Check if we have documents with embeddings first
    const docsCount = await RagChunk.countDocuments();
    console.log(`Found ${docsCount} chunks in database`);
    
    if (docsCount === 0) {
      console.log('No chunks found, returning empty results');
      return [];
    }
    
    // Try with a fallback approach if vector search isn't available
    try {
      // Build the aggregation pipeline with vector search
      const pipeline = [
        // Vector search on chunk embeddings
        {
          $vectorSearch: {
            queryVector: queryEmbedding,
            path: 'embedding',
            numCandidates: 100,
            limit: maxChunks * 2, // Get more candidates for filtering
            index: 'chunk_embedding_index'
          }
        },
    
        // Add score field
        {
          $addFields: {
            score: { $meta: 'vectorSearchScore' }
          }
        },
        
        // Filter by similarity threshold
        {
          $match: {
            score: { $gte: similarityThreshold }
          }
        },
        
        // Lookup the parent document to get title and metadata
        {
          $lookup: {
            from: 'rag_documents',
            localField: 'document_id',
            foreignField: '_id',
            as: 'document'
          }
        },
        
        // Unwind the result of lookup
        {
          $unwind: '$document'
        },
        
        // Add category/tag filters if needed
        ...(category ? [{ $match: { 'document.metadata.category': category } }] : []),
        ...(tags && tags.length > 0 ? [{ $match: { 'document.metadata.tags': { $in: tags } } }] : []),
        
        // Sort by score
        {
          $sort: { score: -1 }
        },
        
        // Limit to requested number of chunks
        {
          $limit: maxChunks
        },
        
        // Project final results
        {
          $project: {
            documentId: '$document_id',
            title: '$document.title',
            chunk: {
              content: '$content',
              metadata: '$metadata'
            },
            score: 1,
            documentMetadata: '$document.metadata'
          }
        }
      ];

        // Execute the search
        const results = await RagChunk.aggregate(pipeline);
        return results;
      } catch (vectorError) {
        // If vector search fails (likely due to missing index), use a simpler approach
        console.error('Vector search failed, using fallback method:', vectorError.message);
        
        // Fallback to simpler query without vector search
        const simplePipeline = [
          // Sort by recency as a fallback
          { $sort: { createdAt: -1 } },
          
          // Limit results
          { $limit: maxChunks },
          
          // Lookup the parent document to get title and metadata
          {
            $lookup: {
              from: 'rag_documents',
              localField: 'document_id',
              foreignField: '_id',
              as: 'document'
            }
          },
          
          // Unwind the result of lookup
          { $unwind: '$document' },
          
          // Project final results
          {
            $project: {
              documentId: '$document_id',
              title: '$document.title',
              chunk: {
                content: '$content',
                metadata: '$metadata'
              },
              score: 0.5, // Default score for fallback results
              documentMetadata: '$document.metadata'
            }
          }
        ];
        
        const fallbackResults = await RagChunk.aggregate(simplePipeline);
        return fallbackResults;
      }
    } catch (error) {
      console.error('Error in RAG search:', error);
      return [];
    }
}

/**
 * Retrieves relevant chunks for a question and builds context
 * @param {string} question - The user's question
 * @param {Object} options - Search options
 * @returns {Promise<{chunks: Array<Object>, context: string}>} Retrieved chunks and built context
 */
export async function getRelevantChunks(question, options = {}) {
  const chunks = await searchRagDocuments(question, options);
  
  // Build context from chunks
  const context = chunks
    .map(result => `From "${result.title}":\n${result.chunk.content}`)
    .join('\n\n');
  
  return {
    chunks,
    context
  };
}

/**
 * Tracks a RAG query and its results
 * @param {string} question - The user's question
 * @param {Array<Object>} chunks - Retrieved chunks
 * @param {string} response - The final response
 * @returns {Promise<void>}
 */
export async function trackRagQuery(question, chunks, response) {
  try {
    const questionEmbedding = await generateEmbedding(question);
    
    // Make sure we have valid scores for all chunks
    const chunkData = chunks.map(chunk => {
      // Default to 0.5 if score is missing or invalid
      let score = chunk.score;
      if (score === undefined || score === null || typeof score !== 'number') {
        score = 0.5;
      }
      
      return {
        document_id: chunk.documentId,
        chunk_index: chunk.chunk.metadata.sequence || 0,
        relevance_score: score
      };
    });
    
    const ragQuery = new RagQuery({
      question,
      question_embedding: questionEmbedding,
      retrieved_chunks: chunkData,
      response
    });
    
    await ragQuery.save();
  } catch (error) {
    console.error('Error tracking RAG query:', error);
    // Don't throw the error as this is non-critical functionality
  }
}