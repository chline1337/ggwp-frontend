import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SportsEsports as PlayerIcon,
  Email as EmailIcon,
  CalendarToday as DateIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [createDialog, setCreateDialog] = useState({ 
    open: false, 
    user: { 
      email: '', 
      password: '', 
      username: '', 
      role: 'player' 
    } 
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    playerUsers: 0,
    recentUsers: []
  });

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  // Debug logging to understand the ID structure
  useEffect(() => {
    if (currentUser && users.length > 0) {
      console.log('Current user:', currentUser);
      console.log('Current user ID field:', currentUser.id);
      console.log('Sample user from list:', users[0]);
      console.log('Sample user ID field:', users[0].id);
    }
  }, [currentUser, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await apiService.getUsers();
      if (result.success) {
        setUsers(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await apiService.getAdminStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Helper function to get user ID consistently
  const getUserId = (user) => {
    // Try different possible ID field names
    const id = user?.id || user?._id || user?.userId;
    console.log('getUserId called with user:', user, 'returning ID:', id);
    return id;
  };

  const getCurrentUserId = () => {
    // Try different possible ID field names for current user
    const id = currentUser?.id || currentUser?._id || currentUser?.userId;
    console.log('getCurrentUserId called with currentUser:', currentUser, 'returning ID:', id);
    return id;
  };

  const canEditUser = (user) => {
    const currentUserId = getCurrentUserId();
    const targetUserId = getUserId(user);
    console.log('Can edit check - Current user ID:', currentUserId, 'Target user ID:', targetUserId);
    
    // Don't allow editing if we can't determine IDs
    if (!currentUserId || !targetUserId) {
      console.log('Cannot edit: Missing user IDs');
      return false;
    }
    
    // Can't edit yourself
    return currentUserId !== targetUserId;
  };

  const canDeleteUser = (user) => {
    const currentUserId = getCurrentUserId();
    const targetUserId = getUserId(user);
    console.log('Can delete check - Current user ID:', currentUserId, 'Target user ID:', targetUserId, 'Target role:', user.role);
    
    // Don't allow deleting if we can't determine IDs
    if (!currentUserId || !targetUserId) {
      console.log('Cannot delete: Missing user IDs');
      return false;
    }
    
    // Can't delete yourself or other admins
    return currentUserId !== targetUserId && user.role !== 'admin';
  };

  const handleCreateUser = () => {
    setCreateDialog({ 
      open: true, 
      user: { 
        email: '', 
        password: '', 
        username: '', 
        role: 'player' 
      } 
    });
  };

  const handleEditUser = (user) => {
    const userId = getUserId(user);
    if (!userId) {
      setSnackbar({
        open: true,
        message: 'Cannot edit user: Invalid user ID',
        severity: 'error'
      });
      return;
    }
    setEditDialog({ open: true, user: { ...user } });
  };

  const handleDeleteUser = (user) => {
    const userId = getUserId(user);
    if (!userId) {
      setSnackbar({
        open: true,
        message: 'Cannot delete user: Invalid user ID',
        severity: 'error'
      });
      return;
    }
    setDeleteDialog({ open: true, user });
  };

  const handleSaveNewUser = async () => {
    try {
      // Validate required fields
      if (!createDialog.user.email || !createDialog.user.password) {
        setSnackbar({
          open: true,
          message: 'Email and password are required',
          severity: 'error'
        });
        return;
      }

      console.log('Creating user:', createDialog.user);
      const result = await apiService.createUser(createDialog.user);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success'
        });
        setCreateDialog({ 
          open: false, 
          user: { 
            email: '', 
            password: '', 
            username: '', 
            role: 'player' 
          } 
        });
        loadUsers();
        loadStats();
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to create user',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to create user',
        severity: 'error'
      });
    }
  };

  const handleSaveUser = async () => {
    try {
      const userId = getUserId(editDialog.user);
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'Cannot update user: Invalid user ID',
          severity: 'error'
        });
        return;
      }

      console.log('Updating user with ID:', userId, 'to role:', editDialog.user.role);
      const result = await apiService.updateUserRole(userId, editDialog.user.role);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
        setEditDialog({ open: false, user: null });
        loadUsers();
        loadStats();
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to update user',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update user',
        severity: 'error'
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const userId = getUserId(deleteDialog.user);
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'Cannot delete user: Invalid user ID',
          severity: 'error'
        });
        return;
      }

      console.log('Deleting user with ID:', userId);
      const result = await apiService.deleteUser(userId);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        setDeleteDialog({ open: false, user: null });
        loadUsers();
        loadStats();
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to delete user',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete user',
        severity: 'error'
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'organizer':
        return 'warning';
      case 'player':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'organizer':
        return <PersonIcon />;
      case 'player':
        return <PlayerIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Create User
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { loadUsers(); loadStats(); }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Debug Info */}
      {currentUser && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Debug Info:</strong> Current user ID: {getCurrentUserId()}, Email: {currentUser.email}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Current user object:</strong> {JSON.stringify(currentUser, null, 2)}
          </Typography>
          {users.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Sample user from list:</strong> {JSON.stringify(users[0], null, 2)}
            </Typography>
          )}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {stats.adminUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administrators
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <AdminIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.playerUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Players
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <PlayerIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {users.filter(u => {
                      const createdDate = new Date(u.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdDate > weekAgo;
                    }).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New This Week
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <DateIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Users ({users.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Game Accounts</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={getUserId(user)} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getRoleColor(user.role) + '.main' }}>
                          {getRoleIcon(user.role)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {user.username || 'N/A'}
                          </Typography>
                          {getUserId(user) === getCurrentUserId() && (
                            <Chip label="You" size="small" color="primary" />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            ID: {getUserId(user)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                        icon={getRoleIcon(user.role)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.game_accounts?.length || 0} accounts
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title={canEditUser(user) ? "Edit user" : "Cannot edit yourself"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleEditUser(user)}
                              disabled={!canEditUser(user)}
                            >
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={canDeleteUser(user) ? "Delete user" : "Cannot delete yourself or other admins"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user)}
                              disabled={!canDeleteUser(user)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false, user: { email: '', password: '', username: '', role: 'player' } })}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <TextField
              fullWidth
              label="Email *"
              type="email"
              value={createDialog.user?.email || ''}
              onChange={(e) => setCreateDialog({
                ...createDialog,
                user: { ...createDialog.user, email: e.target.value }
              })}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Password *"
              type="password"
              value={createDialog.user?.password || ''}
              onChange={(e) => setCreateDialog({
                ...createDialog,
                user: { ...createDialog.user, password: e.target.value }
              })}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Username"
              value={createDialog.user?.username || ''}
              onChange={(e) => setCreateDialog({
                ...createDialog,
                user: { ...createDialog.user, username: e.target.value }
              })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={createDialog.user?.role || 'player'}
                label="Role"
                onChange={(e) => setCreateDialog({
                  ...createDialog,
                  user: { ...createDialog.user, role: e.target.value }
                })}
              >
                <MenuItem value="player">Player</MenuItem>
                <MenuItem value="organizer">Organizer</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog({ open: false, user: { email: '', password: '', username: '', role: 'player' } })}>
            Cancel
          </Button>
          <Button onClick={handleSaveNewUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 300 }}>
            <TextField
              fullWidth
              label="Username"
              value={editDialog.user?.username || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              value={editDialog.user?.email || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editDialog.user?.role || ''}
                label="Role"
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  user: { ...editDialog.user, role: e.target.value }
                })}
              >
                <MenuItem value="player">Player</MenuItem>
                <MenuItem value="organizer">Organizer</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The user will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete user <strong>{deleteDialog.user?.username}</strong> ({deleteDialog.user?.email})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement; 