import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dating_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const syncGPSLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const locRes = await api.updateLocation({ latitude, longitude });
            if (locRes.success && locRes.location) {
              setCurrentUser(prev => prev ? { ...prev, ...locRes.location } : prev);
            }
          } catch (e) {}
        },
        () => {
          // Graceful fallback: user denied or timeout
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res.success && res.user) {
        setCurrentUser(res.user);
        syncGPSLocation();
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginKey, password) => {
    const res = await api.login({ loginKey, password });
    if (res.success && res.token) {
      localStorage.setItem('dating_token', res.token);
      setToken(res.token);
      setCurrentUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Đăng nhập thất bại');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('dating_token', res.token);
      setToken(res.token);
      setCurrentUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Đăng ký thất bại');
  };

  const logout = () => {
    localStorage.removeItem('dating_token');
    setToken(null);
    setCurrentUser(null);
    setIsAdminMode(false);
  };

  const updateBalance = (coins, diamonds) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        coins: coins !== undefined ? coins : prev.coins,
        diamonds: diamonds !== undefined ? diamonds : prev.diamonds
      };
    });
  };

  const updateProfileState = (updatedFields) => {
    setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : prev);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      loading,
      isAdminMode,
      setIsAdminMode,
      login,
      register,
      logout,
      fetchCurrentUser,
      updateBalance,
      updateProfileState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
