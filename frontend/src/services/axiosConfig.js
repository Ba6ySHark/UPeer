import axios from 'axios';
import { API_URL } from '../config';

// Create a configured instance of axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add a request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage on each request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration or auth errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Only redirect to login if the token has expired or is invalid
      if (error.response.data && 
          (error.response.data.error === 'Token has expired' || 
           error.response.data.error === 'Invalid token' ||
           error.response.data.error === 'Authentication required')) {
        
        // Clear token from localStorage
        localStorage.removeItem('token');
        
        // Redirect to login page (if not already there)
        if (window.location.pathname !== '/login') {
          // Use the history object or a direct redirect based on your setup
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 