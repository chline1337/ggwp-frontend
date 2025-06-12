// src/components/team/TeamCreate.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Snackbar
} from '@mui/material';
import {
  Group as TeamIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import useTeamActions from '../../hooks/useTeamActions';

function TeamCreate() {
  const { createTeam } = useTeamActions();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Team name must be at least 3 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Team name must be less than 50 characters';
    }
    
    if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      setSnackbar({ 
        open: true, 
        message: 'Team created successfully!', 
        severity: 'success' 
      });
      // Navigation will be handled by the hook
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to create team. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/teams')}
          sx={{ mb: 2 }}
        >
          Back to Teams
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TeamIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Create New Team
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Start your own esports team and invite players to join
        </Typography>
      </Box>

      {/* Team Creation Form */}
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Team Preview */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 3 }}>
              <TeamIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formData.name || 'Your Team Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.description || 'Team description will appear here...'}
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Team Name Field */}
              <TextField
                name="name"
                label="Team Name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || `${formData.name.length}/50 characters`}
                required
                fullWidth
                variant="outlined"
                placeholder="Enter your team name"
                inputProps={{ maxLength: 50 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              {/* Team Description Field */}
              <TextField
                name="description"
                label="Team Description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description || `${formData.description.length}/200 characters (optional)`}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Describe your team, playstyle, goals, or requirements..."
                inputProps={{ maxLength: 200 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              {/* Team Creation Info */}
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> You will automatically become the team captain and can invite other players to join your team.
                </Typography>
              </Alert>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/teams')}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !formData.name.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ flex: 1, fontWeight: 600 }}
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TeamCreate;