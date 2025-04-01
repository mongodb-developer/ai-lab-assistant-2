// app/components/chat/ChatInterface.js
import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  CircularProgress, 
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  Card,
  CardContent
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BugReportIcon from '@mui/icons-material/BugReport';
import StorageIcon from '@mui/icons-material/Storage';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SampleQuestions from './SampleQuestions';
import MessageList from './MessageList';

// Mock session for development
const mockSession = {
  user: {
    email: 'dev@example.com',
    name: 'Developer',
    image: null
  }
};

/**
 * ChatInterface component - Main interface for the MongoDB AI Lab Assistant
 * 
 * Features:
 * - Question input and submission
 * - Module selection for domain-specific questions
 * - Message history display with Markdown support
 * - Sample questions for getting started
 * - Feedback mechanism
 * - Conversation history (mocked)
 */
export default function ChatInterface() {
  const session = mockSession;
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSamples, setShowSamples] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [feedbackSent, setFeedbackSent] = useState({});
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load conversation history
  useEffect(() => {
    if (session) {
      fetchConversationHistory();
    }
  }, [session]);
  
  const fetchConversationHistory = async () => {
    try {
      // This would be an actual API call in the real implementation
      // Mocked for now
      setConversationHistory([
        { id: '1', title: 'MongoDB Aggregation Pipeline', date: '2023-11-27' },
        { id: '2', title: 'Atlas Vector Search Setup', date: '2023-11-25' },
        { id: '3', title: 'Schema Design Best Practices', date: '2023-11-20' },
      ]);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setShowSamples(false);
    setIsLoading(true);
    
    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMessage,
          debug: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Add assistant message to the chat
      setMessages(prev => [...prev, { 
        id: Date.now().toString(),
        role: 'assistant', 
        content: data.answer,
        metadata: {
          title: data.title,
          summary: data.summary,
          references: data.references,
          source: data.source,
          match_score: data.match_score,
          debug: data.debug
        }
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(),
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.',
        error: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSampleQuestionClick = (question) => {
    setInput(question);
    handleSubmit({ preventDefault: () => {} });
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleCopyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };
  
  const handleFeedback = async (messageId, isPositive) => {
    // Prevent multiple feedback on the same message
    if (feedbackSent[messageId]) return;
    
    try {
      // This would be an actual API call in the real implementation
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ messageId, isPositive }),
      // });
      
      // Update state to show feedback was sent
      setFeedbackSent(prev => ({ ...prev, [messageId]: isPositive ? 'positive' : 'negative' }));
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };
  
  const renderConversationHistory = () => (
    <Paper elevation={3} sx={{ 
      position: 'absolute', 
      top: 70, 
      right: 20, 
      width: 300, 
      maxHeight: 400,
      overflowY: 'auto',
      p: 2,
      zIndex: 100
    }}>
      <Typography variant="h6" gutterBottom>Recent Conversations</Typography>
      <Divider sx={{ mb: 2 }} />
      {conversationHistory.length > 0 ? (
        conversationHistory.map(convo => (
          <Box key={convo.id} sx={{ mb: 2, p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer' }}>
            <Typography variant="body2" fontWeight="bold">{convo.title}</Typography>
            <Typography variant="caption" color="text.secondary">{convo.date}</Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">No conversation history</Typography>
      )}
    </Paper>
  );
  
  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', // Subtract header height
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      bgcolor: '#F9FBFA'
    }}>
      {/* Chat Messages */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        p: 3,
        marginBottom: '80px'
      }}>
        {showSamples ? (
          <SampleQuestions onQuestionClick={handleSampleQuestionClick} />
        ) : (
          <MessageList 
            messages={messages} 
            onCopy={handleCopyToClipboard}
            onFeedback={handleFeedback}
            feedbackSent={feedbackSent}
            expandedMessageId={expandedMessageId}
            onToggleExpand={setExpandedMessageId}
          />
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Input Area */}
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 2, 
          borderTop: '1px solid #E8EDEB',
          display: 'flex', 
          gap: 2,
          bgcolor: '#FFFFFF',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80px'
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <Button 
          variant="contained" 
          color="primary"
          type="submit"
          disabled={isLoading}
          sx={{ minWidth: 100 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
    </Box>
  );
}