import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Snackbar,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  Star as CaptainIcon,
  Delete as DeleteIcon,
  Send as InviteIcon,
  Check as AcceptIcon,
  Close as DeclineIcon,
  Groups as MembersIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import useTeamActions from '../../hooks/useTeamActions';

function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams, loading, sendInvite, respondToInvite, removeMember, deleteTeam } = useTeamActions();
  
  const [team, setTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    // Find the team from the teams list
    if (teams.length > 0) {
      const foundTeam = teams.find(t => t._id === teamId);
      setTeam(foundTeam);
      setTeamLoading(false);
    }
  }, [teams, teamId]);

  const handleInviteSubmit = async () => {
    if (!inviteUsername.trim()) return;
    
    try {
      await sendInvite(teamId, inviteUsername);
      setSnackbar({ open: true, message: 'Invitation sent successfully!', severity: 'success' });
      setInviteDialog(false);
      setInviteUsername('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send invitation';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleRespondToInvite = async (accept) => {
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

  const handleRemoveMember = async (userId, username) => {
    // Prevent captain from removing themselves
    if (String(userId) === String(currentUserId)) {
      setSnackbar({ open: true, message: 'You cannot remove yourself from the team', severity: 'warning' });
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${username} from the team?`)) {
      try {
        await removeMember(teamId, userId);
        setSnackbar({ open: true, message: `${username} has been removed from the team`, severity: 'success' });
      } catch (error) {
        console.error('Error removing member:', error);
        const errorMessage = error.response?.data?.detail || 'Failed to remove member';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
    }
  };

  const handleDeleteTeam = async () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await deleteTeam(teamId);
        setSnackbar({ open: true, message: 'Team deleted successfully', severity: 'success' });
        navigate('/teams');
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to delete team', severity: 'error' });
      }
    }
  };

  if (loading || teamLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!team) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Team not found or you don't have access to view this team.
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

  const isCaptain = String(team.captain_id) === String(currentUserId);
  const pendingInvitations = team.invitations || [];
  const userInvitation = pendingInvitations.find(inv => inv.user_id === currentUserId);



  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <Typography color="text.primary">{team.name}</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/teams')}
              sx={{ mr: 1 }}
            >
              <BackIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <TeamIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {team.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <CaptainIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                <Typography variant="body1" color="text.secondary">
                  Captain: {team.captain_name}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {isCaptain && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<InviteIcon />}
                onClick={() => setInviteDialog(true)}
              >
                Invite Player
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/teams/${teamId}/edit`)}
              >
                Edit Team
              </Button>
              <IconButton
                color="error"
                onClick={handleDeleteTeam}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        
        {team.description && (
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            {team.description}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Team Members */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MembersIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Team Members ({team.members.length})
                </Typography>
              </Box>
              
              {team.members.length === 0 ? (
                <Alert severity="info">
                  No members yet. Invite players to join your team!
                </Alert>
              ) : (
                <List>
                  {team.members
                    .sort((a, b) => {
                      // Captain first, then members
                      if (a.role === 'captain') return -1;
                      if (b.role === 'captain') return 1;
                      return 0;
                    })
                    .map((member, index) => (
                      <ListItem key={index} divider={index < team.members.length - 1}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: member.role === 'captain' ? 'warning.main' : 'primary.main' }}>
                            {member.role === 'captain' ? <CaptainIcon /> : <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.username}
                          secondary={
                            <>
                              <Typography variant="caption" color="text.secondary" component="span">
                                {member.role} • Joined: {new Date(member.joined_at).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        {isCaptain && member.role !== 'captain' && (
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              color="error"
                              size="small"
                              onClick={() => handleRemoveMember(member.user_id, member.username)}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Invitations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <EmailIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pending Invitations ({pendingInvitations.length})
                </Typography>
              </Box>
              
              {pendingInvitations.length === 0 ? (
                <Alert severity="info">
                  No pending invitations.
                </Alert>
              ) : (
                <List>
                  {pendingInvitations.map((invitation, index) => (
                    <ListItem key={index} divider={index < pendingInvitations.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={invitation.username}
                        secondary={
                          <Typography variant="caption" color="text.secondary" component="span">
                            Invited: {new Date(invitation.invited_at).toLocaleDateString()}
                          </Typography>
                        }
                      />
                      {invitation.user_id === currentUserId && (
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleRespondToInvite(true)}
                            sx={{ mr: 1 }}
                          >
                            <AcceptIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRespondToInvite(false)}
                          >
                            <DeclineIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* User's Invitation Status */}
        {userInvitation && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body1">
                You have a pending invitation to join this team.
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<AcceptIcon />}
                  onClick={() => handleRespondToInvite(true)}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeclineIcon />}
                  onClick={() => handleRespondToInvite(false)}
                >
                  Decline
                </Button>
              </Box>
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Invite Dialog */}
      <Dialog 
        open={inviteDialog} 
        onClose={() => setInviteDialog(false)}
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
          <Button onClick={() => setInviteDialog(false)}>
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

export default TeamDetail; 