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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { 
  Login as LoginIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

/**
 * Design Reviews page for the admin dashboard
 */
export default function DesignReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();
  
  // Fetch design reviews data
  useEffect(() => {
    const fetchDesignReviewsData = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch this from your API
        // For now, we'll use mock data
        const mockReviews = [
          {
            id: '1',
            title: 'MongoDB Schema Design',
            user: 'John Doe',
            status: 'completed',
            date: '2023-03-15',
            feedback: 'Very helpful review. The suggestions improved our schema design significantly.'
          },
          {
            id: '2',
            title: 'Indexing Strategy',
            user: 'Jane Smith',
            status: 'pending',
            date: '2023-03-20',
            feedback: ''
          },
          {
            id: '3',
            title: 'Aggregation Pipeline',
            user: 'Bob Johnson',
            status: 'in_progress',
            date: '2023-03-18',
            feedback: 'Still working on implementing the suggested changes.'
          },
          {
            id: '4',
            title: 'Data Modeling',
            user: 'Alice Williams',
            status: 'completed',
            date: '2023-03-10',
            feedback: 'The review was comprehensive and addressed all our concerns.'
          }
        ];
        
        setReviews(mockReviews);
      } catch (error) {
        console.error('Error fetching design reviews data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDesignReviewsData();
  }, []);
  
  const handleSignIn = () => {
    router.push('/auth/signin');
  };
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'in_progress':
        return <Chip label="In Progress" color="warning" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
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
          You need to sign in to access the design reviews page
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
      <Typography variant="h4" gutterBottom>Design Reviews</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Recent Design Reviews</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Feedback</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.title}</TableCell>
                  <TableCell>{review.user}</TableCell>
                  <TableCell>{getStatusChip(review.status)}</TableCell>
                  <TableCell>{review.date}</TableCell>
                  <TableCell>{review.feedback || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Design Review Statistics</Typography>
              <Typography variant="body1" paragraph>
                This section would display statistics about design reviews, such as
                the number of reviews completed, average time to completion, and
                user satisfaction ratings.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Common Design Patterns</Typography>
              <Typography variant="body1" paragraph>
                This section would highlight common design patterns and best practices
                identified through the design review process.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 