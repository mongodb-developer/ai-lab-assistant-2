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
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Checkbox,
  Tooltip,
  Chip,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearIcon from '@mui/icons-material/Clear';

export default function UnansweredQuestionsList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [editForm, setEditForm] = useState({
    title: '',
    answer: '',
    references: '',
    module: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({
    title: '',
    answer: '',
    references: '',
    module: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions/unanswered');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
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
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to update questions');

      setSuccessMessage('Questions updated successfully');
      handleBulkEditClose();
      setSelectedQuestions(new Set());
      fetchQuestions();
    } catch (err) {
      setError(err.message);
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
          questionIds: Array.from(selectedQuestions)
        }),
      });

      if (!response.ok) throw new Error('Failed to delete questions');

      setSuccessMessage('Questions deleted successfully');
      setSelectedQuestions(new Set());
      fetchQuestions();
    } catch (err) {
      setError(err.message);
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
          status: 'answered',
          references: editForm.references.split('\n').filter(ref => ref.trim())
        }),
      });

      if (!response.ok) throw new Error('Failed to update question');

      setSuccessMessage('Question marked as answered successfully');
      handleEditClose();
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete question');

      setSuccessMessage('Question deleted successfully');
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

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
              startIcon={<CheckCircleIcon />}
              onClick={handleBulkEditClick}
            >
              Mark as Answered
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
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question._id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedQuestions.has(question._id)}
                    onChange={() => handleSelectQuestion(question._id)}
                  />
                </TableCell>
                <TableCell>{question.question}</TableCell>
                <TableCell>
                  {new Date(question.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="Mark as answered">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(question)}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(question._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Single Question Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Mark Question as Answered</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Answer"
              value={editForm.answer}
              onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="References (one per line)"
              value={editForm.references}
              onChange={(e) => setEditForm({ ...editForm, references: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Module"
              value={editForm.module}
              onChange={(e) => setEditForm({ ...editForm, module: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            disabled={!editForm.title || !editForm.answer}
          >
            Mark as Answered
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditDialogOpen} onClose={handleBulkEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Mark Selected Questions as Answered</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={bulkEditForm.title}
              onChange={(e) => setBulkEditForm({ ...bulkEditForm, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Answer"
              value={bulkEditForm.answer}
              onChange={(e) => setBulkEditForm({ ...bulkEditForm, answer: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="References (one per line)"
              value={bulkEditForm.references}
              onChange={(e) => setBulkEditForm({ ...bulkEditForm, references: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Module"
              value={bulkEditForm.module}
              onChange={(e) => setBulkEditForm({ ...bulkEditForm, module: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkEditClose}>Cancel</Button>
          <Button 
            onClick={handleBulkEditSubmit}
            variant="contained"
            color="primary"
            disabled={!bulkEditForm.title || !bulkEditForm.answer}
          >
            Mark {selectedQuestions.size} Questions as Answered
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 