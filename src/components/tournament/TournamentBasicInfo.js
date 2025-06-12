import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  SportsEsports as GameIcon
} from '@mui/icons-material';

const POPULAR_GAMES = [
  'League of Legends',
  'Counter-Strike 2',
  'Valorant',
  'Rocket League',
  'FIFA 24',
  'Dota 2',
  'Overwatch 2',
  'Fortnite'
];

function TournamentBasicInfo({ formData, errors, onFormDataChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange({ [name]: value });
  };

  const handleGameSelect = (game) => {
    onFormDataChange({ game });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tournament Name */}
      <TextField
        name="name"
        label="Tournament Name"
        value={formData.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name || `${formData.name.length}/100 characters`}
        required
        fullWidth
        placeholder="Enter tournament name"
        inputProps={{ maxLength: 100 }}
      />

      {/* Game Selection */}
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Game *
        </Typography>
        <TextField
          name="game"
          value={formData.game}
          onChange={handleChange}
          error={!!errors.game}
          helperText={errors.game}
          fullWidth
          placeholder="Type or select a game"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GameIcon />
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {POPULAR_GAMES.map((game) => (
            <Chip
              key={game}
              label={game}
              onClick={() => handleGameSelect(game)}
              color={formData.game === game ? 'primary' : 'default'}
              variant={formData.game === game ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {/* Description */}
      <TextField
        name="description"
        label="Tournament Description"
        value={formData.description}
        onChange={handleChange}
        error={!!errors.description}
        helperText={errors.description || `${formData.description.length}/500 characters (optional)`}
        fullWidth
        multiline
        rows={4}
        placeholder="Describe your tournament, rules, or special conditions..."
        inputProps={{ maxLength: 500 }}
      />
    </Box>
  );
}

export default TournamentBasicInfo; 