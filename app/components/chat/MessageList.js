// app/components/chat/MessageList.js
import { Box, Typography, IconButton, Tooltip, Paper, Chip, Collapse, Card, CardContent, Avatar } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactMarkdown from 'react-markdown';
import DatabaseIcon from '@mui/icons-material/Storage';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';

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

  return (
    <Card variant="outlined" sx={{ mt: 2, bgcolor: '#FAFAFA' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugReportIcon fontSize="small" />
          Question Processing Details
        </Typography>

        {/* Collection Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary">Database Status:</Typography>
          <Typography variant="body2">
            Collection: {debug.hasQuestionCollection ? '✅ Found' : '❌ Not Found'}
          </Typography>
          <Typography variant="body2">
            Total Documents: {debug.totalDocs}
          </Typography>
        </Box>

        {/* Vector Search Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary">Vector Search Configuration:</Typography>
          <Typography variant="body2">
            Embedding Length: {debug.embeddingLength} dimensions
          </Typography>
          <Typography variant="body2">
            Similarity Threshold: {debug.similarityThreshold}
          </Typography>
          <Typography variant="body2">
            Search Candidates: {debug.numCandidates}
          </Typography>
          {debug.vectorSearchQuery && (
            <>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>Search Pipeline:</Typography>
              <Box 
                component="pre"
                sx={{ 
                  mt: 1,
                  p: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}
              >
                {JSON.stringify(debug.vectorSearchQuery, null, 2)}
              </Box>
            </>
          )}
        </Box>

        {/* Search Results */}
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

        {/* RAG Information (if applicable) */}
        {debug.finalSource === 'rag_llm' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary">RAG Information:</Typography>
            <Box 
              sx={{ 
                p: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2">
                Chunks Found: {debug.ragChunksFound || 0}
              </Typography>
              {debug.topRagScore !== undefined && (
                <Typography variant="body2">
                  Top Chunk Score: {debug.topRagScore.toFixed(4)}
                </Typography>
              )}
              <Typography variant="body2">
                Used RAG Context: {debug.usedRagContext ? '✅ Yes' : '❌ No'}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Final Result */}
        <Box>
          <Typography variant="subtitle2" color="primary">Final Result:</Typography>
          <Box 
            sx={{ 
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2">
              Source: {debug.finalSource}
            </Typography>
            {debug.matchedQuestion && (
              <Typography variant="body2">
                Matched Question: "{debug.matchedQuestion}"
              </Typography>
            )}
            {debug.finalScore && (
              <Typography variant="body2">
                Match Score: {debug.finalScore.toFixed(4)}
              </Typography>
            )}
            {debug.processingTime && (
              <Typography variant="body2" color="text.secondary">
                Processing Time: {debug.processingTime}ms
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function MessageList({ 
  messages, 
  onCopy, 
  onFeedback, 
  feedbackSent,
  expandedMessageId,
  onToggleExpand
}) {
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
      {messages.map((message, index) => (
        <Box
          key={message.id || index}
          sx={{
            display: 'flex',
            flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            gap: 2,
            alignItems: 'flex-start'
          }}
        >
          {/* Avatar */}
          <Avatar
            sx={{
              bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
              width: 32,
              height: 32
            }}
          >
            {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
          </Avatar>

          {/* Message Content */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              maxWidth: '70%',
              backgroundColor: message.role === 'user' ? '#FFFFFF' : '#F9FBFA',
              borderRadius: 2,
              border: '1px solid',
              borderColor: '#E8EDEB'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body1" 
                  component="div"
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 400
                  }}
                >
                  {message.role === 'user' ? (
                    message.content
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )}
                </Typography>
                
                {message.role === 'assistant' && message.metadata?.source && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={
                        message.metadata.source.type === 'database' ? <DatabaseIcon /> : 
                        message.metadata.source.type === 'rag_llm' ? <DatabaseIcon /> :
                        <SmartToyIcon />
                      }
                      label={`${message.metadata.source.label} ${message.metadata.source.confidence !== 'N/A' ? `(${message.metadata.source.confidence})` : ''}`}
                      size="small"
                      color={
                        message.metadata.source.type === 'database' ? 'primary' : 
                        message.metadata.source.type === 'rag_llm' ? 'info' :
                        'secondary'
                      }
                      variant="outlined"
                    />
                    {message.metadata.source.matched_question && (
                      <Typography variant="caption" color="text.secondary">
                        Matched: "{message.metadata.source.matched_question}"
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Debug Information */}
                {message.role === 'assistant' && message.metadata?.debug && (
                  <>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={<BugReportIcon />}
                        label={expandedMessageId === message.id ? "Hide Processing Details" : "Show Processing Details"}
                        size="small"
                        onClick={() => onToggleExpand(expandedMessageId === message.id ? null : message.id)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      />
                    </Box>
                    <Collapse in={expandedMessageId === message.id}>
                      <DebugPanel debug={message.metadata.debug} />
                    </Collapse>
                  </>
                )}
              </Box>
              
              {/* Action Buttons */}
              {message.role === 'assistant' && (
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <Tooltip title="Copy">
                    <IconButton 
                      size="small" 
                      onClick={() => onCopy(message.content)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Helpful">
                    <IconButton 
                      size="small"
                      onClick={() => onFeedback(message.id, true)}
                      sx={{ 
                        color: feedbackSent[message.id] === 'positive' ? 'primary.main' : 'text.secondary'
                      }}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Not Helpful">
                    <IconButton 
                      size="small"
                      onClick={() => onFeedback(message.id, false)}
                      sx={{ 
                        color: feedbackSent[message.id] === 'negative' ? 'error.main' : 'text.secondary'
                      }}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            
            {/* Message Metadata */}
            {message.metadata && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {message.metadata.references && Array.isArray(message.metadata.references) ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      References:
                    </Typography>
                    {message.metadata.references.map((ref, idx) => (
                      <Box key={idx} sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'info.light' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          {ref.title} {ref.score ? `(${Math.round(ref.score * 100)}%)` : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          {ref.snippet}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : message.metadata.references && (
                  <Typography variant="caption" color="text.secondary">
                    References: {message.metadata.references}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
}