'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Typography,
  Paper
} from '@mui/material';
import { useDropzone } from 'react-dropzone';

export default function DocumentUploader({ onSuccess, onError }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        if (!title) {
          setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ''));
        }
      }
    }
  });

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !title) {
      setError('Please provide a file and title');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags));

      // Upload document
      const response = await fetch('/api/admin/rag-documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload document');
      }

      // Reset form
      setFile(null);
      setTitle('');
      setCategory('');
      setTags([]);
      setTagInput('');

      // Notify parent
      onSuccess();
    } catch (err) {
      setError(err.message);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {/* File Upload */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 3,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper'
        }}
      >
        <input {...getInputProps()} />
        {file ? (
          <Typography variant="body1">
            Selected file: {file.name}
          </Typography>
        ) : (
          <Typography variant="body1" color="text.secondary">
            {isDragActive
              ? 'Drop the file here'
              : 'Drag and drop a file here, or click to select'}
          </Typography>
        )}
      </Paper>

      {/* Title */}
      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        sx={{ mb: 2 }}
      />

      {/* Category */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="">Select a category</MenuItem>
          <MenuItem value="documentation">Documentation</MenuItem>
          <MenuItem value="tutorial">Tutorial</MenuItem>
          <MenuItem value="reference">Reference</MenuItem>
        </Select>
      </FormControl>

      {/* Tags */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Add Tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          helperText="Press Enter to add a tag"
        />
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
            />
          ))}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading || !file || !title}
      >
        {loading ? <CircularProgress size={24} /> : 'Upload Document'}
      </Button>
    </Box>
  );
} 