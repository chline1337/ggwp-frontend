import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Alert
} from '@mui/material';
import {
  ChairAlt as SeatIcon,
  Person as PersonIcon,
  Close as RemoveSeatIcon
} from '@mui/icons-material';

function SeatMap({ 
  event, 
  currentUserId, 
  currentUserSeat, 
  isRegistered, 
  selectingSeat, 
  onSeatSelect, 
  onSeatRemove 
}) {
  if (!event || !event.seatplan) {
    return null;
  }

  const { seatplan } = event;

  const isSeatTaken = (row, column) => {
    return seatplan.assignments.some(
      assignment => assignment.row === row && assignment.column === column
    );
  };

  const getSeatOwner = (row, column) => {
    const assignment = seatplan.assignments.find(
      assignment => assignment.row === row && assignment.column === column
    );
    return assignment ? assignment.user_id : null;
  };

  const renderSeat = (row, column) => {
    const taken = isSeatTaken(row, column);
    const owner = getSeatOwner(row, column);
    const isCurrentUserSeat = owner === currentUserId;
    const seatId = `${row}-${column}`;

    return (
      <Box
        key={seatId}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          m: 0.5
        }}
      >
        <Button
          variant={taken ? 'contained' : 'outlined'}
          color={isCurrentUserSeat ? 'primary' : taken ? 'error' : 'inherit'}
          size="small"
          sx={{
            minWidth: 40,
            minHeight: 40,
            p: 0.5,
            fontSize: '0.75rem'
          }}
          onClick={() => {
            if (!taken && isRegistered) {
              onSeatSelect(row, column);
            }
          }}
          disabled={selectingSeat || !isRegistered || (taken && !isCurrentUserSeat)}
        >
          {taken ? (
            isCurrentUserSeat ? (
              <PersonIcon fontSize="small" />
            ) : (
              <SeatIcon fontSize="small" />
            )
          ) : (
            `${row}-${column}`
          )}
        </Button>
      </Box>
    );
  };

  const renderSeatMap = () => {
    const rows = [];
    for (let row = 1; row <= seatplan.rows; row++) {
      const seats = [];
      for (let column = 1; column <= seatplan.columns; column++) {
        seats.push(renderSeat(row, column));
      }
      rows.push(
        <Box key={row} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ mr: 2, minWidth: 20, textAlign: 'center', lineHeight: '40px' }}>
            {row}
          </Typography>
          {seats}
        </Box>
      );
    }
    return rows;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <SeatIcon sx={{ mr: 1 }} />
          Seat Map
        </Typography>
        {currentUserSeat && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<RemoveSeatIcon />}
            onClick={onSeatRemove}
            disabled={selectingSeat}
          >
            Remove My Seat
          </Button>
        )}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          icon={<SeatIcon />}
          label="Available"
          variant="outlined"
          size="small"
        />
        <Chip
          icon={<SeatIcon />}
          label="Taken"
          color="error"
          size="small"
        />
        <Chip
          icon={<PersonIcon />}
          label="Your Seat"
          color="primary"
          size="small"
        />
      </Box>

      {/* Current User Seat Info */}
      {currentUserSeat && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You are currently assigned to seat {currentUserSeat.row}-{currentUserSeat.column}
        </Alert>
      )}

      {/* Registration Requirement Notice */}
      {!isRegistered && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You must be registered for this event to select a seat
        </Alert>
      )}

      {/* Column Headers */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Box sx={{ minWidth: 20, mr: 2 }}></Box>
        {Array.from({ length: seatplan.columns }, (_, i) => (
          <Box key={i + 1} sx={{ minWidth: 50, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {i + 1}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Seat Grid */}
      <Box>
        {renderSeatMap()}
      </Box>

      {/* Seat Statistics */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary" align="center">
              Total Seats
            </Typography>
            <Typography variant="h6" align="center">
              {seatplan.rows * seatplan.columns}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary" align="center">
              Assigned
            </Typography>
            <Typography variant="h6" align="center" color="error.main">
              {seatplan.assignments.length}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary" align="center">
              Available
            </Typography>
            <Typography variant="h6" align="center" color="success.main">
              {(seatplan.rows * seatplan.columns) - seatplan.assignments.length}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default SeatMap; 