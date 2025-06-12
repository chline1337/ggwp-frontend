import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Event as EventIcon,
  Add as AddIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  SportsEsports as GameIcon,
  AttachMoney as MoneyIcon,
  EmojiEvents as PrizeIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { eventsService } from '../../services/events';

function EventList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter, gameFilter]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsService.getEvents();
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Game filter
    if (gameFilter !== 'all') {
      filtered = filtered.filter(event => event.game === gameFilter);
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getUniqueGames = () => {
    const games = events
      .filter(event => event.game)
      .map(event => event.game);
    return [...new Set(games)];
  };

  const EventCard = ({ event }) => {
    const eventId = event.id || event._id;
    const isRegistered = user && event.participants.includes(user.id || user._id);
    const isFull = event.participants.length >= event.max_participants;
    const isOrganizer = user && event.organizer_id === (user.id || user._id);

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
        onClick={() => navigate(`/events/${eventId}`)}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {event.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip 
                  label={event.status} 
                  color={getStatusColor(event.status)}
                  size="small"
                />
                {event.game && (
                  <Chip 
                    icon={<GameIcon />}
                    label={event.game} 
                    variant="outlined"
                    size="small"
                  />
                )}
                {isRegistered && (
                  <Chip 
                    label="Registered" 
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
                {isOrganizer && (
                  <Chip 
                    label="Organizer" 
                    color="secondary"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Description */}
          {event.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {event.description}
            </Typography>
          )}

          {/* Event Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(event.date)} at {formatTime(event.date)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {event.location}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Organized by {event.organizer_name}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {event.participant_count} / {event.max_participants} participants
                {isFull && <Chip label="Full" color="error" size="small" sx={{ ml: 1 }} />}
              </Typography>
            </Box>

            {event.entry_fee && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {event.entry_fee}
                </Typography>
              </Box>
            )}

            {event.prizes && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PrizeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {event.prizes}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ pt: 0 }}>
          <Button 
            size="small" 
            variant="contained"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${eventId}`);
            }}
          >
            View Details
          </Button>
        </CardActions>
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
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/dashboard')}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <EventIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Events
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gaming Events
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and join exciting gaming events and LAN parties
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Events">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadEvents}
              disabled={loading}
            >
              Refresh
            </Button>
          </Tooltip>
          {user && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-event')}
            >
              Create Event
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1 }} />
          Filters & Search
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search events"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, location, or organizer..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Game</InputLabel>
              <Select
                value={gameFilter}
                label="Game"
                onChange={(e) => setGameFilter(e.target.value)}
              >
                <MenuItem value="all">All Games</MenuItem>
                {getUniqueGames().map((game) => (
                  <MenuItem key={game} value={game}>
                    {game}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {events.length === 0 ? 'No events found' : 'No events match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {events.length === 0 
              ? 'Be the first to create an event for the community!'
              : 'Try adjusting your search criteria or filters.'
            }
          </Typography>
          {events.length === 0 && user && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-event')}
            >
              Create First Event
            </Button>
          )}
          {events.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setGameFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {/* Results Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredEvents.length} of {events.length} events
            </Typography>
          </Box>

          {/* Events Grid */}
          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} lg={4} key={event.id || event._id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Floating Action Button for Mobile */}
      {user && (
        <Fab
          color="primary"
          aria-label="create event"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={() => navigate('/create-event')}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}

export default EventList;