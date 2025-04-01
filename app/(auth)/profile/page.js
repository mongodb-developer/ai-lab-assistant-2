'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Divider, Grid, Chip, CircularProgress, Tab, Tabs } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [designReviews, setDesignReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (status === 'authenticated') {
      fetchDesignReviews();
    }
  }, [status, router]);
  
  const fetchDesignReviews = async () => {
    try {
      const response = await fetch('/api/design-review');
      if (response.ok) {
        const data = await response.json();
        setDesignReviews(data);
      }
    } catch (error) {
      console.error('Error fetching design reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h4" gutterBottom>
              {session.user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {session.user.email}
            </Typography>
            {session.user.isAdmin && (
              <Chip 
                label="Admin" 
                color="primary" 
                size="small" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Design Reviews" />
              <Tab label="Chat History" />
              <Tab label="Account Settings" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : designReviews.length > 0 ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {designReviews.map((review) => (
                  <Grid item xs={12} key={review._id}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        borderLeft: '4px solid', 
                        borderColor: 
                          review.status === 'completed' ? 'success.main' : 
                          review.status === 'in_progress' ? 'info.main' : 
                          'warning.main' 
                      }}
                    >
                      <Typography variant="h6">{review.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Submitted on {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={review.status.replace('_', ' ')} 
                        color={
                          review.status === 'completed' ? 'success' : 
                          review.status === 'in_progress' ? 'info' : 
                          'warning'
                        }
                        size="small"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  You haven't submitted any design reviews yet.
                </Typography>
              </Box>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Chat history feature coming soon.
              </Typography>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Account settings feature coming soon.
              </Typography>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}
