import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema({
  type: String,
  label: String,
  description: String,
  confidence: String
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    required: true,
    enum: ['user', 'assistant', 'system']
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    title: String,
    summary: String,
    references: [{
      title: String,
      snippet: String,
      score: Number
    }],
    source: sourceSchema
  }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  lastActive: { 
    type: Date, 
    default: Date.now 
  },
  contextWindow: { 
    type: Number, 
    default: 5 
  }
}, {
  timestamps: true,
  collection: 'chat_sessions'
});

// Index for session lookup
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ lastActive: 1 });

// Method to get recent messages within context window
chatSessionSchema.methods.getRecentMessages = function() {
  const startIndex = Math.max(0, this.messages.length - this.contextWindow * 2);
  return this.messages.slice(startIndex);
};

// Method to add a message and maintain context window
chatSessionSchema.methods.addMessage = function(message) {
  this.messages.push(message);
  this.lastActive = new Date();
  
  // If we exceed context window, remove oldest messages
  if (this.messages.length > this.contextWindow * 2) {
    this.messages = this.messages.slice(-this.contextWindow * 2);
  }
};

const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession; 