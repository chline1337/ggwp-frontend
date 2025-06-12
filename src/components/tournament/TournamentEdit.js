import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Skeleton,
  Grid,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  SportsEsports as GameIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import useTournament from '../../hooks/useTournament';
import useTournamentActions from '../../hooks/useTournamentActions';
import { useAuth } from '../../contexts/AuthContext';
import useTeamActions from '../../hooks/useTeamActions';
import TournamentBasicInfo from './TournamentBasicInfo';
import TournamentSettings from './TournamentSettings';
import TournamentParticipants from './TournamentParticipants';
import TournamentPreview from './TournamentPreview';

const TOURNAMENT_FORMATS = [
  { value: 'single_elimination', label: 'Single Elimination', description: 'Traditional knockout tournament' },
  { value: 'double_elimination', label: 'Double Elimination', description: 'Players get a second chance' },
  { value: 'round_robin', label: 'Round Robin', description: 'Everyone plays everyone' },
  { value: 'group_stage', label: 'Group Stage', description: 'Groups followed by knockout' }
];

const PARTICIPANT_TYPES = [
  { value: 'individual', label: 'Individual Players', icon: <PersonIcon /> },
  { value: 'team', label: 'Teams', icon: <TeamIcon /> }
];

const POPULAR_GAMES = [
  'League of Legends',
  'Counter-Strike 2',
  'Valorant',
  'Dota 2',
  'Overwatch 2',
  'Rocket League',
  'FIFA 24',
  'Call of Duty',
  'Fortnite',
  'Apex Legends'
];

const MAX_PARTICIPANTS_OPTIONS = [4, 8, 16, 32, 64, 128];

const steps = [
  'Basic Information',
  'Tournament Settings',
  'Teams & Participants',
  'Review & Update'
];

function TournamentEdit() {
  const { id } = useParams();
  const { tournament, loading: tournamentLoading, error: tournamentError } = useTournament(id);
  const { updateTournament } = useTournamentActions();
  const { allTeams } = useTeamActions();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game: '',
    format: 'single_elimination',
    participantType: 'individual',
    maxParticipants: 8,
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    prizePool: '',
    entryFee: '',
    isPublic: true,
    rules: '',
    numberOfGroups: 4,
    groupSize: 4,
    allowSpectators: true,
    requireApproval: false
  });

  // Check if user is the organizer
  const isOrganizer = tournament && user && String(tournament.organizer_id) === String(user.id || user._id);

  // Load tournament data into form when available
  useEffect(() => {
    if (tournament) {
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        name: tournament.name || '',
        description: tournament.description || '',
        game: tournament.game || '',
        format: tournament.format || 'single_elimination',
        participantType: tournament.participantType || 'individual',
        maxParticipants: tournament.maxParticipants || 8,
        startDate: formatDate(tournament.startDate),
        endDate: formatDate(tournament.endDate),
        registrationDeadline: formatDate(tournament.registrationDeadline),
        prizePool: tournament.prizePool ? String(tournament.prizePool) : '',
        entryFee: tournament.entryFee ? String(tournament.entryFee) : '',
        isPublic: tournament.isPublic !== undefined ? tournament.isPublic : true,
        rules: tournament.rules || '',
        numberOfGroups: tournament.numberOfGroups || 4,
        groupSize: tournament.groupSize || 4,
        allowSpectators: tournament.allowSpectators !== undefined ? tournament.allowSpectators : true,
        requireApproval: tournament.requireApproval !== undefined ? tournament.requireApproval : false
      });
    }
  }, [tournament]);

  const handleFormDataChange = (newData) => {
    setFormData({ ...formData, ...newData });
    // Clear related errors when data changes
    const clearedErrors = { ...errors };
    Object.keys(newData).forEach(key => {
      if (clearedErrors[key]) {
        delete clearedErrors[key];
      }
    });
    setErrors(clearedErrors);
  };

  const handleTeamsChange = (teams) => {
    setSelectedTeams(teams);
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.name.trim()) newErrors.name = 'Tournament name is required';
        if (!formData.game.trim()) newErrors.game = 'Game is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        break;
      case 1: // Tournament Settings
        if (formData.maxParticipants < 2) newErrors.maxParticipants = 'Must have at least 2 participants';
        if (formData.format === 'group_stage') {
          if (!formData.numberOfGroups || formData.numberOfGroups < 2) {
            newErrors.numberOfGroups = 'Must have at least 2 groups';
          }
          if (!formData.groupSize || formData.groupSize < 2) {
            newErrors.groupSize = 'Group size must be at least 2';
          }
        }
        break;
      case 2: // Teams & Participants
        if (formData.participantType === 'team' && selectedTeams.length === 0) {
          newErrors.teams = 'At least one team must be selected for team tournaments';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const tournamentData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        game: formData.game.trim(),
        rules: formData.rules.trim(),
        prizePool: formData.prizePool ? parseFloat(formData.prizePool) : undefined,
        entryFee: formData.entryFee ? parseFloat(formData.entryFee) : undefined,
        preRegisteredTeams: formData.participantType === 'team' ? selectedTeams.map(t => t._id) : undefined
      };

      await updateTournament(id, tournamentData);
      
      setSnackbar({
        open: true,
        message: 'Tournament updated successfully!',
        severity: 'success'
      });

      // Navigate back to tournament detail after successful update
      setTimeout(() => {
        navigate(`/tournaments/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Tournament update error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update tournament. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TournamentBasicInfo
            formData={formData}
            errors={errors}
            onFormDataChange={handleFormDataChange}
            popularGames={POPULAR_GAMES}
            tournamentFormats={TOURNAMENT_FORMATS}
            participantTypes={PARTICIPANT_TYPES}
          />
        );
      case 1:
        return (
          <TournamentSettings
            formData={formData}
            errors={errors}
            onFormDataChange={handleFormDataChange}
            maxParticipantsOptions={MAX_PARTICIPANTS_OPTIONS}
          />
        );
      case 2:
        return (
          <TournamentParticipants
            formData={formData}
            errors={errors}
            selectedTeams={selectedTeams}
            allTeams={allTeams}
            onFormDataChange={handleFormDataChange}
            onTeamsChange={handleTeamsChange}
          />
        );
      case 3:
        return (
          <TournamentPreview
            formData={formData}
            selectedTeams={selectedTeams}
            isEdit={true}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  // Show loading while fetching tournament data
  if (tournamentLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" sx={{ fontSize: '2rem', width: '300px' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem', width: '200px' }} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={400} />
        </Paper>
      </Container>
    );
  }

  // Show error if tournament couldn't be loaded
  if (tournamentError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {tournamentError}
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

  // Show access denied if user is not the organizer
  if (tournament && !isOrganizer) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          You don't have permission to edit this tournament. Only the organizer can edit tournaments.
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/tournaments/${id}`)}
        >
          Back to Tournament
        </Button>
      </Container>
    );
  }

  // Show message if tournament has started
  if (tournament && tournament.status !== 'open') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          This tournament has already started and cannot be edited.
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/tournaments/${id}`)}
        >
          Back to Tournament
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(`/tournaments/${id}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <EditIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Edit Tournament
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Modify your tournament settings and details
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 4 }} />

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            size="large"
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                size="large"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Updating...' : 'Update Tournament'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}

export default TournamentEdit; 