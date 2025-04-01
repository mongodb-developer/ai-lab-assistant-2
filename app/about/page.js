'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorageIcon from '@mui/icons-material/Storage';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import ArchitectureIcon from '@mui/icons-material/Architecture';

export default function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8, mt: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <SmartToyIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          About MongoDB AI Lab Assistant
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Your intelligent companion for MongoDB Developer Days Workshops
        </Typography>
      </Box>

      {/* Overview Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom>
          Overview
        </Typography>
        <Typography variant="body1" paragraph>
          The MongoDB AI Lab Assistant is an advanced chatbot designed to help developers learn, troubleshoot, and master MongoDB. 
          It combines the power of vector search, machine learning, and MongoDB's native capabilities to provide accurate, 
          contextual responses to your questions.
        </Typography>
      </Paper>

      {/* How It Works Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                1. Query Processing
              </Typography>
              <Typography>
                Your questions are processed using advanced natural language understanding to identify intent and context.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <StorageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                2. Vector Search
              </Typography>
              <Typography>
                Questions are matched against a vast knowledge base using MongoDB Atlas Vector Search.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                3. Response Generation
              </Typography>
              <Typography>
                Accurate responses are generated combining retrieved knowledge and AI understanding.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Features Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom>
          Key Features
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <PsychologyIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Contextual Understanding" 
              secondary="Understands complex queries and maintains context throughout conversations"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <IntegrationInstructionsIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Code Examples" 
              secondary="Provides practical, runnable code examples for MongoDB operations"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ArchitectureIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Best Practices" 
              secondary="Recommends MongoDB best practices and optimal solutions"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Security Focus" 
              secondary="Emphasizes security best practices in all recommendations"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Technical Details Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom>
          Technical Details
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">RAG Implementation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Our RAG (Retrieval Augmented Generation) system enhances AI responses by providing relevant context from our knowledge base:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Document Processing"
                    secondary="Documents are split into semantic chunks and converted into vector embeddings using OpenAI's text-embedding-ada-002 model"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Knowledge Base"
                    secondary="Supports multiple document formats including PDF, Markdown, and Word documents, with automatic chunking and embedding generation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Context Retrieval"
                    secondary="Uses MongoDB Atlas Vector Search to find the most relevant document chunks for each query"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Response Generation"
                    secondary="Combines retrieved context with LLM capabilities to generate accurate, contextual responses"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Question Processing System</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Our system implements a sophisticated hybrid search approach combining vector similarity with text-based search:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Vector Search Stage"
                    secondary="Uses MongoDB's vector search to find semantically similar questions, processing the top 10 candidates from 100 potential matches"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Text Search Stage"
                    secondary="Performs fuzzy text matching across questions, answers, and titles with up to 2 edits tolerance"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Result Processing"
                    secondary="Combines vector similarity (70%) and text similarity (30%) scores for optimal matching"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Similarity Threshold"
                    secondary="Implements configurable similarity thresholds to ensure high-quality matches"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Database Architecture</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                The system utilizes MongoDB's advanced features for efficient document storage and retrieval:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="RAG Documents Collection"
                    secondary="Stores document content, chunks, embeddings, and metadata for efficient retrieval"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Vector Search Indexes"
                    secondary="Utilizes Atlas Vector Search with 1536-dimensional vectors and cosine similarity"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Text Search Indexes"
                    secondary="Implements standard text search with analyzers for question, answer, and title fields"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Performance Optimization"
                    secondary="Uses caching for embeddings, batch processing for documents, and efficient chunking strategies"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Technology Stack</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Core Technologies:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="MongoDB Atlas" color="primary" />
                    <Chip label="Vector Search" color="primary" />
                    <Chip label="Next.js" color="primary" />
                    <Chip label="Material UI" color="primary" />
                    <Chip label="React" color="primary" />
                  </Box>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    AI/ML Components:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="OpenAI Embeddings" color="secondary" />
                    <Chip label="text-embedding-ada-002" color="secondary" />
                    <Chip label="Hybrid Search" color="secondary" />
                    <Chip label="Document Chunking" color="secondary" />
                  </Box>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Document Processing:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="PDF Processing" color="success" />
                    <Chip label="Word Documents" color="success" />
                    <Chip label="Markdown" color="success" />
                    <Chip label="Semantic Chunking" color="success" />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Paper>

      {/* Usage Guidelines Section */}
      <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom>
          Usage Guidelines
        </Typography>
        <Typography variant="body1" paragraph>
          To get the most out of the MongoDB AI Lab Assistant:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="1. Be Specific"
              secondary="Provide clear, specific questions for more accurate responses"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="2. Include Context"
              secondary="Share relevant details about your MongoDB version, setup, and specific use case"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="3. Follow Up"
              secondary="Don't hesitate to ask follow-up questions for clarification"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="4. Provide Feedback"
              secondary="Use the thumbs up/down buttons to help improve response quality"
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
} 