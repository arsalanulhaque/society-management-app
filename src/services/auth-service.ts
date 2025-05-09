
import { apiClient } from '@/api/api-client';
import { IAuthUser, IApiResponse } from '@/types/interfaces';
import { IMenuItem, ISubMenuItem } from '@/types/menu';

export const authService = {
  /**
   * Authenticate a user and get token
   */
  async login(username: string, password: string): Promise<IApiResponse<{ user: IAuthUser; token: string }>> {
    return apiClient.post('/auth/login', { username, password });
  },

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string, fullName?: string, phone?: string, roleId?: number): Promise<IApiResponse<{ user: IAuthUser; token: string }>> {
    return apiClient.post('/auth/register', { username, email, password, fullName, phone, roleId });
  },

  /**
   * Get the current user's information
   */
  async getCurrentUser(): Promise<IApiResponse<IAuthUser>> {
    return apiClient.get('/auth/me');
  },

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<IApiResponse<void>> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Log out the current user
   */
  logout(): void {
    apiClient.clearToken();
  },

  /**
   * Check if the user has the given Permission for a specific route
   */
  hasPermission(user: IAuthUser | null, path: string, Permission: 'canView' | 'canAdd' | 'canEdit' | 'canDelete'): boolean {
    if (!user || !user.permissions) {
      return false;
    }

    // Normalize path (remove trailing slash)
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;

    // First try exact match
    if (user.permissions[normalizedPath]) {
      return !!user.permissions[normalizedPath][Permission];
    }

    // Check if the path is a subpath of any Permission
    for (const permPath in user.permissions) {
      if (normalizedPath.startsWith(permPath)) {
        return !!user.permissions[permPath][Permission];
      }
    }

    return false;
  },

  async menuItems(): Promise<IApiResponse<{ menuItem: IMenuItem[]; token: string }>> {
    return apiClient.get('/menus');
  },
};
