import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
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
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import useTournamentActions from '../../hooks/useTournamentActions';
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
  'Review & Create'
];

function TournamentCreate() {
  const { createTournament } = useTournamentActions();
  const { allTeams } = useTeamActions();
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

  useEffect(() => {
    // Set default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    setFormData(prev => ({
      ...prev,
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: dayAfter.toISOString().split('T')[0],
      registrationDeadline: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

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

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.name.trim()) {
          newErrors.name = 'Tournament name is required';
        } else if (formData.name.trim().length < 3) {
          newErrors.name = 'Tournament name must be at least 3 characters';
        } else if (formData.name.trim().length > 100) {
          newErrors.name = 'Tournament name must be less than 100 characters';
        }

        if (!formData.game.trim()) {
          newErrors.game = 'Game selection is required';
        }

        if (formData.description.trim().length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        }
        break;

      case 1: // Tournament Settings
        if (!formData.startDate) {
          newErrors.startDate = 'Start date is required';
        } else if (new Date(formData.startDate) <= new Date()) {
          newErrors.startDate = 'Start date must be in the future';
        }

        if (!formData.endDate) {
          newErrors.endDate = 'End date is required';
        } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          newErrors.endDate = 'End date must be after start date';
        }

        if (!formData.registrationDeadline) {
          newErrors.registrationDeadline = 'Registration deadline is required';
        } else if (new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
          newErrors.registrationDeadline = 'Registration deadline must be before start date';
        }

        if (formData.prizePool && (isNaN(formData.prizePool) || parseFloat(formData.prizePool) < 0)) {
          newErrors.prizePool = 'Prize pool must be a valid positive number';
        }

        if (formData.entryFee && (isNaN(formData.entryFee) || parseFloat(formData.entryFee) < 0)) {
          newErrors.entryFee = 'Entry fee must be a valid positive number';
        }

        if (formData.format === 'group_stage') {
          if (formData.numberOfGroups < 2) {
            newErrors.numberOfGroups = 'Must have at least 2 groups';
          }
          if (formData.groupSize < 2) {
            newErrors.groupSize = 'Group size must be at least 2';
          }
          if (formData.numberOfGroups * formData.groupSize > formData.maxParticipants) {
            newErrors.numberOfGroups = 'Total group capacity exceeds max participants';
          }
        }
        break;

      case 2: // Teams & Participants
        if (formData.participantType === 'team' && selectedTeams.length === 0) {
          newErrors.teams = 'At least one team must be pre-added for team tournaments';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
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

      await createTournament(tournamentData);
      
      setSnackbar({
        open: true,
        message: 'Tournament created successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Tournament creation error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create tournament. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TournamentBasicInfo
            formData={formData}
            errors={errors}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 1:
        return (
          <TournamentSettings
            formData={formData}
            errors={errors}
            onFormDataChange={handleFormDataChange}
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
            onTeamsChange={setSelectedTeams}
          />
        );
      case 3:
        return (
          <TournamentPreview
            formData={formData}
            selectedTeams={selectedTeams}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/tournaments')}
          sx={{ mb: 2 }}
        >
          Back to Tournaments
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TournamentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Create Tournament
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Set up a new tournament for your community
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  {loading ? 'Creating...' : 'Create Tournament'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TournamentCreate; 