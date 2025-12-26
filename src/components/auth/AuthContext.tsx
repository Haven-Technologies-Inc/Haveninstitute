import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthUser, RedirectInfo } from '../../services/authApi';
import { logger } from '../../utils/logger';

export interface LoginResult {
  user: User;
  redirectPath?: RedirectInfo;
}

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  role: 'student' | 'admin';
  subscription?: 'Free' | 'Pro' | 'Premium';
  userType?: 'nursing-student' | 'nclex-prep' | 'both';
  goals?: string[];
  studyLevel?: 'beginner' | 'intermediate' | 'advanced';
  targetExamDate?: string;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  avatar?: string;
  emailVerified?: boolean;
}

// Convert backend user to frontend User format
const mapAuthUserToUser = (authUser: AuthUser): User => ({
  id: authUser.id,
  email: authUser.email,
  name: authUser.fullName,
  fullName: authUser.fullName,
  role: authUser.role === 'admin' || authUser.role === 'moderator' || authUser.role === 'instructor' ? 'admin' : 'student',
  subscription: authUser.subscriptionTier as 'Free' | 'Pro' | 'Premium',
  goals: authUser.goals,
  targetExamDate: authUser.examDate,
  hasCompletedOnboarding: authUser.hasCompletedOnboarding,
  createdAt: authUser.createdAt,
  avatar: authUser.avatarUrl,
  emailVerified: authUser.emailVerified,
});

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('nursehaven_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        logger.error('Error parsing stored user:', error);
        localStorage.removeItem('nursehaven_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try backend API for authentication
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        const mappedUser = mapAuthUserToUser(response.data.user);
        setUser(mappedUser);
        localStorage.setItem('nursehaven_user', JSON.stringify(mappedUser));
        
        // Return the redirect path from backend for intelligent redirection
        return {
          user: mappedUser,
          redirectPath: response.data.redirectPath
        };
      }
      
      throw new Error('Invalid email or password');
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      // Use backend API for registration
      const response = await authApi.register({ email, password, fullName });
      
      if (response.success && response.data) {
        const mappedUser = mapAuthUserToUser(response.data.user);
        setUser(mappedUser);
        localStorage.setItem('nursehaven_user', JSON.stringify(mappedUser));
        return;
      }
      
      throw new Error('Registration failed. Please try again.');
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Try to logout from backend (fire and forget)
    authApi.logout().catch(err => logger.info('Backend logout:', err.message));
    
    setUser(null);
    localStorage.removeItem('nursehaven_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('nursehaven_user', JSON.stringify(updatedUser));

    // Update in mock database if it's a regular user (not admin)
    if (user.role === 'student') {
      const mockUsers = JSON.parse(localStorage.getItem('nursehaven_users') || '[]');
      const userIndex = mockUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
        localStorage.setItem('nursehaven_users', JSON.stringify(mockUsers));
      }
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
