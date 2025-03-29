
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IAuthUser } from '@/types/interfaces';
import { authContextService } from '@/services/auth-context-service';
import { checkPermission } from '@/utils/permission-utils';

type User = IAuthUser | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (menuUrl: string, permission: 'canView' | 'canAdd' | 'canEdit' | 'canDelete') => boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    setIsLoading(true);
    const userData = authContextService.checkUserLoggedIn();
    setUser(userData);
    setIsLoading(false);
  };

  const hasPermission = (menuUrl: string, permission: 'canView' | 'canAdd' | 'canEdit' | 'canDelete'): boolean => {
    return checkPermission(user, menuUrl, permission);
  };

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const userData = await authContextService.login(username, password);
      setUser(userData);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string, fullName?: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authContextService.signup(username, email, password, fullName);
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    authContextService.logout();
    setUser(null);
    navigate('/login');
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authContextService.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasPermission,
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
