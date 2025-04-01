'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Tabs, Tab, CircularProgress, Divider, Chip } from '@mui/material';

export default function RagTester() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Upload test state
  const [title, setTitle] = useState('RAG System Testing Document');
  const [content, setContent] = useState(`# RAG System Overview
  
Retrieval Augmented Generation (RAG) is a technique that enhances Large Language Models by providing them with relevant external knowledge to improve the accuracy and factuality of their responses.

## Key Components

RAG systems have two main components:

1. **Retrieval**: This component is responsible for finding relevant information from a knowledge base:
   - Documents are chunked into smaller pieces
   - Each chunk is converted into a vector embedding
   - When a query is received, it is also converted to an embedding
   - Vector similarity search finds the most relevant chunks

2. **Generation**: This component generates responses using the retrieved information:
   - The retrieved chunks are added to the prompt as context
   - The LLM uses this context to generate a response
   - The response is more accurate because it's based on specific knowledge

## Benefits of RAG
- Reduces hallucinations by grounding responses in factual information
- Provides up-to-date information beyond the LLM's training cutoff
- Allows domain-specific knowledge to be incorporated
- More cost-effective than fine-tuning models

## Implementation Challenges
- Chunk size optimization affects retrieval quality
- Embedding quality affects matching accuracy
- Context window limitations may restrict the amount of retrieved information
- Response quality depends on effective prompt engineering`);

  // Query test state
  const [question, setQuestion] = useState('What are the main components of a RAG system?');

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setResult(null);
    setError(null);
  };

  // Handle upload test
  const handleUploadTest = async () => {
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upload',
          title,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload test document');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle query test
  const handleQueryTest = async () => {
    if (!question) {
      setError('Question is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'query',
          question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to query RAG system');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle full test
  const handleFullTest = async () => {
    if (!title || !content || !question) {
      setError('Title, content, and question are all required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'full-test',
          title,
          content,
          question,
          deleteAfter: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run full RAG test');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        RAG System Test Tool
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        This tool helps you test the RAG (Retrieval Augmented Generation) system by uploading test documents, 
        querying the system, or running a full test workflow.
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Upload Test" />
          <Tab label="Query Test" />
          <Tab label="Full Test" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Test Document Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a test document to the RAG system to see if embeddings are generated correctly.
              </Typography>
              
              <TextField
                label="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Document Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                multiline
                rows={12}
                margin="normal"
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleUploadTest}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload Test Document'}
              </Button>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="h6" gutterBottom>
                Test Query
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Test the RAG system by submitting a query to search for relevant chunks.
              </Typography>
              
              <TextField
                label="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                fullWidth
                margin="normal"
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleQueryTest}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Test Query'}
              </Button>
            </>
          )}

          {activeTab === 2 && (
            <>
              <Typography variant="h6" gutterBottom>
                Full RAG Test
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Run a complete test flow: upload document, query for chunks, generate response, then clean up.
              </Typography>
              
              <TextField
                label="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Document Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                multiline
                rows={8}
                margin="normal"
              />
              
              <TextField
                label="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                fullWidth
                margin="normal"
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleFullTest}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Run Full Test'}
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {error && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#fff8f8', color: '#d32f2f' }}>
          <Typography variant="subtitle1" fontWeight="bold">Error:</Typography>
          <Typography>{error}</Typography>
        </Paper>
      )}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          
          <Typography color="success.main" fontWeight="bold" sx={{ mb: 2 }}>
            {result.message}
          </Typography>

          {/* Upload results */}
          {activeTab === 0 && result.chunks && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Document ID: {result.documentId}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Generated Chunks ({result.chunks.length}):
              </Typography>
              
              <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2, border: '1px solid #eee', borderRadius: 1 }}>
                {result.chunks.map((chunk, i) => (
                  <Box key={i} sx={{ p: 1.5, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Chunk {i+1} - Embedding Length: {chunk.embeddingLength}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {chunk.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}

          {/* Query results */}
          {activeTab === 1 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Question:
                </Typography>
                <Typography>{result.question}</Typography>
              </Box>

              {result.chunks.length > 0 ? (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    Retrieved Chunks ({result.chunks.length}):
                  </Typography>
                  
                  <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    {result.chunks.map((chunk, i) => (
                      <Box key={i} sx={{ p: 1.5, borderBottom: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {chunk.title}
                          </Typography>
                          <Chip size="small" label={`Score: ${(chunk.score * 100).toFixed(1)}%`} />
                        </Box>
                        <Typography variant="body2">
                          {chunk.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle1" fontWeight="bold">
                    Answer:
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {result.answer}
                  </Typography>
                </>
              ) : (
                <Typography color="warning.main">
                  No relevant chunks found for this query.
                </Typography>
              )}
            </>
          )}

          {/* Full test results */}
          {activeTab === 2 && (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Paper sx={{ flex: 1, p: 2, minWidth: '250px' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Document Info
                  </Typography>
                  <Typography variant="body2">
                    Title: {result.documentInfo.title || title}
                  </Typography>
                  <Typography variant="body2">
                    Chunks: {result.documentInfo.chunkCount}
                  </Typography>
                  <Typography variant="body2">
                    Cleaned Up: {result.documentInfo.deleted ? 'Yes' : 'No'}
                  </Typography>
                </Paper>
                
                <Paper sx={{ flex: 1, p: 2, minWidth: '250px' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Query Info
                  </Typography>
                  <Typography variant="body2">
                    Question: {result.questionInfo.question}
                  </Typography>
                  <Typography variant="body2">
                    Retrieved Chunks: {result.questionInfo.relevantChunksCount}
                  </Typography>
                  {result.questionInfo.topChunkScore && (
                    <Typography variant="body2">
                      Top Score: {(result.questionInfo.topChunkScore * 100).toFixed(1)}%
                    </Typography>
                  )}
                </Paper>
              </Box>

              {result.chunks && result.chunks.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    Retrieved Chunks:
                  </Typography>
                  
                  <Box sx={{ maxHeight: 250, overflow: 'auto', mb: 3, border: '1px solid #eee', borderRadius: 1 }}>
                    {result.chunks.map((chunk, i) => (
                      <Box key={i} sx={{ p: 1.5, borderBottom: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {chunk.title}
                          </Typography>
                          <Chip size="small" label={`Score: ${(chunk.score * 100).toFixed(1)}%`} />
                        </Box>
                        <Typography variant="body2">
                          {chunk.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                Generated Answer:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 1 }}>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {result.answer}
                </Typography>
              </Paper>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}