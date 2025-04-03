'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import { isFeedbackCollectionEnabled, getFeedbackPromptMessage } from '../../lib/settingsService';
import { submitQuickFeedback } from '../../lib/feedbackService';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

/**
 * QuickFeedback component - A simple dialog for collecting quick feedback
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog is closed
 * @param {string} props.workshopId - ID of the workshop
 * @param {string} props.moduleId - ID of the module
 * @param {Function} props.onSubmit - Function to call when feedback is submitted
 * @param {string} props.messageId - ID of the message being rated
 * @param {string} props.chatSessionId - ID of the chat session
 * @param {string} props.title - Dialog title
 * @param {string} props.subtitle - Dialog subtitle
 */
export default function QuickFeedback({ 
  open, 
  onClose, 
  workshopId, 
  moduleId, 
  onSubmit,
  messageId,
  chatSessionId,
  title = "Was this response helpful?",
  subtitle = "Your feedback helps us improve our AI assistant."
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleRatingChange = (newValue) => {
    setRating(newValue);
    if (newValue < 4) {
      setShowComment(true);
    }
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        workshopId,
        moduleId,
        feedbackType: 'chat',
        ratings: {
          assistant_helpfulness: rating
        },
        freeText: comment,
        messageId,
        chatSessionId
      });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setRating(0);
    setComment('');
    setShowComment(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          {subtitle}
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SentimentVeryDissatisfiedIcon color="error" />
            <Rating
              name="quick-feedback"
              value={rating}
              onChange={(e, newValue) => handleRatingChange(newValue)}
              precision={1}
              size="large"
            />
            <SentimentVerySatisfiedIcon color="success" />
          </Box>
          
          {showComment && (
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Please tell us how we can improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || rating === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 