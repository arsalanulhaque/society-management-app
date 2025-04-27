
import { IAuthUser, IPermission } from '@/types/interfaces';

/**
 * Checks if user has the specified Permission for a given menu path
 */
export const checkPermission = (
  user: IAuthUser | null, 
  menuUrl: string, 
  permission: keyof IPermission
): boolean => {
  if (!user || !user.permissions) return false;
  
  // Find the menu in Permissions
  const menuPermission = user.permissions[menuUrl];
  if (!menuPermission) return false;
  
  return menuPermission[permission];
};

