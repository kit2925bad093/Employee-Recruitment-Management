import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Candidate } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../api';

interface AuthContextType {
  user: User | null;
  candidate: Candidate | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; role: UserRole; registrationCode?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!getStoredToken()) return;
      const data = await api.getMe();
      setUser(data.user);
      setCandidate(data.candidate || null);
    } catch (err) {
      removeStoredToken();
      setToken(null);
      setUser(null);
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const data = await api.login({ email, password, role });
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setCandidate(data.candidate || null);
  };

  const register = async (payload: { email: string; password: string; fullName: string; role: UserRole; registrationCode?: string }) => {
    const data = await api.register(payload);
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setCandidate(data.candidate || null);
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setCandidate(null);
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setCandidate(data.candidate || null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        candidate,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
