import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 6 }}>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography 
            component="h1" 
            variant="h2" 
            color="primary.main"
            fontWeight="bold"
            gutterBottom
          >
            MongoDB AI Lab Assistant
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            An AI-powered assistant that helps you with MongoDB queries, architecture decisions, 
            and design reviews. Leverage the power of AI to accelerate your MongoDB development.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              component={Link}
              href="/chat"
              variant="contained" 
              size="large"
              color="primary"
            >
              Ask a Question
            </Button>
            <Button 
              component={Link}
              href="/design-review"
              variant="outlined" 
              size="large"
              color="primary"
            >
              Request Design Review
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              width: '100%', 
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              MongoDB Logo Placeholder
            </Typography>
            {/* Replace with actual MongoDB logo */}
            {/* <Image src="/mongodb-logo.png" alt="MongoDB Logo" width={400} height={250} /> */}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>AI-Powered Answers</Typography>
              <Typography variant="body2">
                Get instant answers to your MongoDB questions using our AI-powered search and OpenAI integration.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Design Reviews</Typography>
              <Typography variant="body2">
                Submit your MongoDB schema designs and architecture plans for expert AI-assisted review.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Knowledge Base</Typography>
              <Typography variant="body2">
                Access a growing knowledge base of MongoDB best practices, patterns, and solutions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
