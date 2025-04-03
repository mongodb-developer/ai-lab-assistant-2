import { generateEmbedding } from './embeddings';
import RagDocument from '../models/RagDocument';
import RagChunk from '../models/RagChunk';
import RagQuery from '../models/RagQuery';
import RagUsageMetrics from '../models/RagUsageMetrics';

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
    tags,
    debug = false
  } = options;

  const debugInfo = debug ? {
    documentsSearched: 0,
    chunksRetrieved: 0,
    topChunkScore: null,
    selectedChunks: [],
    errors: [],
    timings: {
      embedding: 0,
      search: 0,
      total: 0
    }
  } : null;

  const startTime = debug ? Date.now() : null;

  try {
    // Generate embedding for the query
    console.log('Generating query embedding...');
    const embeddingStart = debug ? Date.now() : null;
    const queryEmbedding = await generateEmbedding(query);
    if (debug) {
      debugInfo.timings.embedding = Date.now() - embeddingStart;
    }
    
    // Check if we have documents with embeddings first
    const docsCount = await RagChunk.countDocuments();
    console.log(`Found ${docsCount} chunks in database`);
    
    if (docsCount === 0) {
      console.log('No chunks found, returning empty results');
      if (debug) {
        debugInfo.errors.push('No chunks found in database');
      }
      return { chunks: [], debugInfo };
    }

    if (debug) {
      debugInfo.documentsSearched = docsCount;
    }
    
    // Try with a fallback approach if vector search isn't available
    try {
      console.log('Executing vector search...');
      const searchStart = debug ? Date.now() : null;

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
      console.log('Executing aggregation pipeline...');
      const results = await RagChunk.aggregate(pipeline);
      
      if (debug) {
        debugInfo.timings.search = Date.now() - searchStart;
        debugInfo.chunksRetrieved = results.length;
        if (results.length > 0) {
          debugInfo.topChunkScore = results[0].score;
          debugInfo.selectedChunks = results.map(r => ({
            title: r.title,
            content: r.chunk.content,
            score: r.score,
            metadata: r.documentMetadata
          }));
        }
      }

      console.log(`Found ${results.length} relevant chunks`);
      
      if (debug) {
        debugInfo.timings.total = Date.now() - startTime;
      }
      
      return { chunks: results, debugInfo };

    } catch (vectorError) {
      console.error('Vector search failed:', vectorError);
      if (debug) {
        debugInfo.errors.push(`Vector search failed: ${vectorError.message}`);
      }
      
      // Fallback to simpler query without vector search
      console.log('Using fallback search method...');
      const fallbackStart = debug ? Date.now() : null;
      
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
      
      if (debug) {
        debugInfo.timings.search = Date.now() - fallbackStart;
        debugInfo.chunksRetrieved = fallbackResults.length;
        debugInfo.selectedChunks = fallbackResults.map(r => ({
          title: r.title,
          content: r.chunk.content,
          score: 0.5,
          metadata: r.documentMetadata
        }));
      }

      console.log(`Found ${fallbackResults.length} chunks using fallback method`);
      
      if (debug) {
        debugInfo.timings.total = Date.now() - startTime;
      }
      
      return { chunks: fallbackResults, debugInfo };
    }
  } catch (error) {
    console.error('Error in RAG search:', error);
    if (debug) {
      debugInfo.errors.push(`RAG search error: ${error.message}`);
      debugInfo.timings.total = Date.now() - startTime;
    }
    return { chunks: [], debugInfo };
  }
}

/**
 * Retrieves relevant chunks for a question and builds context
 * @param {string} question - The user's question
 * @param {Object} options - Search options
 * @returns {Promise<{chunks: Array<Object>, context: string, debugInfo: Object}>} Retrieved chunks and built context
 */
export async function getRelevantChunks(question, options = {}) {
  const { chunks, debugInfo } = await searchRagDocuments(question, {
    ...options,
    debug: options.debug
  });
  
  return {
    chunks,
    debugInfo
  };
}

/**
 * Tracks a RAG query and its results
 * @param {string} question - The user's question
 * @param {Array<Object>} chunks - Retrieved chunks
 * @param {string} response - The final response
 * @param {string} userId - The user's ID
 * @param {string} chatSessionId - The chat session ID
 * @returns {Promise<void>}
 */
export async function trackRagQuery(question, chunks, response, userId, chatSessionId) {
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
    
    // Create the RAG query record
    const ragQuery = new RagQuery({
      question,
      question_embedding: questionEmbedding,
      retrieved_chunks: chunkData,
      response
    });
    
    await ragQuery.save();
    
    // Record usage metrics for each chunk
    const usageMetrics = chunks.map(chunk => ({
      document_id: chunk.documentId,
      chunk_id: chunk.chunk._id,
      query_id: ragQuery._id,
      user_id: userId,
      chat_session_id: chatSessionId,
      relevance_score: chunk.score || 0.5
    }));
    
    // Save all usage metrics
    await RagUsageMetrics.insertMany(usageMetrics);
    
  } catch (error) {
    console.error('Error tracking RAG query:', error);
    // Don't throw the error as this is non-critical functionality
  }
}