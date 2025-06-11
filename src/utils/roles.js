/**
 * Role-based utility functions for user authorization
 */

// Available roles in the system
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  PLAYER: 'player' // Backend uses 'player' as default role
};

/**
 * Check if user has admin privileges
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN;
};

/**
 * Check if user has specific role
 * @param {Object} user - User object with role property
 * @param {string} role - Role to check
 * @returns {boolean} - True if user has the role
 */
export const hasRole = (user, role) => {
  return user?.role === role;
};

/**
 * Check if user has any of the provided roles
 * @param {Object} user - User object with role property
 * @param {Array} roles - Array of roles to check
 * @returns {boolean} - True if user has any of the roles
 */
export const hasAnyRole = (user, roles) => {
  return roles.includes(user?.role);
};

/**
 * Get user role display name
 * @param {Object} user - User object with role property
 * @returns {string} - Formatted role name
 */
export const getRoleDisplayName = (user) => {
  switch (user?.role) {
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.USER:
      return 'User';
    case ROLES.PLAYER:
      return 'Player';
    default:
      return 'Unknown';
  }
};

/**
 * Get role color for UI display
 * @param {string} role - User role
 * @returns {string} - Color code for the role
 */
export const getRoleColor = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '#f44336'; // Red
    case ROLES.USER:
      return '#2196f3'; // Blue
    case ROLES.PLAYER:
      return '#4caf50'; // Green
    default:
      return '#757575'; // Grey
  }
};

/**
 * Check if user can access admin features
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user can access admin features
 */
export const canAccessAdmin = (user) => {
  return isAdmin(user);
};

/**
 * Check if user can manage other users
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user can manage other users
 */
export const canManageUsers = (user) => {
  return isAdmin(user);
};

/**
 * Check if user can moderate content
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user can moderate content
 */
export const canModerateContent = (user) => {
  return isAdmin(user);
}; 