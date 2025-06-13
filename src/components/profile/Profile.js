// src/components/profile/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useTeamActions from '../../hooks/useTeamActions';
import useProfileActions from '../../hooks/useProfileActions';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Group as TeamIcon,
  SportsEsports as GameIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon
} from '@mui/icons-material';

function Profile() {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();
  const { user, addGameAccount, removeGameAccount, loading: profileLoading } = useProfileActions();
  const { teams } = useTeamActions();
  
  // Use profile user data if available, fallback to auth user
  const currentUser = user || authUser;
  
  // Ensure teams is always an array, even if the API call fails
  const allTeams = teams || [];
  
  // Filter teams to show only those where the current user is a member or captain
  const userTeams = allTeams.filter(team => {
    if (!currentUser) {
      console.log('No current user for filtering');
      return false;
    }
    
    // Debug logging
    console.log('Filtering team:', team.name);
    console.log('Current user._id:', currentUser._id);
    console.log('Current user.id:', currentUser.id);
    console.log('Team captain:', team.captain);
    console.log('Team members:', team.members);
    
    // Check if user is the captain - only if captain field exists and is not undefined
    const userIdToCheck = currentUser._id || currentUser.id;
    const captainId = team.captain;
    
    // Convert both IDs to strings for comparison (handle ObjectID vs string)
    const userIdStr = String(userIdToCheck);
    const captainIdStr = String(captainId);
    
    console.log('Captain comparison:');
    console.log('  - User ID (raw):', userIdToCheck, typeof userIdToCheck);
    console.log('  - Captain ID (raw):', captainId, typeof captainId);
    console.log('  - User ID (string):', userIdStr);
    console.log('  - Captain ID (string):', captainIdStr);
    
    const isCaptain = captainId && captainIdStr === userIdStr;
    console.log('  - Is Captain:', isCaptain);
    
    if (isCaptain) {
      console.log('User is captain of:', team.name);
      return true;
    }
    
    // Check if user is in the members array
    if (team.members && Array.isArray(team.members)) {
      console.log('Checking members for team:', team.name);
      const isMember = team.members.some(member => {
        console.log('Checking member:', member);
        // Handle both string IDs and member objects
        const memberId = typeof member === 'string' ? member : (member.user_id || member._id || member.id);
        
        // Convert both to strings for comparison (handle ObjectID vs string)
        const memberIdStr = String(memberId);
        const userIdStrForMember = String(userIdToCheck);
        
        console.log('Member comparison:');
        console.log('  - Member ID (raw):', memberId, typeof memberId);
        console.log('  - Member ID (string):', memberIdStr);
        console.log('  - User ID (string):', userIdStrForMember);
        
        const isMatch = memberIdStr === userIdStrForMember;
        console.log('  - Is Match:', isMatch);
        
        if (isMatch) {
          console.log('User is member of:', team.name);
        }
        return isMatch;
      });
      if (isMember) return true;
    }
    
    console.log('User is NOT part of:', team.name);
    return false;
  });

  console.log('Filtered user teams:', userTeams.length, 'out of', allTeams.length, 'total teams');

  const [profileStats, setProfileStats] = useState({
    teamsJoined: 0,
    gamesLinked: 0,
    accountAge: 0
  });

  const [gameAccountDialog, setGameAccountDialog] = useState(false);
  const [newGameAccount, setNewGameAccount] = useState({
    gameName: '',
    accountId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileStats({
        teamsJoined: userTeams.length || 0,
        gamesLinked: currentUser.game_accounts?.length || 0,
        accountAge: currentUser.created_at ? 
          Math.floor((new Date() - new Date(currentUser.created_at)) / (1000 * 60 * 60 * 24)) : 0
      });
    }
  }, [currentUser, allTeams]); // Use allTeams instead of userTeams to avoid dependency issues

  const handleGameAccountChange = (e) => {
    setNewGameAccount({
      ...newGameAccount,
      [e.target.name]: e.target.value
    });
  };

  const handleAddGameAccount = async () => {
    if (!newGameAccount.gameName.trim() || !newGameAccount.accountId.trim()) {
      setError('Please fill in both game name and account ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await addGameAccount(newGameAccount);
      if (success) {
        setSuccess('Game account added successfully!');
        setGameAccountDialog(false);
        setNewGameAccount({ gameName: '', accountId: '' });
      } else {
        setError('Failed to add game account. Please try again.');
      }
    } catch (err) {
      setError('Failed to add game account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGameAccount = async (index) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await removeGameAccount(index);
      setSuccess('Game account removed successfully!');
    } catch (err) {
      setError('Failed to remove game account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeGameAccountDialog = () => {
    setGameAccountDialog(false);
    setNewGameAccount({ gameName: '', accountId: '' });
    setError('');
  };

  const openGameAccountDialog = () => {
    setGameAccountDialog(true);
    setError('');
    setSuccess('');
  };

  if (authLoading || profileLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Unable to load profile information. Please try refreshing the page.
        </Alert>
      </Container>
    );
  }

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success/Error Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main',
              fontSize: '2.5rem',
              fontWeight: 700
            }}
            src={currentUser.avatar ? `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}${currentUser.avatar}` : null}
          >
            {currentUser.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              {currentUser.username}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip 
                icon={<EmailIcon />} 
                label={currentUser.email} 
                variant="outlined" 
                color="primary" 
              />
              {currentUser.role === 'admin' && (
                <Chip 
                  icon={<BadgeIcon />} 
                  label="Administrator" 
                  color="error" 
                />
              )}
              <Chip 
                icon={<CalendarIcon />} 
                label={`Member since ${new Date().getFullYear()}`} 
                variant="outlined" 
              />
            </Box>
            {currentUser.bio && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {currentUser.bio}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/settings')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Edit Profile
          </Button>
        </Box>
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Teams Joined"
            value={profileStats.teamsJoined}
            icon={<TeamIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Games Linked"
            value={profileStats.gamesLinked}
            icon={<GameIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Days Active"
            value={profileStats.accountAge}
            icon={<PersonIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Game Accounts Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GameIcon />
                  Game Accounts
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={openGameAccountDialog}
                  disabled={loading}
                >
                  Add Game
                </Button>
              </Box>
              
              {currentUser.game_accounts && currentUser.game_accounts.length > 0 ? (
                <List>
                  {currentUser.game_accounts.map((account, index) => (
                    <ListItem key={index} divider={index < currentUser.game_accounts.length - 1}>
                      <ListItemIcon>
                        <GameIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={account.game_name} 
                              color="primary" 
                              size="small" 
                              variant="outlined"
                            />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {account.account_id}
                            </Typography>
                          </Box>
                        }
                        secondary={`Game: ${account.game_name}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveGameAccount(index)}
                          color="error"
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <GameIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No game accounts linked yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openGameAccountDialog}
                    disabled={loading}
                  >
                    Link Your First Game
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Team Affiliations Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TeamIcon />
                  Team Affiliations
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/teams')}
                >
                  Browse Teams
                </Button>
              </Box>
              
              {userTeams && userTeams.length > 0 ? (
                <List>
                  {userTeams.map((team, index) => (
                    <ListItem key={team._id || index} divider={index < userTeams.length - 1}>
                      <ListItemIcon>
                        <TeamIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {team.name}
                            </Typography>
                            {(team.captain === currentUser._id || team.captain === currentUser.id) && (
                              <Chip 
                                label="Captain" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={`${team.members?.length || 0} members`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="view"
                          onClick={() => navigate(`/teams/${team._id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TeamIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Not part of any teams yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/teams')}
                  >
                    Join a Team
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Social Links Section */}
        {currentUser.social_links && currentUser.social_links.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LinkIcon />
                  Social Links
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {currentUser.social_links.map((link, index) => (
                    <Chip
                      key={index}
                      label={`${link.platform}: ${link.url}`}
                      variant="outlined"
                      clickable
                      onClick={() => window.open(link.url, '_blank')}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/settings')}
                >
                  Profile Settings
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TeamIcon />}
                  onClick={() => navigate('/team-create')}
                >
                  Create Team
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GameIcon />}
                  onClick={() => navigate('/tournaments')}
                >
                  Join Tournament
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Game Account Dialog */}
      <Dialog 
        open={gameAccountDialog} 
        onClose={closeGameAccountDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GameIcon sx={{ mr: 1 }} />
            Add Game Account
          </Box>
          <IconButton onClick={closeGameAccountDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Game Name"
                name="gameName"
                value={newGameAccount.gameName}
                onChange={handleGameAccountChange}
                variant="outlined"
                placeholder="e.g., League of Legends, Valorant, CS:GO"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account ID / Username"
                name="accountId"
                value={newGameAccount.accountId}
                onChange={handleGameAccountChange}
                variant="outlined"
                placeholder="Your in-game username or ID"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeGameAccountDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddGameAccount}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
            disabled={loading || !newGameAccount.gameName.trim() || !newGameAccount.accountId.trim()}
          >
            {loading ? 'Adding...' : 'Add Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;