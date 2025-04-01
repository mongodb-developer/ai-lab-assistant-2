import mongoose from 'mongoose';

// Define the schema
const questionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String },
  title: { type: String },
  summary: { type: String },
  references: [String],
  module: { type: String },
  question_embedding: {
    type: [Number],
    index: {
      type: 'vectorSearch',
      dimensions: 1536,
      similarity: 'cosine'
    }
  },
  answer_embedding: {
    type: [Number],
    index: {
      type: 'vectorSearch',
      dimensions: 1536,
      similarity: 'cosine'
    }
  },
  schema_version: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'questions',
  strict: true
});

// Add indexes
questionSchema.index({ created_at: -1 });
questionSchema.index({ module: 1 });
questionSchema.index({ user_id: 1 });

// Text search index for fuzzy matching
questionSchema.index({
  question: 'text',
  answer: 'text',
  title: 'text'
});

// Delete the model if it exists to prevent OverwriteModelError during hot reloading
if (mongoose.models.Question) {
  delete mongoose.models.Question;
}

// Create and export the model
const Question = mongoose.model('Question', questionSchema);

export default Question;