import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, LoginResponse } from '../api/client';

interface AuthState {
  token: string | null;
  user: LoginResponse['user'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  setPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('tesk_session');
      if (saved) {
        const parsed = JSON.parse(saved) as LoginResponse;
        setToken(parsed.accessToken);
        setUser(parsed.user);
      }
      setLoading(false);
    })();
  }, []);

  async function persist(session: LoginResponse) {
    setToken(session.accessToken);
    setUser(session.user);
    await AsyncStorage.setItem('tesk_session', JSON.stringify(session));
  }

  async function login(email: string, password: string) {
    const session = await api.login(email, password);
    await persist(session);
  }

  async function setPassword(email: string, newPassword: string) {
    const session = await api.setPassword(email, newPassword);
    await persist(session);
  }

  async function logout() {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('tesk_session');
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, setPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
