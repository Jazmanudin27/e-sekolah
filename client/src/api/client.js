import axios from 'axios';

// Dynamic API Base URL: Adapts to mobile.sistemiartas.com in production or localhost in dev
const baseURL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5007/api'
  : `${window.location.origin}/api`;

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject Authorization Bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('esekolah_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
