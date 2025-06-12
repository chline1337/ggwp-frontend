import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemSecondaryAction,
  InputAdornment,
  TextField
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Home as HomeIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  SportsEsports as GameIcon,
  AttachMoney as MoneyIcon,
  EmojiEvents as PrizeIcon,
  TableChart as SeatIcon,
  PersonAdd as RegisterIcon,
  PersonRemove as UnregisterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  List as ListIcon,
  Payment as PaymentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { eventsService } from '../../services/events';

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectingSeat, setSelectingSeat] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null); // userId being edited
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    payment_status: 'pending',
    payment_method: '',
    payment_amount: ''
  });

  const currentUserId = user?.id || user?._id;
  const isRegistered = event && event.participants.includes(currentUserId);
  const isOrganizer = event && event.organizer_id === currentUserId;
  const isFull = event && event.participants.length >= event.max_participants;
  
  // Find current user's seat assignment
  const currentUserSeat = event && event.seatplan.assignments.find(
    assignment => assignment.user_id === currentUserId
  );

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (event && event.participants.length > 0) {
      loadParticipants();
    }
  }, [event]);

  const loadEvent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsService.getEvent(eventId);
      if (result.success) {
        setEvent(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    setLoadingParticipants(true);
    
    try {
      const result = await eventsService.getEventParticipants(eventId);
      if (result.success) {
        // Transform backend data to include seat assignments
        const participantDetails = result.data.map(participant => ({
          ...participant,
          id: participant.user_id,
          seat_assignment: event.seatplan.assignments.find(
            assignment => assignment.user_id === participant.user_id
          )
        }));
        setParticipants(participantDetails);
      } else {
        console.error('Failed to load participants:', result.error);
        // Don't set error for participants as it's not critical
      }
    } catch (err) {
      console.error('Error loading participants:', err);
      // Don't set error for participants as it's not critical
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const result = await eventsService.registerForEvent(eventId);
      if (result.success) {
        setEvent(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error registering for event:', err);
      setError('Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setRegistering(true);
    try {
      const result = await eventsService.unregisterFromEvent(eventId);
      if (result.success) {
        await loadEvent(); // Reload event data
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error unregistering from event:', err);
      setError('Failed to unregister from event');
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await eventsService.deleteEvent(eventId);
      if (result.success) {
        navigate('/events');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  const handleSeatSelect = async (row, column) => {
    if (!isRegistered || selectingSeat) return;
    
    setSelectingSeat(true);
    setError(null);
    
    try {
      const result = await eventsService.assignSeat(eventId, row, column);
      if (result.success) {
        // Reload event data to get updated seat assignments
        await loadEvent();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error selecting seat:', err);
      setError('Failed to select seat');
    } finally {
      setSelectingSeat(false);
    }
  };

  const handleSeatRemove = async () => {
    if (!isRegistered || !currentUserSeat || selectingSeat) return;
    
    setSelectingSeat(true);
    setError(null);
    
    try {
      const result = await eventsService.removeSeatAssignment(eventId);
      if (result.success) {
        // Reload event data to get updated seat assignments
        await loadEvent();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error removing seat:', err);
      setError('Failed to remove seat assignment');
    } finally {
      setSelectingSeat(false);
    }
  };

  const handlePaymentEdit = (participant) => {
    setSelectedParticipant(participant);
    setPaymentFormData({
      payment_status: participant.payment_status || 'pending',
      payment_method: participant.payment_method || '',
      payment_amount: participant.payment_amount || ''
    });
    setPaymentDialog(true);
  };

  const handlePaymentUpdate = async () => {
    if (!selectedParticipant) return;

    setUpdatingPayment(true);
    try {
      const paymentData = {
        user_id: selectedParticipant.user_id,
        payment_status: paymentFormData.payment_status,
        payment_date: paymentFormData.payment_status === 'paid' ? new Date().toISOString() : null,
        payment_method: paymentFormData.payment_method || null,
        payment_amount: paymentFormData.payment_amount ? parseFloat(paymentFormData.payment_amount) : null
      };

      const result = await eventsService.updatePaymentStatus(eventId, selectedParticipant.user_id, paymentData);
      
      if (result.success) {
        // Reload participants to get updated data
        await loadParticipants();
        setPaymentDialog(false);
        setSelectedParticipant(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleQuickPaymentToggle = async (participant) => {
    setUpdatingPayment(true);
    try {
      const newStatus = participant.payment_status === 'paid' ? 'pending' : 'paid';
      const paymentData = {
        user_id: participant.user_id,
        payment_status: newStatus,
        payment_date: newStatus === 'paid' ? new Date().toISOString() : null
      };

      const result = await eventsService.updatePaymentStatus(eventId, participant.user_id, paymentData);
      
      if (result.success) {
        // Reload participants to get updated data
        await loadParticipants();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Event not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/events')}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

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
          {event.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/events')}
          sx={{ mr: 2 }}
        >
          Back to Events
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {event.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
          </Box>
        </Box>
        {isOrganizer && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit Event">
              <IconButton 
                color="primary"
                onClick={() => navigate(`/events/${eventId}/edit`)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Event">
              <IconButton 
                color="error"
                onClick={() => setDeleteDialog(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Event Info */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ mr: 1 }} />
              Event Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(event.date)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {event.location}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Organizer
                    </Typography>
                    <Typography variant="body1">
                      {event.organizer_name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {event.entry_fee && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Entry Fee
                      </Typography>
                      <Typography variant="body1">
                        {event.entry_fee}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {event.prizes && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PrizeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Prizes
                      </Typography>
                      <Typography variant="body1">
                        {event.prizes}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {event.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {event.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Seatplan */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SeatIcon sx={{ mr: 1 }} />
              Seatplan ({event.seatplan.rows} × {event.seatplan.columns})
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {isRegistered ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Click on an available seat to select it. Your current seat will be highlighted.
                </Typography>
                {currentUserSeat && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="primary">
                      Your seat: {currentUserSeat.row}-{currentUserSeat.column}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={handleSeatRemove}
                      disabled={selectingSeat}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
                {selectingSeat && (
                  <Typography variant="body2" color="text.secondary">
                    Updating seat assignment...
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Register for the event to select a seat.
              </Typography>
            )}

            {/* Seatplan grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${event.seatplan.columns}, 1fr)`,
              gap: 1,
              maxWidth: '400px'
            }}>
              {Array.from({ length: event.seatplan.rows * event.seatplan.columns }, (_, index) => {
                const row = Math.floor(index / event.seatplan.columns) + 1;
                const col = (index % event.seatplan.columns) + 1;
                const assignment = event.seatplan.assignments.find(
                  assignment => assignment.row === row && assignment.column === col
                );
                const isAssigned = !!assignment;
                const isCurrentUserSeat = assignment && assignment.user_id === currentUserId;
                
                let buttonVariant, buttonColor;
                if (isCurrentUserSeat) {
                  buttonVariant = "contained";
                  buttonColor = "primary";
                } else if (isAssigned) {
                  buttonVariant = "contained";
                  buttonColor = "inherit";
                } else {
                  buttonVariant = "outlined";
                  buttonColor = "primary";
                }
                
                return (
                  <Button
                    key={index}
                    variant={buttonVariant}
                    color={buttonColor}
                    size="small"
                    disabled={!isRegistered || (isAssigned && !isCurrentUserSeat) || selectingSeat}
                    onClick={() => handleSeatSelect(row, col)}
                    sx={{ 
                      minWidth: '40px', 
                      height: '40px',
                      fontSize: '0.75rem',
                      ...(isAssigned && !isCurrentUserSeat && {
                        backgroundColor: 'grey.400',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'grey.400'
                        }
                      })
                    }}
                  >
                    {row}-{col}
                  </Button>
                );
              })}
            </Box>

            {/* Seat legend */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  backgroundColor: 'primary.main', 
                  borderRadius: 0.5 
                }} />
                <Typography variant="caption">Your seat</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  backgroundColor: 'grey.400', 
                  borderRadius: 0.5 
                }} />
                <Typography variant="caption">Occupied</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  border: '1px solid', 
                  borderColor: 'primary.main', 
                  borderRadius: 0.5 
                }} />
                <Typography variant="caption">Available</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Participants List */}
          {(isOrganizer || participants.length > 0) && (
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListIcon sx={{ mr: 1 }} />
                  Participants ({event.participant_count})
                </Typography>
                {isOrganizer && (
                  <Chip
                    icon={<PaymentIcon />}
                    label="Click to edit payments"
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {loadingParticipants ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : participants.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No participants registered yet
                </Typography>
              ) : (
                <Box>
                  {participants.map((participant, index) => (
                    <ListItem key={participant.id} divider={index < participants.length - 1}>
                      <ListItemAvatar>
                        <Badge
                          badgeContent={participant.payment_status === 'paid' ? '✓' : '!'}
                          color={participant.payment_status === 'paid' ? 'success' : 'warning'}
                          overlap="circular"
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {participant.username.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {participant.username}
                            </Typography>
                            <Chip
                              label={participant.payment_status === 'paid' ? 'Paid' : 'Pending'}
                              color={participant.payment_status === 'paid' ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                              onClick={isOrganizer ? () => handleQuickPaymentToggle(participant) : undefined}
                              sx={isOrganizer ? { cursor: 'pointer', '&:hover': { opacity: 0.8 } } : {}}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {participant.email}
                            </Typography>
                            {participant.seat_assignment ? (
                              <Typography variant="body2" color="primary">
                                Seat: {participant.seat_assignment.row}-{participant.seat_assignment.column}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No seat assigned
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Registered: {new Date(participant.registered_at).toLocaleDateString()}
                            </Typography>
                            {participant.payment_date && (
                              <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                                Paid: {new Date(participant.payment_date).toLocaleDateString()}
                              </Typography>
                            )}
                            {participant.payment_method && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Method: {participant.payment_method}
                              </Typography>
                            )}
                            {participant.payment_amount && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Amount: ${participant.payment_amount}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      {isOrganizer && (
                        <ListItemSecondaryAction>
                          <Tooltip title="Edit Payment Details">
                            <IconButton 
                              edge="end" 
                              onClick={() => handlePaymentEdit(participant)}
                              disabled={updatingPayment}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </Box>
              )}
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Registration Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} />
                Registration
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Participants
                </Typography>
                <Typography variant="h6">
                  {event.participant_count} / {event.max_participants}
                </Typography>
              </Box>

              {user ? (
                <Box>
                  {isRegistered ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckIcon sx={{ mr: 1 }} />
                          You are registered for this event
                        </Box>
                      </Alert>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<UnregisterIcon />}
                        onClick={handleUnregister}
                        disabled={registering}
                      >
                        {registering ? 'Unregistering...' : 'Unregister'}
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<RegisterIcon />}
                      onClick={handleRegister}
                      disabled={registering || isFull}
                    >
                      {registering ? 'Registering...' : isFull ? 'Event Full' : 'Register'}
                    </Button>
                  )}
                </Box>
              ) : (
                <Alert severity="info">
                  Please log in to register for this event
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Statistics
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Seats:
                </Typography>
                <Typography variant="body2">
                  {event.seatplan.rows * event.seatplan.columns}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Assigned Seats:
                </Typography>
                <Typography variant="body2">
                  {event.seatplan.assignments.length}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Available Seats:
                </Typography>
                <Typography variant="body2">
                  {(event.seatplan.rows * event.seatplan.columns) - event.seatplan.assignments.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Payment Stats */}
          {participants.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Status
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Paid:
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {participants.filter(p => p.payment_status === 'paid').length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pending:
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    {participants.filter(p => p.payment_status === 'pending').length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Rate:
                  </Typography>
                  <Typography variant="body2">
                    {participants.length > 0 
                      ? Math.round((participants.filter(p => p.payment_status === 'paid').length / participants.length) * 100)
                      : 0}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Payment Edit Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon />
            Edit Payment Status
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedParticipant && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedParticipant.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedParticipant.email}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={paymentFormData.payment_status}
                      label="Payment Status"
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, payment_status: e.target.value }))}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment Method"
                    value={paymentFormData.payment_method}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                    placeholder="e.g., Credit Card, PayPal, Cash"
                    helperText="Optional - how the payment was made"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment Amount"
                    type="number"
                    value={paymentFormData.payment_amount}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, payment_amount: e.target.value }))}
                    placeholder="0.00"
                    helperText="Optional - amount paid"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPaymentDialog(false)}
            disabled={updatingPayment}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePaymentUpdate}
            variant="contained"
            disabled={updatingPayment}
            startIcon={updatingPayment ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {updatingPayment ? 'Updating...' : 'Update Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{event.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EventDetail; 