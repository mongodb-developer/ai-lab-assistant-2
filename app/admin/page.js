'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Chip
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Chat as ChatIcon, 
  ThumbUp as ThumbUpIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Admin dashboard component
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalFeedback: 0,
    averageSatisfaction: 0,
    activeUsers: {
      daily: 0,
      weekly: 0,
      monthly: 0
    },
    ragMetrics: {
      totalDocuments: 0,
      totalChunks: 0,
      usage: {
        daily: 0,
        weekly: 0
      },
      mostUsedDocuments: []
    }
  });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data
        const response = await fetch('/api/admin/dashboard');
        
        if (response.status === 401) {
          setError('You need to sign in to access the admin dashboard');
          return;
        }
        
        if (response.status === 403) {
          setError('You do not have permission to access the admin dashboard');
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        
        // Set statistics
        setStats(data.stats);
        
        // Set recent feedback
        setRecentFeedback(data.recentFeedback);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'An error occurred while fetching dashboard data');
        setLoading(false);
      }
    };
    
    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchDashboardData();
    }
  }, [status, session]);
  
  // Check authentication on component mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
    } else if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/');
    }
  }, [status, session, router]);
  
  const handleSignIn = () => {
    router.push('/auth/signin?callbackUrl=/admin');
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
            ? 'You need to sign in to access the admin dashboard' 
            : 'You do not have permission to access the admin dashboard'}
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
  
  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }
  
  // Render sentiment chip
  const renderSentimentChip = (sentiment) => {
    if (!sentiment) return null;
    
    let color = 'default';
    let label = sentiment;
    
    if (sentiment === 'positive') {
      color = 'success';
    } else if (sentiment === 'negative') {
      color = 'error';
    } else if (sentiment === 'neutral') {
      color = 'info';
    }
    
    return <Chip label={label} color={color} size="small" />;
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4">{stats.totalUsers}</Typography>
            <Typography variant="body2" color="text.secondary">Total Users</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ChatIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4">{stats.totalChats}</Typography>
            <Typography variant="body2" color="text.secondary">Total Chats</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ThumbUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4">{stats.totalFeedback}</Typography>
            <Typography variant="body2" color="text.secondary">Total Feedback</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>{stats.averageSatisfaction}</Typography>
            <Typography variant="body2" color="text.secondary">Average Satisfaction</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* RAG Metrics */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        RAG Metrics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4">{stats.ragMetrics.totalDocuments}</Typography>
            <Typography variant="body2" color="text.secondary">Total Documents</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4">{stats.ragMetrics.totalChunks}</Typography>
            <Typography variant="body2" color="text.secondary">Total Chunks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4">{stats.ragMetrics.usage.daily}</Typography>
            <Typography variant="body2" color="text.secondary">Daily RAG Usage</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4">{stats.ragMetrics.usage.weekly}</Typography>
            <Typography variant="body2" color="text.secondary">Weekly RAG Usage</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Most Used Documents */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Most Used Documents
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell align="right">Usage Count</TableCell>
              <TableCell align="right">Avg Relevance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.ragMetrics.mostUsedDocuments.map((doc, index) => (
              <TableRow key={index}>
                <TableCell>{doc.title}</TableCell>
                <TableCell align="right">{doc.count}</TableCell>
                <TableCell align="right">{doc.avgRelevance}</TableCell>
              </TableRow>
            ))}
            {stats.ragMetrics.mostUsedDocuments.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">No document usage data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Active Users */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Active Users
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4">{stats.activeUsers.daily}</Typography>
            <Typography variant="body2" color="text.secondary">Daily Active Users</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4">{stats.activeUsers.weekly}</Typography>
            <Typography variant="body2" color="text.secondary">Weekly Active Users</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4">{stats.activeUsers.monthly}</Typography>
            <Typography variant="body2" color="text.secondary">Monthly Active Users</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Feedback */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Recent Feedback
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Workshop</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Satisfaction</TableCell>
              <TableCell>Sentiment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentFeedback.map((feedback, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(feedback.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{feedback.workshop || '-'}</TableCell>
                <TableCell>{feedback.module || '-'}</TableCell>
                <TableCell>{feedback.type || '-'}</TableCell>
                <TableCell>{feedback.satisfaction || '-'}</TableCell>
                <TableCell>{renderSentimentChip(feedback.sentiment)}</TableCell>
              </TableRow>
            ))}
            {recentFeedback.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No feedback available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
