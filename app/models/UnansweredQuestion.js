import mongoose from 'mongoose';

// Define the schema
const unansweredQuestionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String },
  module: { type: String },
  question_embedding: {
    type: [Number],
    index: {
      type: 'vectorSearch',
      dimensions: 1536,
      similarity: 'cosine'
    }
  },
  used_rag: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'unanswered_questions',
  strict: true
});

// Add indexes
unansweredQuestionSchema.index({ created_at: -1 });
unansweredQuestionSchema.index({ module: 1 });
unansweredQuestionSchema.index({ user_id: 1 });

// Delete the model if it exists to prevent OverwriteModelError during hot reloading
if (mongoose.models.UnansweredQuestion) {
  delete mongoose.models.UnansweredQuestion;
}

// Create and export the model
const UnansweredQuestion = mongoose.model('UnansweredQuestion', unansweredQuestionSchema);

export default UnansweredQuestion; 