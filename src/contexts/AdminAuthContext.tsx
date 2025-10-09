'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminAuthService } from '@/lib/services/admin-auth.service';

interface AdminUser {
  ID: number;
  id: string;
  username: string;
  email: string | null;
  profile_picture: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  readonly children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session on mount
    const checkAuth = async () => {
      try {
        const isAuth = await AdminAuthService.verifyToken();
        if (isAuth) {
          const storedUser = AdminAuthService.getUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for authentication state changes
    const handleAuthChange = (authState: boolean) => {
      setIsAuthenticated(authState);
      setUser(authState ? AdminAuthService.getUser() : null);
    };

    AdminAuthService.onAuthChange(handleAuthChange);

    return () => {
      AdminAuthService.offAuthChange(handleAuthChange);
    };
  }, []);

  const login = async (username: string, password: string) => {
    const response = await AdminAuthService.login({ username, password });
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    AdminAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AdminAuthContextType = React.useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }), [user, isAuthenticated, isLoading, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
