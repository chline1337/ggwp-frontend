// src/components/team/Teams.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  Star as CaptainIcon,
  Delete as DeleteIcon,
  Send as InviteIcon,
  Check as AcceptIcon,
  Close as DeclineIcon,
  Groups as MembersIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import useTeamActions from '../../hooks/useTeamActions';
import { useAuth } from '../../contexts/AuthContext';

function Teams() {
  const { teams, loading, sendInvite, respondToInvite, deleteTeam } = useTeamActions();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;
  
  // Dialog states
  const [inviteDialog, setInviteDialog] = useState({ open: false, teamId: null });
  const [inviteUsername, setInviteUsername] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleInviteSubmit = async () => {
    if (!inviteUsername.trim()) return;
    
    try {
      await sendInvite(inviteDialog.teamId, inviteUsername);
      setSnackbar({ open: true, message: 'Invitation sent successfully!', severity: 'success' });
      setInviteDialog({ open: false, teamId: null });
      setInviteUsername('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send invitation';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleRespondToInvite = async (teamId, accept) => {
    try {
      await respondToInvite(teamId, accept);
      setSnackbar({ 
        open: true, 
        message: accept ? 'Successfully joined the team!' : 'Invitation declined', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error responding to invitation:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to respond to invitation';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await deleteTeam(teamId);
        setSnackbar({ open: true, message: 'Team deleted successfully', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to delete team', severity: 'error' });
      }
    }
  };

  const TeamCard = ({ team }) => {
    const isCaptain = String(team.captain_id) === String(currentUserId);
    const pendingInvitations = team.invitations || [];
    const userInvitation = pendingInvitations.find(inv => inv.user_id === currentUserId);



    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={() => navigate(`/teams/${team._id}`)}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Team Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
              <TeamIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {team.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <CaptainIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Captain: {team.captain_name}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Team Description */}
          {team.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {team.description}
            </Typography>
          )}

          {/* Team Members */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MembersIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Members ({team.members.length})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {team.members
                .sort((a, b) => {
                  // Captain first, then members
                  if (a.role === 'captain') return -1;
                  if (b.role === 'captain') return 1;
                  return 0;
                })
                .map((member, index) => (
                  <Chip
                    key={index}
                    label={`${member.username} (${member.role})`}
                    size="small"
                    variant="outlined"
                    color={member.role === 'captain' ? 'warning' : 'default'}
                  />
                ))}
            </Box>
          </Box>

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Pending Invitations ({pendingInvitations.length})
              </Typography>
              <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                {pendingInvitations.map((invitation, index) => (
                  <ListItem key={index} divider={index < pendingInvitations.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={invitation.username}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                    {invitation.user_id === currentUserId && (
                      <ListItemSecondaryAction>
                        <IconButton 
                          size="small" 
                          color="success"
                                                      onClick={(e) => {
                              e.stopPropagation();
                              handleRespondToInvite(team._id, true);
                            }}
                          sx={{ mr: 1 }}
                        >
                          <AcceptIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                                                      onClick={(e) => {
                              e.stopPropagation();
                              handleRespondToInvite(team._id, false);
                            }}
                        >
                          <DeclineIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* User's Invitation Status */}
          {userInvitation && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                You have a pending invitation to join this team.
              </Typography>
            </Alert>
          )}
        </CardContent>

        {/* Team Actions */}
        {isCaptain && (
          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<InviteIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setInviteDialog({ open: true, teamId: team._id });
              }}
            >
              Invite Player
            </Button>
            <IconButton
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTeam(team._id);
              }}
              sx={{ ml: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          </CardActions>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TeamIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Teams
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/team-create')}
            sx={{ fontWeight: 600 }}
          >
            Create Team
          </Button>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Join forces with other players and compete as a team
        </Typography>
      </Box>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <TeamIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No Teams Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't joined any teams yet. Create your own team or wait for an invitation!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/team-create')}
          >
            Create Your First Team
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {teams.map((team) => (
            <Grid item xs={12} sm={6} lg={4} key={team._id}>
              <TeamCard team={team} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Invite Dialog */}
      <Dialog 
        open={inviteDialog.open} 
        onClose={() => setInviteDialog({ open: false, teamId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InviteIcon color="primary" />
            Invite Player to Team
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={inviteUsername}
            onChange={(e) => setInviteUsername(e.target.value)}
            placeholder="Enter player's username"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setInviteDialog({ open: false, teamId: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleInviteSubmit}
            variant="contained"
            disabled={!inviteUsername.trim()}
            startIcon={<InviteIcon />}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default Teams;