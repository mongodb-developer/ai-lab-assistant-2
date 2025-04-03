// app/components/chat/MessageList.js
'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  CircularProgress,
  Tooltip,
  IconButton,
  Collapse,
  Paper,
  Avatar
} from '@mui/material';
import { 
  SentimentVeryDissatisfied as NegativeIcon,
  SentimentSatisfied as NeutralIcon,
  SentimentVerySatisfied as PositiveIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as ContentCopyIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Person as PersonIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import SentimentDisplay from '../feedback/SentimentDisplay';
import QuickFeedback from '../feedback/QuickFeedback';
import { submitQuickFeedback } from '../../lib/feedbackService';

/**
 * MessageList component - Displays chat messages with Markdown support
 * 
 * Features:
 * - Markdown rendering for messages
 * - Syntax highlighting for code blocks
 * - Message metadata display (title, references, etc.)
 * - Copy to clipboard functionality
 * - Feedback mechanisms (thumbs up/down)
 * - Different styling for user vs assistant messages
 * - Source badge indicating answer origin
 */

const DebugPanel = ({ debug }) => {
  if (!debug) return null;

  console.log('DebugPanel received debug data:', debug);

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Processing Details
      </Typography>

      {/* Database Status */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Database Status:
        </Typography>
        <Typography variant="body2">
          Questions Collection: {debug.hasQuestionCollection ? '✅' : '❌'}
          {debug.totalDocs !== undefined && ` (${debug.totalDocs} docs)`}
        </Typography>
      </Box>

      {/* Vector Search Configuration */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Vector Search Config:
        </Typography>
        <Typography variant="body2">
          Embedding Length: {debug.embeddingLength}
          <br />
          Similarity Threshold: {debug.similarityThreshold}
          <br />
          Num Candidates: {debug.numCandidates}
        </Typography>
      </Box>

      {/* RAG Information */}
      {debug.ragInfo && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary">RAG Details:</Typography>
          <Typography variant="body2">
            Documents Searched: {debug.ragInfo.documentsSearched}
            <br />
            Chunks Retrieved: {debug.ragInfo.chunksRetrieved}
            <br />
            Top Chunk Score: {debug.ragInfo.topChunkScore?.toFixed(4)}
          </Typography>
          {debug.ragInfo.selectedChunks && debug.ragInfo.selectedChunks.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Selected Chunks:
              </Typography>
              {debug.ragInfo.selectedChunks.map((chunk, i) => (
                <Box 
                  key={i}
                  sx={{ 
                    mt: 1,
                    p: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    From "{chunk.title}":
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    mt: 0.5,
                    color: 'text.secondary',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {chunk.content.substring(0, 150)}...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Score: {chunk.score.toFixed(4)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Search Pipeline Results */}
      {debug.rawResults && debug.rawResults.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary">Vector Search Results:</Typography>
          {debug.rawResults.slice(0, 3).map((result, i) => (
            <Box 
              key={i} 
              sx={{ 
                mt: 1,
                p: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {i + 1}. "{result.question}"
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Score: {result.score.toFixed(4)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Module: {result.module || 'none'}
                </Typography>
                {result.distance && (
                  <Typography variant="body2" color="text.secondary">
                    Distance: {result.distance.toFixed(4)}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
          {debug.rawResults.length > 3 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              + {debug.rawResults.length - 3} more results
            </Typography>
          )}
        </Box>
      )}

      {/* Final Result Source */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Response Source: {debug.finalSource}
          {debug.matchedQuestion && ` (Matched: "${debug.matchedQuestion}")`}
          {debug.finalScore && ` Score: ${debug.finalScore.toFixed(4)}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Processing Time: {debug.processingTime}ms
        </Typography>
      </Box>
    </Box>
  );
};

export default function MessageList({ 
  messages, 
  onCopy, 
  onFeedback, 
  feedbackSent,
  expandedMessageId,
  onToggleExpand,
  sessionId,
  workshopId = 'default',
  moduleId = ''
}) {
  const [quickFeedbackOpen, setQuickFeedbackOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [localExpandedMessageId, setLocalExpandedMessageId] = useState(expandedMessageId);

  // Debug logging
  useEffect(() => {
    console.log('MessageList received messages:', messages);
  }, [messages]);

  // Sync with parent component's expandedMessageId
  useEffect(() => {
    setLocalExpandedMessageId(expandedMessageId);
  }, [expandedMessageId]);

  const handleFeedbackClick = (messageId, isPositive) => {
    setSelectedMessageId(messageId);
    setQuickFeedbackOpen(true);
    
    if (onFeedback) {
      onFeedback(messageId, isPositive);
    }
  };

  const handleQuickFeedbackSubmit = async (feedbackData) => {
    setFeedbackLoading(true);
    try {
      await submitQuickFeedback(
        selectedMessageId,
        sessionId,
        feedbackData.ratings.assistant_helpfulness >= 4,
        feedbackData.freeText,
        workshopId,
        moduleId
      );
    } catch (error) {
      console.error('Error submitting quick feedback:', error);
    } finally {
      setFeedbackLoading(false);
      setQuickFeedbackOpen(false);
    }
  };

  const handleToggleExpand = (messageId) => {
    // Toggle the expanded state locally
    const newExpandedId = localExpandedMessageId === messageId ? null : messageId;
    setLocalExpandedMessageId(newExpandedId);
    
    // Notify parent component
    if (onToggleExpand) {
      onToggleExpand(newExpandedId);
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          No messages yet. Start a conversation!
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {messages.map((message, index) => {
        // Debug logging for each message
        console.log(`Rendering message ${index}:`, message);
        
        // Check if message has debug information
        const hasDebug = message.metadata && message.metadata.debug;
        console.log(`Message ${index} has debug:`, hasDebug, message.metadata?.debug);
        
        return (
          <Box
            key={message.id || index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '80%',
                bgcolor: message.role === 'user' ? 'background.paper' : 'background.paper',
                color: message.role === 'user' ? 'text.primary' : 'text.primary',
                border: message.role === 'user' ? '1px solid' : '1px solid',
                borderColor: message.role === 'user' ? 'primary.main' : 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {message.role === 'assistant' && (
                  <SmartToyIcon sx={{ color: 'primary.main' }} />
                )}
                {message.role === 'user' && (
                  <PersonIcon sx={{ color: 'primary.main' }} />
                )}
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" component="div">
                    {message.content ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No content available
                      </Typography>
                    )}
                  </Typography>
                  
                  {message.metadata?.debug && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Match Score: {message.metadata.match_score?.toFixed(2) || 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    size="small"
                    onClick={() => onCopy(message.content)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {message.role === 'assistant' && !message.error && (
                  <>
                    <Tooltip title="Helpful">
                      <IconButton
                        size="small"
                        onClick={() => handleFeedbackClick(message.id, true)}
                        sx={{ 
                          color: feedbackSent[message.id] === 'positive' ? 'primary.main' : 'text.secondary'
                        }}
                      >
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Not helpful">
                      <IconButton
                        size="small"
                        onClick={() => handleFeedbackClick(message.id, false)}
                        sx={{ 
                          color: feedbackSent[message.id] === 'negative' ? 'error.main' : 'text.secondary'
                        }}
                      >
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}

                {hasDebug && (
                  <Tooltip title="Toggle debug info">
                    <IconButton
                      size="small"
                      onClick={() => handleToggleExpand(message.id)}
                      sx={{ color: 'text.secondary' }}
                    >
                      {localExpandedMessageId === message.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>

            {/* Debug Panel */}
            {hasDebug && (
              <Collapse in={localExpandedMessageId === message.id}>
                <DebugPanel debug={message.metadata.debug} />
              </Collapse>
            )}
          </Box>
        );
      })}

      {/* Quick Feedback Dialog */}
      <QuickFeedback
        open={quickFeedbackOpen}
        onClose={() => setQuickFeedbackOpen(false)}
        onSubmit={handleQuickFeedbackSubmit}
        messageId={selectedMessageId}
        chatSessionId={sessionId}
        workshopId={workshopId}
        moduleId={moduleId}
      />
    </Box>
  );
}