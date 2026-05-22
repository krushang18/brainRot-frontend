'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { authService } from '@/services/authService';
import { UserSession } from '@/types/auth';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ otpRequired: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, confirm: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Safely decodes base64-encoded JWT payloads on the client-side
 */
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');
    const jsonPayload = decodeURIComponent(
      globalThis
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + (c.codePointAt(0) ?? 0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-validate session and hydrate user profile on startup
  useEffect(() => {
    function checkSession() {
      if (globalThis.window !== undefined) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const payload = decodeJwt(token);
          if (payload && payload.exp * 1000 > Date.now()) {
            setUser({
              id: payload.sub,
              email: payload.email || '',
              fullName: payload.fullName || payload.email?.split('@')[0] || 'User',
            });
            setIsAuthenticated(true);
          } else {
            // Token expired -> clean up
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }
      setIsLoading(false);
    }
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login({ email, password });

    if (!data.otp_required && data.access_token && data.refresh_token) {
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);

      const payload = decodeJwt(data.access_token);
      setUser({
        id: payload?.sub || '',
        email: payload?.email || email,
        fullName: payload?.fullName || email.split('@')[0],
      });
      setIsAuthenticated(true);
    }

    return { otpRequired: data.otp_required };
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const data = await authService.verifyOtp({ email, otp });

    if (data.access_token && data.refresh_token) {
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);

      const payload = decodeJwt(data.access_token);
      setUser({
        id: payload?.sub || '',
        email: payload?.email || email,
        fullName: payload?.fullName || email.split('@')[0],
      });
      setIsAuthenticated(true);
    }
  }, []);

  const signup = useCallback(
    async (fullName: string, email: string, password: string, confirm: string) => {
      const data = await authService.signup({
        full_name: fullName,
        email,
        password,
        confirm_password: confirm,
      });

      if (data.access_token && data.refresh_token) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);

        const payload = decodeJwt(data.access_token);
        setUser({
          id: payload?.sub || '',
          email: payload?.email || email,
          fullName: payload?.fullName || fullName,
        });
        setIsAuthenticated(true);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      try {
        await authService.logout(refresh);
      } catch (err) {
        console.error('API logout notification failed:', err);
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const contextValue = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, verifyOtp, signup, logout }),
    [user, isAuthenticated, isLoading, login, verifyOtp, signup, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
