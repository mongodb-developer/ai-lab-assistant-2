'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';

export default function DocumentChunker({ documentId, onUpdate }) {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chunkSize, setChunkSize] = useState(1000);
  const [overlap, setOverlap] = useState(200);
  const [editingChunk, setEditingChunk] = useState(null);
  const [editContent, setEditContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchChunks();
  }, [documentId]);

  const fetchChunks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/rag-documents/${documentId}/chunks`);
      
      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Failed to fetch chunks');
      }
      
      const data = await response.json();
      setChunks(data.chunks);
    } catch (err) {
      console.error('Error fetching chunks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateChunks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/rag-documents/${documentId}/chunks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chunkSize,
          overlap
        })
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Failed to regenerate chunks');
      }

      const data = await response.json();
      setChunks(data.chunks);
      onUpdate?.();
    } catch (err) {
      console.error('Error regenerating chunks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChunk = async (chunkIndex) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/rag-documents/${documentId}/chunks?chunk_index=${chunkIndex}`, {
        method: 'DELETE'
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Failed to delete chunk');
      }

      setChunks(chunks.filter((_, index) => index !== chunkIndex));
      onUpdate?.();
    } catch (err) {
      console.error('Error deleting chunk:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChunk = async (chunkIndex) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/rag-documents/${documentId}/chunks/${chunkIndex}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: editContent
        })
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Failed to update chunk');
      }

      const updatedChunk = await response.json();
      setChunks(chunks.map((chunk, index) => 
        index === chunkIndex ? updatedChunk : chunk
      ));
      setEditingChunk(null);
      setEditContent('');
      onUpdate?.();
    } catch (err) {
      console.error('Error updating chunk:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (chunk, index) => {
    setEditingChunk(index);
    setEditContent(chunk.content);
  };

  const cancelEditing = () => {
    setEditingChunk(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Chunk Settings */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Chunk Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Chunk Size: {chunkSize} characters</Typography>
            <Slider
              value={chunkSize}
              onChange={(_, value) => setChunkSize(value)}
              min={500}
              max={2000}
              step={100}
              marks
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Overlap: {overlap} characters</Typography>
            <Slider
              value={overlap}
              onChange={(_, value) => setOverlap(value)}
              min={0}
              max={500}
              step={50}
              marks
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          onClick={handleRegenerateChunks}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Regenerate Chunks
        </Button>
      </Paper>

      {/* Chunks List */}
      <Grid container spacing={2}>
        {chunks.map((chunk, index) => (
          <Grid item xs={12} key={chunk._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    {editingChunk === index ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {chunk.content}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Chunk {index + 1} of {chunks.length}
                    </Typography>
                  </Box>
                  <Box>
                    {editingChunk === index ? (
                      <>
                        <Tooltip title="Save">
                          <IconButton
                            onClick={() => handleUpdateChunk(index)}
                            color="primary"
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton onClick={cancelEditing} color="error">
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => startEditing(chunk, index)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteChunk(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 