
import { IAuthUser } from '@/types/interfaces';
import { createMockPermissions } from '@/utils/permission-utils';

/**
 * Mock authentication service
 */
export const authContextService = {
  /**
   * Authenticate a user with username and password
   */
  login: async (username: string, password: string): Promise<IAuthUser> => {
    // Mock authentication
    // In a real app, this would be an API call to your backend
    const token = `mock_token_${Date.now()}`;
    localStorage.setItem('auth_token', token);
    
    // Mock user data based on username
    if (username.includes('admin')) {
      return {
        id: 1,
        username: username,
        fullName: 'Admin User',
        email: username,
        role: {
          roleID: 1,
          roleName: 'Administrator'
        },
        permissions: createMockPermissions(username)
      };
    } else if (username.includes('manager')) {
      return {
        id: 2,
        username: username,
        fullName: 'Manager User',
        email: username,
        role: {
          roleID: 2,
          roleName: 'Manager'
        },
        permissions: createMockPermissions(username)
      };
    } else {
      return {
        id: 3,
        username: username,
        fullName: 'Regular User',
        email: username,
        role: {
          roleID: 3,
          roleName: 'User'
        },
        permissions: createMockPermissions(username)
      };
    }
  },

  /**
   * Check if user is logged in and return user data
   */
  checkUserLoggedIn: (): IAuthUser | null => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // For now, we'll mock a user object with roles and permissions
      // In a real app, you would verify the token with your backend
      return {
        id: 1,
        username: 'admin',
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: {
          roleID: 1,
          roleName: 'Administrator'
        },
        permissions: {
          '/': { canView: true, canAdd: true, canEdit: true, canDelete: true },
          '/admin-tools': { canView: true, canAdd: true, canEdit: true, canDelete: true },
          '/management-panel': { canView: true, canAdd: true, canEdit: true, canDelete: true },
        }
      };
    }
    
    return null;
  },

  /**
   * Register a new user
   */
  signup: async (username: string, email: string, password: string, fullName?: string): Promise<void> => {
    // Mock signup
    // In a real app, this would be an API call to your backend
    console.log('Signup with:', { username, email, password, fullName });
  },

  /**
   * Log out the current user
   */
  logout: (): void => {
    localStorage.removeItem('auth_token');
  },

  /**
   * Reset password for a user
   */
  resetPassword: async (email: string): Promise<void> => {
    // Mock password reset
    // In a real app, this would be an API call to your backend
    console.log('Password reset for:', email);
  }
};
