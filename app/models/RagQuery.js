import mongoose from 'mongoose';

const retrievedChunkSchema = new mongoose.Schema({
  document_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RagDocument', required: true },
  chunk_index: { type: Number, required: true },
  relevance_score: { type: Number, required: true }
});

const ragQuerySchema = new mongoose.Schema({
  question: { type: String, required: true },
  question_embedding: {
    type: [Number],
    required: true,
    index: {
      type: 'vectorSearch',
      dimensions: 1536,
      similarity: 'cosine'
    }
  },
  retrieved_chunks: [retrievedChunkSchema],
  response: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'rag_queries',
  strict: true
});

// Add text search index for hybrid search
ragQuerySchema.index({
  question: 'text',
  response: 'text'
});

// Add index for tracking
ragQuerySchema.index({ created_at: -1 });

const RagQuery = mongoose.models.RagQuery || mongoose.model('RagQuery', ragQuerySchema);

export default RagQuery; 