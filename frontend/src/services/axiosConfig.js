import axios from 'axios';
import { API_URL } from '../config';

// Create a configured instance of axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
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

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.data && 
          (error.response.data.error === 'Token has expired' || 
           error.response.data.error === 'Invalid token' ||
           error.response.data.error === 'Authentication required')) {
        
        // Clear token from localStorage
        localStorage.removeItem('token');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 