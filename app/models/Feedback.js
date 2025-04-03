import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workshop_id: { type: String, required: true },
  module_id: { type: String },
  trigger_type: { type: String, enum: ['prompt', 'error', 'completion', 'chat', 'exit'] },
  ratings: {
    overall_satisfaction: { type: Number, min: 1, max: 5 },
    difficulty: { type: Number, min: 1, max: 5 },
    pace: { type: Number, min: 1, max: 5 },
    materials_quality: { type: Number, min: 1, max: 5 },
    assistant_helpfulness: { type: Number, min: 1, max: 5 }
  },
  concept_confidence: {
    // Dynamic field for various MongoDB concepts
    type: Map,
    of: Number // 1-5 scale
  },
  sentiment_analysis: {
    score: Number, // -1 to 1
    magnitude: Number,
    dominant_emotion: String
  },
  free_text: String,
  pain_points: [String],
  highlights: [String],
  suggestions: String,
  created_at: { type: Date, default: Date.now }
});

// Indexes for efficient querying
feedbackSchema.index({ workshop_id: 1 });
feedbackSchema.index({ module_id: 1 });
feedbackSchema.index({ user_id: 1 });
feedbackSchema.index({ created_at: 1 });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback; 