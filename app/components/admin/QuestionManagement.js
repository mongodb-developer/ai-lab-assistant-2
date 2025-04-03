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
  CircularProgress,
  Alert,
  Checkbox,
  Tooltip,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import ClearIcon from '@mui/icons-material/Clear';

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
  const [collection, setCollection] = useState(initialFilter.answered === false ? 'unanswered' : 'questions');
  const [approving, setApproving] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [editForm, setEditForm] = useState({
    title: '',
    answer: '',
    references: '',
    module: ''
  });
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({
    title: '',
    answer: '',
    references: '',
    module: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(module && { module }),
        ...(answered !== '' && { answered }),
        ...(collection !== 'all' && { collection })
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
  }, [page, rowsPerPage, search, module, answered, collection]);

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

      const payload = {
        ...selectedQuestion,
        ...(method === 'POST' && { collection }) // Include collection only for new questions
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setOpenDialog(false);
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  // Handle approval (move from unanswered to questions collection)
  const handleApprove = async (question) => {
    try {
      setApproving(true);
      
      // First, make sure we have a complete answer
      setSelectedQuestion({
        ...question,
        answered: true // Mark as answered since we're moving to questions collection
      });
      setEditMode(true);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error preparing question for approval:', error);
    } finally {
      setApproving(false);
    }
  };

  // Move question from unanswered to questions collection
  const handleMoveToQuestions = async () => {
    try {
      const url = `/api/admin/questions/${selectedQuestion._id}/approve`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedQuestion),
      });

      if (response.ok) {
        setOpenDialog(false);
        fetchQuestions();
      } else {
        const data = await response.json();
        console.error('Error approving question:', data.error);
      }
    } catch (error) {
      console.error('Error approving question:', error);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedQuestions(new Set(questions.map(q => q._id)));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  const handleSelectQuestion = (questionId) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setEditForm({
      title: question.title || '',
      answer: question.answer || '',
      references: question.references?.join('\n') || '',
      module: question.module || ''
    });
    setOpenDialog(true);
  };

  const handleEditClose = () => {
    setOpenDialog(false);
    setSelectedQuestion(null);
    setEditForm({
      title: '',
      answer: '',
      references: '',
      module: ''
    });
  };

  const handleBulkEditClick = () => {
    setBulkEditForm({
      title: '',
      answer: '',
      references: '',
      module: ''
    });
    setBulkEditDialogOpen(true);
  };

  const handleBulkEditClose = () => {
    setBulkEditDialogOpen(false);
    setBulkEditForm({
      title: '',
      answer: '',
      references: '',
      module: ''
    });
  };

  const handleBulkEditSubmit = async () => {
    try {
      const response = await fetch('/api/admin/questions/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionIds: Array.from(selectedQuestions),
          updates: {
            ...bulkEditForm,
            references: bulkEditForm.references.split('\n').filter(ref => ref.trim())
          },
          collection: 'questions'
        }),
      });

      if (!response.ok) throw new Error('Failed to update questions');

      setSuccessMessage('Questions updated successfully');
      handleBulkEditClose();
      setSelectedQuestions(new Set());
      fetchQuestions();
    } catch (err) {
      console.error('Error updating questions:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedQuestions.size} questions?`)) return;

    try {
      const response = await fetch('/api/admin/questions/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionIds: Array.from(selectedQuestions),
          collection: 'questions'
        }),
      });

      if (!response.ok) throw new Error('Failed to delete questions');

      setSuccessMessage('Questions deleted successfully');
      setSelectedQuestions(new Set());
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting questions:', err);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/questions/${selectedQuestion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          references: editForm.references.split('\n').filter(ref => ref.trim())
        }),
      });

      if (!response.ok) throw new Error('Failed to update question');

      setSuccessMessage('Question updated successfully');
      handleEditClose();
      fetchQuestions();
    } catch (err) {
      console.error('Error updating question:', err);
    }
  };

  return (
    <Box>
      {successMessage && (
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage('')}
          sx={{ mb: 2 }}
        >
          {successMessage}
        </Alert>
      )}

      {selectedQuestions.size > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>
              {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkEditClick}
            >
              Edit Selected
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
            <IconButton
              onClick={() => setSelectedQuestions(new Set())}
              size="small"
            >
              <ClearIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}

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
        
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Collection</InputLabel>
          <Select
            value={collection}
            label="Collection"
            onChange={(e) => setCollection(e.target.value)}
          >
            <MenuItem value="all">All Collections</MenuItem>
            <MenuItem value="questions">Approved Questions</MenuItem>
            <MenuItem value="unanswered">Unanswered Queue</MenuItem>
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
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedQuestions.size > 0 && selectedQuestions.size < questions.length}
                  checked={selectedQuestions.size === questions.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedQuestions.has(question._id)}
                      onChange={() => handleSelectQuestion(question._id)}
                    />
                  </TableCell>
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
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => handleEditClick(question)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {/* Show approve button only for unanswered questions */}
                    {!question.answered && question.answer && (
                      <Tooltip title="Approve and Move to Questions">
                        <IconButton 
                          onClick={() => handleApprove(question)}
                          color="success"
                          size="small"
                        >
                          <ThumbUpIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {/* Move to questions collection button for unanswered questions */}
                    {question._id.toString().includes('unanswered') && (
                      <Tooltip title="Edit and Move to Questions Collection">
                        <IconButton 
                          onClick={() => handleApprove(question)}
                          color="info"
                          size="small"
                        >
                          <UpgradeIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDelete(question._id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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

      <Dialog open={openDialog} onClose={handleEditClose} maxWidth="md" fullWidth>
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
            
            <TextField
              label="Answer"
              value={selectedQuestion?.answer || ''}
              onChange={(e) => setSelectedQuestion({
                ...selectedQuestion,
                answer: e.target.value
              })}
              fullWidth
              multiline
              rows={6}
              helperText="Provide a detailed answer for this question"
            />
            
            <TextField
              label="Title (Optional)"
              value={selectedQuestion?.title || ''}
              onChange={(e) => setSelectedQuestion({
                ...selectedQuestion,
                title: e.target.value
              })}
              fullWidth
              helperText="A short descriptive title for this Q&A pair"
            />
            
            <TextField
              label="Summary (Optional)"
              value={selectedQuestion?.summary || ''}
              onChange={(e) => setSelectedQuestion({
                ...selectedQuestion,
                summary: e.target.value
              })}
              fullWidth
              multiline
              rows={2}
              helperText="A brief summary of the answer"
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
          <Button onClick={handleEditClose}>Cancel</Button>
          
          {/* Show Approve & Move button for unanswered questions being approved */}
          {approving && (
            <Button 
              onClick={handleMoveToQuestions} 
              variant="contained" 
              color="success"
              startIcon={<ThumbUpIcon />}
            >
              Approve & Move to Questions
            </Button>
          )}
          
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditDialogOpen} onClose={handleBulkEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Selected Questions</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={bulkEditForm.title}
              onChange={(e) => setBulkEditForm({ ...bulkEditForm, title: e.target.value })}
              fullWidth
              placeholder="Leave blank to keep existing titles"
            />
            <TextField
              label="Answer"
              value={bulkEditForm.answer}
              onChange={(e) => setBulkEditForm({ ...bulkEditForm, answer: e.target.value })}
              multiline
              rows={4}
              fullWidth
              placeholder="Leave blank to keep existing answers"
            />
            <TextField
              label="References (one per line)"
              value={bulkEditForm.references}
              onChange={(e) => setBulkEditForm({ ...bulkEditForm, references: e.target.value })}
              multiline
              rows={3}
              fullWidth
              placeholder="Leave blank to keep existing references"
            />
            <TextField
              label="Module"
              value={bulkEditForm.module}
              onChange={(e) => setBulkEditForm({ ...bulkEditForm, module: e.target.value })}
              fullWidth
              placeholder="Leave blank to keep existing modules"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkEditClose}>Cancel</Button>
          <Button 
            onClick={handleBulkEditSubmit}
            variant="contained"
            color="primary"
          >
            Update {selectedQuestions.size} Questions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 