'use client';

import { Box, Container } from '@mui/material';
import AdminMenu from '@/components/admin/AdminMenu';

export default function AdminLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AdminMenu />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.grey[100],
          pt: { xs: '64px', sm: '72px' }, // Account for header height
          pl: '280px', // Account for menu width
          overflow: 'auto',
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
} 