'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Login as LoginIcon } from '@mui/icons-material';

/**
 * Admin settings page component
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState({
    adminEmail: '',
    adminPassword: '',
    enableFeedback: true,
    enableSentimentAnalysis: true,
    enableRAG: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch settings from your API
        // For now, we'll use mock data
        const mockSettings = {
          adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
          adminPassword: '',
          enableFeedback: true,
          enableSentimentAnalysis: true,
          enableRAG: true
        };
        
        setSettings(mockSettings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err.message || 'An error occurred while fetching settings');
        setLoading(false);
      }
    };
    
    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchSettings();
    }
  }, [status, session]);
  
  // Check authentication on component mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/settings');
    } else if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/');
    }
  }, [status, session, router]);
  
  const handleSignIn = () => {
    router.push('/auth/signin?callbackUrl=/admin/settings');
  };
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'adminPassword' ? value : (e.target.type === 'checkbox' ? checked : value)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // In a real application, you would save settings to your API
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setSaving(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'An error occurred while saving settings');
      setSaving(false);
    }
  };
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show authentication error if not authenticated or not admin
  if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 5 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {status === 'unauthenticated' 
            ? 'You need to sign in to access the admin settings' 
            : 'You do not have permission to access the admin settings'}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<LoginIcon />}
          onClick={handleSignIn}
        >
          Sign In
        </Button>
      </Box>
    );
  }
  
  // Show loading state while fetching data
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Settings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Admin Credentials
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Admin Email"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleChange}
                type="email"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Admin Password"
                name="adminPassword"
                value={settings.adminPassword}
                onChange={handleChange}
                type="password"
                placeholder="Leave blank to keep current password"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Feature Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableFeedback}
                    onChange={handleChange}
                    name="enableFeedback"
                  />
                }
                label="Enable Feedback Collection"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableSentimentAnalysis}
                    onChange={handleChange}
                    name="enableSentimentAnalysis"
                  />
                }
                label="Enable Sentiment Analysis"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableRAG}
                    onChange={handleChange}
                    name="enableRAG"
                  />
                }
                label="Enable RAG (Retrieval-Augmented Generation)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
} 