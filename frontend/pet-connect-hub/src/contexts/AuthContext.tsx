import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authApi } from '@/services/api';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) =>
  Promise<{ success: boolean; message: string; data?: User }>;

  register: (data: {
    email: string;
    password: string;
    displayName: string;
    country: string;
    city: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

 const login = useCallback(
  async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; data?: User }> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('currentUser', JSON.stringify(response.data));

        return {
          success: true,
          message: response.message || 'Login successful',
          data: response.data,          // 👈 important
        };
      }

      return {
        success: false,
        message: response.message || 'Login failed',
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'An error occurred during login',
      };
    } finally {
      setIsLoading(false);
    }
  },
  []
);


  const register = useCallback(async (data: {
    email: string;
    password: string;
    displayName: string;
    country: string;
    city: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        return { success: true, message: response.message || 'Registration successful' };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: 'An error occurred during registration' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('currentUser');
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  }, [user]);

  const hasRole = useCallback((roles: UserRole | UserRole[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Quick login helper for development/testing
export function useDevLogin() {
  const { login } = useAuth();
  
  return {
    loginAsAdmin: () => login('admin@petmarket.com', 'admin'),
    loginAsModerator: () => login('mod@petmarket.com', 'mod'),
    loginAsUser: () => login('john@example.com', 'user'),
  };
}
