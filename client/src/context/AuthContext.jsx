import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('qf_token'));
  const [loading, setLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('qf_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.manager || data.user || data);
        setToken(storedToken);
      } catch {
        localStorage.removeItem('qf_token');
        localStorage.removeItem('qf_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const newToken = data.token;
    localStorage.setItem('qf_token', newToken);
    setToken(newToken);
    setUser(data.manager || data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const newToken = data.token;
    localStorage.setItem('qf_token', newToken);
    setToken(newToken);
    setUser(data.manager || data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('qf_token');
    localStorage.removeItem('qf_user');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
