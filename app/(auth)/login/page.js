'use client';

import { useEffect } from 'react';
import { Container, Box, Button, Typography, Paper, Divider } from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'authenticated') {
    return null;
  }
  
  return (
    <Container maxWidth="sm" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Welcome to MongoDB AI Lab Assistant
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please sign in to continue
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
