// src/components/tournament/TournamentDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  IconButton,
  TextField,
  Autocomplete,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  SportsEsports as GameIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Group as TeamIcon,
  PlayArrow as PlayIcon,
  PersonAdd as AddPersonIcon,
  PersonRemove as RemovePersonIcon,
  ExitToApp as LeaveIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import useTournament from '../../hooks/useTournament';
import useTournamentActions from '../../hooks/useTournamentActions';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tournament, loading, error, refreshTournament } = useTournament(id);
  const { startTournament, joinTournament, leaveTournament } = useTournamentActions();
  const { user } = useAuth();
  
  // State for dialogs and interactions
  const [startDialog, setStartDialog] = useState(false);
  const [addParticipantDialog, setAddParticipantDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for participant management
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const userId = user?.id || user?._id;
  const isOrganizer = tournament && user && String(tournament.organizer_id) === String(userId);
  const isParticipant = tournament && user && tournament.participants?.some(pid => String(pid) === String(userId));
  const canJoin = tournament && user && tournament.status === 'open' && !isParticipant;

  





  const loadParticipantDetails = useCallback(async () => {
    if (!tournament?.participants?.length) {
      setParticipants([]);
      return;
    }

    setParticipantsLoading(true);
    try {
      // Fetch user details for each participant ID
      const participantDetails = await Promise.all(
        tournament.participants.map(async (participantId) => {
          try {
            const result = await apiService.getUser(participantId);
            if (result.success) {
              // Ensure we have both id and _id for consistency
              const userData = result.data;
              return {
                ...userData,
                id: userData.id || userData._id,
                _id: userData._id || userData.id
              };
            } else {
              return { 
                id: participantId, 
                _id: participantId, 
                username: 'Unknown User', 
                email: '' 
              };
            }
          } catch (error) {
            return { 
              id: participantId, 
              _id: participantId, 
              username: 'Unknown User', 
              email: '' 
            };
          }
        })
      );
      console.log('=== Participant Details Debug ===');
      console.log('Loaded participant details:', participantDetails);
      setParticipants(participantDetails);
    } catch (error) {
      console.error('Error loading participant details:', error);
      setParticipants(tournament.participants.map(id => ({ 
        id, 
        _id: id, 
        username: 'Unknown User', 
        email: '' 
      })));
    } finally {
      setParticipantsLoading(false);
    }
  }, [tournament?.participants]);

  const loadAvailableUsers = useCallback(async () => {
    try {
      const result = await apiService.getUsers();
      if (result.success) {
        // Filter out already participating users and the organizer
        // Use user.id (which is the alias for _id from backend)
        const filtered = result.data.filter(user => 
          !tournament.participants?.includes(user.id || user._id) && 
          (user.id || user._id) !== tournament.organizer_id
        );
        setAvailableUsers(filtered);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setAvailableUsers([]);
    }
  }, [tournament?.participants, tournament?.organizer_id]);

  // Load participant details when tournament loads
  useEffect(() => {
    if (tournament && tournament.participants?.length > 0) {
      loadParticipantDetails();
    } else {
      setParticipants([]);
    }
  }, [tournament, loadParticipantDetails]);

  // Load available users for organizer
  useEffect(() => {
    if (isOrganizer && addParticipantDialog) {
      loadAvailableUsers();
    }
  }, [isOrganizer, addParticipantDialog, loadAvailableUsers]);

  const handleStartTournament = async () => {
    setActionLoading(true);
    try {
      const result = await startTournament(id);
      if (result.success) {
        await refreshTournament();
        setStartDialog(false);
        showSnackbar('Tournament started successfully!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to start tournament', 'error');
      }
    } catch (error) {
      console.error('Error starting tournament:', error);
      showSnackbar('Failed to start tournament', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    setActionLoading(true);
    try {
      const result = await joinTournament(id);
      if (result.success) {
        await refreshTournament();
        showSnackbar('Successfully joined tournament!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to join tournament', 'error');
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
      showSnackbar('Failed to join tournament', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTournament = async () => {
    setActionLoading(true);
    try {
      const result = await leaveTournament(id);
      if (result.success) {
        await refreshTournament();
        showSnackbar('Successfully left tournament', 'success');
      } else {
        showSnackbar(result.error || 'Failed to leave tournament', 'error');
      }
    } catch (error) {
      console.error('Error leaving tournament:', error);
      showSnackbar('Failed to leave tournament', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      // Use the correct ID field (prioritize .id which is the alias for _id)
      const userId = selectedUser.id || selectedUser._id;
      console.log('Adding participant with ID:', userId, 'for user:', selectedUser.username);
      
      const result = await apiService.addTournamentParticipant(id, userId);
      if (result.success) {
        await refreshTournament();
        setAddParticipantDialog(false);
        setSelectedUser(null);
        showSnackbar(`Added ${selectedUser.username} to tournament`, 'success');
      } else {
        showSnackbar(result.error || 'Failed to add participant', 'error');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      showSnackbar('Failed to add participant', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId, username) => {
    console.log('=== Frontend Remove Participant Debug ===');
    console.log('Participant ID:', participantId);
    console.log('Username:', username);
    console.log('Tournament ID:', id);
    
    setActionLoading(true);
    try {
      const result = await apiService.removeTournamentParticipant(id, participantId);
      if (result.success) {
        await refreshTournament();
        showSnackbar(`Removed ${username} from tournament`, 'success');
      } else {
        showSnackbar(result.error || 'Failed to remove participant', 'error');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      showSnackbar('Failed to remove participant', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'primary';
      case 'started':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'Open for Registration';
      case 'started':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getParticipantTypeIcon = (type) => {
    return type === 'team' ? <TeamIcon /> : <PersonIcon />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={200} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
        </Button>
      </Container>
    );
  }

  if (!tournament) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Tournament not found
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/tournaments')}
        sx={{ mb: 3 }}
      >
        Back to Tournaments
      </Button>

      {/* Tournament Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 80,
              height: 80,
              mr: 3
            }}
          >
            <TournamentIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              {tournament.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={getStatusLabel(tournament.status)}
                color={getStatusColor(tournament.status)}
                size="medium"
              />
              <Typography variant="h6" color="text.secondary">
                {tournament.game}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Organized by {tournament.organizer_name || 'Unknown'}
            </Typography>
          </Box>
          {isOrganizer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/tournaments/${id}/edit`)}
              >
                Edit
              </Button>
              {tournament.status === 'open' && (
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={() => setStartDialog(true)}
                  color="success"
                >
                  Start Tournament
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Tournament Description */}
        {tournament.description && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            {tournament.description}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Tournament Details Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GameIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Format
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {tournament.format?.replace('_', ' ') || 'Not specified'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getParticipantTypeIcon(tournament.participantType)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Participant Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {tournament.participantType === 'individual' ? 'Individual' : 'Team'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Participants
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {tournament.participants?.length || 0}
                  {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ''}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(tournament.startDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Participants Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Participants ({participants.length})
                </Typography>
                {isOrganizer && tournament.status === 'open' && (
                  <Button
                    variant="outlined"
                    startIcon={<AddPersonIcon />}
                    onClick={() => setAddParticipantDialog(true)}
                    size="small"
                  >
                    Add Participant
                  </Button>
                )}
              </Box>
              
              {participantsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : participants.length > 0 ? (
                <List>
                  {participants.map((participant, index) => {
                    console.log('Participant object:', participant);
                    return (
                      <ListItem key={participant.id || participant._id || `participant-${index}`} divider={index < participants.length - 1}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {tournament.participantType === 'team' ? <TeamIcon /> : <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={participant.username || participant.name || 'Unknown User'}
                          secondary={participant.email || `User ID: ${participant.id || participant._id}`}
                        />
                        {isOrganizer && tournament.status === 'open' && (
                          <ListItemSecondaryAction>
                            <Tooltip title="Remove participant">
                              <IconButton
                                edge="end"
                                onClick={() => {
                                  const userId = participant.id || participant._id;
                                  console.log('Attempting to remove participant with ID:', userId);
                                  handleRemoveParticipant(userId, participant.username);
                                }}
                                disabled={actionLoading}
                              >
                                <RemovePersonIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Alert severity="info">
                  No participants registered yet.
                  {canJoin && ' Be the first to join!'}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Tournament Bracket/Results Section */}
          {tournament.status === 'started' && (
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Tournament Bracket
                </Typography>
                <Alert severity="info">
                  Tournament bracket functionality coming soon!
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Tournament Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Tournament Information
              </Typography>
              
              {tournament.prizePool && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Prize Pool
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ${tournament.prizePool}
                  </Typography>
                </Box>
              )}

              {tournament.rules && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Rules
                  </Typography>
                  <Typography variant="body1">
                    {tournament.rules}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDate(tournament.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDate(tournament.updatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          {tournament.status === 'open' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {isParticipant ? 'Tournament Actions' : 'Join Tournament'}
                </Typography>
                
                {canJoin ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    size="large"
                    onClick={handleJoinTournament}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <CircularProgress size={20} /> : 'Join Tournament'}
                  </Button>
                ) : isParticipant ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<LeaveIcon />}
                    size="large"
                    onClick={handleLeaveTournament}
                    disabled={actionLoading}
                    color="error"
                  >
                    {actionLoading ? <CircularProgress size={20} /> : 'Leave Tournament'}
                  </Button>
                ) : (
                  <Alert severity="info">
                    {tournament.participants?.length >= tournament.maxParticipants
                      ? 'Tournament is full'
                      : 'Tournament is open for registration'}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Start Tournament Dialog */}
      <Dialog open={startDialog} onClose={() => setStartDialog(false)}>
        <DialogTitle>Start Tournament</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to start this tournament? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current participants: {participants.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStartTournament}
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <PlayIcon />}
          >
            Start Tournament
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={addParticipantDialog} onClose={() => setAddParticipantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Participant</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Autocomplete
              options={availableUsers}
              getOptionLabel={(option) => `${option.username} (${option.email})`}
              value={selectedUser}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  placeholder="Choose a user to add to the tournament"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{option.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddParticipantDialog(false);
            setSelectedUser(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddParticipant}
            variant="contained"
            disabled={!selectedUser || actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <AddPersonIcon />}
          >
            Add Participant
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        action={
          <Button color="inherit" size="small" onClick={() => setSnackbar({ ...snackbar, open: false })}>
            <CheckIcon fontSize="small" />
          </Button>
        }
      />
    </Container>
  );
}

export default TournamentDetail;