import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEMO_CREDENTIALS, DEMO_USER } from '@/constants/auth';

const STORAGE_KEY = 'eventsphere_auth';

type User = typeof DEMO_USER;

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readSession = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readSession);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    // Simulated network latency; replace with the real API call later.
    await new Promise((r) => setTimeout(r, 700));
    const ok =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
    if (!ok) return false;

    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
    } catch {
      // storage blocked: session lives in memory only
    }
    setUser(DEMO_USER);
    return true;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
