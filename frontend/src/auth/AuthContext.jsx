import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  getMe,
  getStoredToken,
  getStoredUser,
  login as loginRequest,
  logout as logoutRequest,
} from '../api';
import { AuthContext } from './context.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    async function checkSession() {
      if (!getStoredToken()) {
        clearSession();
        if (!active) return;
        setUser(null);
        setStatus('anonymous');
        return;
      }
      const data = await getMe();
      if (!active) return;
      if (data?.user) {
        setUser(data.user);
        setStatus('authenticated');
      } else {
        clearSession();
        setUser(null);
        setStatus('anonymous');
      }
    }
    checkSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const data = await loginRequest(payload);
    if (data?.user) {
      setUser(data.user);
      setStatus('authenticated');
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUser,
    }),
    [user, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
