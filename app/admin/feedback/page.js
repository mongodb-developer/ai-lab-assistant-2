'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * Admin dashboard for analyzing feedback
 */
export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [workshopFilter, setWorkshopFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  
  // Fetch feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/feedback');
        
        if (!response.ok) {
          throw new Error(`Error fetching feedback: ${response.status}`);
        }
        
        const data = await response.json();
        setFeedback(data);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, []);
  
  // Filter feedback based on selected filters
  const filteredFeedback = feedback.filter(item => {
    if (workshopFilter !== 'all' && item.workshop_id !== workshopFilter) return false;
    if (moduleFilter !== 'all' && item.module_id !== moduleFilter) return false;
    return true;
  });
  
  // Get unique workshops and modules for filters
  const workshops = [...new Set(feedback.map(item => item.workshop_id))];
  const modules = [...new Set(feedback.map(item => item.module_id).filter(Boolean))];
  
  // Calculate statistics
  const stats = {
    total: filteredFeedback.length,
    averageSatisfaction: filteredFeedback.reduce((sum, item) => sum + (item.ratings?.overall_satisfaction || 0), 0) / filteredFeedback.length || 0,
    averageDifficulty: filteredFeedback.reduce((sum, item) => sum + (item.ratings?.difficulty || 0), 0) / filteredFeedback.length || 0,
    averageHelpfulness: filteredFeedback.reduce((sum, item) => sum + (item.ratings?.assistant_helpfulness || 0), 0) / filteredFeedback.length || 0,
    sentimentDistribution: {
      positive: filteredFeedback.filter(item => item.sentiment_analysis?.score > 0.3).length,
      neutral: filteredFeedback.filter(item => item.sentiment_analysis?.score >= -0.3 && item.sentiment_analysis?.score <= 0.3).length,
      negative: filteredFeedback.filter(item => item.sentiment_analysis?.score < -0.3).length
    }
  };
  
  // Prepare data for charts
  const satisfactionData = [
    { name: '1', value: filteredFeedback.filter(item => item.ratings?.overall_satisfaction === 1).length },
    { name: '2', value: filteredFeedback.filter(item => item.ratings?.overall_satisfaction === 2).length },
    { name: '3', value: filteredFeedback.filter(item => item.ratings?.overall_satisfaction === 3).length },
    { name: '4', value: filteredFeedback.filter(item => item.ratings?.overall_satisfaction === 4).length },
    { name: '5', value: filteredFeedback.filter(item => item.ratings?.overall_satisfaction === 5).length }
  ];
  
  const sentimentData = [
    { name: 'Positive', value: stats.sentimentDistribution.positive },
    { name: 'Neutral', value: stats.sentimentDistribution.neutral },
    { name: 'Negative', value: stats.sentimentDistribution.negative }
  ];
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleWorkshopFilterChange = (event) => {
    setWorkshopFilter(event.target.value);
  };
  
  const handleModuleFilterChange = (event) => {
    setModuleFilter(event.target.value);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">Error: {error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Feedback Analysis Dashboard</Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Workshop</InputLabel>
          <Select
            value={workshopFilter}
            label="Workshop"
            onChange={handleWorkshopFilterChange}
          >
            <MenuItem value="all">All Workshops</MenuItem>
            {workshops.map(workshop => (
              <MenuItem key={workshop} value={workshop}>{workshop}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Module</InputLabel>
          <Select
            value={moduleFilter}
            label="Module"
            onChange={handleModuleFilterChange}
          >
            <MenuItem value="all">All Modules</MenuItem>
            {modules.map(module => (
              <MenuItem key={module} value={module}>{module}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Feedback</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Avg. Satisfaction</Typography>
              <Typography variant="h4">{stats.averageSatisfaction.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Avg. Difficulty</Typography>
              <Typography variant="h4">{stats.averageDifficulty.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Avg. Helpfulness</Typography>
              <Typography variant="h4">{stats.averageHelpfulness.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Satisfaction" />
          <Tab label="Sentiment" />
          <Tab label="Raw Data" />
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Feedback Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="subtitle1" gutterBottom>Satisfaction Distribution</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={satisfactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="subtitle1" gutterBottom>Sentiment Distribution</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Satisfaction Analysis</Typography>
          <Paper sx={{ p: 2, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      )}
      
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Sentiment Analysis</Typography>
          <Paper sx={{ p: 2, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      )}
      
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Raw Feedback Data</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Workshop</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Satisfaction</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Helpfulness</TableCell>
                  <TableCell>Sentiment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFeedback.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{item.workshop_id}</TableCell>
                    <TableCell>{item.module_id || '-'}</TableCell>
                    <TableCell>{item.trigger_type}</TableCell>
                    <TableCell>{item.ratings?.overall_satisfaction || '-'}</TableCell>
                    <TableCell>{item.ratings?.difficulty || '-'}</TableCell>
                    <TableCell>{item.ratings?.assistant_helpfulness || '-'}</TableCell>
                    <TableCell>
                      {item.sentiment_analysis ? 
                        `${item.sentiment_analysis.dominant_emotion} (${item.sentiment_analysis.score.toFixed(2)})` : 
                        '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
} 