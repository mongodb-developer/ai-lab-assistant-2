'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

/**
 * Statistics page for the admin dashboard
 */
export default function StatisticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalFeedback: 0,
    averageSatisfaction: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();
  
  // Fetch statistics data
  useEffect(() => {
    const fetchStatisticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch feedback data
        const feedbackResponse = await fetch('/api/feedback');
        
        // Check if unauthorized
        if (feedbackResponse.status === 401) {
          setIsAuthenticated(false);
          setError('You need to sign in to access the statistics page');
          setLoading(false);
          return;
        }
        
        if (!feedbackResponse.ok) {
          throw new Error(`Error fetching feedback: ${feedbackResponse.status}`);
        }
        
        const feedbackData = await feedbackResponse.json();
        
        // Calculate statistics
        const totalFeedback = feedbackData.length;
        const averageSatisfaction = feedbackData.reduce((sum, item) => {
          return sum + (item.ratings?.overall_satisfaction || 0);
        }, 0) / totalFeedback || 0;
        
        // For demo purposes, we're using mock data
        // In a real application, you would fetch this from your API
        const mockStats = {
          totalUsers: 125,
          totalChats: 342,
          totalFeedback,
          averageSatisfaction: averageSatisfaction.toFixed(1),
          dailyActiveUsers: 45,
          weeklyActiveUsers: 87,
          monthlyActiveUsers: 112
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching statistics data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatisticsData();
  }, []);
  
  const handleSignIn = () => {
    router.push('/auth/signin');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 5 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
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
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Statistics</Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>Daily Active Users</Typography>
                <Typography variant="h4">{stats.dailyActiveUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>Weekly Active Users</Typography>
                <Typography variant="h4">{stats.weeklyActiveUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>Monthly Active Users</Typography>
                <Typography variant="h4">{stats.monthlyActiveUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>Avg. Satisfaction</Typography>
                <Typography variant="h4">{stats.averageSatisfaction}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Additional statistics content would go here */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Usage Trends</Typography>
        <Typography variant="body1" paragraph>
          This section would display charts and graphs showing usage trends over time.
          In a real application, you would use a charting library like Chart.js or Recharts
          to visualize this data.
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>User Engagement</Typography>
        <Typography variant="body1" paragraph>
          This section would display metrics related to user engagement, such as
          session duration, bounce rate, and feature usage.
        </Typography>
      </Paper>
    </Box>
  );
} 