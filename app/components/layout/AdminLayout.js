'use client';

import { Box, Container, Grid } from '@mui/material';
import AdminMenu from '@/components/admin/AdminMenu';

export default function AdminLayout({ children }) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        pt: { xs: '64px', sm: '64px' }, // Account for header height
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Admin Menu Sidebar */}
          <Grid 
            item 
            xs={12} 
            md={3}
            sx={{
              position: { md: 'sticky' },
              top: { md: '88px' }, // 64px header + 24px padding
              height: { md: 'calc(100vh - 88px)' },
              overflowY: { md: 'auto' }
            }}
          >
            <AdminMenu />
          </Grid>
          
          {/* Main Content */}
          <Grid item xs={12} md={9}>
            {children}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 