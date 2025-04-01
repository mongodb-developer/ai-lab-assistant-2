'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

export default function UserManagement({ initialMode = '' }) {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(initialMode === 'add');
  const [dialogType, setDialogType] = useState(initialMode === 'add' ? 'add' : '');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    isAdmin: false
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search })
      });
      
      const response = await fetch(`/api/admin/users?${searchParams}`);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorJson.details || 'Failed to fetch users');
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      // Try to parse the JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON Parse error:', parseError);
        throw new Error('Invalid response from server');
      }

      setUsers(data.users || []);
      setTotalUsers(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch users when page, rowsPerPage, or search changes
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  // Handle dialog open
  const handleOpenDialog = (type, user = null) => {
    setDialogType(type);
    setSelectedUser(user);
    if (type === 'add') {
      setFormData({
        email: '',
        name: '',
        isAdmin: false
      });
    } else if (type === 'edit' && user) {
      setFormData({
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false
      });
    }
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setSelectedUser(null);
    setFormData({
      email: '',
      name: '',
      isAdmin: false
    });
  };

  // Handle form input change
  const handleInputChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isAdmin' ? checked : value
    }));
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (dialogType === 'add') {
        response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else if (dialogType === 'edit') {
        response = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedUser._id, ...formData })
        });
      } else if (dialogType === 'delete') {
        response = await fetch(`/api/admin/users?id=${selectedUser._id}`, {
          method: 'DELETE'
        });
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Search and Add User */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Search users"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add User
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog('edit', user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog('delete', user)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Add User' :
           dialogType === 'edit' ? 'Edit User' :
           'Delete User'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogContentText>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Name"
                type="text"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAdmin}
                    onChange={handleInputChange}
                    name="isAdmin"
                  />
                }
                label="Admin User"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            color={dialogType === 'delete' ? 'error' : 'primary'}
          >
            {dialogType === 'add' ? 'Add' :
             dialogType === 'edit' ? 'Save' :
             'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 