import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api } from './api';
import { getToken, onTokenChange, setToken } from './token';
import type { LoginInput, Profile, SessionResponse, SignupInput } from './types';

interface AuthContextValue {
  profile: Profile | null;
  isLoading: boolean;
  signup: (input: SignupInput) => Promise<Profile>;
  login: (input: LoginInput) => Promise<Profile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    async function loadFromToken() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await api.get<Profile>('/auth/me');
        if (!cancelled) setProfile(me);
      } catch {
        setToken(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadFromToken();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => onTokenChange((token) => {
    if (!token) setProfile(null);
  }), []);

  async function signup(input: SignupInput) {
    const session = await api.post<SessionResponse>('/auth/signup', input);
    setToken(session.token);
    setProfile(session.profile);
    return session.profile;
  }

  async function login(input: LoginInput) {
    const session = await api.post<SessionResponse>('/auth/login', input);
    setToken(session.token);
    setProfile(session.profile);
    return session.profile;
  }

  function logout() {
    api.post('/auth/logout', undefined).catch(() => {});
    setToken(null);
    setProfile(null);
    queryClient.clear();
  }

  return (
    <AuthContext.Provider value={{ profile, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
