import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  Info as InfoIcon
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

function TournamentPreview({ formData, selectedTeams }) {
  const getFormatLabel = (format) => {
    return TOURNAMENT_FORMATS.find(f => f.value === format)?.label || format;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tournament Preview */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mr: 3 }}>
              <TournamentIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formData.name || 'Tournament Name'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {formData.game || 'Game'} • {getFormatLabel(formData.format)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.maxParticipants} {formData.participantType === 'team' ? 'teams' : 'players'} maximum
              </Typography>
            </Box>
          </Box>

          {formData.description && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              {formData.description}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Tournament Details */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Registration Deadline
              </Typography>
              <Typography variant="body2">
                {new Date(formData.registrationDeadline).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Tournament Dates
              </Typography>
              <Typography variant="body2">
                {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
              </Typography>
            </Grid>
            {formData.prizePool && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Prize Pool
                </Typography>
                <Typography variant="body2" color="success.main">
                  ${formData.prizePool}
                </Typography>
              </Grid>
            )}
            {formData.entryFee && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Entry Fee
                </Typography>
                <Typography variant="body2">
                  ${formData.entryFee}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Visibility
              </Typography>
              <Typography variant="body2">
                {formData.isPublic ? 'Public' : 'Private'}
                {formData.requireApproval && ' • Requires Approval'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Spectators
              </Typography>
              <Typography variant="body2">
                {formData.allowSpectators ? 'Allowed' : 'Not Allowed'}
              </Typography>
            </Grid>
          </Grid>

          {/* Group Stage Details */}
          {formData.format === 'group_stage' && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Group Stage Configuration
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={`${formData.numberOfGroups} Groups`} size="small" color="primary" variant="outlined" />
                <Chip label={`${formData.groupSize} per Group`} size="small" color="primary" variant="outlined" />
                <Chip label={`${formData.numberOfGroups * formData.groupSize} Total Capacity`} size="small" color="primary" variant="outlined" />
              </Box>
            </>
          )}

          {/* Tournament Rules */}
          {formData.rules && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tournament Rules
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {formData.rules}
              </Typography>
            </>
          )}

          {/* Pre-registered Teams */}
          {formData.participantType === 'team' && selectedTeams.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pre-registered Teams ({selectedTeams.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedTeams.map((team) => (
                  <Chip
                    key={team._id}
                    label={team.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Alert severity="info" icon={<InfoIcon />}>
        Please review all tournament details before creating. You can modify some settings after creation, but core tournament structure cannot be changed.
      </Alert>
    </Box>
  );
}

export default TournamentPreview; 