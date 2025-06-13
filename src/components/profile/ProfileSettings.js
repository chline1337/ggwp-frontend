// src/components/profile/ProfileSettings.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  PhotoCamera as CameraIcon,
  Link as LinkIcon,
  SportsEsports as GameIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import useProfileActions from '../../hooks/useProfileActions';

function ProfileSettings() {
  const { user: authUser } = useAuth();
  const { user, uploadAvatar, updateProfile, addGameAccount, removeGameAccount, loading: profileLoading } = useProfileActions();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    twitch: '',
    twitter: '',
    discord: '',
  });
  const [profileData, setProfileData] = useState({
    bio: user?.bio || '',
    username: user?.username || '',
  });
  const [gameAccountDialog, setGameAccountDialog] = useState(false);
  const [newGameAccount, setNewGameAccount] = useState({
    gameName: '',
    accountId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      console.log('User data updated:', user); // Debug log
      console.log('Avatar URL:', user.avatar); // Debug log
      setProfileData({
        bio: user.bio || '',
        username: user.username || '',
      });
      // Initialize social links if they exist
      if (user.social_links && user.social_links.length > 0) {
        const socialLinksMap = {};
        user.social_links.forEach(link => {
          socialLinksMap[link.platform] = link.url;
        });
        setSocialLinks({
          twitch: socialLinksMap.twitch || '',
          twitter: socialLinksMap.twitter || '',
          discord: socialLinksMap.discord || '',
        });
      }
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type and size
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSocialChange = (e) => {
    setSocialLinks({ 
      ...socialLinks, 
      [e.target.name]: e.target.value 
    });
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleGameAccountChange = (e) => {
    setNewGameAccount({
      ...newGameAccount,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await uploadAvatar(file);
      setSuccess('Avatar updated successfully!');
      setFile(null);
      setPreviewUrl(null);
      // Force a small delay to ensure the user state is updated
      setTimeout(() => {
        // This will trigger a re-render with the updated avatar
      }, 100);
    } catch (err) {
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare social links data
      const updatedLinks = Object.entries(socialLinks)
        .filter(([_, url]) => url.trim() !== '')
        .map(([platform, url]) => ({ platform, url }));

      const updateData = {
        ...profileData,
        ...(updatedLinks.length > 0 && { social_links: updatedLinks })
      };

      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
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
  };

  if (profileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Profile Settings
          </Typography>
        </Box>

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

        {/* Avatar Upload Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CameraIcon sx={{ mr: 1 }} />
              Profile Picture
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar
                src={(() => {
                  const avatarUrl = previewUrl || (user?.avatar ? `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}${user.avatar}` : null);
                  console.log('Avatar URL being used:', avatarUrl); // Debug log
                  return avatarUrl;
                })()}
                sx={{ 
                  width: 100, 
                  height: 100,
                  border: 2,
                  borderColor: 'primary.light'
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 1, display: 'block' }}
                  >
                    Choose Image
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  JPG, PNG up to 5MB
                </Typography>
              </Box>
            </Box>

            {file && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={handleAvatarSubmit}
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Upload Avatar'}
                </Button>
                <Button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  variant="outlined"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Profile Information Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkIcon sx={{ mr: 1 }} />
                Social Links
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Twitch URL"
                    name="twitch"
                    value={socialLinks.twitch}
                    onChange={handleSocialChange}
                    variant="outlined"
                    placeholder="https://twitch.tv/username"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Twitter URL"
                    name="twitter"
                    value={socialLinks.twitter}
                    onChange={handleSocialChange}
                    variant="outlined"
                    placeholder="https://twitter.com/username"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Discord Invite URL"
                    name="discord"
                    value={socialLinks.discord}
                    onChange={handleSocialChange}
                    variant="outlined"
                    placeholder="https://discord.gg/invite"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setProfileData({
                      bio: user?.bio || '',
                      username: user?.username || '',
                    });
                    setSocialLinks({
                      twitch: '',
                      twitter: '',
                      discord: '',
                    });
                  }}
                  disabled={loading}
                  size="large"
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Game Accounts Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <GameIcon sx={{ mr: 1 }} />
                Game Accounts
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setGameAccountDialog(true)}
                disabled={loading}
              >
                Add Game Account
              </Button>
            </Box>

            {user?.game_accounts && user.game_accounts.length > 0 ? (
              <List>
                {user.game_accounts.map((account, index) => (
                  <ListItem key={index} divider>
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
                        disabled={loading}
                        color="error"
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
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No game accounts added yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add your gaming accounts to connect with other players
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

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
    </Box>
  );
}

export default ProfileSettings;