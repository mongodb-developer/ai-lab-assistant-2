'use client';

import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Grid,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DesignReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    attachmentUrls: []
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/design-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit design review request');
      }
      
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        attachmentUrls: []
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    router.push('/login');
    return null;
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Request a Design Review
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Submit your MongoDB schema, architecture, or query patterns for an AI-powered review.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                variant="outlined"
                helperText="Describe what you're trying to accomplish with your design"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Requirements & Constraints"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                helperText="List any specific requirements, constraints, or concerns"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Note: File upload functionality will be implemented in a future update.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit for Review'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Design review request submitted successfully!
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}
