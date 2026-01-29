import React, { createContext, useContext, useState } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo
const mockUser: User = {
  id: 'user1',
  username: 'ComicFan42',
  email: 'fan@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  role: 'reader',
  createdAt: new Date('2023-01-01'),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call the API
    await new Promise(resolve => setTimeout(resolve, 500));
    if (email && password) {
      setUser(mockUser);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    // Mock signup - in real app, this would call the API
    await new Promise(resolve => setTimeout(resolve, 500));
    if (username && email && password) {
      setUser({ ...mockUser, username, email });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
