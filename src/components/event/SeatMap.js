import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  Menu,
  ListItemText,
  ListItemIcon,
  Badge,
  Card,
  CardContent,
  Avatar,
  Divider
} from '@mui/material';
import {
  ChairAlt as SeatIcon,
  Person as PersonIcon,
  Close as RemoveSeatIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PersonAdd as AssignIcon,
  DragIndicator as DragIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon
} from '@mui/icons-material';
import { eventsService } from '../../services/events';

const SeatMap = ({ 
  event, 
  currentUser, 
  onSeatAssigned, 
  onSeatRemoved,
  isOrganizer = false 
}) => {
  const [editMode, setEditMode] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hiddenSeats, setHiddenSeats] = useState(new Set());

  // Helper function to get correct event ID
  const getEventId = () => {
    return event?.id || event?._id;
  };

  // Load participants for assignment dialog
  useEffect(() => {
    if (assignDialog && isOrganizer) {
      loadParticipants();
    }
  }, [assignDialog, isOrganizer]);

  // Load hidden seats from event data on mount
  useEffect(() => {
    if (event?.seatplan?.hidden_seats) {
      const hiddenSeatsSet = new Set(event.seatplan.hidden_seats);
      setHiddenSeats(hiddenSeatsSet);
    }
  }, [event]);

  const loadParticipants = async () => {
    try {
      const result = await eventsService.getEventParticipants(getEventId());
      if (result.success) {
        setParticipants(result.data);
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };

  // Get seat occupant information
  const getSeatOccupant = (row, column) => {
    if (!event.seatplan?.assignments) return null;
    
    // Convert from 0-based (frontend) to 1-based (backend) indexing for comparison
    const assignment = event.seatplan.assignments.find(
      a => a.row === row + 1 && a.column === column + 1
    );
    
    if (!assignment) return null;

    // Find participant details
    const participant = event.participant_details?.find(
      p => p.user_id === assignment.user_id
    );
    
    return {
      userId: assignment.user_id,
      username: participant?.username || 'Unknown User',
      email: participant?.email || ''
    };
  };

  // Check if seat is occupied
  const isSeatOccupied = (row, column) => {
    return getSeatOccupant(row, column) !== null;
  };

  // Check if current user is in this seat
  const isCurrentUserSeat = (row, column) => {
    const occupant = getSeatOccupant(row, column);
    return occupant && occupant.userId === currentUser?.id;
  };

  // Check if seat is hidden
  const isSeatHidden = (row, column) => {
    return hiddenSeats.has(`${row}-${column}`);
  };

  // Toggle seat visibility
  const toggleSeatVisibility = (row, column) => {
    const seatKey = `${row}-${column}`;
    const newHiddenSeats = new Set(hiddenSeats);
    
    if (newHiddenSeats.has(seatKey)) {
      newHiddenSeats.delete(seatKey);
    } else {
      newHiddenSeats.add(seatKey);
    }
    
    setHiddenSeats(newHiddenSeats);
  };

  // Handle seat click
  const handleSeatClick = (row, column, event) => {
    // Prevent click if seat is hidden and not in edit mode
    if (isSeatHidden(row, column) && !editMode) {
      return;
    }

    if (editMode && isOrganizer) {
      // Check if Shift key is held for hide/show toggle
      if (event?.shiftKey) {
        toggleSeatVisibility(row, column);
        return;
      }
      
      // In edit mode, open assignment dialog (only for visible seats)
      if (!isSeatHidden(row, column)) {
        setSelectedSeat({ row, column });
        setAssignDialog(true);
      }
    } else {
      // Normal mode, current user seat assignment (only for visible seats)
      if (!isSeatHidden(row, column)) {
        if (isSeatOccupied(row, column)) {
          if (isCurrentUserSeat(row, column)) {
            handleRemoveSeat();
          }
        } else {
          handleAssignSeat(row, column);
        }
      }
    }
  };

  // Handle normal seat assignment (current user)
  const handleAssignSeat = async (row, column) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert from 0-based (frontend) to 1-based (backend) indexing
      const result = await eventsService.assignSeat(getEventId(), row + 1, column + 1);
      if (result.success) {
        setSuccess('Seat assigned successfully!');
        onSeatAssigned?.(result.data);
      } else {
        setError(result.error || 'Failed to assign seat');
      }
    } catch (error) {
      setError('Failed to assign seat');
    } finally {
      setLoading(false);
    }
  };

  // Handle normal seat removal (current user)
  const handleRemoveSeat = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsService.removeSeatAssignment(getEventId());
      if (result.success) {
        setSuccess('Seat removed successfully!');
        onSeatRemoved?.(result.data);
      } else {
        setError(result.error || 'Failed to remove seat');
      }
    } catch (error) {
      setError('Failed to remove seat');
    } finally {
      setLoading(false);
    }
  };

  // Handle admin seat assignment
  const handleAdminAssignSeat = async (userId) => {
    if (!selectedSeat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert from 0-based (frontend) to 1-based (backend) indexing
      const result = await eventsService.assignSeatAdmin(
        getEventId(), 
        userId, 
        selectedSeat.row + 1, 
        selectedSeat.column + 1
      );
      
      if (result.success) {
        setSuccess('Seat assigned successfully!');
        onSeatAssigned?.(result.data);
        setAssignDialog(false);
        setSelectedSeat(null);
      } else {
        setError(result.error || 'Failed to assign seat');
      }
    } catch (error) {
      setError('Failed to assign seat');
    } finally {
      setLoading(false);
    }
  };

  // Handle admin seat removal
  const handleAdminRemoveSeat = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsService.removeSeatAssignmentAdmin(getEventId(), userId);
      
      if (result.success) {
        setSuccess('Seat assignment removed successfully!');
        onSeatRemoved?.(result.data);
      } else {
        setError(result.error || 'Failed to remove seat assignment');
      }
    } catch (error) {
      setError('Failed to remove seat assignment');
    } finally {
      setLoading(false);
    }
  };

  // Get available participants (not already seated)
  const getAvailableParticipants = () => {
    if (!participants || !event.seatplan?.assignments) return participants;
    
    const seatedUserIds = event.seatplan.assignments.map(a => a.user_id);
    return participants.filter(p => !seatedUserIds.includes(p.user_id));
  };

  // Save hidden seats to backend
  const saveHiddenSeats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const hiddenSeatsArray = Array.from(hiddenSeats);
      const result = await eventsService.updateSeatplanHiddenSeats(getEventId(), hiddenSeatsArray);
      
      if (result.success) {
        setSuccess('Seatmap changes saved successfully!');
        // Update the event object to reflect the saved hidden seats
        if (event.seatplan) {
          event.seatplan.hidden_seats = hiddenSeatsArray;
        }
      } else {
        setError(result.error || 'Failed to save seatmap changes');
      }
    } catch (error) {
      setError('Failed to save seatmap changes');
    } finally {
      setLoading(false);
    }
  };

  // Render seat component
  const renderSeat = (row, column) => {
    const occupant = getSeatOccupant(row, column);
    const isOccupied = occupant !== null;
    const isCurrentUsersSeat = occupant?.userId === currentUser?.id;
    const isHidden = isSeatHidden(row, column);
    
    // If seat is hidden and not in edit mode, don't render anything
    if (isHidden && !editMode) {
      return (
        <Box
          key={`${row}-${column}`}
          sx={{
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      );
    }
    
    return (
      <Tooltip
        key={`${row}-${column}`}
        title={
          isHidden 
            ? `Hidden Seat - Row ${row + 1}, Seat ${column + 1} (Shift+Click to show)`
            : isOccupied 
              ? `${occupant.username} (${occupant.email})`
              : editMode 
                ? `Row ${row + 1}, Seat ${column + 1} (Shift+Click to hide)`
                : `Row ${row + 1}, Seat ${column + 1}`
        }
      >
        <Card
          sx={{
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: isHidden 
              ? 'action.disabledBackground'
              : isCurrentUsersSeat 
                ? 'primary.light' 
                : isOccupied 
                  ? 'grey.300' 
                  : 'background.paper',
            border: isCurrentUsersSeat ? 2 : 1,
            borderColor: isHidden 
              ? 'action.disabled'
              : isCurrentUsersSeat 
                ? 'primary.main' 
                : isOccupied 
                  ? 'grey.400' 
                  : 'divider',
            borderStyle: isHidden ? 'dashed' : 'solid',
            opacity: isHidden ? 0.5 : 1,
            '&:hover': {
              backgroundColor: isHidden 
                ? 'action.disabledBackground'
                : isCurrentUsersSeat 
                  ? 'primary.light' 
                  : isOccupied 
                    ? 'grey.400' 
                    : 'action.hover',
              borderColor: editMode ? 'primary.main' : (isCurrentUsersSeat ? 'primary.main' : 'primary.light'),
              opacity: isHidden ? 0.7 : 1
            },
            position: 'relative'
          }}
          onClick={(e) => handleSeatClick(row, column, e)}
        >
          {isHidden ? (
            <HideIcon color="disabled" fontSize="small" />
          ) : isOccupied ? (
            <Box sx={{ textAlign: 'center' }}>
              <PersonIcon 
                color={isCurrentUsersSeat ? 'primary' : 'disabled'} 
                fontSize="small" 
              />
              {editMode && isOrganizer && (
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: -8, right: -8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdminRemoveSeat(occupant.userId);
                  }}
                >
                  <ClearIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </Box>
          ) : (
            <SeatIcon color="disabled" fontSize="small" />
          )}
          
          {editMode && (
            <DragIcon
              sx={{
                position: 'absolute',
                top: 2,
                left: 2,
                fontSize: 12,
                color: 'action.active'
              }}
            />
          )}
        </Card>
      </Tooltip>
    );
  };

  if (!event?.seatplan) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          No seating plan available for this event.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header with Edit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Seating Plan - {event.seatplan.name}
        </Typography>
        
        {isOrganizer && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {editMode ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={async () => {
                    await saveHiddenSeats();
                    setEditMode(false);
                  }}
                  color="primary"
                  disabled={loading}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    // Reset hidden seats to original state when canceling
                    if (event?.seatplan?.hidden_seats) {
                      setHiddenSeats(new Set(event.seatplan.hidden_seats));
                    } else {
                      setHiddenSeats(new Set());
                    }
                    setEditMode(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShowIcon />}
                  onClick={() => setHiddenSeats(new Set())}
                  disabled={hiddenSeats.size === 0}
                  size="small"
                >
                  Show All Seats
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
              >
                Edit Seatmap
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Edit Mode Indicator */}
      {editMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Edit Mode Active:</strong> Click on seats to assign participants. 
          <strong>Shift+Click</strong> to hide/show seats. 
          Use the X button to remove assignments.
          {hiddenSeats.size > 0 && (
            <Box component="span" sx={{ ml: 2, fontWeight: 'bold', color: 'warning.main' }}>
              ({hiddenSeats.size} seat{hiddenSeats.size !== 1 ? 's' : ''} hidden)
            </Box>
          )}
        </Alert>
      )}

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Seat Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
        {Array.from({ length: event.seatplan.rows }, (_, row) => (
          <Box key={row} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ minWidth: 30 }}>
              Row {row + 1}
            </Typography>
            {Array.from({ length: event.seatplan.columns }, (_, column) => 
              renderSeat(row, column)
            )}
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Chip
          icon={<SeatIcon />}
          label="Available"
          variant="outlined"
          size="small"
        />
        <Chip
          icon={<PersonIcon />}
          label="Occupied"
          color="default"
          size="small"
        />
        <Chip
          icon={<PersonIcon />}
          label="Your Seat"
          color="primary"
          size="small"
        />
        {editMode && (
          <Chip
            icon={<HideIcon />}
            label="Hidden Seat"
            color="secondary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {/* Seat Assignment Dialog */}
      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Seat {selectedSeat && `(Row ${selectedSeat.row + 1}, Seat ${selectedSeat.column + 1})`}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Participant</InputLabel>
            <Select
              value=""
              label="Select Participant"
              onChange={(e) => handleAdminAssignSeat(e.target.value)}
            >
              {getAvailableParticipants().map((participant) => (
                <MenuItem key={participant.user_id} value={participant.user_id}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={participant.username}
                    secondary={participant.email}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {getAvailableParticipants().length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              All participants are already assigned to seats.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SeatMap; 