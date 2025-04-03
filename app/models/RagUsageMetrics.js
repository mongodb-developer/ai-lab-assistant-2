import mongoose from 'mongoose';

const ragUsageMetricsSchema = new mongoose.Schema({
  document_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RagDocument',
    required: true,
    index: true
  },
  chunk_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RagChunk',
    required: true,
    index: true
  },
  query_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RagQuery',
    required: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  chat_session_id: {
    type: String,
    required: true,
    index: true
  },
  relevance_score: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Create compound indexes for efficient querying
ragUsageMetricsSchema.index({ document_id: 1, created_at: -1 });
ragUsageMetricsSchema.index({ chunk_id: 1, created_at: -1 });
ragUsageMetricsSchema.index({ user_id: 1, created_at: -1 });

const RagUsageMetrics = mongoose.models.RagUsageMetrics || mongoose.model('RagUsageMetrics', ragUsageMetricsSchema);

export default RagUsageMetrics; 