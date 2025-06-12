import api from './api';

export const eventsService = {
  // Get all events
  getEvents: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/api/events/?skip=${skip}&limit=${limit}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get events error:', error);
      let errorMessage = 'Failed to load events';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to load events';
      }
      return {
        success: false,
        error: errorMessage,
        data: []
      };
    }
  },

  // Get event by ID
  getEvent: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get event error:', error);
      let errorMessage = 'Failed to load event details';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to load event details';
      }
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events/', eventData);
      return {
        success: true,
        data: response.data,
        message: 'Event created successfully'
      };
    } catch (error) {
      console.error('Create event error:', error);
      let errorMessage = 'Failed to create event';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map(err => err.msg || err.message || 'Validation error')
            .join(', ');
        }
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/api/events/${eventId}`, eventData);
      return {
        success: true,
        data: response.data,
        message: 'Event updated successfully'
      };
    } catch (error) {
      console.error('Update event error:', error);
      let errorMessage = 'Failed to update event';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map(err => err.msg || err.message || 'Validation error')
            .join(', ');
        }
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Delete event
  deleteEvent: async (eventId) => {
    try {
      await api.delete(`/api/events/${eventId}`);
      return {
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      console.error('Delete event error:', error);
      let errorMessage = 'Failed to delete event';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to delete event';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Register for event
  registerForEvent: async (eventId) => {
    try {
      const response = await api.post(`/api/events/${eventId}/register`);
      return {
        success: true,
        data: response.data,
        message: 'Successfully registered for event'
      };
    } catch (error) {
      console.error('Register for event error:', error);
      let errorMessage = 'Failed to register for event';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to register for event';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Unregister from event
  unregisterFromEvent: async (eventId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}/register`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Successfully unregistered from event'
      };
    } catch (error) {
      console.error('Unregister from event error:', error);
      let errorMessage = 'Failed to unregister from event';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to unregister from event';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Assign seat to current user
  assignSeat: async (eventId, row, column) => {
    try {
      const response = await api.post(`/api/events/${eventId}/seat?row=${row}&column=${column}`);
      return {
        success: true,
        data: response.data,
        message: 'Seat assigned successfully'
      };
    } catch (error) {
      console.error('Assign seat error:', error);
      let errorMessage = 'Failed to assign seat';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to assign seat';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Remove seat assignment for current user
  removeSeatAssignment: async (eventId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}/seat`);
      return {
        success: true,
        data: response.data,
        message: 'Seat assignment removed successfully'
      };
    } catch (error) {
      console.error('Remove seat assignment error:', error);
      let errorMessage = 'Failed to remove seat assignment';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to remove seat assignment';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Remove participant from event (organizer only)
  removeEventParticipant: async (eventId, userId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}/participants/admin`, {
        data: { user_id: userId }
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Participant removed successfully'
      };
    } catch (error) {
      console.error('Remove event participant error:', error);
      let errorMessage = 'Failed to remove participant';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to remove participant';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Get detailed participant information
  getEventParticipants: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/participants`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get participants error:', error);
      let errorMessage = 'Failed to load participant details';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to load participant details';
      }
      return {
        success: false,
        error: errorMessage,
        data: []
      };
    }
  },

  // Update participant payment status
  updatePaymentStatus: async (eventId, userId, paymentData) => {
    try {
      const response = await api.put(`/api/events/${eventId}/participants/${userId}/payment`, paymentData);
      return {
        success: true,
        data: response.data,
        message: 'Payment status updated successfully'
      };
    } catch (error) {
      console.error('Update payment status error:', error);
      let errorMessage = 'Failed to update payment status';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to update payment status';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}; 