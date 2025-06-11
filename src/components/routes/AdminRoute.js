import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/roles';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert 
} from '@mui/material';

/**
 * Admin-only route component
 * Requires user to be authenticated and have admin role
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show access denied if not admin
  if (!isAdmin(user)) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        p={3}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You need administrator privileges to access this page.
          </Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Your current role: {user?.role || 'Unknown'}
        </Typography>
      </Box>
    );
  }

  // Render children for admin users
  return children;
};

export default AdminRoute; 