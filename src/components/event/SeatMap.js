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
  Clear as ClearIcon
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

  // Handle seat click
  const handleSeatClick = (row, column) => {
    if (editMode && isOrganizer) {
      // In edit mode, open assignment dialog
      setSelectedSeat({ row, column });
      setAssignDialog(true);
    } else {
      // Normal mode, current user seat assignment
      if (isSeatOccupied(row, column)) {
        if (isCurrentUserSeat(row, column)) {
          handleRemoveSeat();
        }
      } else {
        handleAssignSeat(row, column);
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

  // Render seat component
  const renderSeat = (row, column) => {
    const occupant = getSeatOccupant(row, column);
    const isOccupied = occupant !== null;
    const isCurrentUsersSeat = occupant?.userId === currentUser?.id;
    
    return (
      <Tooltip
        key={`${row}-${column}`}
        title={
          isOccupied 
            ? `${occupant.username} (${occupant.email})`
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
            backgroundColor: isCurrentUsersSeat 
              ? 'primary.light' 
              : isOccupied 
                ? 'grey.300' 
                : 'background.paper',
            border: isCurrentUsersSeat ? 2 : 1,
            borderColor: isCurrentUsersSeat 
              ? 'primary.main' 
              : isOccupied 
                ? 'grey.400' 
                : 'divider',
            '&:hover': {
              backgroundColor: isCurrentUsersSeat 
                ? 'primary.light' 
                : isOccupied 
                  ? 'grey.400' 
                  : 'action.hover',
              borderColor: 'primary.main'
            },
            position: 'relative'
          }}
          onClick={() => handleSeatClick(row, column)}
        >
          {isOccupied ? (
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            {editMode ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => setEditMode(false)}
                  color="primary"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => setEditMode(false)}
                >
                  Cancel
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
          Use the X button to remove assignments. Drag seats to reposition them.
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