import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import useTeamActions from '../../hooks/useTeamActions';

function TeamEdit() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams, loading, updateTeam } = useTeamActions();
  
  const [team, setTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    if (!loading && teams.length > 0) {
      const foundTeam = teams.find(t => t._id === teamId);
      if (foundTeam) {
        setTeam(foundTeam);
        setFormData({
          name: foundTeam.name || '',
          description: foundTeam.description || '',
          game: foundTeam.game || ''
        });
      } else {
        setError('Team not found');
      }
      setTeamLoading(false);
    }
  }, [teams, teamId, loading]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Team name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateTeam(teamId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        game: formData.game.trim() || null
      });

      // Navigate back to team detail page
      navigate(`/teams/${teamId}`);
    } catch (err) {
      console.error('Error updating team:', err);
      let errorMessage = 'Failed to update team';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail
            .map(error => error.msg || error.message || 'Validation error')
            .join(', ');
        }
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/teams/${teamId}`);
  };

  if (loading || teamLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !team) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Team not found or you don\'t have permission to edit this team.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/teams')}
        >
          Back to Teams
        </Button>
      </Container>
    );
  }

  // Check if user is the team captain
  const isCaptain = String(team.captain_id) === String(currentUserId);
  
  if (!isCaptain) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Only the team captain can edit team information.
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/teams/${teamId}`)}
        >
          Back to Team
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/dashboard')}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/teams')}
          sx={{ textDecoration: 'none' }}
        >
          Teams
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/teams/${teamId}`)}
          sx={{ textDecoration: 'none' }}
        >
          {team.name}
        </Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate(`/teams/${teamId}`)}
          sx={{ mr: 2 }}
        >
          <BackIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EditIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Edit Team
          </Typography>
        </Box>
      </Box>

      {/* Edit Form */}
      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Team Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name || 'Enter a unique team name (3-50 characters)'}
              required
              variant="outlined"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description || 'Optional team description (max 500 characters)'}
              multiline
              rows={4}
              variant="outlined"
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Primary Game"
              name="game"
              value={formData.game}
              onChange={handleInputChange}
              helperText="Optional - What game does your team primarily play?"
              variant="outlined"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default TeamEdit; 