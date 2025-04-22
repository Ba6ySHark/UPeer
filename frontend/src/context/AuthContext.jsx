import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import axiosInstance from '../services/axiosConfig';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on initial render
  useEffect(() => {
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
            isAdmin: decoded.is_admin
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Register a new user
  const register = async (name, email, password) => {
    try {
      // For registration and login, we use the regular axios since we don't have a token yet
      const response = await axios.post(`${API_URL}/api/auth/register/`, {
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
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred during registration'
      };
    }
  };

  // Login a user
  const login = async (email, password) => {
    try {
      // For registration and login, we use the regular axios since we don't have a token yet
      const response = await axios.post(`${API_URL}/api/auth/login/`, {
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