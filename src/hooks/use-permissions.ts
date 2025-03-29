
import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { hasPermission, user } = useAuth();
  
  // Basic permission check that works with both exact paths and path patterns
  const canAccess = (path: string, permission: 'canView' | 'canAdd' | 'canEdit' | 'canDelete', roleID?: number) => {
    // For paths with query parameters, only check the base path
    const basePath = path.split('?')[0];
    
    // If roleID is specified, check if the user has that role
    if (roleID !== undefined && user?.role?.roleID !== roleID) {
      return false;
    }
    
    return hasPermission(basePath, permission);
  };
  
  const canView = (path: string, roleID?: number) => canAccess(path, 'canView', roleID);
  const canAdd = (path: string, roleID?: number) => canAccess(path, 'canAdd', roleID);
  const canEdit = (path: string, roleID?: number) => canAccess(path, 'canEdit', roleID);
  const canDelete = (path: string, roleID?: number) => canAccess(path, 'canDelete', roleID);
  
  return {
    canView,
    canAdd,
    canEdit,
    canDelete,
    canAccess,
    userRole: user?.role?.roleName,
    userRoleID: user?.role?.roleID
  };
}
