'use client';

import { Box, Typography } from '@mui/material';
import UserManagement from '@/components/admin/UserManagement';

export default function NewUserPage() {
  return (
    <>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add Admin User
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new administrator user for the MongoDB AI Lab Assistant
        </Typography>
      </Box>
      <UserManagement initialMode="add" />
    </>
  );
} 