'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { submitWorkshopFeedback } from '../../lib/feedbackService';

const WORKSHOPS = [
  { id: 'intro_lab', name: 'Intro Lab' },
  { id: 'data_modeling_hands_on', name: 'Data Modeling Hands On Session' },
  { id: 'aggregation_lab', name: 'Aggregation Lab' },
  { id: 'search_lab', name: 'Search Lab' },
  { id: 'emcee_slides', name: 'Emcee Slides' },
  { id: 'relational_migrator_lab', name: 'Relational Migrator Lab' },
  { id: 'data_modeling_rdbms', name: 'Data Modeling for RDBMS Professionals' },
  { id: 'sql_to_mongodb', name: 'SQL to MongoDB Query API and Aggregation' },
  { id: 'ai_rag_lab', name: 'AI RAG Lab' },
  { id: 'ai_agents_lab', name: 'AI Agents Lab' },
  { id: 'vector_search_lab', name: 'Vector Search Lab' },
  { id: 'other', name: 'Other / No current workshop' }
];

export default function WorkshopSurvey({ 
  open, 
  onClose,
  sessionId
}) {
  const [workshopId, setWorkshopId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!workshopId) {
      setError('Please select a workshop');
      return;
    }

    setLoading(true);
    try {
      await submitWorkshopFeedback({
        workshop_id: workshopId,
        session_id: sessionId,
        ratings: {
          overall_satisfaction: rating
        },
        freeText: comment,
        trigger_type: 'adhoc_survey'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWorkshopId('');
    setRating(0);
    setComment('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Quick Workshop Feedback</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Which workshop are you currently working on?
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Workshop</InputLabel>
          <Select
            value={workshopId}
            label="Workshop"
            onChange={(e) => setWorkshopId(e.target.value)}
          >
            {WORKSHOPS.map(workshop => (
              <MenuItem key={workshop.id} value={workshop.id}>
                {workshop.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="subtitle1" gutterBottom>
          How would you rate your experience with this workshop?
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
            size="large"
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Additional Comments (Optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us more about your experience..."
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !workshopId || rating === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 