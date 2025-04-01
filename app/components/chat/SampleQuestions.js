import { Box, Button, Typography } from '@mui/material';

const sampleQuestions = [
  "Why can't my application connect to the MongoDB Cluster?",
  "Why is my library application displaying no data or books?",
  "Why is my github codespace not responding or launching the application properly?"
];

const SampleQuestions = ({ onQuestionClick }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mb: 3,
      width: '100%'
    }}>
      <Typography variant="h6" gutterBottom>
        Are you having trouble?
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Consider some of these frequently asked questions
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        justifyContent: 'center',
        width: '100%'
      }}>
        {sampleQuestions.map((question, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => onQuestionClick(question)}
            sx={{ m: 0.5 }}
          >
            {question}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default SampleQuestions; 