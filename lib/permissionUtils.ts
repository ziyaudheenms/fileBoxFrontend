/**
 * Permission utility functions for role-based permission management
 */

export type PermissionType = 'VIEW' | 'EDIT' | 'ADMIN';
export type UserRole = 'VIEW' | 'EDIT' | 'ADMIN' | 'OWNER';

/**
 * Get available permissions based on user's role
 * - EDIT role users can only assign VIEW and EDIT permissions
 * - ADMIN and OWNER role users can assign all permissions
 * @param userRole - The current user's role
 * @returns Array of available permission types
 */
export const getAvailablePermissions = (userRole: UserRole | string | undefined): PermissionType[] => {
  if (!userRole) return ['VIEW', 'EDIT'];
  
  const roleStr = (userRole as string).toUpperCase();
  
  switch (roleStr) {
    case 'OWNER':
    case 'ADMIN':
      return ['VIEW', 'EDIT', 'ADMIN'];
    case 'EDIT':
      return ['VIEW', 'EDIT'];
    case 'VIEW':
      return ['VIEW'];
    default:
      return ['VIEW', 'EDIT'];
  }
};

/**
 * Check if a user with a specific role can assign a permission
 * @param userRole - The current user's role
 * @param permissionToAssign - The permission to be assigned
 * @returns boolean indicating if the assignment is allowed
 */
export const canAssignPermission = (
  userRole: UserRole | string | undefined,
  permissionToAssign: PermissionType
): boolean => {
  const availablePermissions = getAvailablePermissions(userRole);
  return availablePermissions.includes(permissionToAssign);
};

/**
 * Get permission labels for UI display
 */
export const permissionLabels: Record<PermissionType, string> = {
  VIEW: 'View',
  EDIT: 'Edit',
  ADMIN: 'Admin',
};
