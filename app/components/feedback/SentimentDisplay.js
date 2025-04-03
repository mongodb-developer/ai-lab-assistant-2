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
  Paper
} from '@mui/material';
import { 
  SentimentVeryDissatisfied as NegativeIcon,
  SentimentSatisfied as NeutralIcon,
  SentimentVerySatisfied as PositiveIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { analyzeSentiment } from '../../lib/sentimentService';
import { isSentimentAnalysisEnabled } from '../../lib/settingsService';

/**
 * Component to display sentiment analysis results
 */
export default function SentimentDisplay({ text, showDebug = false }) {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [showDebugInfo, setShowDebugInfo] = useState(showDebug);
  
  // Check if sentiment analysis is enabled
  useEffect(() => {
    const checkEnabled = async () => {
      try {
        const isEnabled = await isSentimentAnalysisEnabled();
        setEnabled(isEnabled);
      } catch (error) {
        console.error('Error checking sentiment analysis settings:', error);
        // Default to enabled if there's an error
        setEnabled(true);
      }
    };
    
    checkEnabled();
  }, []);
  
  // Analyze sentiment when text changes
  useEffect(() => {
    const analyzeText = async () => {
      if (!text || !enabled) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await analyzeSentiment(text, showDebugInfo);
        setSentiment(result);
      } catch (error) {
        console.error('Error analyzing sentiment:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeText();
  }, [text, enabled, showDebugInfo]);
  
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };
  
  if (!enabled) {
    return null;
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Analyzing sentiment...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Typography variant="body2" color="error">
        Error analyzing sentiment: {error}
      </Typography>
    );
  }
  
  if (!sentiment) {
    return null;
  }
  
  // Determine sentiment icon and color
  let icon;
  let color;
  
  if (sentiment.score > 0.3) {
    icon = <PositiveIcon />;
    color = 'success';
  } else if (sentiment.score < -0.3) {
    icon = <NegativeIcon />;
    color = 'error';
  } else {
    icon = <NeutralIcon />;
    color = 'warning';
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={`Sentiment: ${sentiment.score.toFixed(2)}`}>
          <Chip
            icon={icon}
            label={sentiment.dominant_emotion}
            color={color}
            size="small"
          />
        </Tooltip>
        
        {sentiment.debug && (
          <IconButton 
            size="small" 
            onClick={toggleDebugInfo}
            aria-label="Toggle debug information"
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      {sentiment.debug && (
        <Collapse in={showDebugInfo}>
          <Paper 
            sx={{ 
              mt: 1, 
              p: 1, 
              fontSize: '0.75rem', 
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              maxHeight: '200px',
              overflow: 'auto'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" fontWeight="bold">
                Debug Information
              </Typography>
              <IconButton 
                size="small" 
                onClick={toggleDebugInfo}
                aria-label="Hide debug information"
              >
                <ExpandLessIcon fontSize="small" />
              </IconButton>
            </Box>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(sentiment.debug, null, 2)}
            </pre>
          </Paper>
        </Collapse>
      )}
    </Box>
  );
} 