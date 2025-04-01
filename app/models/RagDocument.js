import mongoose from 'mongoose';

const ragDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  metadata: {
    category: { type: String },
    tags: [{ type: String }],
    author: { type: String },
    lastUpdated: { type: Date, default: Date.now },
    chunkCount: { type: Number, default: 0 }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'rag_documents'
});

// Add text search index for hybrid search
ragDocumentSchema.index({
  title: 'text',
  content: 'text',
  'metadata.tags': 'text'
});

// Add index for metadata fields
ragDocumentSchema.index({ 'metadata.category': 1 });
ragDocumentSchema.index({ created_at: -1 });

const RagDocument = mongoose.models.RagDocument || mongoose.model('RagDocument', ragDocumentSchema);

export default RagDocument; 