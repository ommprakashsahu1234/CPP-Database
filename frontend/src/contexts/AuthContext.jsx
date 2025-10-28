import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('tms_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('tms_access') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('tms_refresh') || null);

  useEffect(() => {
    if (accessToken) localStorage.setItem('tms_access', accessToken);
    else localStorage.removeItem('tms_access');
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) localStorage.setItem('tms_refresh', refreshToken);
    else localStorage.removeItem('tms_refresh');
  }, [refreshToken]);

  useEffect(() => {
    if (user) localStorage.setItem('tms_user', JSON.stringify(user));
    else localStorage.removeItem('tms_user');
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    setAccessToken(res.data.tokens.accessToken);
    setRefreshToken(res.data.tokens.refreshToken);
    const role = res.data.user.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'teacher') navigate('/teacher');
    else navigate('/student');
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    navigate('/login');
  };

  const value = useMemo(() => ({ user, accessToken, refreshToken, setAccessToken, login, logout }), [user, accessToken, refreshToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
