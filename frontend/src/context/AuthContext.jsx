import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api/authAPI';
import { inferRegistrationProfile, toAppRole } from '../utils/roles';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeUser = useCallback((rawUser) => {
    if (!rawUser) return null;

    return {
      ...rawUser,
      appRole: rawUser.appRole || toAppRole(rawUser),
      role: rawUser.roleName || rawUser.role || 'student',
      restaurantId: rawUser.restaurantId || null,
    };
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');

    if (savedUser && savedToken) {
      try {
        setUser(normalizeUser(JSON.parse(savedUser)));
        setAccessToken(savedToken);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
  }, [normalizeUser]);

  const login = useCallback(async (email, password, options = {}) => {
    setIsLoading(true);
    setError(null);

    const { role, restaurantId } = options;

    try {
      // Try to login
      const response = await authAPI.login(email, password);
      const normalizedUser = normalizeUser(response.data.user);

      setUser(normalizedUser);
      setAccessToken(response.data.accessToken);

      // Persist to localStorage
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('accessToken', response.data.accessToken);

      return { success: true, user: normalizedUser };
    } catch (loginErr) {
      // If login fails, try to auto-register
      try {
        const name = email.split('@')[0];
        const inferred = inferRegistrationProfile(email);
        const resolvedRole = role || inferred.role;
        const resolvedRestaurantId = restaurantId || inferred.restaurantId;

        await authAPI.register(email, name, password, resolvedRole, resolvedRestaurantId);

        // After registration, login
        const loginResponse = await authAPI.login(email, password);
        const normalizedUser = normalizeUser(loginResponse.data.user);

        setUser(normalizedUser);
        setAccessToken(loginResponse.data.accessToken);

        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('accessToken', loginResponse.data.accessToken);

        return { success: true, user: normalizedUser };
      } catch (regErr) {
        const errorMessage = regErr.response?.data?.error || regErr.message || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [normalizeUser]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Always clear local state
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    setError(null);

    return { success: true };
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authAPI.refreshToken();
      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      return { success: true };
    } catch (err) {
      // Token refresh failed - logout user
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      return { success: false, error: err.message };
    }
  }, []);

  const value = {
    user,
    accessToken,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
