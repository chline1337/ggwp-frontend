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
  const token = localStorage.getItem('access_token');
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Dashboard data
  getDashboardStats: async () => {
    try {
      // In a real app, this would be a dedicated dashboard endpoint
      // For now, we'll simulate with multiple API calls
      const [teamsResponse, tournamentsResponse, eventsResponse] = await Promise.all([
        api.get('/api/teams/'),
        api.get('/api/tournaments/').catch(() => ({ data: [] })), // Graceful fallback if endpoint doesn't exist
        api.get('/api/events/').catch(() => ({ data: [] }))
      ]);

      return {
        success: true,
        data: {
          teams: teamsResponse.data?.length || 0,
          tournaments: tournamentsResponse.data?.length || 3,
          events: eventsResponse.data?.length || 5,
          matches: 12 // Mock data for now
        }
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        success: false,
        error: 'Failed to load dashboard data',
        data: {
          teams: 0,
          tournaments: 3,
          events: 5,
          matches: 12
        }
      };
    }
  },

  getRecentActivity: async () => {
    try {
      // Mock recent activity - in real app, this would be a dedicated endpoint
      return {
        success: true,
        data: [
          { id: 1, type: 'tournament', title: 'Spring Championship', date: '2024-01-15', status: 'upcoming' },
          { id: 2, type: 'team', title: 'Joined Team Alpha', date: '2024-01-10', status: 'completed' },
          { id: 3, type: 'event', title: 'Gaming Convention 2024', date: '2024-01-20', status: 'registered' }
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load recent activity',
        data: []
      };
    }
  },

  // User Management (Admin only)
  getUsers: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/api/users/?skip=${skip}&limit=${limit}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get users error:', error);
      let errorMessage = 'Failed to load users';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to load users';
      }
      return {
        success: false,
        error: errorMessage,
        data: []
      };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/api/users/', userData, {
        params: {
          role: userData.role || 'player'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Create user error:', error);
      let errorMessage = 'Failed to create user';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to create user';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return {
        success: false,
        error: 'Failed to load user details'
      };
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/api/users/${userId}`, { role });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Update user role error:', error);
      let errorMessage = 'Failed to update user role';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to update user role';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Delete user error:', error);
      let errorMessage = 'Failed to delete user';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to delete user';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Admin statistics
  getAdminStats: async () => {
    try {
      const [usersResponse, teamsResponse] = await Promise.all([
        api.get('/api/users/?limit=1000'), // Get all users for counting
        api.get('/api/teams/')
      ]);

      const users = usersResponse.data || [];
      const teams = teamsResponse.data || [];

      return {
        success: true,
        data: {
          totalUsers: users.length,
          adminUsers: users.filter(user => user.role === 'admin').length,
          playerUsers: users.filter(user => user.role === 'player').length,
          totalTeams: teams.length,
          recentUsers: users
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
        }
      };
    } catch (error) {
      console.error('Admin stats error:', error);
      return {
        success: false,
        error: 'Failed to load admin statistics',
        data: {
          totalUsers: 0,
          adminUsers: 0,
          playerUsers: 0,
          totalTeams: 0,
          recentUsers: []
        }
      };
    }
  }
};

export default api; 