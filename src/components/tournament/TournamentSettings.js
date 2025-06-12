import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const TOURNAMENT_FORMATS = [
  {
    value: 'single_elimination',
    label: 'Single Elimination',
    description: 'One loss and you\'re out'
  },
  {
    value: 'double_elimination',
    label: 'Double Elimination',
    description: 'Two losses and you\'re out'
  },
  {
    value: 'round_robin',
    label: 'Round Robin',
    description: 'Everyone plays everyone'
  },
  {
    value: 'group_stage',
    label: 'Group Stage + Playoffs',
    description: 'Groups followed by elimination'
  }
];

const PARTICIPANT_TYPES = [
  {
    value: 'individual',
    label: 'Individual Players',
    icon: <PersonIcon />
  },
  {
    value: 'team',
    label: 'Teams',
    icon: <GroupIcon />
  }
];

const MAX_PARTICIPANTS_OPTIONS = [4, 8, 16, 32, 64, 128];

function TournamentSettings({ formData, errors, onFormDataChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { [name]: value };

    // Auto-adjust group settings when max participants change
    if (name === 'maxParticipants' && formData.format === 'group_stage') {
      const participants = parseInt(value);
      const optimalGroups = Math.min(Math.max(2, Math.floor(participants / 4)), 8);
      const optimalGroupSize = Math.floor(participants / optimalGroups);
      
      newData.numberOfGroups = optimalGroups;
      newData.groupSize = optimalGroupSize;
    }

    onFormDataChange(newData);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tournament Format */}
      <FormControl fullWidth>
        <InputLabel>Tournament Format</InputLabel>
        <Select
          name="format"
          value={formData.format}
          onChange={handleChange}
          label="Tournament Format"
        >
          {TOURNAMENT_FORMATS.map((format) => (
            <MenuItem key={format.value} value={format.value}>
              <Box>
                <Typography variant="body1">{format.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {format.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Participant Type */}
      <FormControl fullWidth>
        <InputLabel>Participant Type</InputLabel>
        <Select
          name="participantType"
          value={formData.participantType}
          onChange={handleChange}
          label="Participant Type"
        >
          {PARTICIPANT_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {type.icon}
                {type.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Max Participants */}
      <FormControl fullWidth>
        <InputLabel>Maximum Participants</InputLabel>
        <Select
          name="maxParticipants"
          value={formData.maxParticipants}
          onChange={handleChange}
          label="Maximum Participants"
        >
          {MAX_PARTICIPANTS_OPTIONS.map((num) => (
            <MenuItem key={num} value={num}>
              {num} {formData.participantType === 'team' ? 'Teams' : 'Players'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Group Stage Settings */}
      {formData.format === 'group_stage' && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Group Stage Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="numberOfGroups"
                  label="Number of Groups"
                  type="number"
                  value={formData.numberOfGroups}
                  onChange={handleChange}
                  error={!!errors.numberOfGroups}
                  helperText={errors.numberOfGroups}
                  fullWidth
                  inputProps={{ min: 2, max: 16 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="groupSize"
                  label="Teams per Group"
                  type="number"
                  value={formData.groupSize}
                  onChange={handleChange}
                  error={!!errors.groupSize}
                  helperText={errors.groupSize}
                  fullWidth
                  inputProps={{ min: 2, max: 8 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Dates */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            name="registrationDeadline"
            label="Registration Deadline"
            type="date"
            value={formData.registrationDeadline}
            onChange={handleChange}
            error={!!errors.registrationDeadline}
            helperText={errors.registrationDeadline}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="startDate"
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={!!errors.startDate}
            helperText={errors.startDate}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="endDate"
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            error={!!errors.endDate}
            helperText={errors.endDate}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Prize and Entry Fee */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="prizePool"
            label="Prize Pool"
            type="number"
            value={formData.prizePool}
            onChange={handleChange}
            error={!!errors.prizePool}
            helperText={errors.prizePool || 'Optional'}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="entryFee"
            label="Entry Fee"
            type="number"
            value={formData.entryFee}
            onChange={handleChange}
            error={!!errors.entryFee}
            helperText={errors.entryFee || 'Optional'}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default TournamentSettings; 