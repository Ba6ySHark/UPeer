import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../services/axiosConfig';
import { API_URL } from '../config';

// Create auth context
export const AuthContext = createContext();

// Custom hook for easier access to auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp > currentTime) {
            setToken(storedToken);
            setUser({
              id: decoded.user_id,
              email: decoded.email,
              name: decoded.name,
              isAdmin: decoded.is_admin
            });
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Register a new user
  const register = async (name, email, password) => {
    try {
      // Use the backend URL directly
      const response = await axios.post(`http://localhost:8001/api/auth/register/`, {
        name,
        email,
        password
      });
      
      // Save token to localStorage and set user in state
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser({
        id: user.user_id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin
      });
      
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred during registration'
      };
    }
  };

  // Login a user
  const login = async (email, password) => {
    try {
      // Use the backend URL directly
      const response = await axios.post(`http://localhost:8001/api/auth/login/`, {
        email,
        password
      });
      
      // Save token to localStorage and set user in state
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser({
        id: user.user_id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin
      });
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid credentials'
      };
    }
  };

  // Logout a user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Update user profile
  const updateProfile = async (name, email) => {
    try {
      // Use the axiosInstance for authenticated requests
      const response = await axiosInstance.put(`/api/auth/profile/`, {
        name,
        email
      });
      
      setUser(prev => ({
        ...prev,
        name: response.data.name,
        email: response.data.email
      }));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile'
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      register,
      login,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 