'use client';

import { Box, Container, Typography, Grid } from '@mui/material';
import UserManagement from '@/components/admin/UserManagement';
import AdminMenu from '@/components/admin/AdminMenu';

export default function UsersPage() {
  return (
    <Box sx={{ mt: { xs: 8, sm: 9 } }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Admin Menu Sidebar */}
          <Grid item xs={12} md={3}>
            <AdminMenu />
          </Grid>
          
          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Box mb={4}>
              <Typography variant="h4" component="h1" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and manage users in the MongoDB AI Lab Assistant
              </Typography>
            </Box>
            <UserManagement />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 