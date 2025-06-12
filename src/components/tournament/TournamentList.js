// src/components/tournament/TournamentList.js
import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Fab,
  Skeleton
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Group as TeamIcon,
  CalendarToday as CalendarIcon,
  SportsEsports as GameIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  People as ParticipantsIcon
} from '@mui/icons-material';
import useTournamentActions from '../../hooks/useTournamentActions';
import { useAuth } from '../../contexts/AuthContext';

function TournamentList() {
  const { tournaments, loading, fetchTournaments } = useTournamentActions();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        await fetchTournaments();
      } catch (err) {
        console.error('Error loading tournaments:', err);
        setError('Failed to load tournaments. Please try again.');
      }
    };

    loadTournaments();
  }, [fetchTournaments]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  const TournamentCard = ({ tournament }) => {
    const statusColor = getStatusColor(tournament.status);
    const isUpcoming = tournament.status?.toLowerCase() === 'upcoming' || tournament.status?.toLowerCase() === 'registration';
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <GameIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Game:</strong> {tournament.game || 'Not specified'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {getParticipantTypeIcon(tournament.participantType)}
              <Typography variant="body2" color="text.secondary">
                <strong>Type:</strong> {tournament.participantType?.replace('_', ' ') || 'Not specified'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Format:</strong> {tournament.format?.replace('_', ' ') || 'Not specified'}
              </Typography>
            </Box>

            {tournament.startDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Start Date:</strong> {formatDate(tournament.startDate)}
                </Typography>
              </Box>
            )}
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
                textOverflow: 'ellipsis',
                mb: 2
              }}
            >
              {tournament.description}
            </Typography>
          )}

          {/* Tournament Stats */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {tournament.maxParticipants && (
              <Chip
                label={`Max: ${tournament.maxParticipants}`}
                size="small"
                variant="outlined"
                color="default"
              />
            )}
            {tournament.prizePool && (
              <Chip
                label={`Prize: $${tournament.prizePool}`}
                size="small"
                variant="outlined"
                color="success"
              />
            )}
            {tournament.entryFee && (
              <Chip
                label={`Fee: $${tournament.entryFee}`}
                size="small"
                variant="outlined"
                color="warning"
              />
            )}
          </Box>
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
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="70%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Box>
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="85%" />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Tournaments
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Compete in exciting esports tournaments and showcase your skills
            </Typography>
          </Box>
          <TournamentIcon sx={{ fontSize: 60, opacity: 0.3 }} />
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <TournamentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Failed to load tournaments
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Box>
      ) : tournaments.length === 0 ? (
        /* Empty State */
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <TournamentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No tournaments available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Be the first to create an exciting tournament for the community!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tournament-create')}
          >
            Create Tournament
          </Button>
        </Paper>
      ) : (
        /* Tournament Grid */
        <Grid container spacing={3}>
          {tournaments.map((tournament) => (
            <Grid item xs={12} sm={6} md={4} key={tournament._id}>
              <TournamentCard tournament={tournament} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      {tournaments.length > 0 && (
        <Fab
          color="primary"
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: 6
            }
          }}
          onClick={() => navigate('/tournament-create')}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}

export default TournamentList;