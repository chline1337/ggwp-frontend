import { useAuth } from '../contexts/AuthContext';
import { 
  isAdmin, 
  hasRole, 
  hasAnyRole, 
  getRoleDisplayName, 
  getRoleColor,
  canAccessAdmin,
  canManageUsers,
  canModerateContent 
} from '../utils/roles';

/**
 * Custom hook for role-based functionality
 * @returns {Object} Role-based utility functions and user role information
 */
export const useRole = () => {
  const { user, isAuthenticated } = useAuth();

  return {
    // User role information
    userRole: user?.role,
    roleDisplayName: getRoleDisplayName(user),
    roleColor: getRoleColor(user?.role),
    
    // Role checking functions
    isAdmin: () => isAdmin(user),
    hasRole: (role) => hasRole(user, role),
    hasAnyRole: (roles) => hasAnyRole(user, roles),
    
    // Permission checking functions
    canAccessAdmin: () => canAccessAdmin(user),
    canManageUsers: () => canManageUsers(user),
    canModerateContent: () => canModerateContent(user),
    
    // Authentication state
    isAuthenticated,
    user
  };
}; 