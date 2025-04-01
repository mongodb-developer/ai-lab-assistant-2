'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DocumentUploader from '@/components/admin/DocumentUploader';
import DocumentChunker from '@/components/admin/DocumentChunker';

export default function RAGDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [chunkDialogOpen, setChunkDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/rag-documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/rag-documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter(doc => doc._id !== documentId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    fetchDocuments();
  };

  const handleChunkUpdate = () => {
    fetchDocuments();
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.metadata.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.metadata.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          RAG Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Document
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search documents by title, category, or tags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Documents Grid */}
      <Grid container spacing={3}>
        {filteredDocuments.map((doc) => (
          <Grid item xs={12} md={6} lg={4} key={doc._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {doc.title}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {doc.metadata.tags?.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Category: {doc.metadata.category || 'Uncategorized'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chunks: {doc.metadata.chunkCount || 0}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedDocument(doc);
                    setChunkDialogOpen(true);
                  }}
                >
                  Manage Chunks
                </Button>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteDocument(doc._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <DocumentUploader onSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>

      {/* Chunk Management Dialog */}
      <Dialog
        open={chunkDialogOpen}
        onClose={() => setChunkDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Manage Chunks</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <DocumentChunker
              document={selectedDocument}
              onUpdate={handleChunkUpdate}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChunkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 