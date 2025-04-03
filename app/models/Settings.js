import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Feedback settings
  enableFeedbackCollection: {
    type: Boolean,
    default: true
  },
  feedbackPromptFrequency: {
    type: String,
    enum: ['after_each_chat', 'after_workshop', 'periodic'],
    default: 'after_each_chat'
  },
  feedbackPromptMessage: {
    type: String,
    default: 'Was this response helpful?'
  },
  
  // Sentiment analysis settings
  enableSentimentAnalysis: {
    type: Boolean,
    default: true
  },
  sentimentAnalysisThreshold: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.3
  },
  
  // Notification settings
  enableEmailNotifications: {
    type: Boolean,
    default: false
  },
  notificationEmail: {
    type: String,
    default: ''
  },
  notificationFrequency: {
    type: String,
    enum: ['realtime', 'daily', 'weekly'],
    default: 'daily'
  }
}, {
  timestamps: true
});

// Create a compound index to ensure only one settings document exists
settingsSchema.index({}, { unique: true });

// Create or update the model
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default Settings; 