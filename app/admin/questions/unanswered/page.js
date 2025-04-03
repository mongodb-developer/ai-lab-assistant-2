'use client';

import { Box, Typography } from '@mui/material';
import UnansweredQuestionsList from '../../../components/admin/UnansweredQuestionsList';

export default function UnansweredQuestionsPage() {
  return (
    <>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Unanswered Questions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and respond to pending questions
        </Typography>
      </Box>
      <UnansweredQuestionsList />
    </>
  );
} 