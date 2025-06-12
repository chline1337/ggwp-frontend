// src/components/tournament/TournamentDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  IconButton,
  TextField,
  Autocomplete,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  SportsEsports as GameIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Group as TeamIcon,
  PlayArrow as PlayIcon,
  PersonAdd as AddPersonIcon,
  PersonRemove as RemovePersonIcon,
  ExitToApp as LeaveIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import useTournament from '../../hooks/useTournament';
import useTournamentActions from '../../hooks/useTournamentActions';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { tournamentService } from '../../services/tournaments';
import Bracket from './Bracket';
import './TournamentDetail.css';

// Function to generate proper single elimination bracket
const generateMockBracket = (tournament, participants = []) => {
  const participantIds = tournament.participants || [];
  if (participantIds.length < 2) return [];

  // Use actual participant data if available, otherwise create mock data
  const tournamentParticipants = participants.length > 0 
    ? participants.map(p => ({
        _id: p.id || p._id,
        username: p.username || p.name || 'Unknown Player',
        name: p.username || p.name || 'Unknown Player'
      }))
    : participantIds.map((id, index) => ({
        _id: id,
        username: `Player ${index + 1}`,
        name: `Player ${index + 1}`
      }));

  // Shuffle participants for random matchups
  const shuffledParticipants = [...tournamentParticipants].sort(() => Math.random() - 0.5);
  const totalParticipants = shuffledParticipants.length;
  
  // Calculate the number of rounds needed
  const totalRounds = Math.ceil(Math.log2(totalParticipants));
  
  // Start from the final and work backwards to determine structure
  const matches = [];
  
  // Calculate matches per round for single elimination
  // Work backwards from final to determine structure
  const roundSizes = [];
  
  // For single elimination, each round eliminates half the remaining players
  // Start with total participants and work down to 1
  let remainingPlayers = totalParticipants;
  
  for (let round = 1; round <= totalRounds; round++) {
    if (remainingPlayers <= 1) break;
    
    // Number of matches in this round = floor(remainingPlayers / 2)
    const matchesInRound = Math.floor(remainingPlayers / 2);
    roundSizes.push(matchesInRound);
    
    // After this round, winners advance + any bye player
    const winners = matchesInRound;
    const byes = remainingPlayers % 2; // 1 if odd number, 0 if even
    remainingPlayers = winners + byes;
  }
  

  
  // Generate Round 1 matches
  const round1Matches = roundSizes[0];
  let participantIndex = 0;
  
  for (let i = 0; i < round1Matches; i++) {
    const participant1 = shuffledParticipants[participantIndex++];
    const participant2 = participantIndex < shuffledParticipants.length 
      ? shuffledParticipants[participantIndex++] 
      : null;
    
    matches.push({
      _id: `match-r1-${i}`,
      participant1,
      participant2,
      winner: null,
      round: 1
    });
  }
  
  // If there's an odd number of participants, one gets a bye to round 2
  const hasFirstRoundBye = participantIndex < shuffledParticipants.length;
  const byeParticipant = hasFirstRoundBye ? shuffledParticipants[participantIndex] : null;
  
  // Generate subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = roundSizes[round - 1];
    
    for (let i = 0; i < matchesInRound; i++) {
      const match = {
        _id: `match-r${round}-${i}`,
        participant1: null, // Will be filled by winners from previous round
        participant2: null, // Will be filled by winners from previous round  
        winner: null,
        round: round
      };
      
      // Handle bye participant in round 2
      if (round === 2 && i === matchesInRound - 1 && byeParticipant) {
        match.participant2 = byeParticipant; // Bye participant goes to last match of round 2
      }
      
      matches.push(match);
    }
  }



  return matches;
};

