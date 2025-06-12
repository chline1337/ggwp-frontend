import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Transform tournament data from backend format to frontend format
const transformTournamentFromBackend = (tournament) => {
  return {
    ...tournament,
    id: tournament._id || tournament.id,
    // Map backend field names to frontend field names
    participantType: tournament.participant_type === 'user' ? 'individual' : tournament.participant_type,
    maxParticipants: tournament.max_participants,
    prizePool: tournament.prize_pool,
    entryFee: tournament.entry_fee,
    startDate: tournament.start_date,
    endDate: tournament.end_date,
    numberOfGroups: tournament.groups,
    groupSize: tournament.group_size,
    createdAt: tournament.created_at,
    updatedAt: tournament.updated_at
  };
};

// Transform tournament data to backend format
const transformTournamentToBackend = (tournament) => {
  const transformed = { ...tournament };
  
  // Remove frontend-specific fields
  delete transformed.id;
  
  // Map frontend field names to backend field names
  if (tournament.participantType) {
    // Map frontend value "individual" to backend value "user"
    const participantTypeValue = tournament.participantType === 'individual' ? 'user' : tournament.participantType;
    transformed.participant_type = participantTypeValue;
    delete transformed.participantType;
  }
  
  if (tournament.maxParticipants) {
    transformed.max_participants = tournament.maxParticipants;
    delete transformed.maxParticipants;
  }
  
  if (tournament.startDate) {
    transformed.start_date = tournament.startDate;
    delete transformed.startDate;
  }
  
  if (tournament.endDate) {
    transformed.end_date = tournament.endDate;
    delete transformed.endDate;
  }
  
  if (tournament.prizePool) {
    transformed.prize_pool = tournament.prizePool;
    delete transformed.prizePool;
  }
  
  if (tournament.numberOfGroups) {
    transformed.groups = tournament.numberOfGroups;
    delete transformed.numberOfGroups;
  }
  
  if (tournament.groupSize) {
    transformed.group_size = tournament.groupSize;
    delete transformed.groupSize;
  }
  
  // Remove frontend-only fields that don't exist in backend
  delete transformed.entryFee;
  delete transformed.registrationDeadline;
  delete transformed.isPublic;
  delete transformed.allowSpectators;
  delete transformed.requireApproval;
  delete transformed.preRegisteredTeams;
  
  return transformed;
};

export const tournamentService = {
  // Get all tournaments
  getTournaments: async () => {
    try {
      const response = await api.get('/api/tournaments');
      const transformedData = response.data.map(transformTournamentFromBackend);
      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      console.error('Get tournaments error:', error);
      let errorMessage = 'Failed to load tournaments';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to load tournaments';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage,
        data: []
      };
    }
  },

  // Get tournament by ID
  getTournament: async (tournamentId) => {
    try {
      const response = await api.get(`/api/tournaments/${tournamentId}`);
      return {
        success: true,
        data: transformTournamentFromBackend(response.data)
      };
    } catch (error) {
      console.error('Get tournament by ID error:', error);
      let errorMessage = 'Failed to load tournament';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to load tournament';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  // Create new tournament
  createTournament: async (tournamentData) => {
    try {
      const backendData = transformTournamentToBackend(tournamentData);
      console.log('=== Tournament Creation Debug ===');
      console.log('Original frontend data:', tournamentData);
      console.log('Transformed backend data:', backendData);
      
      const response = await api.post('/api/tournaments', backendData);
      return {
        success: true,
        data: transformTournamentFromBackend(response.data),
        message: 'Tournament created successfully'
      };
    } catch (error) {
      console.error('Create tournament error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      let errorMessage = 'Failed to create tournament';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors array
          errorMessage = error.response.data.detail
            .map(err => `${err.loc?.join('.')}: ${err.msg}`)
            .join(', ');
        } else {
          errorMessage = 'Validation error occurred';
        }
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Update tournament
  updateTournament: async (tournamentId, tournamentData) => {
    try {
      const backendData = transformTournamentToBackend(tournamentData);
      const response = await api.put(`/api/tournaments/${tournamentId}`, backendData);
      return {
        success: true,
        data: transformTournamentFromBackend(response.data),
        message: 'Tournament updated successfully'
      };
    } catch (error) {
      console.error('Update tournament error:', error);
      let errorMessage = 'Failed to update tournament';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to update tournament';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Delete tournament
  deleteTournament: async (tournamentId) => {
    try {
      await api.delete(`/api/tournaments/${tournamentId}`);
      return {
        success: true,
        message: 'Tournament deleted successfully'
      };
    } catch (error) {
      console.error('Delete tournament error:', error);
      let errorMessage = 'Failed to delete tournament';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to delete tournament';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Start tournament
  startTournament: async (tournamentId) => {
    try {
      const response = await api.post(`/api/tournaments/${tournamentId}/start`);
      return {
        success: true,
        data: response.data,
        message: 'Tournament started successfully'
      };
    } catch (error) {
      console.error('Start tournament error:', error);
      let errorMessage = 'Failed to start tournament';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to start tournament';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Join tournament
  joinTournament: async (tournamentId, participantData = {}) => {
    try {
      const response = await api.post(`/api/tournaments/${tournamentId}/participants`, participantData);
      return {
        success: true,
        data: response.data,
        message: 'Successfully joined tournament'
      };
    } catch (error) {
      console.error('Join tournament error:', error);
      let errorMessage = 'Failed to join tournament';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to join tournament';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Leave tournament
  leaveTournament: async (tournamentId) => {
    try {
      const response = await api.delete(`/api/tournaments/${tournamentId}/participants`);
      return {
        success: true,
        data: transformTournamentFromBackend(response.data),
        message: 'Successfully left tournament'
      };
    } catch (error) {
      console.error('Leave tournament error:', error);
      let errorMessage = 'Failed to leave tournament';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to leave tournament';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Get tournament participants
  getTournamentParticipants: async (tournamentId) => {
    try {
      const response = await api.get(`/api/tournaments/${tournamentId}/participants`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get tournament participants error:', error);
      let errorMessage = 'Failed to load tournament participants';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to load tournament participants';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage,
        data: []
      };
    }
  },

  // Get tournament brackets/matches
  getTournamentBrackets: async (tournamentId) => {
    try {
      const response = await api.get(`/api/tournaments/${tournamentId}/brackets`);
      console.log('Raw backend response:', response.data);
      
      // Handle the backend response format which includes both brackets and matches
      const data = {
        brackets: response.data.brackets || [],
        matches: response.data.matches || []
      };
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Get tournament brackets error:', error);
      let errorMessage = 'Failed to load tournament brackets';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to load tournament brackets';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      return {
        success: false,
        error: errorMessage,
        data: { brackets: [], matches: [] }
      };
    }
  }
};

export default tournamentService; 