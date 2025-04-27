import { IAuthUser } from '@/types/interfaces';
import { IMenuItem, ISubMenuItem } from '@/types/menu';


const API_BASE_URL = 'http://localhost:4000/api'; // Replace with your actual backend URL

export const authContextService = {
  /**
   * Authenticate a user with username and password
   */
  login: async (username: string, password: string): Promise<IAuthUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const data = await response.json();
    const token = data.token;

    // Save token to localStorage
    localStorage.setItem('auth_token', token);

    // Assume backend returns user info with the token
    // data.user.permissions = createMockPermissions(username)
    return data.user as IAuthUser;
  },

  /**
   * Check if user is logged in and return user data
   */
  checkUserLoggedIn: async (): Promise<IAuthUser | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user as IAuthUser;
  },

  /**
   * Register a new user
   */
  signup: async (
    username: string,
    email: string,
    password: string,
    fullName?: string
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, fullName })
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }
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
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }
  }
};
