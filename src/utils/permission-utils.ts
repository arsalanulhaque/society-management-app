
import { IAuthUser, IPermissions } from '@/types/interfaces';

/**
 * Checks if user has the specified permission for a given menu path
 */
export const checkPermission = (
  user: IAuthUser | null, 
  menuUrl: string, 
  permission: 'canView' | 'canAdd' | 'canEdit' | 'canDelete'
): boolean => {
  if (!user || !user.permissions) return false;
  
  // Find the menu in permissions
  const menuPermission = user.permissions[menuUrl];
  if (!menuPermission) return false;
  
  return menuPermission[permission];
};

/**
 * Creates mock user permissions based on username
 */
export const createMockPermissions = (username: string): IPermissions => {
  if (username.includes('admin')) {
    return {
      '/': { canView: true, canAdd: true, canEdit: true, canDelete: true },
      '/admin-tools': { canView: true, canAdd: true, canEdit: true, canDelete: true },
      '/management-panel': { canView: true, canAdd: true, canEdit: true, canDelete: true },
    };
  } else if (username.includes('manager')) {
    return {
      '/': { canView: true, canAdd: false, canEdit: false, canDelete: false },
      '/management-panel': { canView: true, canAdd: true, canEdit: true, canDelete: false },
    };
  } else {
    return {
      '/': { canView: true, canAdd: false, canEdit: false, canDelete: false },
    };
  }
};
