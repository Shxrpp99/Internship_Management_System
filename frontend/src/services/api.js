import axios from 'axios';

// Default to backend on port 8081
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for auth handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Standardized error message extraction
export const errMsg = (error) => {
  if (!error) return 'An unknown error occurred.';
  if (error.response?.data) {
    const d = error.response.data;
    if (typeof d === 'string') return d;
    if (d.message) return d.message;
    if (d.error) return d.error;
    // Spring Boot validation errors format
    if (d.errors && Array.isArray(d.errors)) {
      return d.errors.map((e) => e.defaultMessage || e.message || JSON.stringify(e)).join(', ');
    }
  }
  return error.message || 'Network request failed. Is the backend server running on port 8081?';
};

export default api;
