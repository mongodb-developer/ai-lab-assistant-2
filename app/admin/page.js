'use client';

import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import { useRouter } from 'next/navigation';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import QuestionManagement from '@/components/admin/QuestionManagement';
import UserManagement from '@/components/admin/UserManagement';
import { useAuth } from '@/context/AuthProvider';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const session = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    unansweredQuestions: 0,
    designReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setStats({
          totalQuestions: data.total.questions,
          totalUsers: 0, // TODO: Implement user management
          unansweredQuestions: data.total.unansweredQuestions,
          designReviews: 0 // TODO: Implement design reviews
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <QuestionAnswerIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Questions
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalQuestions}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalUsers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Unanswered
                  </Typography>
                  <Typography variant="h5">
                    {stats.unansweredQuestions}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DesignServicesIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Design Reviews
                  </Typography>
                  <Typography variant="h5">
                    {stats.designReviews}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          aria-label="admin tabs"
        >
          <Tab label="Questions" />
          <Tab label="Users" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <QuestionManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UserManagement />
        </TabPanel>
      </Paper>
    </>
  );
}
