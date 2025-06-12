import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Alert
} from '@mui/material';
import {
  Group as TeamIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

function TournamentParticipants({ 
  formData, 
  errors, 
  selectedTeams, 
  allTeams, 
  onFormDataChange, 
  onTeamsChange 
}) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    onFormDataChange({ [name]: newValue });
  };

  const handleAddTeam = (teamId) => {
    if (teamId && !selectedTeams.find(t => t._id === teamId)) {
      const team = allTeams.find(t => t._id === teamId);
      if (team) {
        onTeamsChange([...selectedTeams, team]);
      }
    }
  };

  const handleRemoveTeam = (teamId) => {
    onTeamsChange(selectedTeams.filter(t => t._id !== teamId));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tournament Settings */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tournament Settings
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                />
              }
              label="Public Tournament (visible to all users)"
            />
            <FormControlLabel
              control={
                <Switch
                  name="requireApproval"
                  checked={formData.requireApproval}
                  onChange={handleChange}
                />
              }
              label="Require approval for registration"
            />
            <FormControlLabel
              control={
                <Switch
                  name="allowSpectators"
                  checked={formData.allowSpectators}
                  onChange={handleChange}
                />
              }
              label="Allow spectators"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Team Pre-registration (for team tournaments) */}
      {formData.participantType === 'team' && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pre-register Teams
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add teams that will automatically be registered for this tournament
            </Typography>
            
            {errors.teams && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.teams}
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Team</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAddTeam(e.target.value)}
                label="Select Team"
              >
                {allTeams
                  .filter(team => !selectedTeams.find(t => t._id === team._id))
                  .map((team) => (
                    <MenuItem key={team._id} value={team._id}>
                      {team.name} ({team.members?.length || 0} members)
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {selectedTeams.length > 0 && (
              <List>
                {selectedTeams.map((team) => (
                  <ListItem key={team._id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <TeamIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={team.name}
                      secondary={`${team.members?.length || 0} members`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveTeam(team._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      <TextField
        name="rules"
        label="Tournament Rules"
        value={formData.rules}
        onChange={handleChange}
        fullWidth
        multiline
        rows={4}
        placeholder="Enter specific rules, restrictions, or guidelines for this tournament..."
        helperText="Optional: Define specific rules that participants must follow"
      />
    </Box>
  );
}

export default TournamentParticipants; 