import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lum_token');
    if (token) {
      authAPI.me()
        .then(r => setUser(r.data.user))
        .catch(() => localStorage.removeItem('lum_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await authAPI.login(email, password);
    localStorage.setItem('lum_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (name, email, password, role) => {
    const r = await authAPI.register(name, email, password, role);
    localStorage.setItem('lum_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('lum_token');
    setUser(null);
  };

  // Merge partial updates into the current user object (e.g. after profile edit)
  const updateUser = (updates) => setUser(prev => prev ? { ...prev, ...updates } : prev);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
