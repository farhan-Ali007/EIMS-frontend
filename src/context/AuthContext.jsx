import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  // Check if admin is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedToken) {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`
          },
          withCredentials: true
        });
        // Handle both admin and seller responses
        const userProfile = response.data.admin || response.data.user;
        setAdmin(userProfile);
        setToken(savedToken);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setToken(null);
        setAdmin(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      // Handle both admin and seller login responses
      const { token: newToken, admin: adminData, user: userData, userType } = response.data;
      
      // Use admin data if admin login, otherwise use user data (for seller)
      const userProfile = adminData || userData;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('userType', userType || 'admin'); // Store user type
      setToken(newToken);
      setAdmin(userProfile); // Store user profile (admin or seller)
      
      return { success: true, userType };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { username, email, password },
        { withCredentials: true }
      );
      
      const { token: newToken, admin: adminData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setAdmin(adminData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      setToken(null);
      setAdmin(null);
    }
  };

  const value = {
    admin,
    user: admin, // Alias for backward compatibility
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!admin,
    userType: localStorage.getItem('userType') || 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
