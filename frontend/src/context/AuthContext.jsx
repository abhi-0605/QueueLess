import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('queueless_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('queueless_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          localStorage.setItem('queueless_user', JSON.stringify(res.data.user));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { user: userData, accessToken } = res.data;
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('queueless_token', accessToken);
    localStorage.setItem('queueless_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user: userData, accessToken } = res.data;
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('queueless_token', accessToken);
    localStorage.setItem('queueless_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('queueless_token');
    localStorage.removeItem('queueless_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ROLE_ADMIN',
    isStaff: user?.role === 'ROLE_STAFF' || user?.role === 'ROLE_ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
