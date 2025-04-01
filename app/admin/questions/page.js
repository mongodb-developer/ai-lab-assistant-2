'use client';

import { Box, Typography } from '@mui/material';
import QuestionManagement from '@/components/admin/QuestionManagement';

export default function AdminQuestionsPage() {
  return (
    <>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Questions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and respond to user questions
        </Typography>
      </Box>
      <QuestionManagement />
    </>
  );
} 