import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
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

// Predefined admin accounts
const ADMIN_ACCOUNTS = [
  { email: 'admin@nursehaven.com', password: 'admin123', fullName: 'Admin User' },
  { email: 'superadmin@nursehaven.com', password: 'super123', fullName: 'Super Admin' },
];

// Predefined demo student accounts
const DEMO_STUDENTS = [
  { email: 'student@demo.com', password: 'student123', fullName: 'Sarah Johnson', subscription: 'Pro' as const },
  { email: 'demo@nursehaven.com', password: 'demo123', fullName: 'John Smith', subscription: 'Premium' as const },
  { email: 'test@nursehaven.com', password: 'test123', fullName: 'Emma Davis', subscription: 'Free' as const },
];

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
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('nursehaven_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if it's an admin account
      const adminAccount = ADMIN_ACCOUNTS.find(
        admin => admin.email === email && admin.password === password
      );

      if (adminAccount) {
        const adminUser: User = {
          id: `admin-${Date.now()}`,
          email: adminAccount.email,
          name: adminAccount.fullName,
          fullName: adminAccount.fullName,
          role: 'admin',
          hasCompletedOnboarding: true,
          createdAt: new Date().toISOString()
        };
        setUser(adminUser);
        localStorage.setItem('nursehaven_user', JSON.stringify(adminUser));
        setIsLoading(false);
        return;
      }

      // Check demo student accounts
      const demoStudent = DEMO_STUDENTS.find(
        student => student.email === email && student.password === password
      );

      if (demoStudent) {
        const studentUser: User = {
          id: `student-${Date.now()}`,
          email: demoStudent.email,
          name: demoStudent.fullName,
          fullName: demoStudent.fullName,
          role: 'student',
          subscription: demoStudent.subscription,
          hasCompletedOnboarding: true,
          createdAt: new Date().toISOString()
        };
        setUser(studentUser);
        localStorage.setItem('nursehaven_user', JSON.stringify(studentUser));
        setIsLoading(false);
        return;
      }

      // Check if user exists in registered users database
      const mockUsers = JSON.parse(localStorage.getItem('nursehaven_users') || '[]');
      const existingUser = mockUsers.find((u: any) => u.email === email && u.password === password);

      if (existingUser) {
        const { password: _, ...userWithoutPassword } = existingUser;
        
        // Ensure role is set (default to student if not set)
        const userToSet = {
          ...userWithoutPassword,
          role: userWithoutPassword.role || 'student',
          subscription: userWithoutPassword.subscription || 'Free'
        };
        
        setUser(userToSet);
        localStorage.setItem('nursehaven_user', JSON.stringify(userToSet));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Prevent signup with admin emails
      if (ADMIN_ACCOUNTS.some(admin => admin.email === email)) {
        throw new Error('This email is reserved for administrators');
      }

      // Check existing users
      const mockUsers = JSON.parse(localStorage.getItem('nursehaven_users') || '[]');
      
      // Check if user already exists
      if (mockUsers.some((u: any) => u.email === email)) {
        throw new Error('An account with this email already exists');
      }

      const newUser: User & { password: string } = {
        id: `user-${Date.now()}`,
        email,
        password, // Store password for demo (never do this in production!)
        name: fullName,
        fullName,
        role: 'student',
        subscription: 'Free',
        hasCompletedOnboarding: false,
        createdAt: new Date().toISOString()
      };

      mockUsers.push(newUser);
      localStorage.setItem('nursehaven_users', JSON.stringify(mockUsers));

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('nursehaven_user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
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
