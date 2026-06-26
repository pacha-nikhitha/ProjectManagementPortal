import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || 'https://projectmanagementportal-5gn7.onrender.com/api';

const authApi = axios.create({ baseURL: `${BASE_URL}/auth`, withCredentials: true });

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('projectnest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('projectnest_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('projectnest_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await authApi.post('/login', credentials);
    localStorage.setItem('projectnest_token', data.token);
    localStorage.setItem('projectnest_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (details) => {
    const { data } = await authApi.post('/register', details);
    localStorage.setItem('projectnest_token', data.token);
    localStorage.setItem('projectnest_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('projectnest_token');
    localStorage.removeItem('projectnest_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('projectnest_user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
