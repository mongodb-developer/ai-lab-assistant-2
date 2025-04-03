'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Rating,
  Stack,
  CircularProgress,
  Grid
} from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { isFeedbackCollectionEnabled } from '../../lib/settingsService';
import { submitWorkshopFeedback } from '../../lib/feedbackService';

/**
 * FeedbackPrompt component - A dialog for collecting user feedback
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog is closed
 * @param {string} props.workshopId - ID of the workshop
 * @param {string} props.moduleId - ID of the module
 * @param {Function} props.onSubmit - Function to call when feedback is submitted
 * @param {Object} props.initialRatings - Initial ratings values
 * @param {Object} props.initialConceptConfidence - Initial concept confidence values
 * @param {string} props.title - Dialog title
 * @param {string} props.subtitle - Dialog subtitle
 */
export default function FeedbackPrompt({ 
  open, 
  onClose, 
  workshopId, 
  moduleId, 
  onSubmit,
  initialRatings = {},
  initialConceptConfidence = {},
  title = "Share Your Workshop Experience",
  subtitle = "Your feedback helps us improve our MongoDB Developer Days workshops!"
}) {
  const [ratings, setRatings] = useState({
    overall_satisfaction: initialRatings.overall_satisfaction || 3,
    difficulty: initialRatings.difficulty || 3,
    pace: initialRatings.pace || 3,
    materials_quality: initialRatings.materials_quality || 3,
    assistant_helpfulness: initialRatings.assistant_helpfulness || 3
  });
  
  const [conceptConfidence, setConceptConfidence] = useState({
    'data_modeling': initialConceptConfidence.data_modeling || 3,
    'aggregation': initialConceptConfidence.aggregation || 3,
    'indexing': initialConceptConfidence.indexing || 3,
    'atlas_search': initialConceptConfidence.atlas_search || 3
  });
  
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  
  // Check if feedback collection is enabled
  useEffect(() => {
    const checkFeedbackEnabled = async () => {
      try {
        const enabled = await isFeedbackCollectionEnabled();
        setFeedbackEnabled(enabled);
      } catch (error) {
        console.error('Error checking feedback settings:', error);
        // Default to enabled if there's an error
        setFeedbackEnabled(true);
      }
    };
    
    checkFeedbackEnabled();
  }, []);
  
  const handleSubmit = async () => {
    // Check if all ratings are provided
    const missingRatings = Object.entries(ratings)
      .filter(([_, value]) => value === 0)
      .map(([key]) => key);
    
    if (missingRatings.length > 0) {
      setError(`Please provide ratings for: ${missingRatings.join(', ')}`);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await submitWorkshopFeedback({
        workshop_id: workshopId,
        module_id: moduleId,
        ratings,
        comment: freeText,
        trigger_type: 'workshop_completion'
      });
      
      // Reset form
      setRatings({
        overall_satisfaction: 0,
        difficulty: 0,
        pace: 0,
        materials_quality: 0,
        assistant_helpfulness: 0
      });
      setFreeText('');
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Error submitting feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    // Reset form
    setRatings({
      overall_satisfaction: 0,
      difficulty: 0,
      pace: 0,
      materials_quality: 0,
      assistant_helpfulness: 0
    });
    setFreeText('');
    setError(null);
    
    // Close dialog
    onClose();
  };
  
  if (!feedbackEnabled) {
    return null;
  }
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          {subtitle}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1" gutterBottom>
              Please rate your experience with this workshop:
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Overall Satisfaction
              </Typography>
              <Rating
                value={ratings.overall_satisfaction}
                onChange={(e, newValue) => setRatings({...ratings, overall_satisfaction: newValue})}
                size="large"
                precision={1}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Difficulty Level
              </Typography>
              <Rating
                value={ratings.difficulty}
                onChange={(e, newValue) => setRatings({...ratings, difficulty: newValue})}
                size="large"
                precision={1}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Assistant Helpfulness
              </Typography>
              <Rating
                value={ratings.assistant_helpfulness}
                onChange={(e, newValue) => setRatings({...ratings, assistant_helpfulness: newValue})}
                size="large"
                precision={1}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Content Quality
              </Typography>
              <Rating
                value={ratings.materials_quality}
                onChange={(e, newValue) => setRatings({...ratings, materials_quality: newValue})}
                size="large"
                precision={1}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Comments (Optional)"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              disabled={loading}
            />
          </Grid>
          
          {error && (
            <Grid item xs={12}>
              <Typography color="error">
                {error}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || Object.values(ratings).some(value => value === 0)}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 