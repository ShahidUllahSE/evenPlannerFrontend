import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore, UNAUTHORIZED_EVENT } from '@/services/api';
import type { User } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  /** True while a saved token is being checked on page load. */
  checking: boolean;
  isManager: boolean;
  /** Resolves on success; rejects with the server's message. */
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(() => !!tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Restore the session from a saved token.
  useEffect(() => {
    if (!tokenStore.get()) return;
    let active = true;
    api
      .get<{ user: User }>('/auth/me')
      .then(({ user }) => active && setUser(user))
      .catch(() => active && tokenStore.clear())
      .finally(() => active && setChecking(false));
    return () => {
      active = false;
    };
  }, []);

  // Expired token, or the account was deactivated: back to the login screen.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    tokenStore.set(res.token, remember);
    setUser(res.user);
    return res.user;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await api.patch('/auth/password', { currentPassword, newPassword });
  }, []);

  const value = useMemo(
    () => ({
      user,
      checking,
      isManager: user?.role === 'admin' || user?.role === 'planner',
      login,
      logout,
      changePassword,
    }),
    [user, checking, login, logout, changePassword],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
