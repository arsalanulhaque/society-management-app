
import { useAuth } from '@/contexts/AuthContext';
import { IPermission } from '@/types/interfaces';

export function usePermissions() {
  const { hasPermission, user } = useAuth();

  // Basic Permission check that works with both exact paths and path patterns
  const canAccess = (path: string, Permission: keyof IPermission, roleID?: number) => {
    // For paths with query parameters, only check the base path
    // const basePath = path.split('?')[0];
    const basePath = path;

    // If roleID is specified, check if the user has that role
    if (roleID !== undefined && user?.role?.roleID !== roleID) {
      return false;
    }

    return hasPermission(basePath, Permission);
  };

  const canView = (path: string, roleID?: number) => canAccess(path, 'CanView', roleID);
  const canAdd = (path: string, roleID?: number) => canAccess(path, 'CanAdd', roleID);
  const canEdit = (path: string, roleID?: number) => canAccess(path, 'CanEdit', roleID);
  const canDelete = (path: string, roleID?: number) => canAccess(path, 'CanDelete', roleID);

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
