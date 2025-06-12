// src/components/tournament/TournamentCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Avatar,
  Chip
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Group as TeamIcon,
  People as ParticipantsIcon
} from '@mui/icons-material';

function TournamentCard({ tournament }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
      case 'registration':
        return 'primary';
      case 'ongoing':
      case 'active':
        return 'success';
      case 'completed':
      case 'finished':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'Upcoming';
      case 'registration':
        return 'Open Registration';
      case 'ongoing':
      case 'active':
        return 'Live';
      case 'completed':
      case 'finished':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const getParticipantTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'team':
      case 'teams':
        return <TeamIcon />;
      case 'individual':
      case 'solo':
        return <PersonIcon />;
      default:
        return <ParticipantsIcon />;
    }
  };

  const statusColor = getStatusColor(tournament.status);
  const isLive = tournament.status?.toLowerCase() === 'ongoing' || tournament.status?.toLowerCase() === 'active';

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
      onClick={() => navigate(`/tournaments/${tournament._id}`)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Tournament Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: isLive ? 'success.main' : 'primary.main', 
              mr: 2, 
              width: 48, 
              height: 48 
            }}
          >
            <TournamentIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
              {tournament.name}
            </Typography>
            <Chip 
              label={getStatusLabel(tournament.status)}
              color={statusColor}
              size="small"
              variant={isLive ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>

        {/* Tournament Details */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Game:</strong> {tournament.game || 'Not specified'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {getParticipantTypeIcon(tournament.participantType)}
            <Typography variant="body2" color="text.secondary">
              <strong>Type:</strong> {tournament.participantType?.replace('_', ' ') || 'Not specified'}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            <strong>Format:</strong> {tournament.format?.replace('_', ' ') || 'Not specified'}
          </Typography>
        </Box>

        {/* Tournament Description */}
        {tournament.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {tournament.description}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="small" 
          color="primary" 
          endIcon={<ViewIcon />}
          sx={{ ml: 'auto' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/tournaments/${tournament._id}`);
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default TournamentCard;