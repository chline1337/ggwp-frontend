import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Save as SaveIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  SportsEsports as GameIcon,
  AttachMoney as MoneyIcon,
  EmojiEvents as PrizeIcon,
  TableChart as SeatIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { eventsService } from '../../services/events';

function EventCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    max_participants: '',
    game: '',
    entry_fee: '',
    prizes: '',
    seatplan: {
      rows: '',
      columns: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Event name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Event name must be less than 100 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const eventDate = new Date(formData.date);
      const now = new Date();
      if (eventDate <= now) {
        newErrors.date = 'Event date must be in the future';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    } else if (formData.location.trim().length > 200) {
      newErrors.location = 'Location must be less than 200 characters';
    }

    if (!formData.max_participants) {
      newErrors.max_participants = 'Maximum participants is required';
    } else {
      const maxParticipants = parseInt(formData.max_participants);
      if (isNaN(maxParticipants) || maxParticipants < 1) {
        newErrors.max_participants = 'Maximum participants must be at least 1';
      } else if (maxParticipants > 1000) {
        newErrors.max_participants = 'Maximum participants cannot exceed 1000';
      }
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!formData.seatplan.rows) {
      newErrors.seatplan_rows = 'Seatplan rows is required';
    } else {
      const rows = parseInt(formData.seatplan.rows);
      if (isNaN(rows) || rows < 1) {
        newErrors.seatplan_rows = 'Rows must be at least 1';
      } else if (rows > 50) {
        newErrors.seatplan_rows = 'Rows cannot exceed 50';
      }
    }

    if (!formData.seatplan.columns) {
      newErrors.seatplan_columns = 'Seatplan columns is required';
    } else {
      const columns = parseInt(formData.seatplan.columns);
      if (isNaN(columns) || columns < 1) {
        newErrors.seatplan_columns = 'Columns must be at least 1';
      } else if (columns > 50) {
        newErrors.seatplan_columns = 'Columns cannot exceed 50';
      }
    }

    // Validate that seatplan capacity matches max participants
    if (formData.seatplan.rows && formData.seatplan.columns && formData.max_participants) {
      const seatCapacity = parseInt(formData.seatplan.rows) * parseInt(formData.seatplan.columns);
      const maxParticipants = parseInt(formData.max_participants);
      if (seatCapacity < maxParticipants) {
        newErrors.seatplan_capacity = `Seatplan capacity (${seatCapacity}) must be at least equal to maximum participants (${maxParticipants})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('seatplan.')) {
      const seatplanField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seatplan: {
          ...prev.seatplan,
          [seatplanField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name] || errors[name.replace('.', '_')]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
        [name.replace('.', '_')]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data for API
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        date: formData.date,
        location: formData.location.trim(),
        max_participants: parseInt(formData.max_participants),
        game: formData.game.trim() || null,
        entry_fee: formData.entry_fee.trim() || null,
        prizes: formData.prizes.trim() || null,
        seatplan: {
          rows: parseInt(formData.seatplan.rows),
          columns: parseInt(formData.seatplan.columns),
          assignments: []
        }
      };

      const result = await eventsService.createEvent(eventData);
      
      if (result.success) {
        console.log('Event creation result:', result.data); // Debug log
        setSuccess('Event created successfully! Redirecting...');
        
        // Handle different possible ID field names
        const eventId = result.data.id || result.data._id;
        if (eventId) {
          setTimeout(() => {
            navigate(`/events/${eventId}`);
          }, 2000);
        } else {
          console.error('No event ID found in response:', result.data);
          setError('Event created but unable to redirect. Please check the events list.');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/events');
  };

  // Calculate seatplan capacity
  const seatCapacity = formData.seatplan.rows && formData.seatplan.columns 
    ? parseInt(formData.seatplan.rows) * parseInt(formData.seatplan.columns) 
    : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/events')}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <EventIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Events
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          Create Event
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          Back to Events
        </Button>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Event
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a new gaming event or LAN party for the community
          </Typography>
        </Box>
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1 }} />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Event Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Featured Game"
                name="game"
                value={formData.game}
                onChange={handleInputChange}
                error={!!errors.game}
                helperText={errors.game || 'Optional - main game for this event'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GameIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description || 'Optional - describe your event'}
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Event Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CalendarIcon sx={{ mr: 1 }} />
                Event Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Date & Time"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleInputChange}
                error={!!errors.date}
                helperText={errors.date}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                error={!!errors.location}
                helperText={errors.location}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Maximum Participants"
                name="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={handleInputChange}
                error={!!errors.max_participants}
                helperText={errors.max_participants}
                required
                inputProps={{ min: 1, max: 1000 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Entry Fee"
                name="entry_fee"
                value={formData.entry_fee}
                onChange={handleInputChange}
                error={!!errors.entry_fee}
                helperText={errors.entry_fee || 'Optional - e.g., "$10" or "Free"'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Prizes"
                name="prizes"
                value={formData.prizes}
                onChange={handleInputChange}
                error={!!errors.prizes}
                helperText={errors.prizes || 'Optional - prize information'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PrizeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Seatplan Configuration */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <SeatIcon sx={{ mr: 1 }} />
                Seatplan Configuration
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number of Rows"
                name="seatplan.rows"
                type="number"
                value={formData.seatplan.rows}
                onChange={handleInputChange}
                error={!!errors.seatplan_rows}
                helperText={errors.seatplan_rows || 'Number of seat rows (1-50)'}
                required
                inputProps={{ min: 1, max: 50 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SeatIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number of Columns"
                name="seatplan.columns"
                type="number"
                value={formData.seatplan.columns}
                onChange={handleInputChange}
                error={!!errors.seatplan_columns}
                helperText={errors.seatplan_columns || 'Number of seat columns (1-50)'}
                required
                inputProps={{ min: 1, max: 50 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SeatIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Seatplan Summary */}
            {seatCapacity > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Seatplan Summary
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${formData.seatplan.rows} × ${formData.seatplan.columns} = ${seatCapacity} seats`}
                        color="primary"
                        variant="outlined"
                      />
                      {formData.max_participants && (
                        <Chip 
                          label={`${formData.max_participants} max participants`}
                          color={seatCapacity >= parseInt(formData.max_participants) ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </Box>
                    {errors.seatplan_capacity && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {errors.seatplan_capacity}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Form Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  size="large"
                >
                  {loading ? 'Creating Event...' : 'Create Event'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default EventCreate;