'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSession } from 'next-auth/react';

export default function RagSearchPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/rag-documents/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters: {
            ...(category && { category }),
            ...(tags.length > 0 && { tags: { $in: tags } })
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search documents');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Semantic Search
      </Typography>

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search Query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="documentation">Documentation</MenuItem>
                <MenuItem value="tutorial">Tutorial</MenuItem>
                <MenuItem value="reference">Reference</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Typography variant="h6" gutterBottom>
          Search Results
        </Typography>
      )}

      <Grid container spacing={3}>
        {results.map((result, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardHeader
                title={result.title}
                subheader={
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {result.metadata.category && (
                      <Chip
                        label={result.metadata.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {result.metadata.tags?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Section: {result.chunks.metadata.section}
                </Typography>
                <Typography variant="body1" paragraph>
                  {result.chunks.content}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Relevance Score: {(result.score * 100).toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!loading && results.length === 0 && query && (
        <Typography variant="body1" color="text.secondary" align="center">
          No results found. Try adjusting your search query or filters.
        </Typography>
      )}
    </Container>
  );
} 