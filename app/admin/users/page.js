'use client';

import { Box, Typography } from '@mui/material';
import UserManagement from '@/components/admin/UserManagement';

export default function UsersPage() {
  return (
    <>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage users in the MongoDB AI Lab Assistant
        </Typography>
      </Box>
      <UserManagement />
    </>
  );
} 