function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tournament, loading, error, refreshTournament } = useTournament(id);
  const { startTournament, joinTournament, leaveTournament } = useTournamentActions();
  const { user } = useAuth();
  
  // State for dialogs and interactions
  const [startDialog, setStartDialog] = useState(false);
  const [addParticipantDialog, setAddParticipantDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for participant management
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State for bracket/matches
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  
  const userId = user?.id || user?._id;
  const isOrganizer = tournament && user && String(tournament.organizer_id) === String(userId);
  const isParticipant = tournament && user && tournament.participants?.some(pid => String(pid) === String(userId));
  const canJoin = tournament && user && tournament.status === 'open' && !isParticipant;

  





  const loadParticipantDetails = useCallback(async () => {
    if (!tournament?.participants?.length) {
      setParticipants([]);
      return;
    }

    setParticipantsLoading(true);
    try {
      // Fetch user details for each participant ID
      const participantDetails = await Promise.all(
        tournament.participants.map(async (participantId) => {
          try {
            const result = await apiService.getUser(participantId);
            if (result.success) {
              // Ensure we have both id and _id for consistency
              const userData = result.data;
              return {
                ...userData,
                id: userData.id || userData._id,
                _id: userData._id || userData.id
              };
            } else {
              return { 
                id: participantId, 
                _id: participantId, 
                username: 'Unknown User', 
                email: '' 
              };
            }
          } catch (error) {
            return { 
              id: participantId, 
              _id: participantId, 
              username: 'Unknown User', 
              email: '' 
            };
          }
        })
      );

      setParticipants(participantDetails);
    } catch (error) {
      
      setParticipants(tournament.participants.map(id => ({ 
        id, 
        _id: id, 
        username: 'Unknown User', 
        email: '' 
      })));
    } finally {
      setParticipantsLoading(false);
    }
  }, [tournament?.participants]);

  const loadAvailableUsers = useCallback(async () => {
    try {
      const result = await apiService.getUsers();
      if (result.success) {
        // Filter out already participating users and the organizer
        // Use user.id (which is the alias for _id from backend)
        const filtered = result.data.filter(user => 
          !tournament.participants?.includes(user.id || user._id) && 
          (user.id || user._id) !== tournament.organizer_id
        );
        setAvailableUsers(filtered);
      }
    } catch (error) {

      setAvailableUsers([]);
    }
  }, [tournament?.participants, tournament?.organizer_id]);

  // Load participant details when tournament loads
  useEffect(() => {
    if (tournament && tournament.participants?.length > 0) {
      loadParticipantDetails();
    } else {
      setParticipants([]);
    }
  }, [tournament, loadParticipantDetails]);

  // Load available users for organizer
  useEffect(() => {
    if (isOrganizer && addParticipantDialog) {
      loadAvailableUsers();
    }
  }, [isOrganizer, addParticipantDialog, loadAvailableUsers]);

  // Function to advance winner to next round
  const advanceWinnerToNextRound = useCallback((completedMatch, winnerParticipant, allMatches) => {
    const currentRound = completedMatch.round;
    const nextRound = currentRound + 1;
    
    // Find all matches in current round
    const currentRoundMatches = allMatches
      .filter(match => match.round === currentRound)
      .sort((a, b) => (a.match_number || 0) - (b.match_number || 0));
    
    // Find the index of the completed match
    const completedMatchIndex = currentRoundMatches.findIndex(match => 
      (match._id || match.id) === (completedMatch._id || completedMatch.id)
    );
    
    if (completedMatchIndex === -1) return allMatches;
    
    // Calculate which next round match this winner should go to
    const nextMatchIndex = Math.floor(completedMatchIndex / 2);
    
    // Find the next round match
    const nextRoundMatches = allMatches.filter(match => match.round === nextRound);
    const nextMatch = nextRoundMatches[nextMatchIndex];
    
    if (!nextMatch) return allMatches;
    
    // Determine if winner goes to participant1 or participant2 slot
    const isFirstSlot = completedMatchIndex % 2 === 0;
    

    
    // Update the next round match
    return allMatches.map(match => {
      if ((match._id || match.id) === (nextMatch._id || nextMatch.id)) {
        if (isFirstSlot) {
          return { ...match, participant1: winnerParticipant };
        } else {
          return { ...match, participant2: winnerParticipant };
        }
      }
      return match;
    });
  }, []);

  // Function to check for and handle bye matches (participant vs TBD)
  const handleByeMatches = useCallback(async (allMatches) => {
    let updatedMatches = [...allMatches];
    
    // Find bye matches that need to be processed
    const byeMatches = allMatches.filter(match => {
      const hasParticipant1 = match.participant1 && match.participant1.username !== 'TBD';
      const hasParticipant2 = match.participant2 && match.participant2.username !== 'TBD';
      
      // Return true if it's a bye match without a winner
      return !match.winner && ((hasParticipant1 && !hasParticipant2) || (!hasParticipant1 && hasParticipant2));
    });
    
    // Process each bye match
    for (const match of byeMatches) {
      const hasParticipant1 = match.participant1 && match.participant1.username !== 'TBD';
      const hasParticipant2 = match.participant2 && match.participant2.username !== 'TBD';
      
      let winnerParticipant = null;
      let winnerId = null;
      
      if (hasParticipant1 && !hasParticipant2) {
        winnerParticipant = match.participant1;
        winnerId = match.participant1.id || match.participant1._id;

      } else if (!hasParticipant1 && hasParticipant2) {
        winnerParticipant = match.participant2;
        winnerId = match.participant2.id || match.participant2._id;

      }
      
      if (winnerParticipant && winnerId) {
        try {
          // Call the backend API to update the match result and advance the winner
          const response = await apiService.updateMatchResult(
            tournament.id || tournament._id, 
            match._id || match.id, 
            winnerId
          );
          
          if (response.success) {

            
            // Update the local state optimistically
            updatedMatches = updatedMatches.map(m => {
              if ((m._id || m.id) === (match._id || match.id)) {
                return { ...m, winner: winnerParticipant };
              }
              return m;
            });
            
            // Advance winner to next round in local state
            updatedMatches = advanceWinnerToNextRound(match, winnerParticipant, updatedMatches);
            
          } else {

          }
        } catch (error) {

        }
      }
    }
    
    return updatedMatches;
  }, [tournament, advanceWinnerToNextRound]);

  const loadMatches = useCallback(async () => {
    if (!tournament || (!tournament.participants || tournament.participants.length < 2)) return;
    
    setMatchesLoading(true);
    try {
      // Load actual matches from backend
      const result = await tournamentService.getTournamentBrackets(tournament.id || tournament._id);

      
      if (result.success && result.data && result.data.matches && result.data.matches.length > 0) {
        // Check if matches have participant data
        const backendMatches = result.data.matches;

        
        // Check if backend matches already have participant details (MatchOut format)
        const hasParticipantDetails = backendMatches.some(match => 
          match.participant1 !== null || match.participant2 !== null
        );

        if (hasParticipantDetails) {
          // Backend returned enriched matches, use them directly

          // Handle any bye matches in the backend matches
          const matchesWithByes = await handleByeMatches(backendMatches);
          setMatches(matchesWithByes);
        } else {
          // Backend matches only have IDs, need to transform them

          
          const transformedMatches = await Promise.all(
            backendMatches.map(async (match) => {

              
              const transformedMatch = {
                _id: match._id || match.id,
                id: match._id || match.id,
                round: match.round,
                participant1: null,
                participant2: null,
                winner: null
              };

              // Get participant1 details
              if (match.participant1_id) {
                const participant = participants.find(p => {
                  const pId = p.id || p._id;
                  return pId === match.participant1_id;
                });
                if (participant) {
                  transformedMatch.participant1 = {
                    _id: participant.id || participant._id,
                    id: participant.id || participant._id,
                    username: participant.username,
                    name: participant.username
                  };
                }
              }

              // Get participant2 details
              if (match.participant2_id) {
                const participant = participants.find(p => {
                  const pId = p.id || p._id;
                  return pId === match.participant2_id;
                });
                if (participant) {
                  transformedMatch.participant2 = {
                    _id: participant.id || participant._id,
                    id: participant.id || participant._id,
                    username: participant.username,
                    name: participant.username
                  };
                }
              }

              // Handle winner
              if (match.winner_id) {
                const winner = participants.find(p => 
                  (p.id || p._id) === match.winner_id
                );
                if (winner) {
                  transformedMatch.winner = {
                    _id: winner.id || winner._id,
                    id: winner.id || winner._id,
                    username: winner.username,
                    name: winner.username
                  };
                }
              }


              return transformedMatch;
            })
          );


          
          // Check if transformation was successful (at least first round should have participants)
          const firstRoundMatches = transformedMatches.filter(match => match.round === 1);
          const hasValidParticipants = firstRoundMatches.some(match => 
            match.participant1 !== null && match.participant2 !== null
          );

          if (hasValidParticipants) {
            // Handle any bye matches in the transformed matches
            const matchesWithByes = await handleByeMatches(transformedMatches);

            setMatches(matchesWithByes);
          } else {
            const mockMatches = generateMockBracket(tournament, participants);
            // Handle any bye matches in the mock bracket
            const mockMatchesWithByes = await handleByeMatches(mockMatches);
            setMatches(mockMatchesWithByes);
          }
        }
      } else {
        // Fall back to mock bracket if no backend matches or they're incomplete
        const mockMatches = generateMockBracket(tournament, participants);
        // Handle any bye matches in the mock bracket
        const mockMatchesWithByes = await handleByeMatches(mockMatches);
        setMatches(mockMatchesWithByes);
      }
    } catch (error) {
      // Fall back to mock bracket on error
      const mockMatches = generateMockBracket(tournament, participants);
      // Handle any bye matches in the fallback mock bracket
      const mockMatchesWithByes = await handleByeMatches(mockMatches);
      setMatches(mockMatchesWithByes);
    } finally {
      setMatchesLoading(false);
    }
  }, [tournament, participants, handleByeMatches]);



  // Function to update match result with optimistic updates and round progression
  const updateMatchResult = useCallback(async (matchId, winnerId) => {

    
    // First, do an optimistic update to the local state for immediate UI feedback
    let updatedMatches;
    setMatches(prevMatches => {
      updatedMatches = prevMatches.map(match => {
        if ((match._id || match.id) === matchId) {
          // Find the winner participant object
          let winnerParticipant = null;
          if ((match.participant1?.id || match.participant1?._id) === winnerId) {
            winnerParticipant = match.participant1;
          } else if ((match.participant2?.id || match.participant2?._id) === winnerId) {
            winnerParticipant = match.participant2;
          }
          

          
          return {
            ...match,
            winner: winnerParticipant
          };
        }
        return match;
      });

      // Find the completed match for round progression
      const completedMatch = updatedMatches.find(match => 
        (match._id || match.id) === matchId
      );
      
      if (completedMatch && completedMatch.winner) {
        // Advance winner to next round
        updatedMatches = advanceWinnerToNextRound(completedMatch, completedMatch.winner, updatedMatches);
      }

      return updatedMatches;
    });

    // Handle any new bye matches that might have been created (async operation)
    try {
      const matchesWithByes = await handleByeMatches(updatedMatches);
      setMatches(matchesWithByes);
    } catch (error) {

    }

    // Then sync with backend (but don't reload all matches to avoid overwriting the optimistic update)
    try {
      const response = await apiService.updateMatchResult(tournament.id || tournament._id, matchId, winnerId);
      if (response.success) {

        // Optionally, we could do a partial reload here, but the optimistic update should be sufficient
      } else {

        // If backend update fails, we might want to revert the optimistic update
        // For now, we'll just log the error
      }
    } catch (error) {

      // On error, we could revert the optimistic update by reloading matches
      // await loadMatches();
    }
  }, [tournament, advanceWinnerToNextRound, handleByeMatches]);

  // Load matches/bracket when tournament has started and participants are loaded
  useEffect(() => {
    if (tournament && (tournament.status === 'started' || tournament.status === 'completed') && participants.length > 0) {
      loadMatches();
    }
  }, [tournament, participants, loadMatches]);



  const handleStartTournament = async () => {
    setActionLoading(true);
    try {
      const result = await startTournament(id);
      if (result.success) {
        await refreshTournament();
        setStartDialog(false);
        showSnackbar('Tournament started successfully!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to start tournament', 'error');
      }
    } catch (error) {

      showSnackbar('Failed to start tournament', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    setActionLoading(true);
    try {
      const result = await joinTournament(id);
      if (result.success) {
        await refreshTournament();
        showSnackbar('Successfully joined tournament!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to join tournament', 'error');
      }
    } catch (error) {

      showSnackbar('Failed to join tournament', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTournament = async () => {
    setActionLoading(true);
    try {
      const result = await leaveTournament(id);
      if (result.success) {
        await refreshTournament();
        showSnackbar('Successfully left tournament', 'success');
      } else {
        showSnackbar(result.error || 'Failed to leave tournament', 'error');
      }
    } catch (error) {

      showSnackbar('Failed to leave tournament', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      // Use the correct ID field (prioritize .id which is the alias for _id)
      const userId = selectedUser.id || selectedUser._id;

      
      const result = await apiService.addTournamentParticipant(id, userId);
      if (result.success) {
        await refreshTournament();
        setAddParticipantDialog(false);
        setSelectedUser(null);
        showSnackbar(`Added ${selectedUser.username} to tournament`, 'success');
      } else {
        showSnackbar(result.error || 'Failed to add participant', 'error');
      }
    } catch (error) {

      showSnackbar('Failed to add participant', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId, username) => {
    
    setActionLoading(true);
    try {
      const result = await apiService.removeTournamentParticipant(id, participantId);
      if (result.success) {
        await refreshTournament();
        showSnackbar(`Removed ${username} from tournament`, 'success');
      } else {
        showSnackbar(result.error || 'Failed to remove participant', 'error');
      }
    } catch (error) {

      showSnackbar('Failed to remove participant', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'primary';
      case 'started':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'Open for Registration';
      case 'started':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getParticipantTypeIcon = (type) => {
    return type === 'team' ? <TeamIcon /> : <PersonIcon />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={200} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
        </Button>
      </Container>
    );
  }

  if (!tournament) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Tournament not found
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/tournaments')}
        sx={{ mb: 3 }}
      >
        Back to Tournaments
      </Button>

      {/* Tournament Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 80,
              height: 80,
              mr: 3
            }}
          >
            <TournamentIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              {tournament.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={getStatusLabel(tournament.status)}
                color={getStatusColor(tournament.status)}
                size="medium"
              />
              <Typography variant="h6" color="text.secondary">
                {tournament.game}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Organized by {tournament.organizer_name || 'Unknown'}
            </Typography>
          </Box>
          {isOrganizer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/tournaments/${id}/edit`)}
              >
                Edit
              </Button>
              {tournament.status === 'open' && (
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={() => setStartDialog(true)}
                  color="success"
                >
                  Start Tournament
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Tournament Description */}
        {tournament.description && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            {tournament.description}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Tournament Details Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GameIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Format
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {tournament.format?.replace('_', ' ') || 'Not specified'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getParticipantTypeIcon(tournament.participantType)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Participant Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {tournament.participantType === 'individual' ? 'Individual' : 'Team'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Participants
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {tournament.participants?.length || 0}
                  {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ''}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(tournament.startDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Participants Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Participants ({participants.length})
                </Typography>
                {isOrganizer && tournament.status === 'open' && (
                  <Button
                    variant="outlined"
                    startIcon={<AddPersonIcon />}
                    onClick={() => setAddParticipantDialog(true)}
                    size="small"
                  >
                    Add Participant
                  </Button>
                )}
              </Box>
              
              {participantsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : participants.length > 0 ? (
                <List>
                  {participants.map((participant, index) => {

                    return (
                      <ListItem key={participant.id || participant._id || `participant-${index}`} divider={index < participants.length - 1}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {tournament.participantType === 'team' ? <TeamIcon /> : <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={participant.username || participant.name || 'Unknown User'}
                          secondary={participant.email || `User ID: ${participant.id || participant._id}`}
                        />
                        {isOrganizer && tournament.status === 'open' && (
                          <ListItemSecondaryAction>
                            <Tooltip title="Remove participant">
                              <IconButton
                                edge="end"
                                onClick={() => {
                                  const userId = participant.id || participant._id;

                                  handleRemoveParticipant(userId, participant.username);
                                }}
                                disabled={actionLoading}
                              >
                                <RemovePersonIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Alert severity="info">
                  No participants registered yet.
                  {canJoin && ' Be the first to join!'}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Tournament Bracket/Results Section */}
          {(tournament.status === 'started' || tournament.status === 'completed') && (
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Tournament Bracket
                </Typography>
                {matchesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : matches && matches.length > 0 ? (
                  <Box sx={{ position: 'relative', overflow: 'auto' }}>
                                    <Bracket 
                  tournament={{...tournament, matches}} 
                  isOrganizer={isOrganizer}
                  refreshTournament={refreshTournament}
                  onMatchResult={updateMatchResult}
                />
                  </Box>
                ) : (
                  <Alert severity="info">
                    {tournament.status === 'started' 
                      ? 'Bracket is being generated. Please refresh the page in a moment.'
                      : 'Tournament bracket will be available once the tournament starts.'
                    }
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Tournament Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Tournament Information
              </Typography>
              
              {tournament.prizePool && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Prize Pool
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ${tournament.prizePool}
                  </Typography>
                </Box>
              )}

              {tournament.rules && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Rules
                  </Typography>
                  <Typography variant="body1">
                    {tournament.rules}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDate(tournament.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDate(tournament.updatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          {tournament.status === 'open' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {isParticipant ? 'Tournament Actions' : 'Join Tournament'}
                </Typography>
                
                {canJoin ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    size="large"
                    onClick={handleJoinTournament}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <CircularProgress size={20} /> : 'Join Tournament'}
                  </Button>
                ) : isParticipant ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<LeaveIcon />}
                    size="large"
                    onClick={handleLeaveTournament}
                    disabled={actionLoading}
                    color="error"
                  >
                    {actionLoading ? <CircularProgress size={20} /> : 'Leave Tournament'}
                  </Button>
                ) : (
                  <Alert severity="info">
                    {tournament.participants?.length >= tournament.maxParticipants
                      ? 'Tournament is full'
                      : 'Tournament is open for registration'}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Start Tournament Dialog */}
      <Dialog open={startDialog} onClose={() => setStartDialog(false)}>
        <DialogTitle>Start Tournament</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to start this tournament? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current participants: {participants.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStartTournament}
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <PlayIcon />}
          >
            Start Tournament
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={addParticipantDialog} onClose={() => setAddParticipantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Participant</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Autocomplete
              options={availableUsers}
              getOptionLabel={(option) => `${option.username} (${option.email})`}
              value={selectedUser}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  placeholder="Choose a user to add to the tournament"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{option.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddParticipantDialog(false);
            setSelectedUser(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddParticipant}
            variant="contained"
            disabled={!selectedUser || actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <AddPersonIcon />}
          >
            Add Participant
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        action={
          <Button color="inherit" size="small" onClick={() => setSnackbar({ ...snackbar, open: false })}>
            <CheckIcon fontSize="small" />
          </Button>
        }
      />
    </Container>
  );
}

export default TournamentDetail;