import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const authService = {
  register: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password
      });
      
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map(err => err.msg || err.message || 'Validation error')
            .join(', ');
        }
      }
      return { success: false, error: errorMessage };
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map(err => err.msg || err.message || 'Validation error')
            .join(', ');
        }
      }
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await axios.get(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Failed to get user data' };
    }
  }
}; 