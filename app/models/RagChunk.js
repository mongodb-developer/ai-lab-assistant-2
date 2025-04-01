import mongoose from 'mongoose';

const ragChunkSchema = new mongoose.Schema({
  document_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RagDocument',
    required: true,
    index: true
  },
  content: { type: String, required: true },
  embedding: {
    type: [Number],
    required: true,
    index: {
      type: 'vectorSearch',
      name: 'chunk_embedding_index',
      dimensions: 1536,
      similarity: 'cosine'
    }
  },
  metadata: {
    startIndex: { type: Number, required: true },
    endIndex: { type: Number, required: true },
    section: { type: String },
    sequence: { type: Number, required: true }
  }
}, {
  timestamps: true,
  collection: 'rag_chunks'
});

// Add text search index for hybrid search
ragChunkSchema.index({
  content: 'text'
});

// Add index for sequence order retrieval
ragChunkSchema.index({ document_id: 1, 'metadata.sequence': 1 });

const RagChunk = mongoose.models.RagChunk || mongoose.model('RagChunk', ragChunkSchema);

export default RagChunk;