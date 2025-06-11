import React from 'react';
import { useRole } from '../../hooks/useRole';

/**
 * Component that conditionally renders children based on user roles
 * 
 * @param {React.ReactNode} children - Content to render if role check passes
 * @param {string|Array} allowedRoles - Single role or array of roles that can see the content
 * @param {boolean} requireAdmin - If true, only admin users can see the content
 * @param {React.ReactNode} fallback - Content to render if role check fails (optional)
 */
const RoleBasedComponent = ({ 
  children, 
  allowedRoles = null, 
  requireAdmin = false, 
  fallback = null 
}) => {
  const { isAdmin, hasAnyRole, isAuthenticated } = useRole();

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return fallback;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return fallback;
  }

  // Check specific roles if provided
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!hasAnyRole(roles)) {
      return fallback;
    }
  }

  // Render children if all checks pass
  return children;
};

export default RoleBasedComponent;

// Convenience components for common use cases
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent requireAdmin={true} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const PlayerOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent allowedRoles="player" fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const AuthenticatedOnly = ({ children, fallback = null }) => {
  const { isAuthenticated } = useRole();
  return isAuthenticated ? children : fallback;
}; 