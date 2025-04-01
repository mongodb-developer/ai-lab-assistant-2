'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

export default function QuestionManagement({ initialFilter = {} }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [answered, setAnswered] = useState(initialFilter.answered !== undefined ? initialFilter.answered : '');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(module && { module }),
        ...(answered !== '' && { answered })
      });

      console.log('Fetching questions with params:', params.toString());
      const response = await fetch(`/api/admin/questions?${params}`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.error) {
        console.error('API Error:', data.error, data.details);
        return;
      }

      setQuestions(data.questions || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, rowsPerPage, search, module, answered]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle edit
  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setEditMode(true);
    setOpenDialog(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode 
        ? `/api/admin/questions/${selectedQuestion._id}`
        : '/api/admin/questions';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedQuestion),
      });

      if (response.ok) {
        setOpenDialog(false);
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Module</InputLabel>
          <Select
            value={module}
            label="Module"
            onChange={(e) => setModule(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="mongodb">MongoDB</MenuItem>
            <MenuItem value="atlas">Atlas</MenuItem>
            <MenuItem value="realm">Realm</MenuItem>
            <MenuItem value="compass">Compass</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={answered}
            label="Status"
            onChange={(e) => setAnswered(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Answered</MenuItem>
            <MenuItem value="false">Unanswered</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedQuestion({
              question: '',
              module: '',
              answered: false,
              user_id: 'admin',
              user_name: 'Admin'
            });
            setEditMode(false);
            setOpenDialog(true);
          }}
          sx={{ ml: 'auto' }}
        >
          Add Question
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Asked By</TableCell>
              <TableCell>Asked At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                    <CircularProgress />
                    <Typography color="text.secondary">Loading questions...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                    <Typography color="text.secondary">No questions found</Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setSearch('');
                        setModule('');
                        setAnswered('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question._id} hover>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography noWrap>{question.question}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={question.module} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={question.answered ? 'Answered' : 'Unanswered'}
                      color={question.answered ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{question.user_name}</TableCell>
                  <TableCell>
                    {new Date(question.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleEdit(question)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(question._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Question"
              value={selectedQuestion?.question || ''}
              onChange={(e) => setSelectedQuestion({
                ...selectedQuestion,
                question: e.target.value
              })}
              fullWidth
              multiline
              rows={4}
            />
            <FormControl fullWidth>
              <InputLabel>Module</InputLabel>
              <Select
                value={selectedQuestion?.module || ''}
                label="Module"
                onChange={(e) => setSelectedQuestion({
                  ...selectedQuestion,
                  module: e.target.value
                })}
              >
                <MenuItem value="mongodb">MongoDB</MenuItem>
                <MenuItem value="atlas">Atlas</MenuItem>
                <MenuItem value="realm">Realm</MenuItem>
                <MenuItem value="compass">Compass</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedQuestion?.answered || false}
                label="Status"
                onChange={(e) => setSelectedQuestion({
                  ...selectedQuestion,
                  answered: e.target.value
                })}
              >
                <MenuItem value={false}>Unanswered</MenuItem>
                <MenuItem value={true}>Answered</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 