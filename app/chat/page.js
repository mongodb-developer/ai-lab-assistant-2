'use client';

import { Box, Container } from '@mui/material';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <Box 
      sx={{ 
        mt: 8, // Add margin top to account for fixed header (64px)
        height: 'calc(100vh - 64px)', // Subtract header height
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Container maxWidth="xl">
        <ChatInterface />
      </Container>
    </Box>
  );
}
